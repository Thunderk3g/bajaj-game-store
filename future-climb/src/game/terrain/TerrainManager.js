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

        // Base fill (Solid Pure Black)
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(this.points[0].x, 2000);
        
        for (let point of this.points) {
            this.graphics.lineTo(point.x, point.y);
        }
        
        this.graphics.lineTo(this.points[this.points.length-1].x, 2000);
        this.graphics.closePath();
        this.graphics.fillPath();

        // Surface (Neon Pink Line)
        this.graphics.lineStyle(8, 0xf472b6, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            this.graphics.lineTo(this.points[i].x, this.points[i].y);
        }
        
        this.graphics.strokePath();
        
        // Inner Glow (Cyan)
        this.graphics.lineStyle(3, 0x22d3ee, 0.8);
        this.graphics.beginPath();
        this.graphics.moveTo(this.points[0].x, this.points[0].y + 4);
        
        for (let i = 1; i < this.points.length; i++) {
            this.graphics.lineTo(this.points[i].x, this.points[i].y + 4);
        }
        
        this.graphics.strokePath();

        // Depth details (Vertical Grid lines)
        this.graphics.lineStyle(1, 0x22d3ee, 0.2);
        for (let i = 0; i < this.points.length; i += 2) {
            this.graphics.beginPath();
            this.graphics.moveTo(this.points[i].x, this.points[i].y);
            this.graphics.lineTo(this.points[i].x, 2000);
            this.graphics.strokePath();
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
