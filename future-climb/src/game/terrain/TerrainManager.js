import Phaser from 'phaser';

export default class TerrainManager {
    constructor(scene) {
        this.scene = scene;
        this.graphics = this.scene.add.graphics();
        
        this.points = [];
        this.bodies = [];
        this.segmentWidth = 150;
        this.lastX = -1000;
        this.lastY = 600;
        
        // Initial terrain points
        for (let i = 0; i < 20; i++) {
            this.addPoint();
        }
        
        this.render();
    }

    addPoint() {
        const nextX = this.lastX + this.segmentWidth;
        
        let nextY;
        if (nextX < 1000) {
            // Flat starting area
            nextY = 600;
        } else {
            // Varied hills
            const amplitude = 150;
            const frequency = 0.002;
            const scrollOffset = nextX - 1000;
            nextY = 600 + Math.sin(scrollOffset * frequency) * amplitude + (Math.random() - 0.5) * 50;
        }
        
        const point = { x: nextX, y: nextY };
        this.points.push(point);
        
        if (this.points.length > 1) {
            this.createPhysicsBody(this.points[this.points.length - 2], point);
        }
        
        this.lastX = nextX;
        this.lastY = nextY;
    }

    createPhysicsBody(p1, p2) {
        const centerX = (p1.x + p2.x) / 2;
        const centerY = (p1.y + p2.y) / 2 + 20; // Offset by half-height to align TOP edge with points
        const distance = Phaser.Math.Distance.BetweenPoints(p1, p2);
        const angle = Phaser.Math.Angle.BetweenPoints(p1, p2);
        
        const body = this.scene.matter.add.rectangle(centerX, centerY, distance, 40, {
            isStatic: true,
            angle: angle,
            label: 'terrain',
            friction: 0.9,
            restitution: 0.1
        });
        
        this.bodies.push(body);
    }

    update(playerX) {
        if (this.lastX < playerX + 2000) {
            for(let i=0; i<5; i++) this.addPoint();
            this.render();
        }

        // Cleanup
        if (this.points.length > 150) {
            this.points.splice(0, 10);
            const removedBodies = this.bodies.splice(0, 10);
            removedBodies.forEach(b => this.scene.matter.world.remove(b));
        }
    }

    render() {
        this.graphics.clear();
        
        if (this.points.length < 2) return;

        // Texture fill (using the 'dirt' image)
        // We can use fillTexture if we have a pattern, but graphics.fillPath with a texture is tricky
        // Instead, we'll draw the dirt texture as a tileSprite or use a custom shader.
        // For simplicity and quality, let's use a colored fill with a top line.
        
        this.graphics.fillStyle(0x3d2b1f, 1); // Dark brown
        this.graphics.beginPath();
        this.graphics.moveTo(this.points[0].x, 2000);
        
        for (let point of this.points) {
            this.graphics.lineTo(point.x, point.y);
        }
        
        this.graphics.lineTo(this.points[this.points.length-1].x, 2000);
        this.graphics.closePath();
        this.graphics.fillPath();

        // Surface (Grass/Road)
        this.graphics.lineStyle(12, 0x4ade80, 1); // Bright green grass
        this.graphics.beginPath();
        this.graphics.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            this.graphics.lineTo(this.points[i].x, this.points[i].y);
        }
        
        this.graphics.strokePath();

        // Add some depth details (rocks/texture)
        this.graphics.fillStyle(0x000000, 0.1);
        for (let i = 0; i < this.points.length; i += 4) {
            this.graphics.fillCircle(this.points[i].x, this.points[i].y + 50, Math.random() * 20);
        }
    }

    getHeightAt(x) {
        // Simple linear interpolation between points
        const p2Index = this.points.findIndex(p => p.x >= x);
        if (p2Index <= 0) return 600;
        
        const p1 = this.points[p2Index - 1];
        const p2 = this.points[p2Index];
        
        const t = (x - p1.x) / (p2.x - p1.x);
        return p1.y + t * (p2.y - p1.y);
    }
}
