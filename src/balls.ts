import * as THREE from 'three';
import { GUI } from 'dat.gui'

const gBufferVertexShader = require('./shaders/g_buffer_v.glsl');
const gBufferFragmentShader = require('./shaders/g_buffer_f.glsl');
const normalImg = require('./images/diamond_normal.jpg');

export class Balls {
  private scene = new THREE.Scene();
  private ballGeometry = new THREE.IcosahedronGeometry(0.1, 2);
  private ballMaterial!: THREE.Material;
  private ballColor = new THREE.Vector3(192, 192, 192).multiplyScalar(1/255);
  private ballColorHex = new THREE.Color(this.ballColor.x, this.ballColor.y, this.ballColor.z).getHex();

  constructor(
    private renderer: THREE.WebGLRenderer,
    private camera: THREE.Camera,
    gui: GUI
  ) {
    this.createBallMaterial();
    this.addGUIFolder(gui);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  addBall(position: THREE.Vector3) {
    const ballMesh = new THREE.Mesh(this.ballGeometry, this.ballMaterial);
    ballMesh.applyMatrix4(new THREE.Matrix4().setPosition(position));
    this.scene.add(ballMesh);
  }

  addGUIFolder(gui: GUI) {
    const ballFolder = gui.addFolder('Ball');
    ballFolder.addColor(this, "ballColorHex")
      .name("ball color")
      .onChange(() => {
        const color = new THREE.Color(this.ballColorHex);
        this.ballColor = new THREE.Vector3(color.r, color.g, color.b);
        this.createBallMaterial();
      }
    );
    ballFolder.open();
  }

  createBallMaterial() {
    const normalTexture = new THREE.TextureLoader().load(normalImg);

    this.ballMaterial = new THREE.RawShaderMaterial({
      vertexShader: gBufferVertexShader,
      fragmentShader: gBufferFragmentShader,
      glslVersion: THREE.GLSL3,
      uniforms: {
        color: {value: this.ballColor},
        normalTex: {value: normalTexture},
        normaTexProvided: {value: true}
      }
    });
  }
}