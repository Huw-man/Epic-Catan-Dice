"use strict";
// Set up the scene, camera, and renderer as global variables.
var scene, camera, camera2, cameraHelper, renderer, controls, raycaster;
//Meshes for THREE
var cube, cube2, redCity, blueCity, whiteCity, orangeCity, greenCity, brownCity,
    plane, playerSelectors, selectorBackground, turnIndicators;
//Bodies for CANNON
var world, cubeBody, cubeBody2, leftBarrier, rightBarrier, topBarrier, bottomBarrier;
var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;
var timeStep = 1/60;
var delta = 0;
var mouse = new THREE.Vector2(), INTERSECTED;
var sixRandomVectors = generateSixRandomVectors();
var diceView = false;
var transition = false;
var turnOrder = [];

initThree();
initCannon();
animate();
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener('click', onMouseClick, false);
document.getElementById("roll button").onclick = roll;
document.getElementById("simple_dice").onclick = function () { transition = true };
document.getElementById("back").onclick = function () { transition = true};
document.getElementById("reset_turns").onclick = resetTurns;
cubeBody.addEventListener("sleep", function () { afterRoll(cube) });
cubeBody2.addEventListener("sleep", function () { afterRoll(cube2) });



// Sets up the scene.
function initThree() {

    // Create the scene and set the scene size.
    scene = new THREE.Scene();

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
    camera.position.set( 0, 0, 25);
    // camera.rotation.x = Math.PI /2
    scene.add(camera);

    //Helpers
    // var axes = new THREE.AxisHelper(5);
    // var grid = new THREE.GridHelper(50, 1);
    // scene.add(axes);
    // grid.setColors(0x0000ff, 0x808080);
    // grid.rotation.x = Math.PI /2;
    // scene.add(grid);

    // Lights
    // var ambientLight = new THREE.AmbientLight(0xffffff, 0.001);
    // scene.add(ambientLight);

    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.4 );
    light.rotation.x = Math.PI /2 ;
    // var hemHelper = new THREE.HemisphereLightHelper(light, 15);
    // scene.add(hemHelper);
    scene.add( light );


    var diceLight = new THREE.SpotLight( 0xffffff, 0.7);
    diceLight.position.set( 10, -10, 50 );
    // var spotLightHelper = new THREE.SpotLightHelper( spotLight );
    // scene.add( spotLightHelper );
    // spotLight.target = cube;
    diceLight.castShadow = true;
    diceLight.shadow.bias = 0.001;
    diceLight.shadow.mapSize.width = 2048*2;
    diceLight.shadow.mapSize.height = 2048*2;
    diceLight.shadow.camera.near = 5;
    diceLight.shadow.camera.far = 100;
    scene.add( diceLight );

    var playerSelectorLight = new THREE.SpotLight( 0xffffff, 0.7);
    playerSelectorLight.position.set( -10, 10, 30 );
    // playerSelectorLight.target
    playerSelectorLight.castShadow = true;
    playerSelectorLight.shadow.bias = 0.001;
    playerSelectorLight.shadow.mapSize.width = 2048*2;
    playerSelectorLight.shadow.mapSize.height = 2048*2;
    playerSelectorLight.shadow.camera.near = 5;
    playerSelectorLight.shadow.camera.far = 100;
    scene.add( playerSelectorLight );


    //Elements
    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1 );
    // var modifier = new THREE.SubdivisionModifier( 4 ); //attempt to smooth cube
    // modifier.modify( cubeGeometry );
    // var cubeMaterial = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
    var faceMaterial = []; //apply texture to each face
    for (var i=1; i < 7; i++) {
        faceMaterial.push( new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: new THREE.TextureLoader().load("images/dice"+i+".PNG") }) );
    }
    cube = new THREE.Mesh( cubeGeometry, new THREE.MeshFaceMaterial(faceMaterial) );
    cube.castShadow = true;
    scene.add( cube );

    cube2 = new THREE.Mesh(cubeGeometry, new THREE.MeshFaceMaterial(faceMaterial));
    cube2.castShadow = true;
    scene.add(cube2);

    var planeGeometry = new THREE.PlaneGeometry( 50, 50, 1, 1 );
    var planeMaterial = new THREE.MeshPhongMaterial( { map: new THREE.TextureLoader().load("images/woodGrain.jpg") });
    plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.material.side = THREE.DoubleSide;
    plane.receiveShadow = true;
    scene.add( plane );

    selectorBackground = new THREE.Mesh( planeGeometry, planeMaterial );
    selectorBackground.recieveShadow = true;
    selectorBackground.rotation.y = Math.PI/2;
    selectorBackground.position.set(25, 0, 25);
    scene.add(selectorBackground);

    playerSelectors = new THREE.Group();
    //create city selectors
    var cityGeometry = createCityGeometry(1);
    var spacing = 4;
    whiteCity = new THREE.Mesh(cityGeometry, new THREE.MeshLambertMaterial());
    whiteCity.name = "White";
    whiteCity.castShadow = true;
    whiteCity.position.set(-(5/2) * spacing,0,0);
    playerSelectors.add(whiteCity);

    redCity = new THREE.Mesh(cityGeometry, new THREE.MeshLambertMaterial({color: 0xff0000}));
    redCity.name = "Red";
    redCity.castShadow = true;
    redCity.position.set(-(3/2) * spacing,0,0);
    playerSelectors.add(redCity);

    blueCity = new THREE.Mesh(cityGeometry, new THREE.MeshLambertMaterial({color: 0x0000ff}));
    blueCity.name = "Blue";
    blueCity.castShadow = true;
    blueCity.position.set(-spacing/2,0,0);
    playerSelectors.add(blueCity);

    orangeCity = new THREE.Mesh(cityGeometry, new THREE.MeshLambertMaterial({color: 0xffA500}));
    orangeCity.name = "Orange";
    orangeCity.castShadow = true;
    orangeCity.position.set(spacing/2,0,0);
    playerSelectors.add(orangeCity);

    greenCity = new THREE.Mesh(cityGeometry, new THREE.MeshLambertMaterial({color: 0x008000}));
    greenCity.name = "Green";
    greenCity.castShadow = true;
    greenCity.position.set((3/2) * spacing,0,0);
    playerSelectors.add(greenCity);

    brownCity = new THREE.Mesh(cityGeometry, new THREE.MeshLambertMaterial({color: 0x8B4513}));
    brownCity.name = "Brown";
    brownCity.castShadow = true;
    brownCity.position.set((5/2) * spacing,0,0);
    playerSelectors.add(brownCity);

    playerSelectors.position.set(23, 0, 25);
    playerSelectors.rotation.y = -Math.PI/2;
    scene.add(playerSelectors);

    playerSelectorLight.target = selectorBackground;
    camera.lookAt(playerSelectors.position);

    turnIndicators = new THREE.Group();
    var vHeight = visibleHeightAtZDepth(plane.position.z, camera) /2 *0.82;
    turnIndicators.position.set(0,vHeight,2);
    // playerSelectors.rotation.y = -Math.PI/2;
    scene.add(turnIndicators);
    // Add OrbitControls so that we can pan around with the mouse.
    // controls = new THREE.OrbitControls(camera, renderer.domElement);

    //window resize
    window.addEventListener( 'resize', onWindowResize, false );
    // window.addEventListener( "click", findDiceFace );

    raycaster = new THREE.Raycaster();

}

function initCannon() {
    world = new CANNON.World();
    // world.quatNormalizeSkip = 0;
    // world.quatNormalizeFast = false;
    world.gravity.set(0,0, -9.82); //y as up and down
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.allowSleep = true;

    var cubeShape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
    var mass = 5;
    cubeBody = new CANNON.Body({
        mass: mass,
        shape: cubeShape
    });
    cubeBody.angularDamping = 0.1;
    cubeBody.position.set(-1,0,5);
    cubeBody.allowSleep = true;
    cubeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), -Math.PI/2);
    world.addBody(cubeBody);
    // cubeBody.addEventListener("sleep", function () { findDiceFace(cube) });

    cubeBody2 = new CANNON.Body({
        mass: mass,
        shape: cubeShape
    });
    cubeBody2.angularDamping = 0.1;
    cubeBody2.position.set(1,0,5);
    cubeBody2.allowSleep = true;
    cubeBody2.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), -Math.PI/2);
    world.addBody(cubeBody2);

    //Material
    var diceMaterial = new CANNON.Material("dice material");
    cubeBody.material = diceMaterial;
    cubeBody2.material = diceMaterial;
    var barrierMaterial = new CANNON.Material("barrier material");
    var tableMaterial = new CANNON.Material("table material");
    world.addContactMaterial( new CANNON.ContactMaterial( diceMaterial, tableMaterial, {
        friction: 0.1,
        restitution: 0
    }));
    world.addContactMaterial( new CANNON.ContactMaterial( diceMaterial, barrierMaterial, {
        friction: 0,
        restitution: 0.6
    }));
    world.addContactMaterial( new CANNON.ContactMaterial( diceMaterial, cubeBody.material, {
        friction: 0,
        restitution: 0.6
    }));

    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0, shape: groundShape, material: tableMaterial });
    // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
    world.add(groundBody);

    //position of barriers in view frame
    var pHeight = visibleHeightAtZDepth(plane.position.z, camera) /2*0.8;
    var pWidth = visibleWidthAtZDepth(plane.position.z, camera) /2*0.8;
    // console.log(pHeight,pWidth);
    //Barriers
    // -x plane
    leftBarrier = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() , material: barrierMaterial });
    leftBarrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI/2);
    leftBarrier.position.set(-pWidth,0,0);
    world.addBody(leftBarrier);

    // +x plane
    rightBarrier = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() , material: barrierMaterial });
    rightBarrier.quaternion.setFromAxisAngle( new CANNON.Vec3(0, 1, 0), -Math.PI /2);
    rightBarrier.position.set( pWidth,0, 0);
    world.addBody(rightBarrier);

    // -y plane
    topBarrier = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() , material: barrierMaterial });
    topBarrier.quaternion.setFromAxisAngle( new CANNON.Vec3(1, 0, 0), -Math.PI /2);
    topBarrier.position.set( 0, -pHeight, 0);
    world.addBody(topBarrier);

    // +y plane
    bottomBarrier = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() , material: barrierMaterial });
    bottomBarrier.quaternion.setFromAxisAngle( new CANNON.Vec3(1, 0, 0), Math.PI /2);
    bottomBarrier.position.set( 0, pHeight, 0);
    world.addBody(bottomBarrier);

}

function updatePhysics() {
    // Step the physics world
    world.step(timeStep);
    // Copy coordinates from Cannon.js to Three.js
    cube.position.copy(cubeBody.position);
    cube.quaternion.copy(cubeBody.quaternion);

    cube2.position.copy(cubeBody2.position);
    cube2.quaternion.copy(cubeBody2.quaternion);
}

// Renders the scene and updates the render as needed.
function animate() {
    // delta += 0.001;
    // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    requestAnimationFrame(animate);

    rotateSelectors(sixRandomVectors); //also rotates indicators
    transitions();
    displayControls();
    // show intersections
    highlightSelectors();

    // console.log(visibleHeightAtZDepth(plane.position.z, camera));
    // console.log(visibleWidthAtZDepth(plane.position.z, camera));
    // Render the scene.
    updatePhysics();
    renderer.render(scene, camera);
    // controls.update();

}

function onWindowResize() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    positionBarriers();
    positionTurnIndicators();
}

function findDiceFace(dice) {
    var aboveFacePosition = dice.position.clone();
    aboveFacePosition.z += 2;
    var raycaster = new THREE.Raycaster( aboveFacePosition, new THREE.Vector3(0, 0, -1) );
    var intersect = raycaster.intersectObject(dice);
    // var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(0, 0, -1), aboveFacePosition );
    // scene.add( arrowHelper );

    var id = intersect[0].faceIndex;
    switch (true) {
        case (id < 2):

            return 1;
        case (id < 4):

            return 2;
        case (id < 6):

            return 3;
        case (id < 8):

            return 4;
        case (id < 10):

            return 5;
        case (id < 12):

            return 6;
    }
}

function visibleHeightAtZDepth( depth, camera ) {
    // compensate for cameras not positioned at z=0
    const cameraOffset = camera.position.z;
    if ( depth < cameraOffset ) depth -= cameraOffset;
    else depth += cameraOffset;

    // vertical fov in radians
    const vFOV = camera.fov * Math.PI / 180;

    // Math.abs to ensure the result is always positive
    return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
}

function visibleWidthAtZDepth( depth, camera ) {
    const height = visibleHeightAtZDepth( depth, camera );
    return height * camera.aspect;
}

function roll(){
    rollDice1();
    rollDice2();
}

function rollDice1() {
    var strength = 20;
    var radius = 10;
    var values = generateRandomVector();
    cubeBody.wakeUp();
    cubeBody.position.set(values.x * radius, values.y * radius, 3);
    cubeBody.velocity.set(-values.x*strength, -values.y*strength, -values.z);
    cubeBody.angularVelocity.set(values.x*strength, values.y*strength, values.z*strength);
}

function rollDice2() {
    var strength = 20;
    var radius = 10;
    var values = generateRandomVector();
    cubeBody2.wakeUp();
    cubeBody2.position.set(values.x * radius, values.y * radius, 3);
    cubeBody2.velocity.set(-values.x*strength, -values.y*strength, -values.z);
    cubeBody2.angularVelocity.set(values.x*strength, values.y*strength, values.z*strength);
}

function afterRoll(){
    var d1Result = findDiceFace(cube);
    var d2Result = findDiceFace(cube2);
    document.getElementById("results").innerHTML = d1Result.toString()+" + "+d2Result.toString();
}

/*Makes geometry for city Mesh*/
function createCityGeometry( scale ) {
    var c = new THREE.Vector2(0,0);
    var cityShape = new THREE.Shape();
    cityShape.moveTo(c.x,c.y);
    cityShape.lineTo(c.x +scale,0);
    cityShape.lineTo(c.x+scale, c.y -scale);
    cityShape.lineTo(0, c.y -scale);
    cityShape.lineTo(c.x -scale, c.y -scale);
    cityShape.lineTo(c.x -scale, 0);
    cityShape.lineTo(c.x -scale, c.y +scale);
    cityShape.lineTo(c.x -scale/2, c.y +scale + scale/2);
    cityShape.lineTo(0, c.y +scale);
    cityShape.lineTo(c.x,c.y);

    var geom = new THREE.ExtrudeGeometry(cityShape, {
        amount: scale,
        bevelEnabled: false
    });
    geom.computeBoundingBox();
    geom.center();
    return geom;

}

function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function highlightSelectors() {
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( playerSelectors.children );
    if ( intersects.length > 0 ) {
        if ( INTERSECTED !== intersects[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material.emissive.set( INTERSECTED.currentHex );
            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.set( 0xff0000 );
        }
    } else {
        if ( INTERSECTED ) INTERSECTED.material.emissive.set( INTERSECTED.currentHex );
        INTERSECTED = null;
    }
}

function onMouseClick( event ) {
    if (INTERSECTED) {
        // alert( INTERSECTED.name);
        if (!containsObject(turnOrder, INTERSECTED)) {
            turnOrder.push(INTERSECTED);
            displayPlayerOrder();
        } else {
            // alert("player already selected");
            var prompt = document.getElementById("prompt_text");
            prompt.innerHTML = INTERSECTED.name +" is already selected";
            setTimeout(function() {
                prompt.innerHTML = "select players";
            }, 1000);
        }
    }
}

function containsObject( array, obj) {
    for (var i=0; i < array.length; i++) {
        if (array[i] === obj) { return true;}
    }
    return false;
}


function rotateSelectors( axes ) {
    // console.log(axes);
    var selectors = playerSelectors.children;
    // selectors[0].rotateOnAxis(axes[0], 0.01);
    for (var i=0; i < selectors.length; i++) {
        selectors[i].rotateOnAxis(axes[i], 0.01);
        if (turnIndicators.children[i]){
            turnIndicators.children[i].rotateOnAxis(axes[i], 0.01);
        }
    }

}

function transitions(){
    if (!diceView && transition) {
        // console.log("transition");
        camera.rotateY(0.04);
        // camera.position.z += delta ;
        // console.log(camera.position);
        if (camera.rotation.y >= -0.03 && camera.rotation.y <= 0.03){
            transition = false;
            diceView = true;
            camera.lookAt(plane.position);
            // camera.position.set(0,0, 25);
            camera.updateProjectionMatrix();
        }

        camera.updateProjectionMatrix();
    } else if (diceView && transition){
        camera.rotateY(-0.04);
        if (camera.rotation.y >= -0.03 - Math.PI/2 && camera.rotation.y <= 0.03 - Math.PI/2){
            transition = false;
            diceView = false;
            camera.lookAt(selectorBackground.position);
            // camera.position.set(0,0, 25);
            camera.updateProjectionMatrix();
        }

    }
}

function displayControls() {
    var startDisplay = document.getElementById("start");
    var startPrompt =  document.getElementById("promptText");
    var rollButtons = document.getElementById("dice");
    var options = document.getElementById("options");
    if (diceView){
       rollButtons.style.display = "flex";
       options.style.display = "flex";
       startDisplay.style.display= "none";
       startPrompt.style.display = "none";
    } else {
        startDisplay.style.display="flex";
        startPrompt.style.display = "flex";
        rollButtons.style.display = "none";
        options.style.display = "none";
    }
}

function positionBarriers() {
    //update barriers according to window resize
    var pHeight = visibleHeightAtZDepth(plane.position.z, camera) /2 *0.80;
    var pWidth = visibleWidthAtZDepth(plane.position.z, camera) /2 *0.80;

    leftBarrier.position.set(-pWidth,0,0);
    rightBarrier.position.set( pWidth,0, 0);
    topBarrier.position.set( 0, -pHeight, 0);
    bottomBarrier.position.set( 0, pHeight, 0);
}

function resetTurns() {
    turnOrder = [];
    displayPlayerOrder();
    refreshTurnIndicators(true);
    document.getElementById("prompt_text").innerHTML = "select players";
}

function displayPlayerOrder() {
    var playersText ="";

    for (var i=0; i < turnOrder.length; i++){
        playersText += turnOrder[i].name+" ";
        var newPlayer;
        switch (turnOrder[i].name) {
            case "Red":
                newPlayer = redCity.clone();
                break;
            case "White":
                newPlayer = whiteCity.clone();
                break;
            case "Blue":
                newPlayer = blueCity.clone();
                break;
            case "Orange":
                newPlayer = orangeCity.clone();
                break;
            case "Green":
                newPlayer = greenCity.clone();
                break;
            case "Brown":
                newPlayer = brownCity.clone();
                break;
        }
        if (!indicatorAdded(newPlayer)){
            newPlayer.scale.set(0.5,0.5,0.5);
            turnIndicators.add(newPlayer);
        }
    }
    document.getElementById("player_order").innerHTML = playersText;
    refreshTurnIndicators(false);

    function indicatorAdded( obj) {
        for (var i=0; i<turnIndicators.children.length; i++){
            if (turnIndicators.children[i].name === obj.name){
                return true;
            }
        }
        return false;
    }
}

function refreshTurnIndicators( reset ) {
    if (reset) {
        var len = turnIndicators.children.length;
        for (var i=0; i<len; i++){
            turnIndicators.remove(turnIndicators.children.pop());
        }
    } else {
        var multiplier;
        if (turnIndicators.children.length % 2 === 0){
            multiplier = -(turnIndicators.children.length / 2)+(1/2);
        } else {
            multiplier = -(turnIndicators.children.length -1) /2;
        }

        var spacing = 2;
        for (var j=0; j<turnOrder.length; j++ ){
            var current = turnOrder[j];
            var indicator = getTurnIndicator(current.name);
            if (indicator){
                indicator.position.set( multiplier * spacing, 0,0);
                multiplier += 1;
            }

        }
    }
    turnIndicators.updateMatrixWorld();
    function getTurnIndicator(name) {
        for (var k=0; turnIndicators.children.length; k++){
            if (name === turnIndicators.children[k].name){ return turnIndicators.children[k]}
        }
        return false;
    }
}

function positionTurnIndicators() {
    //update indicators according to window resize
    var pHeight = visibleHeightAtZDepth(plane.position.z, camera) /2 *0.82;
    turnIndicators.position.set(0, pHeight, 2);
}