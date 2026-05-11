import Phaser from 'phaser';
import Vehicle from '../entities/Vehicle';
import TerrainManager from '../terrain/TerrainManager';
import PickupManager from '../systems/PickupManager';
import { useGameStore, GAME_STATUS } from '../../store/useGameStore';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Matter World Setup
        this.matter.world.setGravity(0, 2.8);
        this.matter.world.setBounds(0, -2000, 1000000, 4000, true, false, false, false);

        // Background (Parallax)
        this.bgBack = this.add.tileSprite(0, 0, width, height, 'background')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setAlpha(0.4);
        
        this.bgMid = this.add.tileSprite(0, 0, width, height, 'background')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setAlpha(0.6);

        // Atmosphere (Daytime Clouds)
        this.clouds = [];
        for (let i = 0; i < 12; i++) {
            const cloud = this.add.sprite(
                Math.random() * width * 2, 
                Math.random() * height * 0.5, 
                'cloud'
            ).setScrollFactor(Math.random() * 0.3)
             .setAlpha(0.6 + Math.random() * 0.2)
             .setScale(0.5 + Math.random() * 1.5);
            
            this.clouds.push(cloud);
        }

        // Terrain
        this.terrain = new TerrainManager(this);

        // Pickups
        this.pickups = new PickupManager(this);

        // Vehicle
        this.vehicle = new Vehicle(this, 100, 520);

        // Camera configuration
        this.cameras.main.startFollow(this.vehicle.container, true, 1, 0.08);
        this.cameras.main.setFollowOffset(-width * 0.2, 0);
        this.cameras.main.setBackgroundColor(0x7dd3fc); // Sky Blue

        // Audio Helper initialization
        this.lastX = this.vehicle.x;
        this.engineFreq = 60;
        this.setupEngineSound();

        // Collisions
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                const result = this.pickups.handleCollision(pair);
                if (result === 'coin') this.playTone(1200, 'sine', 0.1, 0.1);
                if (result === 'health') {
                    this.playTone(440, 'sine', 0.1, 0.1);
                    this.playTone(660, 'sine', 0.1, 0.1);
                }
            });
        });

        // Stunts & Rewards
        this.events.on('flip_complete', (isBackflip) => {
            const reward = 500;
            this.store.addCoins(reward);
            this.showStuntToast(isBackflip ? 'BACKFLIP!' : 'FRONTFLIP!', reward);
            this.playTone(800, 'square', 0.1, 0.05);
            this.playTone(1000, 'square', 0.1, 0.05);
        });

        // Input
        this.setupControls();
        
        // Game State
        this.store = useGameStore.getState();
    }

    setupEngineSound() {
        try {
            const ctx = this.game.sound.context;
            if (!ctx) return;

            // Main Rumble (Triangle for smooth low end)
            this.engineOsc = ctx.createOscillator();
            this.engineOsc.type = 'triangle';
            
            // Mechanical Texture (Low volume sine)
            this.engineOsc2 = ctx.createOscillator();
            this.engineOsc2.type = 'sine';

            // Chug LFO (for the idling rhythm)
            this.engineLFO = this.engineLFO || ctx.createOscillator();
            this.engineLFO.type = 'sine';
            this.engineLFO.frequency.setValueAtTime(10, ctx.currentTime);

            this.engineGain = ctx.createGain();
            this.engineGain.gain.setValueAtTime(0, ctx.currentTime);
            
            this.engineOsc.connect(this.engineGain);
            this.engineOsc2.connect(this.engineGain);
            this.engineGain.connect(ctx.destination);
            
            this.engineOsc.start();
            this.engineOsc2.start();
        } catch (e) {
            console.warn("Engine sound setup failed", e);
        }
    }

    playTone(freq, type = 'sine', duration = 0.1, volume = 0.1) {
        try {
            const ctx = this.game.sound.context;
            if (!ctx || ctx.state === 'suspended') return;
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {}
    }

    setupControls() {
        const { width, height } = this.cameras.main;

        // Keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Touch zones
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x > width / 2) {
                this.vehicle.setGas(true);
            } else {
                this.vehicle.setBrake(true);
            }
        });

        this.input.on('pointerup', () => {
            this.vehicle.setGas(false);
            this.vehicle.setBrake(false);
        });
    }

    update(time, delta) {
        if (this.store.status !== GAME_STATUS.PLAYING) return;

        // Keyboard Input Mapping
        if (this.cursors.right.isDown || this.keyD.isDown) {
            this.vehicle.setGas(true);
        } else if (this.cursors.left.isDown || this.keyA.isDown) {
            this.vehicle.setBrake(true);
        } else if (this.input.activePointer.isDown === false) {
            this.vehicle.setGas(false);
            this.vehicle.setBrake(false);
        }

        this.vehicle.update();
        this.terrain.update(this.vehicle.x);
        this.pickups.update(this.vehicle.x, this.terrain);

        // Engine Sound Modulation (Improved)
        if (this.engineOsc && this.engineGain) {
            const ctx = this.game.sound.context;
            const isGas = this.vehicle.isGas;
            const speed = this.vehicle.container.body.speed;
            
            const targetFreq = isGas ? 80 + (speed * 6) : 40;
            const targetFreq2 = targetFreq * 1.5; // Harmonic
            const targetChug = isGas ? 15 + (speed * 0.5) : 8;
            
            const targetGain = this.store.status === GAME_STATUS.PLAYING ? 0.08 + (isGas ? 0.07 : 0) : 0;
            
            this.engineOsc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
            if (this.engineOsc2) this.engineOsc2.frequency.setTargetAtTime(targetFreq2, ctx.currentTime, 0.1);
            if (this.engineLFO) this.engineLFO.frequency.setTargetAtTime(targetChug, ctx.currentTime, 0.1);
            
            this.engineGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.1);
        }

        // Parallax
        this.bgBack.tilePositionX = this.cameras.main.scrollX * 0.05;
        this.bgMid.tilePositionX = this.cameras.main.scrollX * 0.1;

        // Distance & Health Drain
        const distance = Math.max(0, Math.floor((this.vehicle.x - 100) / 50));
        this.store.setDistance(distance);

        // Health drain (More aggressive)
        const currentHealth = useGameStore.getState().health;
        const movement = Math.abs(this.vehicle.x - this.lastX);
        
        // Passive drain (~3% per second) + Movement drain
        const drainAmount = (delta * 0.003) + (movement * 0.01);
        
        this.store.setHealth(Math.max(0, currentHealth - drainAmount));
        this.lastX = this.vehicle.x;

        if (useGameStore.getState().health <= 0) {
            this.gameOver("Out of Health!");
        }

        // Flip check (Game Over if vehicle touches ground upside down)
        if (Math.abs(this.vehicle.angle) > 120 && this.isChassisTouchingGround()) {
            this.gameOver("Vehicle Flipped!");
        }
    }

    isChassisTouchingGround() {
        // Matter collision check for container + terrain
        const bodies = this.matter.intersectBody(this.vehicle.container.body);
        return bodies.some(b => b.label === 'terrain');
    }

    showStuntToast(message, reward) {
        const { width, height } = this.cameras.main;
        
        const toast = this.add.container(width / 2, height / 3);
        
        // Premium Background Panel
        const panel = this.add.rectangle(0, 25, 600, 160, 0x000000, 0.7)
            .setStrokeStyle(4, 0xfacc15);
        
        const text = this.add.text(0, 0, message, {
            fontSize: '82px',
            fontStyle: 'bold',
            color: '#facc15',
            stroke: '#000000',
            strokeThickness: 12
        }).setOrigin(0.5);

        const subText = this.add.text(0, 70, `+${reward} WEALTH UNITS`, {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        toast.add([panel, text, subText]);
        toast.setScale(0);

        this.tweens.add({
            targets: toast,
            scale: 1,
            y: height / 3 - 50,
            duration: 600,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(1200, () => {
                    this.tweens.add({
                        targets: toast,
                        alpha: 0,
                        y: height / 3 - 150,
                        duration: 600,
                        onComplete: () => toast.destroy()
                    });
                });
            }
        });
    }

    gameOver(reason = "Out of Health!") {
        this.playTone(200, 'sawtooth', 0.5, 0.2); // Death sound
        if (this.engineGain) {
            this.engineGain.gain.setTargetAtTime(0, this.game.sound.context.currentTime, 0.05);
        }
        this.store.setStatus(GAME_STATUS.GAMEOVER);
        this.scene.pause();
    }
}
