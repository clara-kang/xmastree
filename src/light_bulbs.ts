import * as THREE from 'three';

const lightBulbVertexShader = require('./shaders/light_bulb_v.glsl');
const lightBulbFragmentShader = require('./shaders/light_bulb_f.glsl');

export class LightBulbs {
  private scene = new THREE.Scene();
  private lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  private lightMaterial: THREE.RawShaderMaterial;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private camera: THREE.Camera,
    colorTexture: THREE.Texture,
    positionTexture: THREE.Texture
  ) {
    this.lightMaterial = new THREE.RawShaderMaterial({
      vertexShader: lightBulbVertexShader,
      fragmentShader: lightBulbFragmentShader,
      glslVersion: THREE.GLSL3,
      uniforms: {
        colorTex: {value: colorTexture},
        positionTex: {value: positionTexture}
      }
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  addLightBulb(position: THREE.Vector3) {
    const lightBulbMesh = new THREE.Mesh(this.lightGeometry, this.lightMaterial);
    lightBulbMesh.applyMatrix4(new THREE.Matrix4().setPosition(position));
    this.scene.add(lightBulbMesh);
  }
}