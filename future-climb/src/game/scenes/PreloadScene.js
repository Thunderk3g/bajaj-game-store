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
        this.createShieldTexture();   // Insurance Shield pickup
        this.createSIPTexture();      // SIP Boost pickup
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
        
        // 1. Golden Outer Glow
        graphics.fillStyle(0xFFD700, 0.2);
        graphics.fillCircle(32, 32, 30);
        
        // 2. Beveled Dark Rim
        graphics.fillStyle(0xB8860B, 1);
        graphics.fillCircle(32, 32, 24);
        
        // 3. Shiny Gold Inner Face
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(32, 32, 20);
        
        // 4. Shiny Gloss Highlight (semi-circle on top)
        graphics.fillStyle(0xFFFFFF, 0.35);
        graphics.beginPath();
        graphics.arc(32, 32, 20, Math.PI, 0, false);
        graphics.lineTo(32, 32);
        graphics.closePath();
        graphics.fillPath();
        
        // 5. ₹ Symbol in center
        graphics.lineStyle(3, 0xB8860B, 1);
        graphics.beginPath();
        // Top horizontal bars
        graphics.moveTo(24, 23); graphics.lineTo(40, 23);
        graphics.moveTo(24, 29); graphics.lineTo(38, 29);
        // Vertical stem
        graphics.moveTo(29, 23); graphics.lineTo(29, 43);
        // Diagonal slash
        graphics.moveTo(38, 29); graphics.lineTo(24, 43);
        graphics.strokePath();
        
        graphics.generateTexture('coin', 64, 64);
    }

    createShieldTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Helper to draw a sleek, faceted futuristic crest shape
        const drawCrest = (g, scale) => {
            const cx = 32;
            const cy = 32;
            
            const dx1 = 0;            const dy1 = -20 * scale; // Top center
            const dx2 = 18 * scale;   const dy2 = -16 * scale; // Top right
            const dx3 = 20 * scale;   const dy3 = 2 * scale;   // Mid right
            const dx4 = 0;            const dy4 = 22 * scale;  // Bottom tip
            const dx5 = -20 * scale;  const dy5 = 2 * scale;   // Mid left
            const dx6 = -18 * scale;  const dy6 = -16 * scale; // Top left
            
            g.beginPath();
            g.moveTo(cx + dx1, cy + dy1);
            g.lineTo(cx + dx2, cy + dy2);
            g.lineTo(cx + dx3, cy + dy3);
            g.lineTo(cx + dx4, cy + dy4);
            g.lineTo(cx + dx5, cy + dy5);
            g.lineTo(cx + dx6, cy + dy6);
            g.closePath();
        };

        // 1. Neon Cyan Glow Shield
        graphics.fillStyle(0x00f2fe, 0.2);
        drawCrest(graphics, 1.25);
        graphics.fillPath();

        // 2. Cyan Outer Rim
        graphics.fillStyle(0x00f2fe, 1);
        drawCrest(graphics, 1.05);
        graphics.fillPath();

        // 3. Electric Blue Shield Body
        graphics.fillStyle(0x090d16, 1);
        drawCrest(graphics, 0.9);
        graphics.fillPath();

        // 4. Glossy Cyan Top Fill (faceted reflection)
        graphics.fillStyle(0x00f2fe, 0.15);
        graphics.beginPath();
        graphics.moveTo(32, 14);
        graphics.lineTo(46, 17);
        graphics.lineTo(46, 26);
        graphics.lineTo(18, 26);
        graphics.lineTo(18, 17);
        graphics.closePath();
        graphics.fillPath();

        // 5. White Checkmark (✓) emblem in center
        graphics.lineStyle(4, 0x00f2fe, 1);
        graphics.beginPath();
        graphics.moveTo(24, 32);
        graphics.lineTo(30, 38);
        graphics.lineTo(40, 24);
        graphics.strokePath();

        // Extra white core to checkmark for intensity
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.beginPath();
        graphics.moveTo(24, 32);
        graphics.lineTo(30, 38);
        graphics.lineTo(40, 24);
        graphics.strokePath();

        graphics.generateTexture('shield', 64, 64);
    }

    // SIP Boost — Premium green coin with chart arrow
    createSIPTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // 1. Neon Green Outer Glow
        graphics.fillStyle(0x22c55e, 0.2);
        graphics.fillCircle(32, 32, 30);

        // 2. Beveled Dark Green Rim
        graphics.fillStyle(0x15803d, 1);
        graphics.fillCircle(32, 32, 24);

        // 3. Bright Lime/Mint Face
        graphics.fillStyle(0x22c55e, 1);
        graphics.fillCircle(32, 32, 20);

        // 4. Glossy Highlight (semi-circle on top)
        graphics.fillStyle(0xffffff, 0.35);
        graphics.beginPath();
        graphics.arc(32, 32, 20, Math.PI, 0, false);
        graphics.lineTo(32, 32);
        graphics.closePath();
        graphics.fillPath();

        // 5. Upward Chart Arrow
        // Draw the line graph
        graphics.lineStyle(3, 0xffffff, 1);
        graphics.beginPath();
        graphics.moveTo(20, 40); // Start bottom-left
        graphics.lineTo(28, 32); // Mid point
        graphics.lineTo(38, 22); // Target point
        graphics.strokePath();

        // Draw arrow head pointing top-right
        graphics.fillStyle(0xffffff, 1);
        graphics.beginPath();
        graphics.moveTo(38, 22);
        graphics.lineTo(30, 22);
        graphics.lineTo(38, 30);
        graphics.closePath();
        graphics.fillPath();

        graphics.generateTexture('sip', 64, 64);
    }

    createCloudTexture() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        graphics.fillStyle(0xffffff, 0.8);
        
        graphics.fillCircle(40, 40, 25);
        graphics.fillCircle(70, 30, 30);
        graphics.fillCircle(100, 40, 25);
        graphics.fillCircle(70, 50, 20);
        
        graphics.generateTexture('cloud', 140, 80);
    }
}
