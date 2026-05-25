import Phaser from 'phaser';

export default class Vehicle {
  constructor(scene, x, y) {
    this.scene = scene;

    // =========================
    // MAIN CAR CONTAINER
    // =========================
    this.container = scene.add.container(x, y);

    // =========================
    // BODY SUB-CONTAINER FOR SUSPENSION & MOVEMENT EFFECTS
    // =========================
    this.bodyContainer = scene.add.container(0, 0);

    // =========================
    // VISUAL COMPONENTS (Red Jeep - Scaled 1.4x)
    // =========================
    // Chassis / Base
    this.chassis = scene.add.rectangle(0, 21, 154, 11, 0x1f2937);
    
    // Main Body Tub
    this.bodyTub = scene.add.rectangle(0, 7, 140, 28, 0xe11d48);
    
    // Back Box
    this.backBox = scene.add.rectangle(-49, -7, 42, 28, 0xe11d48);
    
    // Front Hood
    this.frontHood = scene.add.rectangle(35, 0, 70, 21, 0xe11d48);
    
    // Windshield Frame - Pushed forward to x = 26 to clear the driver's cap bill
    this.windshield = scene.add.rectangle(26, -21, 6, 42, 0x1f2937).setAngle(-30);
    
    // Roll Bar
    this.rollBar = scene.add.rectangle(-28, -21, 6, 35, 0x1f2937);
    this.rollBarTop = scene.add.rectangle(-42, -35, 28, 6, 0x1f2937);
    
    // Antenna - High-Visibility Cyber Neon Yellow/Lime Green Graphics for flexible Bezier whipped curve
    this.antenna = scene.add.graphics();

    // Driver (Simple original cap & face - Scaled 1.4x)
    this.driverHead = scene.add.circle(-7, -28, 14, 0xfecdd3);
    this.driverCap = scene.add.rectangle(-7, -39, 28, 11, 0xe11d48);
    this.driverCapBill = scene.add.rectangle(7, -36, 14, 4, 0xe11d48);
    this.driverEye = scene.add.circle(0, -31, 2.8, 0x000000);

    // Headlight (With soft retro yellow glow)
    const headlight = scene.add.circle(67, 0, 8.4, 0xfef08a);
    const headlightGlow = scene.add.circle(67, 0, 14, 0xfef08a, 0.3);

    // Dynamic Plasma Thruster / Exhaust Assembly
    this.exhaustPipe = scene.add.rectangle(-72, 10, 12, 8, 0x3f3f46);
    this.exhaustFlame = scene.add.ellipse(-84, 10, 25, 12, 0x00f2fe, 0.85);
    this.exhaustInner = scene.add.ellipse(-80, 10, 12, 6, 0xffffff, 0.95);

    // Add all body elements to bodyContainer
    this.bodyContainer.add([
      this.exhaustPipe, this.exhaustFlame, this.exhaustInner,
      this.antenna, this.rollBar, this.rollBarTop,
      this.driverHead, this.driverCap, this.driverCapBill, this.driverEye,
      this.chassis, this.bodyTub, this.backBox, this.frontHood, this.windshield,
      headlight, headlightGlow
    ]);

    // Sleek high-fidelity wheels perfectly aligned with the ground (Scaled 1.4x)
    this.frontWheel = this.createWheel(56, 38);
    this.backWheel = this.createWheel(-56, 38);

    // Add both bodyContainer and wheels to primary vehicle container
    this.container.add([
      this.bodyContainer,
      this.frontWheel, this.backWheel
    ]);

    // =========================
    // PHYSICS BODY (Scaled 1.4x)
    // =========================
    scene.matter.add.gameObject(this.container);

    const Bodies = Phaser.Physics.Matter.Matter.Bodies;
    const body = Bodies.rectangle(
      x,
      y,
      196,
      126,
      {
        chamfer: { radius: 35 },
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

    // Bobbing, Spring Whip & Weight Transfer Tracking
    this.rumbleTime = 0;
    this.antennaTipX = -73; // Starts at naturally tilted rest position
    this.antennaTipY = -56;
    this.antennaTipVx = 0;
    this.antennaTipVy = 0;

    // Flip Tracking
    this.lastAngle = this.container.angle;
    this.cumulativeRotation = 0;
  }

  createWheel(x, y) {
    const wheel = this.scene.add.container(x, y);
    
    // 1. Outer tire (Sleek Futuristic Black) - radius 28
    const tire = this.scene.add.circle(0, 0, 28, 0x18181b);
    
    // 2. Thick solid white ring to define the rim boundary against the black tire
    const rimSeparation = this.scene.add.circle(0, 0, 19.6, 0xffffff);
    
    // 3. Rim base (Distinct metallic steel grey) - radius 16.8
    const rim = this.scene.add.circle(0, 0, 16.8, 0x3f3f46);
    
    // 4. Glowing inner cyan rim highlight border
    const rimBorder = this.scene.add.graphics();
    rimBorder.lineStyle(2.1, 0x00f2fe, 1); // Neon Cyan chrome border
    rimBorder.strokeCircle(0, 0, 15.4);
    
    // 5. Star Spokes (5-spoke futuristic premium wheel)
    const spokes = [];
    const spokeCount = 5;
    for (let i = 0; i < spokeCount; i++) {
        const angle = (i * (360 / spokeCount)) * (Math.PI / 180);
        const spoke = this.scene.add.graphics();
        spoke.lineStyle(2.8, 0xff007f, 1); // Bright Neon Pink spoke
        spoke.beginPath();
        spoke.moveTo(0, 0);
        spoke.lineTo(Math.cos(angle) * 15.4, Math.sin(angle) * 15.4);
        spoke.strokePath();
        
        const spoke2 = this.scene.add.graphics();
        spoke2.lineStyle(1.4, 0xffffff, 0.8); // White inner highlighting line
        spoke2.beginPath();
        spoke2.moveTo(0, 0);
        spoke2.lineTo(Math.cos(angle) * 12.6, Math.sin(angle) * 12.6);
        spoke2.strokePath();
        
        spokes.push(spoke, spoke2);
    }
    
    // 6. Hub cap core
    const centerGlow = this.scene.add.circle(0, 0, 5.6, 0x00f2fe, 0.6); // Center cyan hub glow
    const center = this.scene.add.circle(0, 0, 3.5, 0xffffff); // Core silver cap
    
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
    if (grounded) {
      if (forceX !== 0) {
        this.container.setFriction(0.8);
        if (body.velocity.x < this.maxSpeed) {
          // Apply force at a point below the center of mass (wheels level at +28)
          const forcePoint = {
            x: this.container.x,
            y: this.container.y + 28
          };
          Phaser.Physics.Matter.Matter.Body.applyForce(body, forcePoint, { x: forceX, y: 0 });
        }
        
        // Apply the balancing torque
        body.torque += torque;
      } else {
        // Coasting on ground - lower friction to allow rolling
        this.container.setFriction(0.15);
        
        // Calculate downhill rolling force based on tilt (slope angle)
        // If tilt is negative (uphill), Math.sin(tilt) is negative -> rolls backward (left)
        // If tilt is positive (downhill), Math.sin(tilt) is positive -> rolls forward (right)
        const rollFactor = 0.035; 
        const rollForceX = Math.sin(tilt) * rollFactor;
        
        const forcePoint = {
          x: this.container.x,
          y: this.container.y + 28
        };
        Phaser.Physics.Matter.Matter.Body.applyForce(body, forcePoint, { x: rollForceX, y: 0 });
      }
    }

    // Wheel Rotation based on velocity
    const rotationSpeed = body.velocity.x * 0.05;
    this.frontWheel.rotation += rotationSpeed;
    this.backWheel.rotation += rotationSpeed;

    // ================================================================
    // DYNAMIC VISUAL EFFECTS: WEIGHT TRANSFER, RUMBLE & THRUSTERS
    // ================================================================
    // 1. Weight Transfer Tilt (Suspension squat & dive)
    let targetTilt = 0;
    if (this.isGas) {
      targetTilt = -0.06; // Squats back on acceleration
    } else if (this.isBrake) {
      targetTilt = 0.06;  // Dives forward on braking/reversing
    }
    this.bodyContainer.rotation = Phaser.Math.Linear(this.bodyContainer.rotation, targetTilt, 0.12);

    // 2. Idle Engine Rumble & Speed-based Suspension Bobbing
    this.rumbleTime += 0.15 + (Math.abs(body.velocity.x) * 0.04);
    const rumbleAmp = 0.7 + (Math.abs(body.velocity.x) * 0.12);
    this.bodyContainer.y = Math.sin(this.rumbleTime) * rumbleAmp;

    // 3. Dynamic Antenna Whip Flex & Air Sway (physically curves/flexes back under wind drag and inertia, sways upon bumps/landings)
    const springTension = 0.08;
    const damping = 0.85;
    
    // Wind drag bends it backward (strongly proportional to speed)
    const windDragX = -body.velocity.x * 1.5; 
    let accelInertiaX = 0;
    if (this.isGas) {
      accelInertiaX = -8; // Accel pushes it back
    } else if (this.isBrake) {
      accelInertiaX = 10; // Brake throws it forward
    }
    
    // Vibration / bounce sways (chassis rumble + vertical landing impacts)
    const jiggleX = Math.sin(this.rumbleTime * 1.6) * (Math.abs(body.velocity.x) * 0.35)
                  + Math.sin(this.rumbleTime * 2.8) * (Math.abs(body.velocity.y) * 0.45);
    
    // Target whip tip coordinates (relative to the base at -63, 0)
    // Stationary rest tip position is at (-73, -56)
    const targetTipX = -73 + windDragX + accelInertiaX + jiggleX;
    
    // Vertical squash: bending back also pulls the tip slightly downwards
    const targetTipY = -56 + Math.abs(windDragX) * 0.22; 
    
    // Spring physics equations (force -> acceleration -> velocity -> position)
    const springForceX = (targetTipX - this.antennaTipX) * springTension;
    const springForceY = (targetTipY - this.antennaTipY) * springTension;
    
    this.antennaTipVx += springForceX;
    this.antennaTipVy += springForceY;
    this.antennaTipVx *= damping;
    this.antennaTipVy *= damping;
    
    this.antennaTipX += this.antennaTipVx;
    this.antennaTipY += this.antennaTipVy;
    
    // Draw the whip dynamically as a Bezier curve!
    this.antenna.clear();
    
    // Draw neon lime green whip line
    this.antenna.lineStyle(3, 0x39ff14, 1);
    this.antenna.beginPath();
    
    // Generate Bezier curve points mathematically (12 steps is smooth and highly performant)
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const omt = 1 - t; // (1 - t)
      
      // Quadratic Bezier math: B(t) = (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
      // Base P0 = (-63, 0), Control P1 = (-63, -28), Tip P2 = (antennaTipX, antennaTipY)
      const px = omt * omt * -63 + 2 * omt * t * -63 + t * t * this.antennaTipX;
      const py = omt * omt * 0 + 2 * omt * t * -28 + t * t * this.antennaTipY;
      
      if (i === 0) {
        this.antenna.moveTo(px, py);
      } else {
        this.antenna.lineTo(px, py);
      }
    }
    this.antenna.strokePath();
    
    // Draw a small glowing hot pink bead at the tip for premium style and high visibility!
    this.antenna.fillStyle(0xff007f, 1);
    this.antenna.fillCircle(this.antennaTipX, this.antennaTipY, 3.5);

    // 4. Dynamic Plasma Thruster Flame (Cyan forward jet, Orange brake/reverse glow)
    if (this.isGas) {
      this.exhaustFlame.setVisible(true);
      this.exhaustInner.setVisible(true);
      this.exhaustFlame.fillColor = 0x00f2fe; // Vibrant Neon Cyan
      const flicker = 1.0 + Math.random() * 0.5;
      this.exhaustFlame.scaleX = flicker;
      this.exhaustFlame.scaleY = 0.8 + Math.random() * 0.3;
      this.exhaustFlame.alpha = 0.7 + Math.random() * 0.3;
      this.exhaustInner.scaleX = flicker * 0.65;
      this.exhaustInner.scaleY = 0.6;
    } else if (this.isBrake) {
      this.exhaustFlame.setVisible(true);
      this.exhaustInner.setVisible(false);
      this.exhaustFlame.fillColor = 0xff5500; // Hot red-orange retro brake thruster
      this.exhaustFlame.scaleX = 0.6 + Math.random() * 0.2;
      this.exhaustFlame.scaleY = 0.8;
      this.exhaustFlame.alpha = 0.9;
    } else {
      // Coasting / Idle - faint ambient exhaust puff
      this.exhaustFlame.setVisible(true);
      this.exhaustInner.setVisible(false);
      this.exhaustFlame.fillColor = 0x00f2fe;
      this.exhaustFlame.scaleX = 0.2 + Math.sin(this.rumbleTime) * 0.05;
      this.exhaustFlame.scaleY = 0.2;
      this.exhaustFlame.alpha = 0.3;
    }

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
