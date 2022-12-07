import './css/style.css';
import { Tree } from './tree';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { WebGLRenderTarget } from 'three';

const background = require('./images/winter_lake_01_2k.hdr');

const lightBulbVertexShader = require('./shaders/light_bulb_v.glsl');
const lightBulbFragmentShader = require('./shaders/light_bulb_f.glsl');

const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 5000);
camera.position.z = 5;

const scene = new THREE.Scene();
const loader = new GLTFLoader();
const hdrLoader = new RGBELoader();
const renderer = new THREE.WebGLRenderer( { antialias: false } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMappingExposure = 2;
const controls = new OrbitControls( camera, renderer.domElement );

let read = false;
let mouseX = 0, mouseY = 0;
let clickedPosWorld = new THREE.Vector3();

let depthTexture = new THREE.DepthTexture( window.innerWidth, window.innerHeight, THREE.FloatType);
const gBufferRenderTarget = new THREE.WebGLMultipleRenderTargets(window.innerWidth, window.innerHeight, 2, {
  format: THREE.RGBAFormat,
  type: THREE.FloatType,
  depthTexture: depthTexture
});

hdrLoader.load(background, (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;

  render();
})

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
