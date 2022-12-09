import './css/style.css';
import { Tree } from './tree';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Sky } from './sky';
import { DeferShadingPlane } from './defer_shading_plane';
import { LightBulbs } from './light_bulbs';


function component() {
  const element = document.createElement('div');
  element.classList.add('hello');

  return element;
}

document.body.appendChild(component());

const camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.set( 10, 2, 10 );

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer( { antialias: true } );
// renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const controls = new OrbitControls( camera, renderer.domElement );

const moon = new THREE.Vector3();
const sky = new Sky();
sky.scale.setScalar( 10000 );

const parameters = {
  elevation: 7,
  azimuth: -150,
  turbidity: 0,
  rayleigh: 0.01,
  mieCoefficient: 0.005,
  mieDirectionalG: 0
};


const pmremGenerator = new THREE.PMREMGenerator( renderer );
// @ts-expect-error
let renderTarget = pmremGenerator.fromScene( sky );

function updateMoon() {

  const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
  const theta = THREE.MathUtils.degToRad( parameters.azimuth );

  moon.setFromSphericalCoords( 1000, phi, theta );
  // @ts-expect-error
  sky.material.uniforms[ 'sunPosition' ].value.copy( moon );
  if ( renderTarget !== undefined ) renderTarget.dispose();
  // @ts-expect-error
  renderTarget = pmremGenerator.fromScene( sky );

  scene.environment = renderTarget.texture;

}

updateMoon();
scene.add( sky );

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
const deferShadingPlane = new DeferShadingPlane(renderer, camera, gBufferRenderTarget.texture[1], depthTexture);
const lightBulbs = new LightBulbs(renderer, camera, gBufferRenderTarget.texture[1], gBufferRenderTarget.texture[0]);

function render() {
  renderer.autoClear = true;
  renderer.setRenderTarget(gBufferRenderTarget);
  tree.render();


  if (read) {
    const pixels = new Float32Array(4);
    const gl = renderer.getContext();
    gl.readPixels(mouseX, window.innerHeight-mouseY, 1, 1, gl.RGBA, gl.FLOAT, pixels);
    clickedPosWorld.set(pixels[0], pixels[1], pixels[2]);

    if (clickedPosWorld.length() > 0) {
      lightBulbs.addLightBulb(clickedPosWorld);
    }
    read = false;
  }

  renderer.autoClear = false;
  renderer.setRenderTarget(null);
  deferShadingPlane.render();
  lightBulbs.render();
  renderer.render(scene, camera);
}

// animation
function animate() {
	controls.update();
  render();
}
