import * as THREE from 'three';

const treeVertexShader = require('./shaders/tree_v.glsl');
const treeFragmentShader = require('./shaders/tree_f.glsl');
const gBufferVertexShader = require('./shaders/g_buffer_v.glsl');
const gBufferFragmentShader = require('./shaders/g_buffer_f.glsl');

export class Tree {
  private treeConeRadiusToHeightRatio = 0.5;
  private secondLevelRounds = 15;
  private secondLevelAvgBranchPerRound = 11;
  private secondLevelBranchNum = this.secondLevelRounds * this.secondLevelAvgBranchPerRound;
  private secondLevelRadiusScale = 0.2;
  private secondLevelBotNotGrowingPortion = 0.5;
  private secondLevelTopNotGrowingPortion = 0.1;
  private secondLevelRoundsWithoutChildren = 3;
  
  private thirdLevelBranchNum = 4;
  private thirdLevelRounds = 2;
  private thirdLevelBranchPerRound = this.thirdLevelBranchNum / this.thirdLevelRounds;
  private thirdLevelApartAngle = Math.PI;
  private thirdLevelRadiusScale = 0.2;

  private trunkHeight = 5;
  private trunkBotNotGrowingHeight = 0.5;
  private trunkTopNotGrowingHeight = 0.025 * this.trunkHeight;

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
    private camera: THREE.Camera,
    private gBufferRenderTarget: THREE.WebGLMultipleRenderTargets
  ) {
    this.scene = new THREE.Scene();
    this.branchGeometry = new THREE.CylinderGeometry(0.08, 0.08, this.trunkHeight, 10);
    this.branchGeometry.translate(0, this.trunkHeight * 0.5, 0);
    this.branchMaterial = new THREE.RawShaderMaterial( {
      vertexShader: gBufferVertexShader,
      fragmentShader: gBufferFragmentShader,
      glslVersion: THREE.GLSL3,
      uniforms: {
        color: {value: new THREE.Vector3(139,69,19).multiplyScalar(0.5/255)}
      }
    });

    this.leafGeometry = new THREE.PlaneGeometry( this.leafWidth, 1.0 );
    const leafMatrix = new THREE.Matrix4().makeTranslation(this.leafWidth / 2, 0.5, 0);
    this.leafGeometry.applyMatrix4(leafMatrix);
    this.leafMaterial = new THREE.RawShaderMaterial( {
      glslVersion: THREE.GLSL3,
      vertexShader: treeVertexShader,
      fragmentShader: treeFragmentShader,
    });
    this.leafMaterial.side = THREE.DoubleSide;
    
    const secndLevelNoChildBranchNum = (
      (this.secondLevelRoundsWithoutChildren - 1) / 2 + this.getSecndLevelRoundBranchNum(this.secondLevelRounds - 1)
    ) * this.secondLevelRoundsWithoutChildren;
    const totalBranchNum = 1 + this.secondLevelBranchNum + this.thirdLevelBranchNum * (this.secondLevelBranchNum - secndLevelNoChildBranchNum);
    this.branchInstancedMesh = new THREE.InstancedMesh(this.branchGeometry, this.branchMaterial, totalBranchNum);

    const totalLeafNum = (totalBranchNum - 1) * this.leafNumPerBranch;
    this.leafInstancedMesh = new THREE.InstancedMesh(this.leafGeometry, this.leafMaterial, totalLeafNum);

    this.scene.add(this.leafInstancedMesh);
    this.scene.add(this.branchInstancedMesh);

    this.createMeshLevel0();
  }

  render() {
    this.renderer.setRenderTarget(this.gBufferRenderTarget);
    this.renderer.render(this.scene, this.camera);
  }


  private getSecndLevelRoundBranchNum(roundNum: number): number {
    return this.secondLevelAvgBranchPerRound + (Math.floor(this.secondLevelRounds / 2) - roundNum);
  }

  private createMeshLevel0() {
    const branchMatrix = new THREE.Matrix4();
    this.branchInstancedMesh.setMatrixAt(this.currentBranchIndex++, branchMatrix);
    let branchId = 0;
    for (let roundNum = 0; roundNum < this.secondLevelRounds; roundNum++) {
      const roundBranchNum = this.getSecndLevelRoundBranchNum(roundNum);
      for (let i = 0; i < roundBranchNum; i++) {
        this.createMeshLevel1(roundNum, roundBranchNum, i);
        branchId += 1;
      }
    }
  }

  
  private createMeshLevel1(roundNum: number, roundBranchNum: number, branchIdInRound: number) {
    const scaleFactor = this.jitter((this.treeConeRadiusToHeightRatio - this.treeConeRadiusToHeightRatio * roundNum / this.secondLevelRounds));
    const availableLength = this.trunkHeight - this.trunkBotNotGrowingHeight - this.trunkTopNotGrowingHeight;
    const branchHeight = this.jitter(
      roundNum * availableLength / this.secondLevelRounds + this.trunkBotNotGrowingHeight,
      0.2 * (1.0 - roundNum / (this.secondLevelRounds - 1))
    );
    const matrix = new THREE.Matrix4().makeRotationY(this.jitter(Math.PI * 2 / roundBranchNum * branchIdInRound));
    matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI * 0.4));
    matrix.setPosition(0, branchHeight, 0);
    const branchMatrixWithoutScale = matrix.clone();

    const leafMatrix = matrix.clone();
    matrix.multiply(new THREE.Matrix4().scale(new THREE.Vector3(this.secondLevelRadiusScale, scaleFactor, this.secondLevelRadiusScale)));
    leafMatrix.multiply(new THREE.Matrix4().scale(new THREE.Vector3(1, scaleFactor * this.trunkHeight + this.leafWidth / 2.0, 1)));
    leafMatrix.multiply(new THREE.Matrix4().makeRotationY(-Math.PI / 2.0));

    for (let leafId = 0; leafId < this.leafNumPerBranch; ++leafId) {
      this.leafInstancedMesh.setMatrixAt(this.currentLeafIndex++, leafMatrix);
      leafMatrix.multiply(new THREE.Matrix4().makeRotationY(this.jitter(Math.PI / this.leafNumPerBranch)));
    }

    this.branchInstancedMesh.setMatrixAt(this.currentBranchIndex++, matrix);

    if (roundNum < this.secondLevelRounds - this.secondLevelRoundsWithoutChildren) {
      for (let index = 0; index < this.thirdLevelBranchNum; ++index) {
        this.createMeshLevel2(index, branchMatrixWithoutScale, this.trunkHeight * scaleFactor);
      }
    }
  }

  private createMeshLevel2(branchId: number, parentMatrix: THREE.Matrix4, parentLength: number) {
    const roundNum = Math.floor(branchId / this.thirdLevelBranchPerRound);
    const offset = parentLength * this.secondLevelBotNotGrowingPortion;
    const availableLength =  parentLength * (1 - (this.secondLevelBotNotGrowingPortion + this.secondLevelTopNotGrowingPortion)); 
    const branchHeight = this.jitter(roundNum * availableLength / this.thirdLevelRounds) + offset;
    const lengthScale = 0.2 * parentLength / this.trunkHeight;
    const matrix = new THREE.Matrix4().makeRotationY(this.jitter(this.thirdLevelApartAngle * branchId) + Math.PI / 2);
    matrix.multiply(new THREE.Matrix4().setPosition(new THREE.Vector3(0, branchHeight, 0)));
    matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI * 0.25));
    
    matrix.premultiply(parentMatrix);
    const leafMatrix = matrix.clone();
    leafMatrix.multiply(new THREE.Matrix4().scale(new THREE.Vector3(1, lengthScale * this.trunkHeight + this.leafWidth / 2.0, 1)));

    const flipLeaf = leafMatrix.elements[9] > 0;
    leafMatrix.multiply(new THREE.Matrix4().makeRotationY(flipLeaf ? Math.PI : 0));

    for (let leafId = 0; leafId < this.leafNumPerBranch; ++leafId) {
      this.leafInstancedMesh.setMatrixAt(this.currentLeafIndex++, leafMatrix);
      leafMatrix.multiply(new THREE.Matrix4().makeRotationY(this.jitter(Math.PI / (this.leafNumPerBranch - 1))));
    }

    matrix.multiply(new THREE.Matrix4().scale(new THREE.Vector3(this.thirdLevelRadiusScale, lengthScale, this.thirdLevelRadiusScale)));
    this.branchInstancedMesh.setMatrixAt(this.currentBranchIndex++, matrix);
  }

  private jitter(num: number, fluctuation: number = 0.05) {
    return (1 + fluctuation * (0.5 - Math.random())) * num
  }
}