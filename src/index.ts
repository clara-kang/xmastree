import './css/style.css';
import { Tree } from './tree';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const gltfPath = require('./models/lowpolytree.glb');
const snowmanImg = require('./images/the-snow-folk.png');
const background = require('./images/winter_lake_01_2k.hdr');

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


const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 5000);
camera.position.z = 5;

const scene = new THREE.Scene();
const loader = new GLTFLoader();
const hdrLoader = new RGBELoader();
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMappingExposure = 2;
const controls = new OrbitControls( camera, renderer.domElement );

// loader.load(gltfPath, function ( gltf ) {
//   for (const obj of gltf.scene.children) {
//     if (obj.type === 'Mesh') {
//       const mesh = obj as Mesh;
//       mesh.applyMatrix4(new THREE.Matrix4().scale(new THREE.Vector3(0.1, 0.1, 0.1)));
//       mesh.material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
//       scene.add(mesh);
//     }
//   }
// }, undefined, function ( error ) {
// 	console.error( error );
// } );

// hdrLoader.load(background, (texture) => {
//   texture.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = texture;
//   scene.environment = texture;

//   render();
// })

renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const sphereVertexShader = require('./shaders/sphere_v.glsl');
const sphereFragmentShader = require('./shaders/sphere_f.glsl');

const geometry = new THREE.SphereGeometry( 1, 32, 16 );
const material = new THREE.RawShaderMaterial( {
  uniforms: {
    time: {value: 0}
  },
  vertexShader: sphereVertexShader,
  fragmentShader: sphereFragmentShader,
  glslVersion: THREE.GLSL3
} );

const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

function render() {
  renderer.render(scene, camera);
  material.uniforms.time.value = (material.uniforms.time.value + 0.1) % 5;
  // renderer.autoClear = false;
  // tree.render();
}

// animation
function animate() {
	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();
  render();
}
