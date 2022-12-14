import * as THREE from 'three';
import { Sky } from "./sky";
import { GUI } from 'dat.gui'


export class SkyScene {
  private elevation = 7;
  private azimuth = -150;
  private sky = new Sky();
  private scene = new THREE.Scene();
  private moon = new THREE.Vector3();
  private pmremGenerator: THREE.PMREMGenerator;
  // private renderTarget: THREE.WebGLRenderTarget;

  private moonDirectionListeners: Array<Function> = [];

  constructor(
    private renderer: THREE.WebGLRenderer,
    private camera: THREE.Camera,
    gui: GUI
  ) {
    this.sky.scale.setScalar( 10000 );
    // this.renderTarget = this.pmremGenerator.fromScene( sky );
    this.pmremGenerator = new THREE.PMREMGenerator( renderer );
    this.updateMoon();
    this.scene.add(this.sky);
    this.addGUIFolder(gui);
  }

  addGUIFolder(gui: GUI) {
    const moonFolder = gui.addFolder('Moon');
    moonFolder.open();
    moonFolder.add(this, 'elevation')
      .min(0)
      .max(90)
      .step(0.1)
      .onChange(() => {
        this.updateMoon();
      }
    );
    moonFolder.add(this, 'azimuth')
      .name('azimuth')
      .min(-180)
      .max(180)
      .step(0.1)
      .onChange(() => {
        this.updateMoon();
      }
    );
  }

  getMoonDirection() {
    return this.moon.clone().normalize();
  }

  registerMoonListener(listener: (moon: THREE.Vector3) => void) {
    this.moonDirectionListeners.push(listener);
  }

  updateMoon() {
    const phi = THREE.MathUtils.degToRad( 90 - this.elevation );
    const theta = THREE.MathUtils.degToRad( this.azimuth );
  
    this.moon.setFromSphericalCoords( 1000, phi, theta );
    // @ts-expect-error
    this.sky.material.uniforms[ 'sunPosition' ].value.copy( this.moon );
    // if ( renderTarget !== undefined ) renderTarget.dispose();
    // // @ts-expect-error
    // renderTarget = this.pmremGenerator.fromScene( sky );
  
    // this.scene.environment = renderTarget.texture;

    for (const listener of this.moonDirectionListeners) {
      listener(this.moon.clone().normalize());
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

}
