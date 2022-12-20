import * as THREE from 'three';
import { GUI } from 'dat.gui'

const lightBulbVertexShader = require('./shaders/light_bulb_v.glsl');
const lightBulbFragmentShader = require('./shaders/light_bulb_f.glsl');
const gBufferVertexShader = require('./shaders/g_buffer_v.glsl');
const gBufferFragmentShader = require('./shaders/g_buffer_f.glsl');
export class LightBulbs {
  private scene = new THREE.Scene();
  private lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  private lightMaterial!: THREE.RawShaderMaterial;
  private lightColor = new THREE.Vector3(255.0 / 255.0, 215.0 / 255.0, 13.0 / 255.0);
  private lightColorHex = new THREE.Color(this.lightColor.x, this.lightColor.y, this.lightColor.z).getHex();

  constructor(
    private renderer: THREE.WebGLRenderer,
    private camera: THREE.Camera,
    private colorTexture: THREE.Texture,
    private positionTexture: THREE.Texture,
    gui: GUI
  ) {
    this.createLightMaterial();
    this.addGUIFolder(gui);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  addLightBulb(position: THREE.Vector3) {
    const lightBulbMesh = new THREE.Mesh(this.lightGeometry, this.lightMaterial);
    lightBulbMesh.applyMatrix4(new THREE.Matrix4().setPosition(position));
    this.scene.add(lightBulbMesh);
  }

  addGUIFolder(gui: GUI) {
    const lightFolder = gui.addFolder('Light');
    lightFolder.addColor(this, "lightColorHex")
      .name("light color")
      .onChange(() => {
        const color = new THREE.Color(this.lightColorHex);
        this.lightColor = new THREE.Vector3(color.r, color.g, color.b);
        this.createLightMaterial();
      }
    );
    lightFolder.open();
  }

  createLightMaterial() {
    this.lightMaterial = new THREE.RawShaderMaterial({
      vertexShader: lightBulbVertexShader,
      fragmentShader: lightBulbFragmentShader,
      glslVersion: THREE.GLSL3,
      uniforms: {
        colorTex: {value: this.colorTexture},
        positionTex: {value: this.positionTexture},
        lightColor: {value: this.lightColor}
      },
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      depthTest: false
    });
  }
}