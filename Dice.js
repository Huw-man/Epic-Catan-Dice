"use strict";
// Set up the scene, camera, and renderer as global variables.
var scene, camera, camera2, cameraHelper, renderer, controls, world, cube, cubeBody, plane;
var timeStep = 1/60;

initThree();
initCannon();
animate();

// Sets up the scene.
function initThree() {

    // Create the scene and set the scene size.
    scene = new THREE.Scene();
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;

    // Create a renderer and add it to the DOM.
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById("mainCanvas"), antialias:true});
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // document.body.appendChild(renderer.domElement);
    // Set the background color of the scene.
    renderer.setClearColor(0x333F47, 1);

    // Cameras
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 5000);
    camera.position.set( -5, 10, 10);
    // camera.rotation.x = Math.PI /2
    scene.add(camera);

    //Helpers
    // var axes = new THREE.AxisHelper(5);
    // var grid = new THREE.GridHelper(100, 2);
    // grid.setColors(0x0000ff, 0x808080);
    // scene.add(axes);
    // scene.add(grid);

    // Lights
    // var pointLight = new THREE.PointLight(0xffffff);
    // pointLight.position.set(400, 300, 500);
    // // pointLight.castShadow = true;
    // scene.add(pointLight);

    // var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    // scene.add(ambientLight);

    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 50, 50, 40 );
    scene.add( spotLight );

    var spotLightHelper = new THREE.SpotLightHelper( spotLight );
    scene.add( spotLightHelper );


    // spotLight.target = cube;
    //
    // spotLight.castShadow = true;
    var shadowCamera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 5000);
    shadowCamera.position.copy(spotLight.position);
    spotLight.castShadow = true;
    spotLight.shadow = new THREE.LightShadow(shadowCamera);
    spotLight.shadow.bias = 0.001;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    // spotLight.shadow.update( spotLight );

    //Geometry
    var cubeGeometry = new THREE.CubeGeometry(1, 1, 1 );
    // var modifier = new THREE.SubdivisionModifier( 4 ); //attempt to smooth cube
    // modifier.modify( cubeGeometry );
    var cubeMaterial = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
    cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
    cube.position.set( 0, 5, 0);
    cube.castShadow = true;
    scene.add( cube );

    var planeGeometry = new THREE.PlaneGeometry( 100, 100, 1, 1 );
    var planeMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
    plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.material.side = THREE.DoubleSide;
    plane.receiveShadow = true;
    plane.rotation.x =  Math.PI /2 ;//90 * (Math.PI / 180);
    plane.position.y = 0;
    scene.add( plane );

    // Add OrbitControls so that we can pan around with the mouse.
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    //window resize
    window.addEventListener( 'resize', onWindowResize, false );

}

function initCannon() {
    world = new CANNON.World();
    // world.quatNormalizeSkip = 0;
    // world.quatNormalizeFast = false;
    world.gravity.set(0,-9.82,0); //y as up and down
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    var cubeShape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
    var mass = 5;
    cubeBody = new CANNON.Body({
        mass: mass,
        shape: cubeShape
    });
    // body.addShape(shape);
    cubeBody.angularVelocity.set(Math.random() * 10 -5 , Math.random() * 10 -5, Math.random() * 10 -5);
    cubeBody.velocity.set( Math.random() * 10 -5 , - Math.random() * 30, Math.random() * 10 -5);
    cubeBody.angularDamping = 0.1;
    cubeBody.position.set(0,5,0);
    world.addBody(cubeBody);

    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2); //rotate ground so y is up
    world.add(groundBody);

}

function updatePhysics() {
    // Step the physics world
    world.step(timeStep);
    // Copy coordinates from Cannon.js to Three.js
    cube.position.copy(cubeBody.position);
    cube.quaternion.copy(cubeBody.quaternion);
}

// Renders the scene and updates the render as needed.
// var delta = 0;
function animate() {
    // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    requestAnimationFrame(animate);

    camera.lookAt(cube.position);
    // camera.position.x = Math.sin(delta) * 1000;
    // camera.position.z = Math.cos(delta) * 1000;
    // Render the scene.
    updatePhysics();
    renderer.render(scene, camera);
    controls.update();

}

function onWindowResize() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}