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

        // Background (Parallax setup)
        this.bgBack = this.add.tileSprite(0, 0, width, height, 'background')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setAlpha(0.1)
            .setTint(0x8b5cf6);
        
        this.bgMid = this.add.tileSprite(0, 0, width, height, 'background')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setAlpha(0.2)
            .setTint(0xf472b6);

        // Space Background (Planet & Spaceships)
        const planetX = width * 0.8;
        const planetY = height * 0.3;
        
        // Large Planet
        this.planet = this.add.circle(planetX, planetY, 80, 0x9333ea, 0.8) // Purple planet
            .setScrollFactor(0.01) // Moves very slowly
            .setDepth(-10);
            
        // Planet Glow
        this.planetGlow = this.add.circle(planetX, planetY, 100, 0x9333ea, 0.2)
            .setScrollFactor(0.01)
            .setDepth(-11);
            
        // Planet Ring
        this.planetRing = this.add.ellipse(planetX, planetY, 240, 40, 0xc084fc, 0.5)
            .setScrollFactor(0.01)
            .setDepth(-9)
            .setRotation(-0.2);

        // Stars (Random dots)
        this.stars = this.add.graphics().setScrollFactor(0).setDepth(-12);
        this.stars.fillStyle(0xffffff, 0.8);
        for(let i = 0; i < 100; i++) {
            const rx = Phaser.Math.Between(0, width);
            const ry = Phaser.Math.Between(0, height * 0.6);
            const size = Phaser.Math.Between(1, 3);
            this.stars.fillCircle(rx, ry, size);
        }

        // ----------------------------------------------------
        // BACKGROUND AMBIENCE: Shooting Stars, Rockets, UFOs
        // ----------------------------------------------------
        
        // 1. Shooting Stars
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (Math.random() > 0.4) return;
                const startX = Phaser.Math.Between(width * 0.2, width + 100);
                const startY = Phaser.Math.Between(-50, height * 0.2);
                
                const star = this.add.graphics().setScrollFactor(0).setDepth(-11);
                star.fillStyle(0xffffff, 1);
                star.fillCircle(0, 0, 2);
                
                star.lineStyle(2, 0x00f2fe, 0.8);
                star.beginPath();
                star.moveTo(0, 0);
                star.lineTo(60, -40); // Tail
                star.strokePath();

                star.setPosition(startX, startY);

                this.tweens.add({
                    targets: star,
                    x: startX - 600,
                    y: startY + 400,
                    alpha: 0,
                    duration: Phaser.Math.Between(600, 1200),
                    ease: 'Power2',
                    onComplete: () => star.destroy()
                });
            },
            loop: true
        });

        // 2. Futuristic Rockets
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                const y = Phaser.Math.Between(50, height * 0.35);
                const speed = Phaser.Math.Between(3, 6);
                const shipContainer = this.add.container(width + 50, y).setScrollFactor(0).setDepth(-5);
                
                const ship = this.add.graphics();
                // Rocket body
                ship.fillStyle(0xcbd5e1, 1); // Silver
                ship.fillEllipse(0, 0, 30, 10);
                // Cockpit window
                ship.fillStyle(0x00f2fe, 1); // Cyan glow
                ship.fillEllipse(-8, -2, 8, 4);
                // Fins
                ship.fillStyle(0xff007f, 1); // Pink
                ship.beginPath();
                ship.moveTo(10, 0); ship.lineTo(20, -12); ship.lineTo(15, 0);
                ship.moveTo(10, 0); ship.lineTo(20, 12); ship.lineTo(15, 0);
                ship.fillPath();
                
                // Engine flame
                const flame = this.add.graphics();
                flame.fillStyle(0xfacc15, 1); // Yellow
                flame.beginPath();
                flame.moveTo(15, -3); flame.lineTo(30, 0); flame.lineTo(15, 3);
                flame.fillPath();

                this.tweens.add({
                    targets: flame,
                    scaleX: 1.4,
                    alpha: 0.5,
                    duration: 80,
                    yoyo: true,
                    repeat: -1
                });

                shipContainer.add([flame, ship]);
                
                this.tweens.add({
                    targets: shipContainer,
                    x: -100,
                    duration: (width + 150) / speed * 10,
                    onComplete: () => shipContainer.destroy()
                });
            },
            loop: true
        });

        // Alien UFO logic is now tied to player movement (see update loop)
        this.ufoSpawned = false;
        this.ufo100mSpawned = false;

        // Terrain
        this.terrain = new TerrainManager(this);

        // Pickups
        this.pickups = new PickupManager(this);

        // Vehicle
        this.vehicle = new Vehicle(this, 100, 520);

        // Camera configuration
        this.cameras.main.startFollow(this.vehicle.container, true, 1, 0.08);
        this.cameras.main.setFollowOffset(-width * 0.2, 0);
        this.cameras.main.setBackgroundColor(0x0f172a); // Synthwave Dark Slate

        // Audio Helper initialization
        this.lastX = this.vehicle.x;
        this.engineFreq = 60;
        this.setupEngineSound();

        // Collisions
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                const result = this.pickups.handleCollision(pair);
                if (result === 'coin') this.playTone(1200, 'sine', 0.1, 0.1);
                if (result === 'shield') {
                    // Shield pickup sound (rising tone = protection gained)
                    this.playTone(440, 'sine', 0.1, 0.1);
                    this.playTone(660, 'sine', 0.1, 0.1);
                }
                if (result === 'sip') {
                    // SIP Boost — rich reward sound
                    this.playTone(600, 'sine', 0.1, 0.08);
                    this.playTone(900, 'sine', 0.1, 0.08);
                    this.playTone(1200, 'sine', 0.1, 0.08);
                }
            });
        });

        // Stunts & Rewards (financial language)
        this.events.on('flip_complete', (isBackflip) => {
            if (useGameStore.getState().status !== GAME_STATUS.PLAYING) return;
            const reward = 500;
            this.store.addCoins(reward);
            this.showStuntToast(isBackflip ? '📈 BACKFLIP RETURNS!' : '📈 FRONTFLIP RETURNS!', reward);
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

    spawnUFO(textMessage = 'Hii!') {
        if (this.activeUFO) {
            this.activeUFO.destroy();
            this.activeUFO = null;
        }

        const { width, height } = this.cameras.main;
        const y = Phaser.Math.Between(80, height * 0.3);
        const ufoContainer = this.add.container(width + 80, y).setScrollFactor(0).setDepth(-4);
        this.activeUFO = ufoContainer;
        
        // Alien (Green guy)
        const alien = this.add.graphics();
        alien.fillStyle(0x22c55e, 1); 
        alien.fillEllipse(0, -6, 10, 14); // Head
        alien.fillStyle(0x000000, 1); // Eyes
        alien.fillEllipse(-3, -8, 2, 4);
        alien.fillEllipse(3, -8, 2, 4);
        
        // Glass Dome
        const ufo = this.add.graphics();
        ufo.fillStyle(0x00f2fe, 0.4); 
        ufo.lineStyle(2, 0x00f2fe, 0.8);
        ufo.beginPath();
        ufo.arc(0, 0, 20, Math.PI, 0, false); 
        ufo.fillPath();
        ufo.strokePath();
        
        // Saucer body
        const saucer = this.add.graphics();
        saucer.fillStyle(0x94a3b8, 1); 
        saucer.fillEllipse(0, 2, 45, 12);
        saucer.lineStyle(2, 0xff007f, 1); 
        saucer.strokeEllipse(0, 2, 45, 12);
 
        // Flashing lights
        const lights = [];
        for(let i = -15; i <= 15; i+=15) {
            const light = this.add.circle(i, 4, 3, 0xfacc15);
            lights.push(light);
            this.tweens.add({
                targets: light,
                alpha: 0.2,
                duration: 300 + (Math.random() * 200),
                yoyo: true,
                repeat: -1
            });
        }
        
        ufoContainer.add([alien, ufo, saucer, ...lights]);
        
        // 1. Move to center
        this.tweens.add({
            targets: ufoContainer,
            x: width / 2 + 40,
            y: height * 0.55, // Hovering perfectly right next to / slightly above the vehicle
            scaleX: 2.5,     // Make it appear bigger
            scaleY: 2.5,
            duration: 2000,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // Play Alien voice
                this.playAlienHii();
 
                // 2. Start bobbing animation ONLY after the entry tween completes
                // This resolves the Phaser tween conflict where two tweens fought over the 'y' property
                const bobTween = this.tweens.add({
                    targets: ufoContainer,
                    y: '+=15',
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
 
                // Speech Bubble (Dynamically size based on message length)
                const bubble = this.add.graphics();
                bubble.fillStyle(0xffffff, 0.9);
                
                const isLongMessage = textMessage.length > 5;
                const bubbleWidth = isLongMessage ? 110 : 60;
                const bubbleX = isLongMessage ? -55 : -30;
                bubble.fillRoundedRect(bubbleX, -60, bubbleWidth, 30, 8);
                
                // Bubble pointer
                bubble.beginPath();
                bubble.moveTo(-5, -30);
                bubble.lineTo(0, -20);
                bubble.lineTo(5, -30);
                bubble.fillPath();
 
                const text = this.add.text(0, -45, textMessage, {
                    fontSize: '16px',
                    color: '#000',
                    fontWeight: 'bold',
                    resolution: 4
                }).setOrigin(0.5);
 
                ufoContainer.add([bubble, text]);
 
                // Wait 2.5 seconds, then leave
                this.time.delayedCall(2500, () => {
                    bobTween.stop(); // Stop bobbing before departure
                    bubble.destroy();
                    text.destroy();
                    
                    // 3. Go away
                    this.tweens.add({
                        targets: ufoContainer,
                        x: -200,
                        y: height * 0.2, // Fly upward and away
                        scaleX: 0.5,
                        scaleY: 0.5,
                        duration: 2500,
                        ease: 'Power2',
                        onComplete: () => {
                            if (this.activeUFO === ufoContainer) {
                                this.activeUFO = null;
                            }
                            ufoContainer.destroy();
                        }
                    });
                });
            }
        });
    }

    playTone(freq, type = 'sine', duration = 0.1, volume = 0.1) {
        if (this.isMuted) return;
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

    playAlienHii() {
        if (this.isMuted) return;
        try {
            const ctx = this.game.sound.context;
            if (!ctx || ctx.state === 'suspended') return;
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sawtooth';
            // "Hiiii" squeaky alien voice using frequency modulation
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.1);
            osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.3);
            
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
            
            // Add a little vibrato (LFO)
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 15; // fast wobble
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 50;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();
            lfo.stop(ctx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {}
    }

    setupControls() {
        const { width, height } = this.cameras.main;

        // Keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Visual UI Controls
        this.createUIControls();
    }

    createUIControls() {
        const { width, height } = this.cameras.main;

        // ── Small-screen responsive pedal inset ──────────────────────────────
        // On narrow screens (Galaxy S8 = 360px, iPhone SE = 375px) the default
        // 80px inset causes the brake/gauge/gas to overlap. Use 48px instead.
        const pedalInset = width <= 380 ? 60 : 80;
        
        // Pedals and Gauges should be fixed to the screen (ignore camera scroll)
        const uiContainer = this.add.container(0, 0).setScrollFactor(0);

        // =========================
        // MUTE BUTTON
        // =========================
        this.isMuted = false;
        const muteBtn = this.add.container(width - 50, 130).setScrollFactor(0).setDepth(100);
        
        const muteBg = this.add.graphics();
        muteBg.fillStyle(0x0f172a, 0.7);
        muteBg.lineStyle(2, 0x00f2fe, 1);
        muteBg.fillCircle(0, 0, 25);
        muteBg.strokeCircle(0, 0, 25);

        const muteIcon = this.add.text(0, 0, '🔊', { fontSize: '24px' }).setOrigin(0.5);
        
        muteBtn.add([muteBg, muteIcon]);

        // Flat scene-level Zone for bulletproof click detection on the mute button
        const muteZone = this.add.zone(width - 50, 130, 60, 60)
            .setOrigin(0.5)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(101);
        
        muteZone.on('pointerdown', (pointer, localX, localY, event) => {
            if (event && event.stopPropagation) event.stopPropagation(); // Stop click from triggering anything else
            
            this.isMuted = !this.isMuted;
            
            // Set both properties and formal methods on Scene and Game-level sound managers
            this.sound.mute = this.isMuted;
            if (this.sound.setMute) {
                this.sound.setMute(this.isMuted);
            }
            if (this.game.sound) {
                this.game.sound.mute = this.isMuted;
                if (this.game.sound.setMute) {
                    this.game.sound.setMute(this.isMuted);
                }
            }
            
            muteIcon.setText(this.isMuted ? '🔇' : '🔊');
            
            const ctx = this.game.sound ? this.game.sound.context : null;
            if (ctx) {
                // Instantly resume context if unmuting
                if (!this.isMuted && ctx.state === 'suspended') {
                    ctx.resume().catch(e => console.warn("Could not resume AudioContext:", e));
                }
            }

            // Instantly transition the engine gain so sound starts/stops immediately
            if (this.engineGain && ctx) {
                if (this.isMuted) {
                    this.engineGain.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
                } else {
                    const isGas = this.vehicle ? this.vehicle.isGas : false;
                    const speed = this.vehicle ? this.vehicle.container.body.speed : 0;
                    const targetGain = 0.08 + (isGas ? 0.07 : 0);
                    this.engineGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.02);
                }
            }
        });
        
        this.muteBtn = muteBtn;
        this.muteZone = muteZone;

        // =========================
        // BRAKE PEDAL (Left - Visual Only)
        // =========================
        const brakePedal = this.add.container(pedalInset, height - 90);
        
        const brakeBg = this.add.graphics();
        brakeBg.fillStyle(0x0f172a, 0.7);
        brakeBg.lineStyle(3, 0x00f2fe, 1); // Neon Cyan border
        brakeBg.fillRoundedRect(-50, -70, 100, 140, 15);
        brakeBg.strokeRoundedRect(-50, -70, 100, 140, 15);

        const brakeGrips = this.add.graphics();
        brakeGrips.lineStyle(4, 0x00f2fe, 0.6);
        brakeGrips.beginPath();
        brakeGrips.moveTo(-20, -30); brakeGrips.lineTo(20, -30);
        brakeGrips.moveTo(-20, -10); brakeGrips.lineTo(20, -10);
        brakeGrips.moveTo(-20, 10); brakeGrips.lineTo(20, 10);
        brakeGrips.strokePath();

        const brakeLabel = this.add.text(0, 45, 'BRAKE', {
            fontSize: '20px',
            fill: '#ffffff',
            fontWeight: '900',
            stroke: '#00f2fe',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        brakePedal.add([brakeBg, brakeGrips, brakeLabel]);
        
        // =========================
        // GAS PEDAL (Right - Visual Only)
        // =========================
        const gasPedal = this.add.container(width - pedalInset, height - 90);
        
        const gasBg = this.add.graphics();
        gasBg.fillStyle(0x0f172a, 0.7);
        gasBg.lineStyle(3, 0xff007f, 1); // Neon Pink border
        gasBg.fillRoundedRect(-50, -70, 100, 140, 15);
        gasBg.strokeRoundedRect(-50, -70, 100, 140, 15);

        const gasGrips = this.add.graphics();
        gasGrips.lineStyle(4, 0xff007f, 0.6);
        gasGrips.beginPath();
        gasGrips.moveTo(-20, -30); gasGrips.lineTo(20, -30);
        gasGrips.moveTo(-20, -10); gasGrips.lineTo(20, -10);
        gasGrips.moveTo(-20, 10); gasGrips.lineTo(20, 10);
        gasGrips.strokePath();

        const gasLabel = this.add.text(0, 45, 'GAS', {
            fontSize: '20px',
            fill: '#ffffff',
            fontWeight: '900',
            stroke: '#ff007f',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        gasPedal.add([gasBg, gasGrips, gasLabel]);

        // =========================
        // GAUGES (Center)
        // =========================
        const gaugeCenter = width / 2;
        const gaugeY = height - 80;
        
        // Speedometer (Centered)
        const speedGauge = this.add.container(gaugeCenter, gaugeY);
        
        const speedBg = this.add.graphics();
        speedBg.fillStyle(0x0f172a, 0.8);
        speedBg.lineStyle(4, 0x00f2fe, 1); // Neon Cyan border
        speedBg.fillCircle(0, 0, 60);
        speedBg.strokeCircle(0, 0, 60);

        // Inner glowing ring
        const speedInner = this.add.graphics();
        speedInner.lineStyle(2, 0xff007f, 0.5); // Pink inner
        speedInner.strokeCircle(0, 0, 45);

        // Ticks for speedometer
        const speedTicks = this.add.graphics();
        speedTicks.lineStyle(2, 0xffffff, 0.8);
        speedTicks.beginPath();
        for(let i = -120; i <= 120; i += 30) {
            const rad = Phaser.Math.DegToRad(i - 90);
            const x1 = Math.cos(rad) * 45;
            const y1 = Math.sin(rad) * 45;
            const x2 = Math.cos(rad) * 55;
            const y2 = Math.sin(rad) * 55;
            speedTicks.moveTo(x1, y1);
            speedTicks.lineTo(x2, y2);
        }
        speedTicks.strokePath();

        const speedLabel = this.add.text(0, 35, 'SPEED', { 
            fontSize: '14px', 
            fill: '#00f2fe', 
            fontWeight: '900'
        }).setOrigin(0.5);

        // Center pin
        const centerPin = this.add.circle(0, 0, 6, 0xffffff);

        // Stylized Needle
        this.speedNeedle = this.add.graphics();
        this.speedNeedle.fillStyle(0xff007f, 1);
        this.speedNeedle.beginPath();
        this.speedNeedle.moveTo(-4, 0);
        this.speedNeedle.lineTo(4, 0);
        this.speedNeedle.lineTo(0, -50);
        this.speedNeedle.closePath();
        this.speedNeedle.fillPath();
        
        speedGauge.add([speedBg, speedInner, speedTicks, speedLabel, this.speedNeedle, centerPin]);

        uiContainer.add([brakePedal, gasPedal, speedGauge]);
        
        // ================================================================
        // SCENE-LEVEL INTERACTIVE TOUCH ZONES (100% reliable, no nested container bugs)
        // ================================================================
        const brakeZone = this.add.zone(pedalInset, height - 90, 100, 140)
            .setOrigin(0.5)
            .setInteractive()
            .setScrollFactor(0);
            
        const gasZone = this.add.zone(width - pedalInset, height - 90, 100, 140)
            .setOrigin(0.5)
            .setInteractive()
            .setScrollFactor(0);

        // Enable multi-touch in Phaser
        this.input.addPointer(2);

        this.uiBrakeDown = false;
        this.uiGasDown = false;

        // Perfect direct touch handlers
        brakeZone.on('pointerdown', () => this.uiBrakeDown = true);
        brakeZone.on('pointerup', () => this.uiBrakeDown = false);
        brakeZone.on('pointerout', () => this.uiBrakeDown = false);

        gasZone.on('pointerdown', () => this.uiGasDown = true);
        gasZone.on('pointerup', () => this.uiGasDown = false);
        gasZone.on('pointerout', () => this.uiGasDown = false);

        // Modern Animated Dual-Pedal Tutorial Overlay
        this.tutorialGroup = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

        // 1. Instruction Banner
        const bannerWidth = Math.min(width - 20, 420);
        const bannerHeight = width <= 380 ? 95 : 75;
        const bannerBg = this.add.rectangle(width / 2, height / 3, bannerWidth, bannerHeight, 0x0f172a, 0.85)
            .setStrokeStyle(2, 0x00f2fe, 1);

        const extraText = this.add.text(width / 2, height / 3, "Reach 1000 meters without Falling and Capture all the Shields and Coin.", {
            fontSize: '16px',
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: bannerWidth - 30 }
        }).setOrigin(0.5);
        
        // 2. Gas Pedal Tutorial Hand & Pulse
        const gasX = width - pedalInset;
        const gasY = height - 90;
        
        const gasPulse = this.add.circle(gasX, gasY, 20, 0xff007f, 0.4);
        const gasHand = this.add.text(gasX + 15, gasY + 40, '👆', {
            fontSize: '42px',
            padding: { left: 10, right: 10, top: 10, bottom: 10 }
        }).setOrigin(0.5);
        gasHand.setAngle(-45);

        const gasLabelText = this.add.text(gasX, gasY - 95, "HOLD GAS\nTO CLIMB", {
            fontSize: '11px',
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ff007f', // Pink theme
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 3. Brake Pedal Tutorial Hand & Pulse
        const brakeX = pedalInset;
        const brakeY = height - 90;
        
        const brakePulse = this.add.circle(brakeX, brakeY, 20, 0x00f2fe, 0.4);
        const brakeHand = this.add.text(brakeX - 15, brakeY + 40, '👆', {
            fontSize: '42px',
            padding: { left: 10, right: 10, top: 10, bottom: 10 }
        }).setOrigin(0.5);
        brakeHand.setAngle(45);

        const brakeLabelText = this.add.text(brakeX, brakeY - 95, "HOLD BRAKE\nTO STEER/SLOW", {
            fontSize: '11px',
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#00f2fe', // Cyan theme
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.tutorialGroup.add([bannerBg, extraText, gasPulse, gasHand, gasLabelText, brakePulse, brakeHand, brakeLabelText]);

        // Animations:
        // Gas Pulse (expanding ripple)
        this.tweens.add({
            targets: gasPulse,
            scale: 2.2,
            alpha: 0,
            duration: 1200,
            repeat: -1
        });
        
        // Gas Hand (tapping gesture)
        this.tweens.add({
            targets: gasHand,
            x: gasX,
            y: gasY,
            scale: 0.8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Cubic.easeInOut'
        });

        // Brake Pulse (expanding ripple)
        this.tweens.add({
            targets: brakePulse,
            scale: 2.2,
            alpha: 0,
            duration: 1200,
            repeat: -1
        });
        
        // Brake Hand (tapping gesture)
        this.tweens.add({
            targets: brakeHand,
            x: brakeX,
            y: brakeY,
            scale: 0.8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Cubic.easeInOut'
        });

        const hideTutorial = () => {
            if (this.tutorialGroup && this.tutorialGroup.active) {
                this.tweens.add({
                    targets: this.tutorialGroup,
                    alpha: 0,
                    scale: 0.8,
                    duration: 300,
                    onComplete: () => {
                        this.tutorialGroup.destroy();
                    }
                });
            }
        };
        gasZone.on('pointerdown', hideTutorial);
        brakeZone.on('pointerdown', hideTutorial);
        this.input.keyboard.once('keydown', hideTutorial);


        // Handle resize to keep UI visible on all devices (like iPhone SE)
        this.scale.on('resize', (gameSize) => {
            const w = gameSize.width;
            const h = gameSize.height;
            // Recalculate inset for the new width (small-screen fix)
            const inset = w <= 380 ? 60 : 80;
            brakePedal.setPosition(inset, h - 90);
            gasPedal.setPosition(w - inset, h - 90);
            speedGauge.setPosition(w / 2, h - 80);
            if (this.muteBtn) this.muteBtn.setPosition(w - 50, 130);
            if (this.muteZone) this.muteZone.setPosition(w - 50, 130);
            
            // Keep interactive zones perfectly aligned with visual graphics
            brakeZone.setPosition(inset, h - 90);
            gasZone.setPosition(w - inset, h - 90);
            
            if (this.tutorialGroup && this.tutorialGroup.active) {
                this.tutorialGroup.destroy();
            }
            
            // Update sun position on resize
            if (this.sun) this.sun.setPosition(w / 2, h * 0.4);
            if (this.sunGlow) this.sunGlow.setPosition(w / 2, h * 0.4);
        });

        this.gameStartedMoving = false;
    }

    update(time, delta) {
        if (useGameStore.getState().status !== GAME_STATUS.PLAYING) return;
        // Update Needles
        if (this.vehicle && this.speedNeedle) {
            const speed = Math.abs(this.vehicle.container.body.velocity.x);
            const maxSpeed = this.vehicle.maxSpeed;
            
            // Map speed to target angle (-120 to 120 degrees)
            let targetAngle = (speed / maxSpeed) * 240 - 120;
            
            // Clamp target angle to prevent it from spinning backwards if maxSpeed is exceeded
            if (targetAngle > 120) targetAngle = 120;
            if (targetAngle < -120) targetAngle = -120;
            
            // Smoothly interpolate the needle angle to prevent flickering
            const currentAngle = this.speedNeedle.angle;
            const smoothedAngle = Phaser.Math.Linear(currentAngle, targetAngle, 0.15); // 0.15 smoothing factor
            
            this.speedNeedle.setAngle(smoothedAngle);
        }

        // Input Mapping (Keyboard + Touch)
        const isRightDown = this.cursors.right.isDown || this.keyD.isDown;
        const isLeftDown = this.cursors.left.isDown || this.keyA.isDown;
        
        this.vehicle.setGas(isRightDown || this.uiGasDown);
        this.vehicle.setBrake(isLeftDown || this.uiBrakeDown);

        this.vehicle.update();
        this.terrain.update(this.vehicle.x);
        this.pickups.update(this.vehicle.x, this.terrain);

        // Spawn UFO when the user first starts driving
        if (!this.ufoSpawned && this.vehicle.x > 300) {
            this.ufoSpawned = true;
            this.spawnUFO();
        }

        // Engine Sound Modulation (Improved)
        if (this.engineOsc && this.engineGain) {
            const ctx = this.game.sound.context;
            const isGas = this.vehicle.isGas;
            const speed = this.vehicle.container.body.speed;
            
            const targetFreq = isGas ? 80 + (speed * 6) : 40;
            const targetFreq2 = targetFreq * 1.5; // Harmonic
            const targetChug = isGas ? 15 + (speed * 0.5) : 8;
            
            const targetGain = (useGameStore.getState().status === GAME_STATUS.PLAYING && !this.isMuted) ? 0.08 + (isGas ? 0.07 : 0) : 0;
            
            this.engineOsc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
            if (this.engineOsc2) this.engineOsc2.frequency.setTargetAtTime(targetFreq2, ctx.currentTime, 0.1);
            if (this.engineLFO) this.engineLFO.frequency.setTargetAtTime(targetChug, ctx.currentTime, 0.1);
            
            this.engineGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.1);
        }

        // Parallax
        this.bgBack.tilePositionX = this.cameras.main.scrollX * 0.05;
        this.bgMid.tilePositionX = this.cameras.main.scrollX * 0.1;

        // Distance & Health Drain (calculated 3.2x faster)
        const distance = Math.max(0, Math.floor(((this.vehicle.x - 100) / 50) * 3.2));
        if (distance >= 1000) {
            this.store.setDistance(1000);
            this.gameOver("Climb Completed!");
            return;
        }
        this.store.setDistance(distance);

        // Spawn UFO again when player completes 100m — financial tip
        if (!this.ufo100mSpawned && distance >= 100) {
            this.ufo100mSpawned = true;
            this.spawnUFO('Diversify!');
        }

        // Check if player has started driving/moving (explicit input trigger only)
        if (!this.gameStartedMoving) {
            const hasInput = isRightDown || this.uiGasDown || isLeftDown || this.uiBrakeDown;
            if (hasInput) {
                this.gameStartedMoving = true;
            }
        }

        // Shield drain — represents unprotected risk exposure over time
        const currentShield = useGameStore.getState().shield;
        const movement = Math.abs(this.vehicle.x - this.lastX);
        
        // Passive drain (~2% per second) + movement risk drain (only active once car starts running)
        const drainAmount = this.gameStartedMoving ? ((delta * 0.002) + (movement * 0.007)) : 0;
        
        this.store.setShield(Math.max(0, currentShield - drainAmount));
        this.lastX = this.vehicle.x;

        if (useGameStore.getState().shield <= 0) {
            this.gameOver("Out of Fuel!");
            return;
        }

        // Flip check (Game Over if vehicle touches ground upside down - threshold increased to 150 degrees to avoid false positives on steep slopes)
        if (Math.abs(this.vehicle.angle) > 150 && this.isChassisTouchingGround()) {
            this.gameOver("Vehicle Flipped!");
        }

        // Abyss check (Game Over if vehicle falls off the terrain)
        if (this.vehicle.y > 1100) {
            this.gameOver("Fell into the Abyss!");
        }
    }

    isChassisTouchingGround() {
        // Matter collision check for container + terrain
        const bodies = this.matter.intersectBody(this.vehicle.container.body);
        return bodies.some(b => b.label === 'terrain');
    }

    showStuntToast(message, reward) {
        if (this.activeToast) {
            this.activeToast.destroy();
            this.activeToast = null;
        }

        const { width, height } = this.cameras.main;
        
        const toast = this.add.container(width / 2, height / 3);
        this.activeToast = toast;
        
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
                        onComplete: () => {
                            if (this.activeToast === toast) {
                                this.activeToast = null;
                            }
                            toast.destroy();
                        }
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
        if (this.activeToast) {
            this.activeToast.destroy();
            this.activeToast = null;
        }
        if (this.activeUFO) {
            this.activeUFO.destroy();
            this.activeUFO = null;
        }
        this.store.setStatus(GAME_STATUS.LEAD_CAPTURE);
        this.scene.pause();
    }
}
