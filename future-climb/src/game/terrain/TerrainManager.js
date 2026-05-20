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
            // Varied hills - using multiple sine waves for smooth rounded terrain instead of jagged random noise
            const scrollOffset = nextX - 1000;
            const baseWave = Math.sin(scrollOffset * 0.002) * 150;
            const detailWave = Math.sin(scrollOffset * 0.005) * 50;
            nextY = 600 + baseWave + detailWave;
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
        
        // Overlap bodies slightly to hide gaps, and chamfer corners to make smooth rolling surface
        const body = this.scene.matter.add.rectangle(centerX, centerY, distance + 10, 40, {
            isStatic: true,
            angle: angle,
            label: 'terrain',
            friction: 0.9,
            restitution: 0.1,
            chamfer: { radius: 10 }
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

    /**
     * Catmull-Rom spline interpolation.
     * Generates smooth intermediate points between each pair of control points.
     * This eliminates ALL angular/edgy corners on the terrain surface.
     */
    getSmoothPoints(numPerSegment = 10) {
        const pts = this.points;
        if (pts.length < 2) return pts;

        const result = [];

        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(i - 1, 0)];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[Math.min(i + 2, pts.length - 1)];

            for (let step = 0; step < numPerSegment; step++) {
                const t  = step / numPerSegment;
                const t2 = t * t;
                const t3 = t2 * t;

                const x = 0.5 * (
                    2 * p1.x +
                    (-p0.x + p2.x) * t +
                    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
                );
                const y = 0.5 * (
                    2 * p1.y +
                    (-p0.y + p2.y) * t +
                    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                    (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
                );

                result.push({ x, y });
            }
        }

        // Push the last point
        result.push(pts[pts.length - 1]);
        return result;
    }

    render() {
        this.graphics.clear();

        if (this.points.length < 2) return;

        // Get smooth spline points (10 interpolated steps per segment = very smooth)
        const smooth = this.getSmoothPoints(10);
        const first  = smooth[0];
        const last   = smooth[smooth.length - 1];

        // ── Black fill ─────────────────────────────────────────────────────
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(first.x, 2000);

        for (const pt of smooth) {
            this.graphics.lineTo(pt.x, pt.y);
        }

        this.graphics.lineTo(last.x, 2000);
        this.graphics.closePath();
        this.graphics.fillPath();

        // ── Neon Pink surface line (smooth) ────────────────────────────────
        this.graphics.lineStyle(8, 0xf472b6, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(smooth[0].x, smooth[0].y);

        for (let i = 1; i < smooth.length; i++) {
            this.graphics.lineTo(smooth[i].x, smooth[i].y);
        }

        this.graphics.strokePath();

        // ── Cyan inner glow line (smooth, offset 4px down) ─────────────────
        this.graphics.lineStyle(3, 0x22d3ee, 0.8);
        this.graphics.beginPath();
        this.graphics.moveTo(smooth[0].x, smooth[0].y + 4);

        for (let i = 1; i < smooth.length; i++) {
            this.graphics.lineTo(smooth[i].x, smooth[i].y + 4);
        }

        this.graphics.strokePath();

        // ── Depth grid lines (drawn at original control points only) ────────
        this.graphics.lineStyle(1, 0x22d3ee, 0.2);
        for (let i = 0; i < this.points.length; i += 2) {
            this.graphics.beginPath();
            this.graphics.moveTo(this.points[i].x, this.points[i].y);
            this.graphics.lineTo(this.points[i].x, 2000);
            this.graphics.strokePath();
        }
    }

    getHeightAt(x) {
        // Simple linear interpolation between control points
        const p2Index = this.points.findIndex(p => p.x >= x);
        if (p2Index <= 0) return 600;

        const p1 = this.points[p2Index - 1];
        const p2 = this.points[p2Index];

        const t = (x - p1.x) / (p2.x - p1.x);
        return p1.y + t * (p2.y - p1.y);
    }
}

