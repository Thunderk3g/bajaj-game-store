import Phaser from 'phaser';

export default class Vehicle {
  constructor(scene, x, y) {
    this.scene = scene;

    // =========================
    // MAIN CAR CONTAINER
    // =========================
    this.container = scene.add.container(x, y);

    // =========================
    // VISUAL COMPONENTS (Red Jeep)
    // =========================
    // Chassis / Base
    this.chassis = scene.add.rectangle(0, 15, 110, 8, 0x1f2937);
    
    // Main Body Tub
    this.bodyTub = scene.add.rectangle(0, 5, 100, 20, 0xe11d48);
    
    // Back Box
    this.backBox = scene.add.rectangle(-35, -5, 30, 20, 0xe11d48);
    
    // Front Hood
    this.frontHood = scene.add.rectangle(25, 0, 50, 15, 0xe11d48);
    
    // Windshield Frame
    this.windshield = scene.add.rectangle(10, -15, 4, 30, 0x1f2937).setAngle(-30);
    
    // Roll Bar
    this.rollBar = scene.add.rectangle(-20, -15, 4, 25, 0x1f2937);
    this.rollBarTop = scene.add.rectangle(-30, -25, 20, 4, 0x1f2937);
    
    // Antenna
    this.antenna = scene.add.rectangle(-45, -20, 2, 40, 0x000000).setAngle(-10);

    // Driver (Simple original cap & face)
    this.driverHead = scene.add.circle(-5, -20, 10, 0xfecdd3);
    this.driverCap = scene.add.rectangle(-5, -28, 20, 8, 0xe11d48);
    this.driverCapBill = scene.add.rectangle(5, -26, 10, 3, 0xe11d48);
    this.driverEye = scene.add.circle(0, -22, 2, 0x000000);

    // Headlight (With soft retro yellow glow)
    const headlight = scene.add.circle(48, 0, 6, 0xfef08a);
    const headlightGlow = scene.add.circle(48, 0, 10, 0xfef08a, 0.3);

    // Sleek high-fidelity wheels perfectly aligned with the ground
    this.frontWheel = this.createWheel(40, 27);
    this.backWheel = this.createWheel(-40, 27);

    this.container.add([
      this.antenna, this.rollBar, this.rollBarTop,
      this.driverHead, this.driverCap, this.driverCapBill, this.driverEye,
      this.chassis, this.bodyTub, this.backBox, this.frontHood, this.windshield,
      headlight, headlightGlow,
      this.frontWheel, this.backWheel
    ]);

    // =========================
    // PHYSICS BODY
    // =========================
    scene.matter.add.gameObject(this.container);

    const Bodies = Phaser.Physics.Matter.Matter.Bodies;
    const body = Bodies.rectangle(
      x,
      y,
      140,
      90,
      {
        chamfer: { radius: 25 },
        label: 'vehicle'
      }
    );

    this.container.setExistingBody(body);

    this.container.setMass(25); 
    this.container.setFriction(0.8);
    this.container.setFrictionAir(0.02);
    this.container.setBounce(0.05);

    this.maxSpeed = 28;
    this.acceleration = 0.11; 
    this.rotationForce = 0.01; // Increased for flips
    this.isGas = false;
    this.isBrake = false;

    // Flip Tracking
    this.lastAngle = this.container.angle;
    this.cumulativeRotation = 0;
  }

  createWheel(x, y) {
    const wheel = this.scene.add.container(x, y);
    
    // 1. Outer tire (Sleek Futuristic Black) - radius 20
    const tire = this.scene.add.circle(0, 0, 20, 0x18181b);
    
    // 2. Thick solid white ring to define the rim boundary against the black tire
    const rimSeparation = this.scene.add.circle(0, 0, 14, 0xffffff);
    
    // 3. Rim base (Distinct metallic steel grey) - radius 12
    const rim = this.scene.add.circle(0, 0, 12, 0x3f3f46);
    
    // 4. Glowing inner cyan rim highlight border
    const rimBorder = this.scene.add.graphics();
    rimBorder.lineStyle(1.5, 0x00f2fe, 1); // Neon Cyan chrome border
    rimBorder.strokeCircle(0, 0, 11);
    
    // 5. Star Spokes (5-spoke futuristic premium wheel)
    const spokes = [];
    const spokeCount = 5;
    for (let i = 0; i < spokeCount; i++) {
        const angle = (i * (360 / spokeCount)) * (Math.PI / 180);
        const spoke = this.scene.add.graphics();
        spoke.lineStyle(2, 0xff007f, 1); // Bright Neon Pink spoke
        spoke.beginPath();
        spoke.moveTo(0, 0);
        spoke.lineTo(Math.cos(angle) * 11, Math.sin(angle) * 11);
        spoke.strokePath();
        
        const spoke2 = this.scene.add.graphics();
        spoke2.lineStyle(1, 0xffffff, 0.8); // White inner highlighting line
        spoke2.beginPath();
        spoke2.moveTo(0, 0);
        spoke2.lineTo(Math.cos(angle) * 9, Math.sin(angle) * 9);
        spoke2.strokePath();
        
        spokes.push(spoke, spoke2);
    }
    
    // 6. Hub cap core
    const centerGlow = this.scene.add.circle(0, 0, 4, 0x00f2fe, 0.6); // Center cyan hub glow
    const center = this.scene.add.circle(0, 0, 2.5, 0xffffff); // Core silver cap
    
    wheel.add([tire, rimSeparation, rim, rimBorder, ...spokes, centerGlow, center]);
    return wheel;
  }

  update() {
    const body = this.container.body;
    const tilt = this.container.rotation;
    const grounded = this.isGrounded(); // Moved to top
    let forceX = 0;
    let torque = 0;

    if (this.isGas) {
      forceX = this.acceleration;
      torque = -1.2; // Help lift nose when moving forward
      
      // Hill Assist (Only when grounded and not upside down)
      if (grounded && tilt < -0.1 && tilt > -1.5) {
          const assistFactor = Math.abs(tilt) * 0.05;
          forceX += assistFactor;
          this.container.applyForce({ x: 0, y: -assistFactor * 0.5 });
      }
    } else if (this.isBrake) {
      forceX = -this.acceleration * 0.7;
      torque = 0.8; // Help keep nose down when reversing
    }

    // Apply force at the bottom of the vehicle (simulating wheel drive)
    // ONLY when grounded!
    if (forceX !== 0 && grounded) {
      if (body.velocity.x < this.maxSpeed) {
        // Apply force at a point below the center of mass (wheels level)
        const forcePoint = {
          x: this.container.x,
          y: this.container.y + 20
        };
        Phaser.Physics.Matter.Matter.Body.applyForce(body, forcePoint, { x: forceX, y: 0 });
      }
      
      // Apply the balancing torque
      body.torque += torque;
    }

    // Wheel Rotation based on velocity
    const rotationSpeed = body.velocity.x * 0.05;
    this.frontWheel.rotation += rotationSpeed;
    this.backWheel.rotation += rotationSpeed;

    // =====================
    // AIR CONTROL & FLIPS
    // =====================
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
      let wrappedDelta = deltaAngle;
      if (deltaAngle > 180) wrappedDelta -= 360;
      if (deltaAngle < -180) wrappedDelta += 360;

      this.cumulativeRotation += wrappedDelta;

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
