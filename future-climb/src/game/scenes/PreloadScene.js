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
        
        // Outer glow
        graphics.fillStyle(0xffd700, 0.3);
        graphics.fillCircle(32, 32, 30);
        
        // Main gold body
        graphics.fillStyle(0xfacc15, 1);
        graphics.fillCircle(32, 32, 24);
        
        // Inner rim
        graphics.lineStyle(3, 0xca8a04, 1);
        graphics.strokeCircle(32, 32, 20);
        
        // Symbol (C)
        graphics.fillStyle(0xca8a04, 1);
        graphics.fillCircle(32, 32, 8);
        
        graphics.generateTexture('coin', 64, 64);
    }

    createHealthTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Medical Kit Body (White with Red Cross)
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRoundedRect(12, 12, 40, 40, 8);
        
        // Red Cross
        graphics.fillStyle(0xef4444, 1);
        graphics.fillRect(28, 18, 8, 28); // Vertical
        graphics.fillRect(18, 28, 28, 8); // Horizontal
        
        // Handle
        graphics.lineStyle(4, 0x94a3b8, 1);
        graphics.strokeRect(24, 6, 16, 8);
        
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
