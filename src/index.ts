import * as THREE from 'three';
import { Snow } from './snow';
import { GUI } from 'dat.gui'
import { Tree } from './tree';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DeferShadingPlane } from './defer_shading_plane';
import { LightBulbs } from './light_bulbs';
import { SkyScene } from './sky_scene';
import { Balls } from './balls';

const camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set( -10, 5, 0 );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 4.5, 0);

let read = false;
let mouseLeftClicked = false;
let mouseRightClicked = false;
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
});

window.addEventListener('click', (event) => {
  read = true;
  mouseX = event.x;
  mouseY = event.y;
});

const gui = new GUI();
const tree = new Tree(renderer, camera);
const skyScene = new SkyScene(renderer, camera, gui);
const deferShadingPlane = new DeferShadingPlane(
  renderer,
  camera,
  skyScene.getMoonDirection(),
  gBufferRenderTarget.texture[0],
  gBufferRenderTarget.texture[1],
  depthTexture
);
const lightBulbs = new LightBulbs(renderer, camera, gBufferRenderTarget.texture[1], gBufferRenderTarget.texture[0], gui);
const balls = new Balls(renderer, camera, gui);
const snow = new Snow(renderer, camera, gui);
deferShadingPlane.listenToMoonDirection(skyScene);

const settings = {
  decorationMode: 'light'
};

gui.add(settings, 'decorationMode', ['light', 'ball']);
// gui.close();

renderer.autoClear = false;


function render() {
  renderer.setRenderTarget(gBufferRenderTarget);
  renderer.clear();
  tree.render();
  balls.render();
  

  if (read) {
    const pixels = new Float32Array(4);
    const gl = renderer.getContext();
    gl.readPixels(mouseX, window.innerHeight-mouseY, 1, 1, gl.RGBA, gl.FLOAT, pixels);
    clickedPosWorld.set(pixels[0], pixels[1], pixels[2]);

    if (clickedPosWorld.length() > 0) {
      if (settings.decorationMode == 'light') {
        lightBulbs.addLightBulb(clickedPosWorld);
      } else {
        balls.addBall(clickedPosWorld.add(new THREE.Vector3(0, -0.1, 0)));
      }
    }
    read = false;
  }

  renderer.setRenderTarget(null);
  deferShadingPlane.render();
  lightBulbs.render();
  skyScene.render();
  snow.render();
}

// animation
function animate() {
	controls.update();
  render();
}
