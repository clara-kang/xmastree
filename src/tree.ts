import * as THREE from 'three';

const treeVertexShader = require('./shaders/tree_v.glsl');
const treeFragmentShader = require('./shaders/tree_f.glsl');

export class Tree {
  private secondLevelBranchNum = 40;
  private secondLevelRounds = 5;
  private secondLevelBranchPerRound = this.secondLevelBranchNum / this.secondLevelRounds;
  private secondLevelApartAngle = Math.PI * 2 / this.secondLevelBranchPerRound;
  private secondLevelRadiusScale = 0.2;
  private secondLevelNotGrowingPortion = 0.5;
  
  private thirdLevelBranchNum = 10;
  private thirdLevelRounds = 2;
  private thirdLevelBranchPerRound = this.thirdLevelBranchNum / this.thirdLevelRounds;
  private thirdLevelApartAngle = Math.PI;
  private thirdLevelRadiusScale = 0.2;

  private trunkHeight = 5;
  private trunkNotGrowingHeight = 0.5;

  private leafWidth = 0.2;
  private leafNumPerBranch = 6;

  private scene;
  private branchGeometry;
  private branchMaterial;

  private leafGeometry;
  private leafMaterial;

  private branchInstancedMesh;
  private leafInstancedMesh;
  private currentBranchIndex = 0;
  private currentLeafIndex = 0;

  constructor (
    private renderer: THREE.WebGLRenderer,
    private camera: THREE.Camera
  ) {
    this.scene = new THREE.Scene();
    this.branchGeometry = new THREE.CylinderGeometry(0.08, 0.08, this.trunkHeight, 10);
    this.branchGeometry.translate(0, this.trunkHeight * 0.5, 0);
    this.branchMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color(0xfffffff)});

    this.leafGeometry = new THREE.PlaneGeometry( this.leafWidth, 1.0 );
    const leafMatrix = new THREE.Matrix4().makeTranslation(this.leafWidth / 2, 0.5, 0);
    this.leafGeometry.applyMatrix4(leafMatrix);
    this.leafMaterial = new THREE.RawShaderMaterial( {
      glslVersion: THREE.GLSL3,
      vertexShader: treeVertexShader,
      fragmentShader: treeFragmentShader,
    });
    this.leafMaterial.side = THREE.DoubleSide;
    
    const totalBranchNum = 1 + this.secondLevelBranchNum + this.thirdLevelBranchNum * this.secondLevelBranchNum;
    this.branchInstancedMesh = new THREE.InstancedMesh(this.branchGeometry, this.branchMaterial, totalBranchNum);

    const totalLeafNum = (totalBranchNum - 1) * this.leafNumPerBranch;
    this.leafInstancedMesh = new THREE.InstancedMesh(this.leafGeometry, this.leafMaterial, totalLeafNum);

    this.scene.add(this.leafInstancedMesh);
    this.scene.add(this.branchInstancedMesh);

    this.createMeshLevel0();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }


  private createMeshLevel0() {
    const branchMatrix = new THREE.Matrix4();
    this.branchInstancedMesh.setMatrixAt(this.currentBranchIndex++, branchMatrix);

    for (let index = 0; index < this.secondLevelBranchNum; ++index) {
      this.createMeshLevel1(index, branchMatrix);
    }
  }

  
  private createMeshLevel1(branchId: number, parentMatrix: THREE.Matrix4) {
    const roundNum = 1 + Math.floor(branchId / this.secondLevelBranchPerRound);
    const scaleFactor = this.jitter((0.5 - 0.5 * roundNum / this.secondLevelRounds));
    const branchHeight = this.jitter(roundNum * (this.trunkHeight - this.trunkNotGrowingHeight) / this.secondLevelRounds + this.trunkNotGrowingHeight);
    const matrix = new THREE.Matrix4().makeRotationY(this.jitter(this.secondLevelApartAngle * branchId));
    matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI * 0.4 * (1.0 - (roundNum - 1.0) / this.secondLevelBranchPerRound)));
    matrix.setPosition(0, branchHeight, 0);
    const branchMatrixWithoutScale = matrix.clone();

    const leafMatrix = matrix.clone();
    matrix.multiply(new THREE.Matrix4().scale(new THREE.Vector3(this.secondLevelRadiusScale, scaleFactor, this.secondLevelRadiusScale)));
    leafMatrix.multiply(new THREE.Matrix4().scale(new THREE.Vector3(1, scaleFactor * this.trunkHeight + this.leafWidth / 2.0, 1)));

    for (let leafId = 0; leafId < this.leafNumPerBranch; ++leafId) {
      this.leafInstancedMesh.setMatrixAt(this.currentLeafIndex++, leafMatrix);
      leafMatrix.multiply(new THREE.Matrix4().makeRotationY(this.jitter(Math.PI * 2 / this.leafNumPerBranch)));
    }

    this.branchInstancedMesh.setMatrixAt(this.currentBranchIndex++, matrix);

    for (let index = 0; index < this.thirdLevelBranchNum; ++index) {
      this.createMeshLevel2(index, branchMatrixWithoutScale, this.trunkHeight * scaleFactor);
    }
  }

  private createMeshLevel2(branchId: number, parentMatrix: THREE.Matrix4, parentLength: number) {
    const roundNum = Math.floor(branchId / this.thirdLevelBranchPerRound) + 1;
    const offset = parentLength * this.secondLevelNotGrowingPortion;
    const branchHeight = this.jitter(roundNum * parentLength * (1 - this.secondLevelNotGrowingPortion - 0.1) / this.thirdLevelRounds) + offset;
    const lengthScale = 0.2;
    const matrix = new THREE.Matrix4().makeRotationY(this.jitter(this.thirdLevelApartAngle * branchId) + Math.PI / 2);
    matrix.multiply(new THREE.Matrix4().setPosition(new THREE.Vector3(0, branchHeight, 0)));
    matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI * 0.25));
    
    matrix.premultiply(parentMatrix);
    const leafMatrix = matrix.clone();
    leafMatrix.multiply(new THREE.Matrix4().scale(new THREE.Vector3(1, lengthScale * this.trunkHeight + this.leafWidth / 2.0, 1)));

    for (let leafId = 0; leafId < this.leafNumPerBranch; ++leafId) {
      this.leafInstancedMesh.setMatrixAt(this.currentLeafIndex++, leafMatrix);
      leafMatrix.multiply(new THREE.Matrix4().makeRotationY(this.jitter(Math.PI * 2 / this.leafNumPerBranch)));
    }

    matrix.multiply(new THREE.Matrix4().scale(new THREE.Vector3(this.thirdLevelRadiusScale, lengthScale, this.thirdLevelRadiusScale)));
    this.branchInstancedMesh.setMatrixAt(this.currentBranchIndex++, matrix);
  }

  private jitter(num: number) {
    return (1 + 0.1 * (0.5 - Math.random())) * num
  }
}