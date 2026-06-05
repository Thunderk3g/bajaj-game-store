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
        
        // 1. Golden/Silver Outer Glow
        graphics.fillStyle(0xFACC15, 0.15); // soft gold glow
        graphics.fillCircle(32, 32, 30);
        
        // 2. Silver Outer Ring (Bimetallic Outer Ring - Steel/Silver color)
        graphics.fillStyle(0x9CA3AF, 1); // bevel shadow (gray-400)
        graphics.fillCircle(32, 32, 29);
        
        graphics.fillStyle(0xE5E7EB, 1); // metallic face (gray-200)
        graphics.fillCircle(32, 32, 28);
        
        graphics.fillStyle(0xF9FAFB, 1); // bright shine edge (gray-50)
        graphics.fillCircle(32, 32, 26);
        
        graphics.fillStyle(0x9CA3AF, 1); // inner rim bevel (gray-400)
        graphics.fillCircle(32, 32, 22);
        
        // 3. Gold Inner Disc (Bimetallic Center - Gold/Brass color)
        graphics.fillStyle(0xB8860B, 1); // dark gold bevel (dark goldenrod)
        graphics.fillCircle(32, 32, 20);
        
        graphics.fillStyle(0xFAC81A, 1); // gold core face
        graphics.fillCircle(32, 32, 18);
        
        graphics.fillStyle(0xFDE047, 1); // inner gold shine core
        graphics.fillCircle(32, 32, 16);
        
        // 4. Subtle Radial Notches on the Silver Ring (gives realistic minted look)
        graphics.lineStyle(1.5, 0x4B5563, 0.45); // subtle gray ridges
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6;
            graphics.beginPath();
            graphics.moveTo(32 + Math.cos(angle) * 22.5, 32 + Math.sin(angle) * 22.5);
            graphics.lineTo(32 + Math.cos(angle) * 25.5, 32 + Math.sin(angle) * 25.5);
            graphics.strokePath();
        }
        
        // 5. Glossy Highlight Reflection (glassy top sheen)
        graphics.fillStyle(0xFFFFFF, 0.22);
        graphics.beginPath();
        graphics.arc(32, 32, 28, Math.PI * 0.9, Math.PI * 1.9, false);
        graphics.lineTo(32, 32);
        graphics.closePath();
        graphics.fillPath();
        
        // 6. High-Fidelity ₹ Symbol (centered & engraved with 3D shadow)
        const drawRupee = (g, ox, oy, color, thickness) => {
            g.lineStyle(thickness, color, 1);
            
            // Top horizontal bar
            g.beginPath();
            g.moveTo(32 + ox - 7, 32 + oy - 8);
            g.lineTo(32 + ox + 7, 32 + oy - 8);
            g.strokePath();
            
            // Second horizontal bar
            g.beginPath();
            g.moveTo(32 + ox - 7, 32 + oy - 3);
            g.lineTo(32 + ox + 3, 32 + oy - 3);
            g.strokePath();
            
            // Vertical stem
            g.beginPath();
            g.moveTo(32 + ox - 3, 32 + oy - 8);
            g.lineTo(32 + ox - 3, 32 + oy + 3);
            g.strokePath();
            
            // Curved loop (R-like ra curve)
            g.beginPath();
            g.arc(32 + ox - 3, 32 + oy - 3, 5, -Math.PI / 2, Math.PI / 2, false);
            g.strokePath();
            
            // Diagonal leg
            g.beginPath();
            g.moveTo(32 + ox - 3, 32 + oy + 3);
            g.lineTo(32 + ox + 5, 32 + oy + 11);
            g.strokePath();
        };
        
        // Outer dark brown shadow to make it pop and look engraved
        drawRupee(graphics, 0.75, 0.75, 0x78350F, 2.5);
        // Minted gold foreground
        drawRupee(graphics, 0, 0, 0xD97706, 2);
        
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
