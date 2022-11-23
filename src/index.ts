import './css/style.css';
import * as THREE from 'three';
import { Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const gltfPath = require('./models/lowpolytree.glb');
const snowmanImg = require('./images/the-snow-folk.png');

function component() {
  const element = document.createElement('div');

  element.innerHTML ='blbabbbb';
  element.classList.add('hello');

  const myIcon = new Image(50, 50);
  myIcon.src = snowmanImg;

  element.appendChild(myIcon);

  return element;
}

document.body.appendChild(component());


const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
camera.position.z = 1;

const scene = new THREE.Scene();
const loader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
const controls = new OrbitControls( camera, renderer.domElement );

loader.load(gltfPath, function ( gltf ) {
  for (const obj of gltf.scene.children) {
    if (obj.type === 'Mesh') {
      const mesh = obj as Mesh;
      mesh.applyMatrix4(new THREE.Matrix4().scale(new THREE.Vector3(0.1, 0.1, 0.1)));
      mesh.material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
      scene.add(mesh);
    }
  }
}, undefined, function ( error ) {
	console.error( error );
} );

const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// animation
function animate() {
	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render( scene, camera );
}