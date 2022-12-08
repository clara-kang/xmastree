// @ts-nocheck
import './css/style.css';
import { Tree } from './tree';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Sky } from './sky';


function component() {
  const element = document.createElement('div');
  element.classList.add('hello');

  return element;
}

document.body.appendChild(component());

import { WebGLRenderTarget } from 'three';


const lightBulbVertexShader = require('./shaders/light_bulb_v.glsl');
const lightBulbFragmentShader = require('./shaders/light_bulb_f.glsl');

const camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.set( 30, 10, 100 );

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMappingExposure = 2;
const controls = new OrbitControls( camera, renderer.domElement );

const moon = new THREE.Vector3();
const sky = new Sky();
sky.scale.setScalar( 10000 );

const parameters = {
  elevation: 20,
  azimuth: -150,
  turbidity: 1,
  rayleigh: 0,
  mieCoefficient: 0.005,
  mieDirectionalG: 0
};

const skyUniforms = sky.material.uniforms;
function updateSky() {
  skyUniforms[ 'turbidity' ].value = parameters.turbidity;
  skyUniforms[ 'rayleigh' ].value = parameters.rayleigh;
  skyUniforms[ 'mieCoefficient' ].value = parameters.mieCoefficient;
  skyUniforms[ 'mieDirectionalG' ].value = parameters.mieDirectionalG;
}

updateSky();

const pmremGenerator = new THREE.PMREMGenerator( renderer );
let renderTarget;

function updateMoon() {

  const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
  const theta = THREE.MathUtils.degToRad( parameters.azimuth );

  moon.setFromSphericalCoords( 1000, phi, theta );

  sky.material.uniforms[ 'sunPosition' ].value.copy( moon );

  if ( renderTarget !== undefined ) renderTarget.dispose();

  renderTarget = pmremGenerator.fromScene( sky );

  scene.environment = renderTarget.texture;

}

updateMoon();
scene.add( sky );

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
let read = false;
let mouseX = 0, mouseY = 0;
let clickedPosWorld = new THREE.Vector3();

let depthTexture = new THREE.DepthTexture( window.innerWidth, window.innerHeight, THREE.FloatType);
const gBufferRenderTarget = new THREE.WebGLMultipleRenderTargets(window.innerWidth, window.innerHeight, 2, {
  format: THREE.RGBAFormat,
  type: THREE.FloatType,
  depthTexture: depthTexture
});

renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  gBufferRenderTarget.setSize(window.innerWidth, window.innerHeight);
  depthTexture = new THREE.DepthTexture( window.innerWidth, window.innerHeight, THREE.FloatType);
});

window.addEventListener('click', (event) => {
  read = true;
  mouseX = event.x;
  mouseY = event.y;
});


const tree = new Tree(renderer, camera, gBufferRenderTarget);

const finalVertexShader = require('./shaders/final_plane_v.glsl');
const finalFragmentShader = require('./shaders/final_plane_f.glsl');

const finalPlaneGeometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.RawShaderMaterial( {
  vertexShader: finalVertexShader,
  fragmentShader: finalFragmentShader,
  glslVersion: THREE.GLSL3,
  uniforms: {
    colorTex: {value: gBufferRenderTarget.texture[1]},
    depthTex: {value: depthTexture}
  }
} );
const plane = new THREE.Mesh( finalPlaneGeometry, material );


scene.add( plane );
function render() {
  renderer.setRenderTarget(gBufferRenderTarget);
  // renderer.render(scene, camera);
  // renderer.autoClear = false;
  tree.render();


  if (read) {
    const pixels = new Float32Array(4);
    const gl = renderer.getContext();
    gl.readPixels(mouseX, window.innerHeight-mouseY, 1, 1, gl.RGBA, gl.FLOAT, pixels);
    clickedPosWorld.set(pixels[0], pixels[1], pixels[2]);

    if (clickedPosWorld.length() > 0) {
      const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
      const lightMaterial =  new THREE.RawShaderMaterial( {
        vertexShader: lightBulbVertexShader,
        fragmentShader: lightBulbFragmentShader,
        glslVersion: THREE.GLSL3,
        uniforms: {
          colorTex: {value: gBufferRenderTarget.texture[1]},
          positionTex: {value: gBufferRenderTarget.texture[0]}
        }
      });
  
      const lightMesh = new THREE.Mesh( lightGeometry, lightMaterial );
      lightMesh.applyMatrix4(new THREE.Matrix4().setPosition(clickedPosWorld));
      scene.add( lightMesh );
    }
    read = false;
  }

  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

// animation
function animate() {
	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();
  render();
}
