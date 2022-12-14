import * as THREE from 'three';
import { GUI } from 'dat.gui'

const ventionSnowFlake = require('./images/snowflake.png');

export class Snow {
    public particleNum = 100000;
    public maxRange = 30;
    public minRange = -this.maxRange;
    public velocity = {
        x: { min: 0.001, max: 0.004 },
        y: { min: 0.001, max: 0.01 },
        z: { min: 0.001, max: 0.012 }
    }

    private particles!: THREE.Points;
    private pointGeometry!: THREE.BufferGeometry;
    private pointMaterial!: THREE.PointsMaterial;
    private textureSize = 64.0;
    private scene!: THREE.Scene;

    constructor(
        private renderer: THREE.WebGLRenderer,
        private camera: THREE.Camera,
        gui: GUI
    ) {
        this.generateSnow();
        this.addGUIFolder(gui);
    }

    addGUIFolder(gui: GUI) {
        const snowFolder = gui.addFolder('Snow');
        snowFolder.open();
        snowFolder.add(this, 'maxRange').min(5).max(30).step(1).onFinishChange(() => {
            this.minRange = -this.maxRange;
            this.generateSnow();
            this.render();
        });

        snowFolder.add(this, 'particleNum').min(100).max(100000).step(100).onFinishChange(() => {
            this.initPositions();
        });

        const velocityFolder = snowFolder.addFolder('velocity');
        velocityFolder.open();
        velocityFolder.add(this.velocity.x, 'min', 0.001, 0.5, 0.001).onChange(this.initVelocities.bind(this));
        velocityFolder.add(this.velocity.x, 'max', 0.001, 0.5, 0.001).onChange(this.initVelocities.bind(this));
        velocityFolder.add(this.velocity.y, 'min', 0.001, 0.5, 0.001).onChange(this.initVelocities.bind(this));
        velocityFolder.add(this.velocity.y, 'max', 0.001, 0.5, 0.001).onChange(this.initVelocities.bind(this));
    }

    generateSnow() {

        if (this.particles !== undefined) {
            this.pointGeometry.dispose();
            this.pointMaterial.dispose();
            this.scene.remove(this.particles);
        }

        this.scene = new THREE.Scene();
        this.pointGeometry = new THREE.BufferGeometry();
        
        this.initPositions();  
        this.initVelocities();
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(ventionSnowFlake);

        this.pointMaterial = new THREE.PointsMaterial({
            size: 0.08,
            blending: THREE.AdditiveBlending,
            transparent: true,
            map: texture,
            depthTest: true,
        });
        this.particles = new THREE.Points(this.pointGeometry, this.pointMaterial);
    
        this.scene.add(this.particles);
    }

    initPositions() {
        const positions = new Float32Array(this.particleNum * 3);

        for (let i = 0; i < this.particleNum; i++) {
            const i3 = i * 3;
            const position = this.generatePosition();
            positions[i3 + 0] = position.x;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z;
        }
        this.pointGeometry.setAttribute(
        'position', 
        new THREE.BufferAttribute(positions, 3)
        );
    }

    generatePosition() {
        const x = THREE.MathUtils.randFloat(this.minRange, this.maxRange);
        const y = THREE.MathUtils.randFloat(0, this.maxRange + 10);
        const z = THREE.MathUtils.randFloat(this.minRange, this.maxRange);
        return {x, y, z}
    }

    initVelocities() {
        const velocities = [];
        for (let i = 0; i < this.particleNum; i++) {
            const velocity = this.generateVelocity();
            velocities.push(velocity.x, velocity.y, velocity.z);
        }
        this.pointGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    }

    generateVelocity() {
        const x = THREE.MathUtils.randFloat(this.velocity.x.min, this.velocity.x.max);
        const y = THREE.MathUtils.randFloat(this.velocity.y.min, this.velocity.y.max);
        const z = THREE.MathUtils.randFloat(this.velocity.z.min, this.velocity.z.max);
        return {x, y, z};
    }

    getTexture() {
        const canvas = document.createElement('canvas');
    
        const diameter = this.textureSize;
        canvas.width = diameter;
        canvas.height = diameter;
    
        const texture = new THREE.Texture(canvas);
        texture.type = THREE.FloatType;
        texture.needsUpdate = true;
        return texture;
    }

    render() {

        const positions = new Float32Array(this.particleNum * 3);

        for (let i = 0; i < this.particleNum; i++) {
            const i3 = i * 3;
            const positionArray = this.particles.geometry.attributes.position.array;
            const velocityArray = this.particles.geometry.attributes.velocity.array
            let x = positionArray[i3 + 0] - velocityArray[i3 + 0];
            let y = positionArray[i3 + 1] - velocityArray[i3 + 1];
            let z = positionArray[i3 + 2] - velocityArray[i3 + 2];
            
            const outOfXRange = (x > this.maxRange || x < this.minRange);
            const outOfZRange = (z > this.maxRange || z < this.minRange)
            if (y < 0 || outOfXRange || outOfZRange) {
                const position = this.generatePosition();
                x = position.x;
                y = position.y;
                z = position.z;
            }
           
            positions[i3 + 0] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

        }

        this.particles.geometry.setAttribute(
            'position', 
            new THREE.BufferAttribute(positions, 3)
            );
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
    
    }
    
}