import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Load external assets
        this.load.image('background', 'assets/terrain/background.png');
        this.load.image('dirt', 'assets/terrain/dirt.png');

        // Generate Procedural Assets (High Quality, Transparent)
        this.createCoinTexture();
        this.createHealthTexture();
        this.createCloudTexture();

        // Loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x31CDEC, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            this.scene.start('MainScene');
        });
    }

    createCoinTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Classic Gold Coin
        // Outer rim
        graphics.fillStyle(0xDAA520, 1);
        graphics.fillCircle(32, 32, 24);
        
        // Inner gold
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(32, 32, 18);
        
        // C symbol (simplified)
        graphics.lineStyle(4, 0xDAA520, 1);
        graphics.beginPath();
        graphics.arc(32, 32, 8, 0.5, Math.PI * 1.5, false);
        graphics.strokePath();
        
        graphics.generateTexture('coin', 64, 64);
    }
 
    createHealthTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Classic Health Kit (White Box, Red Cross)
        
        // Main body (White)
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRoundedRect(12, 12, 40, 40, 6);
        
        // Light grey border
        graphics.lineStyle(2, 0xd1d5db, 1);
        graphics.strokeRoundedRect(12, 12, 40, 40, 6);
        
        // Red Cross
        graphics.fillStyle(0xff0000, 1);
        graphics.fillRect(28, 20, 8, 24); // Vertical
        graphics.fillRect(20, 28, 24, 8); // Horizontal
        
        graphics.generateTexture('health', 64, 64);
    }

    createCloudTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Clouds are white with a bit of transparency
        graphics.fillStyle(0xffffff, 0.8);
        
        // Draw a fluffy cloud using multiple overlapping circles/ellipses
        graphics.fillCircle(40, 40, 25);
        graphics.fillCircle(70, 30, 30);
        graphics.fillCircle(100, 40, 25);
        graphics.fillCircle(70, 50, 20);
        
        graphics.generateTexture('cloud', 140, 80);
    }
}
