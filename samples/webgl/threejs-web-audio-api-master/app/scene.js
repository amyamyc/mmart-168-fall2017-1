import THREE from 'three';
import axis from './Debug/axis';
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

var loader = new OBJLoader();
//var loader = new OBJLoader();

// load a resource
loader.load(
	// resource URL
	'models/monster.obj',
	// called when resource is loaded
	function ( object ) {

		scene.add( object );

	},
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);
/**
 *  THREEjs initialization
 *  ----------------------
 *  create camera, controls, scene and renderer
 */
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer();

// create mouse controls
let controls = new (require('three-orbit-controls')(THREE))(camera);
// initial camera position
camera.position.z = 900;
// set renderer fullscreen
renderer.setSize(window.innerWidth, window.innerHeight);
// add to dom
document.getElementById('scene').appendChild(renderer.domElement);

/**
 *  Lighting
 *  --------
 *  point light adds more direct lighting - color, intensity, distance, decay
 *  while ambient light adds light to all angles - color
 */
let pointLight = new THREE.PointLight(0xFFFFFF, 1, 0, 2);
let ambientLight = new THREE.AmbientLight(0x404040);
pointLight.position.set(10, 50, 130);

// change these colors to whatever you want!
let colors = [
    { r: 156, g: 0, b: 253 },
    { r: 0, g: 255, b: 249},
    { r: 0, g: 253, b: 40},
    { r: 245, g: 253, b: 0},
    { r: 252, g: 15, b: 145}
];
let activeColor = 0;
/**
 *  Plane
 *  ------
 *  pointlight adds more direct lighting
 *  while ambient light adds light to all angles
 */
let planePoints = 15;
let planeMaterial = new THREE.MeshLambertMaterial({
  color: 0x8a8a8a,
  side: THREE.DoubleSide,
  wireframe: true,
  wireframeLinewidth: 1
});
let planeGeometry = new THREE.PlaneGeometry(500, 500, planePoints, planePoints);
let floor = new THREE.Mesh(planeGeometry, planeMaterial);
// let the renderer know we plan to update the vertices
floor.geometry.verticesNeedUpdate = true;
floor.geometry.dynamic = true;
// rotate and position plane on ground
floor.position.y = -200;
floor.rotation.x = -Math.PI/2;

// add all objects to scene
scene.add(ambientLight);
scene.add(pointLight);
scene.add(floor);
// debug x,y,z axis
scene.add(axis(300));

/***********************/
/* Add Alex's Pyramids */
/***********************/
let pyramid1
let pyramid2
let doublePyramid
let material = new THREE.MeshLambertMaterial({color:0x00ff00, wireframe: false});

let geometryPyramid = new THREE.CylinderGeometry(0, 150, 200, 3, false);
pyramid1 = new THREE.Mesh(geometryPyramid, material);
pyramid1.position.x = 0;
pyramid1.position.y = 50;

pyramid2 = new THREE.Mesh(geometryPyramid, material);
pyramid2.position.x = 0;
pyramid2.position.y = -50;
pyramid2.rotation.x = 380;

doublePyramid = new THREE.Object3D();
doublePyramid.add( pyramid1 );
doublePyramid.add( pyramid2 );
scene.add(doublePyramid);


/***********************/


// will fire every time new audio data is recieved
export default function(audioData) {
    let {
        levels, waveform, beatCutOff, isBeat, volume
    } = audioData;

    // change doublePyramid color everytime audio API detects a beat:
    if (isBeat) {
        let color = colors[activeColor];
        pyramid1.material.color = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`);
        pyramid2.material.color = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`);
        activeColor = activeColor < colors.length - 1 ? activeColor + 1 : 0;
    }

    // speed of rotation depends on volume of sound:
    pyramid1.rotation.y += volume;
    pyramid2.rotation.y += volume;

    // change sphere size based on volume
    doublePyramid.scale.x = volume;
    doublePyramid.scale.y = volume;
    doublePyramid.scale.z = volume;

    waveform.forEach((value, i) => {
        if (i%2 === 0) {
            floor.geometry.vertices[i/2].z = value * 80;
        }
    });
    floor.geometry.verticesNeedUpdate = true;

    // rerender scene every update
    renderer.render(scene, camera);
}
