if (typeof(ModulesLoader) == "undefined") {
  throw "ModulesLoaderV2.js is required to load script FlyingVehicle.js";
}
// Loads dependencies and initializes this module
ModulesLoader.requireModules(['threejs/three.min.js', 'Physics.js', 'DebugHelper.js']);

/** An Helicopter
 *
 * @param configuration
 * @returns {Helicopter}
 */
function Helicopter(configuration) {
  if (!configuration.hasOwnProperty('position')) {
    configuration.position = new THREE.Vector3(0.0, 0.0, 0.0);
  }
  if (!configuration.hasOwnProperty('xAngle')) {
    configuration.xAngle = 0.0;
  }
  if (!configuration.hasOwnProperty('yAngle')) {
    configuration.yAngle = 0.0;
  }
  if (!configuration.hasOwnProperty('zAngle')) {
    configuration.zAngle = 0.0;
  }

  this.position = new THREE.Object3D();
  this.position.position.x = configuration.position.x;
  this.position.position.y = configuration.position.y;
  this.position.position.z = configuration.position.z;


  this.palesSpeed = 0;
  this.PALE_BASE_ANGULAR_SPEED = 2;
  this.PALE_ANGULAR_SPEED_COEF = 1 / 60;

  this.turbineRotationSpeed = 2 * Math.PI / 60;
  this.corpRotationSpeed = 2 * Math.PI / 120;
  this.corpRotation = 0;
  this.turbineRotation = 0;


  this.speed = 0; // px/frame
  this.MAX_SPEED = 10; // px/frame
  this.acceleration = 0.5; // px.frame^-2
  this.frictionDeceleration = 0.1;
  this.steps = 50;
  this.avancement = 0;

  this.curves = {
    position: [],
    speed: [],
    acceleration: []
  };


  p = [
    new THREE.Vector3(-170, -20, 150),
    new THREE.Vector3(-170, 250, 150),
    new THREE.Vector3(170, 250, 150),
    new THREE.Vector3(170, 0, 150),
    new THREE.Vector3(170, 0, 150),
    new THREE.Vector3(170, -250, 150),
    new THREE.Vector3(-170, -250, 150),
    new THREE.Vector3(-170, -20, 150)
  ];


  /*Bezier */

  this.curve1 = new THREE.CubicBezierCurve3(
    p[0],
    p[1],
    p[2],
    p[3]
  );

  this.curve2 = new THREE.CubicBezierCurve3(
    p[4],
    p[5],
    p[6],
    p[7]
  );

  this.points1 = this.curve1.getPoints(50);
  this.points2 = this.curve2.getPoints(50);

  var starsGeometry = new THREE.Geometry();

  this.points1.forEach((p) => {
    starsGeometry.vertices.push(p);
  });
  this.points2.forEach((p) => {
    starsGeometry.vertices.push(p);
  });

  var material = new THREE.LineBasicMaterial({
    color: 0xff0000
  });

  this.curveObject = new THREE.Line(starsGeometry, material);

  this.helicoParts = {
    turbineDroite: new THREE.Object3D(),
    axeDroit: new THREE.Object3D(),
    axeDroitPal1: new THREE.Object3D(),
    axeDroitPal2: new THREE.Object3D(),
    axeDroitPal3: new THREE.Object3D(),
    turbineGauche: new THREE.Object3D(),
    axeGauche: new THREE.Object3D(),
    axeGauchePal1: new THREE.Object3D(),
    axeGauchePal2: new THREE.Object3D(),
    axeGauchePal3: new THREE.Object3D(),
    turbineCentral: new THREE.Object3D(),
    axeCentral: new THREE.Object3D(),
    axeCentralPal1: new THREE.Object3D(),
    axeCentralPal2: new THREE.Object3D(),
    axeCentralPal3: new THREE.Object3D()
  }

  configuration.Loader.load({
    filename: 'assets/helico/helicoCorp.obj',
    node: this.position,
    name: 'helico_corps'
  })

  /* Add rigth turbine */


  this.helicoParts.turbineDroite.position.set(8.5, -3, 4);
  configuration.Loader.load({
    filename: 'assets/helico/turbine.obj',
    node: this.helicoParts.turbineDroite,
    name: 'turbine_droite'
  })
  this.position.add(this.helicoParts.turbineDroite)

  /* Add right axeRotator */

  this.helicoParts.axeDroit.position.y = 1;
  configuration.Loader.load({
    filename: 'assets/helico/axe.obj',
    node: this.helicoParts.axeDroit,
    name: 'axe_droite'
  });
  this.helicoParts.turbineDroite.add(this.helicoParts.axeDroit)

  /* Add pales for rigth axeRotator */


  this.helicoParts.axeDroitPal1.position.y = 2.9;
  configuration.Loader.load({
    filename: 'assets/helico/pale.obj',
    node: this.helicoParts.axeDroitPal1,
    name: 'axe_droite_pal_01'
  })
  this.helicoParts.turbineDroite.add(this.helicoParts.axeDroitPal1)

  this.helicoParts.axeDroitPal2.position.y = 2.9;
  this.helicoParts.axeDroitPal2.rotation.y = -2 * Math.PI / 3;
  configuration.Loader.load({
    filename: 'assets/helico/pale.obj',
    node: this.helicoParts.axeDroitPal2,
    name: 'axe_droite_pal_02'
  })
  this.helicoParts.turbineDroite.add(this.helicoParts.axeDroitPal2)

  this.helicoParts.axeDroitPal3.position.y = 2.9;
  this.helicoParts.axeDroitPal3.rotation.y = 2 * Math.PI / 3;
  configuration.Loader.load({
    filename: 'assets/helico/pale.obj',
    node: this.helicoParts.axeDroitPal3,
    name: 'axe_droite_pal_03'
  })
  this.helicoParts.turbineDroite.add(this.helicoParts.axeDroitPal3)

  /* Add left turbine */

  this.helicoParts.turbineGauche.position.set(-8.5, -3, 4);
  configuration.Loader.load({
    filename: 'assets/helico/turbine.obj',
    node: this.helicoParts.turbineGauche,
    name: 'turbine_gauche'
  })
  this.position.add(this.helicoParts.turbineGauche);


  /* Add left axeRotator */

  this.helicoParts.axeGauche.position.y = 1;
  configuration.Loader.load({
    filename: 'assets/helico/axe.obj',
    node: this.helicoParts.axeGauche,
    name: 'axe_gauche'
  });
  this.helicoParts.turbineGauche.add(this.helicoParts.axeGauche);

  /* Add pales for left axeRotator */

  this.helicoParts.axeGauchePal1.position.y = 2.9
  configuration.Loader.load({
    filename: 'assets/helico/pale.obj',
    node: this.helicoParts.axeGauchePal1,
    name: 'axe_gauche_pal_01'
  })
  this.helicoParts.turbineGauche.add(this.helicoParts.axeGauchePal1)

  this.helicoParts.axeGauchePal2.position.y = 2.9
  this.helicoParts.axeGauchePal2.rotation.y = -2 * Math.PI / 3;
  configuration.Loader.load({
    filename: 'assets/helico/pale.obj',
    node: this.helicoParts.axeGauchePal2,
    name: 'axe_gauche_pal_02'
  })
  this.helicoParts.turbineGauche.add(this.helicoParts.axeGauchePal2)

  this.helicoParts.axeGauchePal3.position.y = 2.9
  this.helicoParts.axeGauchePal3.rotation.y = 2 * Math.PI / 3;
  configuration.Loader.load({
    filename: 'assets/helico/pale.obj',
    node: this.helicoParts.axeGauchePal3,
    name: 'axe_gauche_pal_03'
  })
  this.helicoParts.turbineGauche.add(this.helicoParts.axeGauchePal3)


  /*Add central turbine */

  this.helicoParts.turbineCentral.position.set(0, 0, 4);
  this.helicoParts.turbineCentral.rotation.x = Math.PI / 2;
  configuration.Loader.load({
    filename: 'assets/helico/turbine.obj',
    node: this.helicoParts.turbineCentral,
    name: 'turbine_centrale'
  });
  this.position.add(this.helicoParts.turbineCentral);

  /* Add central axeRotator */

  this.helicoParts.axeCentral.position.y = 1
  configuration.Loader.load({
    filename: 'assets/helico/axe.obj',
    node: this.helicoParts.axeCentral,
    name: 'axe_centrale'
  })
  this.helicoParts.turbineCentral.add(this.helicoParts.axeCentral);

  /*Add pales for central axeRotator */

  this.helicoParts.axeCentralPal1.position.y = 2.9;
  configuration.Loader.load({
    filename: 'assets/helico/pale.obj',
    node: this.helicoParts.axeCentralPal1,
    name: 'axe_central_pal_01'
  })
  this.helicoParts.turbineCentral.add(this.helicoParts.axeCentralPal1)

  this.helicoParts.axeCentralPal2.position.y = 2.9;
  this.helicoParts.axeCentralPal2.rotation.y = -2 * Math.PI / 3;
  configuration.Loader.load({
    filename: 'assets/helico/pale.obj',
    node: this.helicoParts.axeCentralPal2,
    name: 'axe_central_pal_02'
  })
  this.helicoParts.turbineCentral.add(this.helicoParts.axeCentralPal2)

  this.helicoParts.axeCentralPal3.position.y = 2.9;
  this.helicoParts.axeCentralPal3.rotation.y = 2 * Math.PI / 3;
  configuration.Loader.load({
    filename: 'assets/helico/pale.obj',
    node: this.helicoParts.axeCentralPal3,
    name: 'axe_central_pal_03'
  })
  this.helicoParts.turbineCentral.add(this.helicoParts.axeCentralPal3)

  /* Methods  */



  this.cubicdt = function(p, t) {
    var r = new THREE.Vector3(0, 0, 0);
    r.add(p[0].clone().multiplyScalar(-3 * t * t));
    r.add(p[1].clone().multiplyScalar(9 * t * t));
    r.add(p[2].clone().multiplyScalar(-9 * t * t));
    r.add(p[3].clone().multiplyScalar(3 * t * t));
    r.add(p[0].clone().multiplyScalar(6 * t));
    r.add(p[1].clone().multiplyScalar(-12 * t));
    r.add(p[2].clone().multiplyScalar(6 * t));
    r.add(p[0].clone().multiplyScalar(-3));
    r.add(p[1].clone().multiplyScalar(3));
    return r;
  };


  this.cubicdt2 = function(p, t) {
    var r = new THREE.Vector3(0, 0, 0);
    r.add(p[0].clone().multiplyScalar(-6 * t));
    r.add(p[1].clone().multiplyScalar(18 * t));
    r.add(p[2].clone().multiplyScalar(-18 * t));
    r.add(p[3].clone().multiplyScalar(3 * t));
    r.add(p[0].clone().multiplyScalar(6));
    r.add(p[1].clone().multiplyScalar(-12));
    r.add(p[2].clone().multiplyScalar(6));
    return r;
  };

  this.interpolate = function(curve, n, p) {
    var r = [];
    for (var i = 0; i < n; i++) {
      r.push(curve(p, (i / n)));
    }
    return r;
  }

  this.turnPales = function() {

    var coef = (this.palesSpeed / 10 + this.PALE_BASE_ANGULAR_SPEED) * this.PALE_ANGULAR_SPEED_COEF;

    this.helicoParts.axeDroitPal1.rotation.y += 2 * Math.PI * coef;
    this.helicoParts.axeDroitPal2.rotation.y += 2 * Math.PI * coef;
    this.helicoParts.axeDroitPal3.rotation.y += 2 * Math.PI * coef;
    this.helicoParts.axeGauchePal1.rotation.y += 2 * Math.PI * coef;
    this.helicoParts.axeGauchePal2.rotation.y += 2 * Math.PI * coef;
    this.helicoParts.axeGauchePal3.rotation.y += 2 * Math.PI * coef;
    this.helicoParts.axeCentralPal1.rotation.y += 2 * Math.PI * coef;
    this.helicoParts.axeCentralPal2.rotation.y += 2 * Math.PI * coef;
    this.helicoParts.axeCentralPal3.rotation.y += 2 * Math.PI * coef;
  }

  this.setSpeed = function(s) {
    this.speed = s;
    if (this.speed > this.MAX_SPEED) {
      this.speed = this.MAX_SPEED;
    }
    if (this.speed < 0) {
      this.speed = 0;
    }
    this.palesSpeed = s;
  }

  this.setTurbinRotation = function(rotation) {
    this.helicoParts.turbineDroite.rotation.z = rotation;
    this.helicoParts.turbineGauche.rotation.z = rotation;
  }

  this.setRotation = function(rotation) {
    this.helicoParts.turbineDroite.rotation.z += rotation;
    this.helicoParts.turbineGauche.rotation.z += rotation;
  }

  this.setMRotation = function(rotation) {
    this.position.rotation.z -= rotation;
  }

  this.turnLeft = function() {
    //this.setTurbinRotation(this.helicoParts.turbineDroite.rotation.z + this.turbineRotationSpeed)
    this.setRotation(this.helicoParts.turbineDroite.rotation.z + this.turbineRotationSpeed);
  }

  this.turnRight = function() {
    //this.setTurbinRotation(this.helicoParts.turbineDroite.rotation.z - this.turbineRotationSpeed)
    this.setRotation(this.helicoParts.turbineDroite.rotation.z - this.turbineRotationSpeed);
  }

  this.speedup = function() {
    this.setSpeed(this.speed + this.acceleration);
  }

  this.brake = function() {
    this.setSpeed(this.speed - this.acceleration);
  }

  this.handleSpeed = function() {
    this.setSpeed(this.speed - this.frictionDeceleration);
    this.position.position.y += this.speed * Math.cos(this.position.rotation.z);
    this.position.position.x -= this.speed * Math.sin(this.position.rotation.z);
  }


  this.handleRotation = function() {

    var turbineRotation = this.helicoParts.turbineDroite.rotation.z;
    var corpRotation = (this.position.rotation.z + 2 * Math.PI) % (2 * Math.PI);

    switch (true) {
      case turbineRotation > this.corpRotationSpeed:
        corpRotation += this.corpRotationSpeed;
        turbineRotation -= this.corpRotationSpeed;
        break;

      case turbineRotation < -this.corpRotationSpeed:
        corpRotation -= this.corpRotationSpeed;
        turbineRotation += this.corpRotationSpeed;
        break;

      case turbineRotation > 0:
        corpRotation = corpRotation - turbineRotation;
        turbineRotation = 0;
        break;

      case turbineRotation < 0:
        corpRotation = corpRotation + turbineRotation;
        turbineRotation = 0;
        break;
    }

    this.helicoParts.turbineDroite.rotation.z = turbineRotation;
    this.helicoParts.turbineGauche.rotation.z = turbineRotation;
    this.position.rotation.z = corpRotation;
  }

  this.bezierRotation = function() {

  }

  this.getCurveObject = function() {
    return this.curveObject;
  }



  this.makeRotation = function() {
    var speed;
    var angle;
    var next;
    if (this.avancement === 1999) {
      next = 0;
    } else {
      next = this.avancement + 1;
    }
    speed = this.curves.position[this.avancement];
    angle = (speed.angleTo(new THREE.Vector3(this.curves.position[next].x, this.curves.position[next].y, this.curves.position[next].z)));
    if (this.avancement === 1999)
      this.position.rotation.z = 0

    if ((this.avancement >= 300 && this.avancement <= 400) ||
      (this.avancement >= 700 && this.avancement <= 800) ||
      (this.avancement >= 1300 && this.avancement <= 1400) ||
      (this.avancement >= 1650 && this.avancement <= 1950)
    ) {
      angle = angle * 2
    }
    this.setMRotation(angle);
  }

  this.update = function() {
    this.handleSpeed();
    this.turnPales();
    this.position.position.x = this.curves.position[this.avancement].x;
    this.position.position.y = this.curves.position[this.avancement].y;
    this.position.position.z = this.curves.position[this.avancement].z;
    this.makeRotation();
    if ((this.avancement + 1) === 2000) {
      this.tour++
    }
    this.avancement = (this.avancement + 1) % 2000;

    //this.handleRotation();
  }

  this.createBezier = function() {
    var temp = 0;
    while (temp <= 1) {
      this.curves.position.push(this.curve1.getPointAt(temp))
      temp += 0.001
    }
    temp = 0
    while (temp <= 1) {
      this.curves.position.push(this.curve2.getPointAt(temp))
      temp += 0.001
    }
  }

  this.reset = function (){
    this.position.position.x = configuration.position.x;
    this.position.position.y = configuration.position.y;
    this.position.position.z = configuration.position.z;
    this.position.rotation.z = 0;
    this.avancement = 0;

  }
  this.createBezier()


  return this;
}
