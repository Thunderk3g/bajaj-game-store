import Phaser from 'phaser';
import { useGameStore } from '../../store/useGameStore';

export default class PickupManager {
    constructor(scene) {
        this.scene = scene;
        this.pickups = this.scene.matter.world.nextGroup();
        this.store = useGameStore.getState();
        
        this.nextSpawnX = 500;
    }

    spawn(x, y, type) {
        const pickup = this.scene.matter.add.image(x, y, type, null, {
            isSensor: true,
            label: type,
            ignoreGravity: true
        });

        pickup.setScale(1); 

        return pickup;
    }

    update(playerX, terrain) {
        if (playerX + 1000 > this.nextSpawnX) {
            // Spawn type probabilities:
            // 15% → SIP Boost (Wealth + Shield)
            // 25% → Insurance Shield (restore shield)
            // 60% → Coin (Wealth)
            const roll = Math.random();
            const type = roll < 0.15 ? 'sip' : roll < 0.40 ? 'shield' : 'coin';
            
            // Get height from terrain
            const groundY = terrain.getHeightAt(this.nextSpawnX);
            const y = groundY - 60; // 60px above ground
            
            this.spawn(this.nextSpawnX, y, type);
            this.nextSpawnX += 800 + Math.random() * 1200;
        }
    }

    handleCollision(pair) {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const validLabels = ['coin', 'shield', 'sip'];
        const pickupBody = validLabels.includes(bodyA.label) ? bodyA
            : validLabels.includes(bodyB.label) ? bodyB : null;
        const playerBody = bodyA.label === 'vehicle' ? bodyA
            : (bodyB.label === 'vehicle' ? bodyB : null);

        if (pickupBody && playerBody) {
            const type = pickupBody.label;
            const state = useGameStore.getState();

            if (type === 'coin') {
                state.setCoins(state.coins + 50);
                state.showToast('+₹50 Wealth Added! 💰', 2000);

            } else if (type === 'shield') {
                // Insurance Shield — restores protection cover
                state.setShield(Math.min(100, state.shield + 40));
                state.showToast('🛡️ Shield Restored! +40 Cover', 2000);

            } else if (type === 'sip') {
                // SIP Boost — compound benefit: wealth + protection
                state.setCoins(state.coins + 200);
                state.setShield(Math.min(100, state.shield + 20));
                state.showToast('📈 SIP Returns! +₹200 & +20 Shield', 2000);
            }

            // Remove physics body so it can't be collected again
            this.scene.matter.world.remove(pickupBody);
            
            const gameObject = pickupBody.gameObject;
            if (gameObject) {
                // Play collection animation
                this.scene.tweens.add({
                    targets: gameObject,
                    y: gameObject.y - 80,
                    alpha: 0,
                    scale: 1.8,
                    duration: 600,
                    ease: 'Power2',
                    onComplete: () => {
                        gameObject.destroy();
                    }
                });
            }
            return type;
        }
        return null;
    }
}
