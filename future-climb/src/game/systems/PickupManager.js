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
            // Very rare health kits (5% chance)
            const type = Math.random() < 0.05 ? 'health' : 'coin';
            
            // Get height from terrain
            const groundY = terrain.getHeightAt(this.nextSpawnX);
            const y = groundY - 60; // 60px above ground
            
            this.spawn(this.nextSpawnX, y, type);
            this.nextSpawnX += 800 + Math.random() * 1200; // Much larger spacing for difficulty
        }
    }

    handleCollision(pair) {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const pickupBody = bodyA.label === 'coin' || bodyA.label === 'health' ? bodyA : (bodyB.label === 'coin' || bodyB.label === 'health' ? bodyB : null);
        const playerBody = bodyA.label === 'vehicle' ? bodyA : (bodyB.label === 'vehicle' ? bodyB : null);

        if (pickupBody && playerBody) {
            const type = pickupBody.label;
            const state = useGameStore.getState();

            if (type === 'coin') {
                state.setCoins(state.coins + 50);
                state.showToast("+50 Wealth Units", 1000);
            } else if (type === 'health') {
                state.setHealth(Math.min(100, state.health + 40));
                state.showToast("Health Restored!", 1000);
            }

            // Remove pickup
            this.scene.matter.world.remove(pickupBody);
            if (pickupBody.gameObject) pickupBody.gameObject.destroy();
            return type;
        }
        return null;
    }
}
