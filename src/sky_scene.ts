import * as THREE from 'three';
import { Sky } from "./sky";

const parameters = {
  elevation: 7,
  azimuth: -150,
  turbidity: 0,
  rayleigh: 0.01,
  mieCoefficient: 0.005,
  mieDirectionalG: 0
};


export class SkyScene {
  private sky = new Sky();
  private scene = new THREE.Scene();
  private moon = new THREE.Vector3();
  private pmremGenerator: THREE.PMREMGenerator;
  // private renderTarget: THREE.WebGLRenderTarget;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private camera: THREE.Camera
  ) {
    this.sky.scale.setScalar( 10000 );
    // this.renderTarget = this.pmremGenerator.fromScene( sky );
    this.pmremGenerator = new THREE.PMREMGenerator( renderer );
    this.updateMoon();
    this.scene.add(this.sky);
  }

  updateMoon() {

    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth );
  
    this.moon.setFromSphericalCoords( 1000, phi, theta );
    // @ts-expect-error
    this.sky.material.uniforms[ 'sunPosition' ].value.copy( this.moon );
    // if ( renderTarget !== undefined ) renderTarget.dispose();
    // // @ts-expect-error
    // renderTarget = this.pmremGenerator.fromScene( sky );
  
    // this.scene.environment = renderTarget.texture;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

}
