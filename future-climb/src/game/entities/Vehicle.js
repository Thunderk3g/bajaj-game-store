import Phaser from 'phaser';

export default class Vehicle {
  constructor(scene, x, y) {
    this.scene = scene;

    // =========================
    // MAIN CAR CONTAINER
    // =========================
    this.container = scene.add.container(x, y);

    // =========================
    // BOTTOM SHADOW
    // =========================
    this.bottomShadow = scene.add.ellipse(0, 42, 110, 14, 0x000000, 0.25);

    // =========================
    // CAR BODY (Ultra-Compact Buggy)
    // =========================
    this.bodySprite = this.scene.add.polygon(0, -8, [
      -50, 15,   // Back bottom
      -45, -10,  // Back top
      30, -10,   // Hood start
      65, 0,     // Front tip
      70, 15,    // Bumper
      -50, 15    // Back bottom
    ], 0x0284c7);
    this.bodySprite.setStrokeStyle(3, 0x0ea5e9);

    // =========================
    // BODY HIGHLIGHT
    // =========================
    this.highlight = this.scene.add.rectangle(-5, -12, 80, 4, 0x7dd3fc);
    this.highlight.setAlpha(0.4);

    // =========================
    // TOP CABIN (Compact)
    // =========================
    this.cabin = scene.add.polygon(-10, -20, [
      0, 0, 
      40, 0, 
      55, 18, 
      -5, 18
    ], 0xc62828);
    this.cabin.setStrokeStyle(2, 0xffb4b4);

    // =========================
    // WINDOWS
    // =========================
    this.window = scene.add.polygon(-8, -18, [
      3, 3, 
      32, 3, 
      45, 14, 
      0, 14
    ], 0x81d4fa);

    // =========================
    // FRONT LIGHT
    // =========================
    this.frontLight = this.scene.add.circle(60, -8, 4, 0xfff59d);

    // =========================
    // CHASSIS (Undercarriage)
    // =========================
    this.chassis = this.scene.add.rectangle(0, 18, 110, 10, 0x1f2937);
    this.chassis.setStrokeStyle(2, 0x111827);

    // =========================
    // SUSPENSION STRUTS
    // =========================
    this.suspFront = this.scene.add.rectangle(42, 18, 6, 20, 0x374151).setAngle(-15);
    this.suspBack = this.scene.add.rectangle(-42, 18, 6, 20, 0x374151).setAngle(15);

    // =========================
    // FRONT WHEEL
    // =========================
    this.frontWheel = this.createWheel(52, 30);

    // =========================
    // REAR WHEEL
    // =========================
    this.backWheel = this.createWheel(-52, 30);

    // =========================
    // ADD ALL TO CONTAINER
    // =========================
    this.container.add([
      this.bottomShadow,
      this.chassis,
      this.suspFront,
      this.suspBack,
      this.bodySprite,
      this.highlight,
      this.cabin,
      this.window,
      this.frontLight,
      this.frontWheel,
      this.backWheel
    ]);

    // =========================
    // PHYSICS BODY
    // =========================
    scene.matter.add.gameObject(this.container);

    const Bodies = Phaser.Physics.Matter.Matter.Bodies;
    const body = Bodies.rectangle(
      x,
      y,
      130,
      85,
      {
        chamfer: { radius: 25 },
        label: 'vehicle'
      }
    );

    this.container.setExistingBody(body);

    // =========================
    // PHYSICS FEEL
    // =========================
    this.container.setMass(20); 
    this.container.setFriction(0.8);
    this.container.setFrictionAir(0.02);
    this.container.setBounce(0.05);

    // =========================
    // MOVEMENT SETTINGS
    // =========================
    this.maxSpeed = 22;
    this.acceleration = 0.08; 
    this.rotationForce = 0.01; // Increased for flips
    this.isGas = false;
    this.isBrake = false;

    // Flip Tracking
    this.lastAngle = this.container.angle;
    this.cumulativeRotation = 0;
  }

  createWheel(x, y) {
    const wheel = this.scene.add.container(x, y);
    const tireShadow = this.scene.add.circle(2, 3, 30, 0x000000, 0.35);
    const tire = this.scene.add.circle(0, 0, 30, 0x111827);
    const rim = this.scene.add.circle(0, 0, 15, 0x9ca3af);
    const center = this.scene.add.circle(0, 0, 5, 0x374151);
    wheel.add([tireShadow, tire, rim, center]);
    return wheel;
  }

  update() {
    const body = this.container.body;

    // =====================
    // ACCELERATION
    // =====================
    if (this.isGas) {
      const tilt = this.container.rotation;
      let forceX = this.acceleration;
      
      // Hill Assist: Extra force when tilted up (climbing)
      if (tilt < -0.1) {
          const assistFactor = Math.abs(tilt) * 0.05;
          forceX += assistFactor;
          this.container.applyForce({ x: 0, y: -assistFactor * 0.5 });
      }

      if (body.velocity.x < this.maxSpeed) {
        this.container.applyForce({ x: forceX, y: 0 });
      }
      this.container.body.torque -= 0.55; // Slightly more nose-up torque for climbing

      this.frontWheel.rotation += 0.35;
      this.backWheel.rotation += 0.35;
    }

    // =====================
    // BRAKE
    // =====================
    if (this.isBrake) {
      this.container.applyForce({ x: -this.acceleration * 0.7, y: 0 });
      this.container.body.torque += 0.5; // Clockwise (Nose down)

      this.frontWheel.rotation -= 0.15;
      this.backWheel.rotation -= 0.15;
    }

    // =====================
    // AIR CONTROL & FLIPS
    // =====================
    const grounded = this.isGrounded();
    if (!grounded) {
      // Rotation in air
      if (this.isGas) {
        this.container.body.torque -= this.rotationForce * 480; // Anti-clockwise (Backflip)
      }
      if (this.isBrake) {
        this.container.body.torque += this.rotationForce * 480; // Clockwise (Frontflip)
      }

      // Track Flip Progress
      const deltaAngle = this.container.angle - this.lastAngle;
      // Handle degree wrapping
      let wrappedDelta = deltaAngle;
      if (deltaAngle > 180) wrappedDelta -= 360;
      if (deltaAngle < -180) wrappedDelta += 360;

      this.cumulativeRotation += wrappedDelta;

      // Check for 360 Flip
      if (Math.abs(this.cumulativeRotation) >= 340) {
        const isBackflip = this.cumulativeRotation > 0;
        this.scene.events.emit('flip_complete', isBackflip);
        this.cumulativeRotation = 0; // Reset
      }
    } else {
      this.cumulativeRotation = 0; // Reset when touching ground
    }

    this.lastAngle = this.container.angle;

    // Velocity Clamp
    if (body.velocity.x > this.maxSpeed) {
      this.container.setVelocityX(this.maxSpeed);
    }
  }

  isGrounded() {
    const bodies = this.scene.matter.intersectBody(this.container.body);
    return bodies.some(body => body.label === 'terrain');
  }

  setGas(value) { this.isGas = value; }
  setBrake(value) { this.isBrake = value; }
  get x() { return this.container.x; }
  get y() { return this.container.y; }
  get angle() { return this.container.angle; }
}
