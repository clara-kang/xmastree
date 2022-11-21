"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./css/style.css");
const THREE = __importStar(require("three"));
const GLTFLoader_1 = require("three/examples/jsm/loaders/GLTFLoader");
const OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
const gltfPath = require('./models/lowpolytree.glb');
const snowmanImg = require('./images/the-snow-folk.png');
function component() {
    const element = document.createElement('div');
    element.innerHTML = 'blbabbbb';
    element.classList.add('hello');
    const myIcon = new Image(50, 50);
    myIcon.src = snowmanImg;
    element.appendChild(myIcon);
    return element;
}
document.body.appendChild(component());
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 1;
const scene = new THREE.Scene();
const loader = new GLTFLoader_1.GLTFLoader();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls_1.OrbitControls(camera, renderer.domElement);
loader.load(gltfPath, function (gltf) {
    for (const obj of gltf.scene.children) {
        if (obj.type === 'Mesh') {
            const mesh = obj;
            mesh.applyMatrix4(new THREE.Matrix4().scale(new THREE.Vector3(0.1, 0.1, 0.1)));
            mesh.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            scene.add(mesh);
        }
    }
}, undefined, function (error) {
    console.error(error);
});
const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);
// animation
function animate() {
    requestAnimationFrame(animate);
    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();
    renderer.render(scene, camera);
}
