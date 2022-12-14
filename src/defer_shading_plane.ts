import * as THREE from 'three';
import { SkyScene } from './sky_scene';

export class DeferShadingPlane {
  private scene = new THREE.Scene();
  private material: THREE.RawShaderMaterial;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private camera: THREE.Camera,
    lightDirection: THREE.Vector3,
    positionTexture: THREE.Texture,
    colorTexture: THREE.Texture,
    depthTexture: THREE.DepthTexture
  ) {
    const vertexShader = require('./shaders/final_plane_v.glsl');
    const fragmentShader = require('./shaders/final_plane_f.glsl');
    const finalPlaneGeometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.RawShaderMaterial( {
      vertexShader,
      fragmentShader: fragmentShader,
      glslVersion: THREE.GLSL3,
      uniforms: {
        lightDirctn: {value: lightDirection},
        positionTex: {value: positionTexture},
        colorTex: {value: colorTexture},
        depthTex: {value: depthTexture}
      }
    } );
    const plane = new THREE.Mesh(finalPlaneGeometry, this.material);
    
    this.scene.add(plane);
  }

  listenToMoonDirection(skyScene: SkyScene) {
    skyScene.registerMoonListener((moonDirctn) => {
      this.material.uniforms.lightDirctn.value = moonDirctn;
    })
  }

  setDepthTexture(depthTexture: THREE.DepthTexture) {
    this.material.uniforms.depthTex.value = depthTexture;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}