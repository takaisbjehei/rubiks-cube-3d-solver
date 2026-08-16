import * as THREE from 'three';
import { Face, CubeColor, FaceletArray, NotationMove } from '../../types/cube';
import { COLOR_HEX } from '../../cube/constants';
import { createMoveArrow } from './MoveArrow';

export interface StickerMeshInfo {
  mesh: THREE.Mesh;
  faceletIndex: number;
  face: Face;
  cubieX: number;
  cubieY: number;
  cubieZ: number;
}

export class CubeRenderer {
  public scene: THREE.Scene;
  public cubeGroup: THREE.Group;
  public pivotGroup: THREE.Group;
  public cubies: THREE.Group[] = [];
  public stickers: StickerMeshInfo[] = [];
  public isAnimating: boolean = false;
  private currentArrow: THREE.Group | null = null;

  // Materials
  private plasticMaterial: THREE.MeshStandardMaterial;
  private colorMaterials: Record<CubeColor, THREE.MeshStandardMaterial>;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.cubeGroup = new THREE.Group();
    this.pivotGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);
    this.scene.add(this.pivotGroup);

    // Speedcube Black Plastic core material
    this.plasticMaterial = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.35,
      metalness: 0.15,
    });

    // Vibrant speedcube sticker materials
    this.colorMaterials = {
      white: new THREE.MeshStandardMaterial({ color: COLOR_HEX.white, roughness: 0.15, metalness: 0.05 }),
      yellow: new THREE.MeshStandardMaterial({ color: COLOR_HEX.yellow, roughness: 0.15, metalness: 0.05 }),
      red: new THREE.MeshStandardMaterial({ color: COLOR_HEX.red, roughness: 0.15, metalness: 0.05 }),
      orange: new THREE.MeshStandardMaterial({ color: COLOR_HEX.orange, roughness: 0.15, metalness: 0.05 }),
      blue: new THREE.MeshStandardMaterial({ color: COLOR_HEX.blue, roughness: 0.15, metalness: 0.05 }),
      green: new THREE.MeshStandardMaterial({ color: COLOR_HEX.green, roughness: 0.15, metalness: 0.05 }),
    };

    this.buildCube();
  }

  private buildCube() {
    const cubieSize = 0.96;
    const spacing = 1.0;
    const stickerSize = 0.86;
    const stickerOffset = 0.485;

    // Create 26 cubies
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue; // Skip core center

          const cubie = new THREE.Group();
          cubie.position.set(x * spacing, y * spacing, z * spacing);
          cubie.userData = { initialX: x, initialY: y, initialZ: z };

          // Plastic body with rounded edges look
          const bodyGeo = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);
          const bodyMesh = new THREE.Mesh(bodyGeo, this.plasticMaterial);
          bodyMesh.castShadow = true;
          bodyMesh.receiveShadow = true;
          cubie.add(bodyMesh);

          // Add stickers on exterior faces
          // Top Face (U): y = 1
          if (y === 1) {
            const uIndex = this.getFaceletIndex('U', x, z);
            const sticker = this.createStickerMesh(stickerSize, 'white', uIndex, 'U', x, y, z);
            sticker.mesh.position.set(0, stickerOffset, 0);
            sticker.mesh.rotation.x = -Math.PI / 2;
            cubie.add(sticker.mesh);
            this.stickers.push(sticker);
          }

          // Bottom Face (D): y = -1
          if (y === -1) {
            const dIndex = this.getFaceletIndex('D', x, z);
            const sticker = this.createStickerMesh(stickerSize, 'yellow', dIndex, 'D', x, y, z);
            sticker.mesh.position.set(0, -stickerOffset, 0);
            sticker.mesh.rotation.x = Math.PI / 2;
            cubie.add(sticker.mesh);
            this.stickers.push(sticker);
          }

          // Front Face (F): z = 1
          if (z === 1) {
            const fIndex = this.getFaceletIndex('F', x, y);
            const sticker = this.createStickerMesh(stickerSize, 'green', fIndex, 'F', x, y, z);
            sticker.mesh.position.set(0, 0, stickerOffset);
            cubie.add(sticker.mesh);
            this.stickers.push(sticker);
          }

          // Back Face (B): z = -1
          if (z === -1) {
            const bIndex = this.getFaceletIndex('B', x, y);
            const sticker = this.createStickerMesh(stickerSize, 'blue', bIndex, 'B', x, y, z);
            sticker.mesh.position.set(0, 0, -stickerOffset);
            sticker.mesh.rotation.y = Math.PI;
            cubie.add(sticker.mesh);
            this.stickers.push(sticker);
          }

          // Right Face (R): x = 1
          if (x === 1) {
            const rIndex = this.getFaceletIndex('R', y, z);
            const sticker = this.createStickerMesh(stickerSize, 'red', rIndex, 'R', x, y, z);
            sticker.mesh.position.set(stickerOffset, 0, 0);
            sticker.mesh.rotation.y = Math.PI / 2;
            cubie.add(sticker.mesh);
            this.stickers.push(sticker);
          }

          // Left Face (L): x = -1
          if (x === -1) {
            const lIndex = this.getFaceletIndex('L', y, z);
            const sticker = this.createStickerMesh(stickerSize, 'orange', lIndex, 'L', x, y, z);
            sticker.mesh.position.set(-stickerOffset, 0, 0);
            sticker.mesh.rotation.y = -Math.PI / 2;
            cubie.add(sticker.mesh);
            this.stickers.push(sticker);
          }

          this.cubies.push(cubie);
          this.cubeGroup.add(cubie);
        }
      }
    }

    // Sort stickers by faceletIndex 0..53
    this.stickers.sort((a, b) => a.faceletIndex - b.faceletIndex);
  }

  private createStickerMesh(
    size: number,
    color: CubeColor,
    faceletIndex: number,
    face: Face,
    cubieX: number,
    cubieY: number,
    cubieZ: number
  ): StickerMeshInfo {
    const stickerGeo = new THREE.PlaneGeometry(size, size);
    const mesh = new THREE.Mesh(stickerGeo, this.colorMaterials[color].clone());
    mesh.userData = { faceletIndex, face, cubieX, cubieY, cubieZ };
    return { mesh, faceletIndex, face, cubieX, cubieY, cubieZ };
  }

  private getFaceletIndex(face: Face, a: number, b: number): number {
    // Exact mapping corresponding to constants & moves:
    // U: 0..8 (x: -1..1, z: -1..1)
    if (face === 'U') {
      const row = b + 1; // z: -1->0, 0->1, 1->2
      const col = a + 1; // x: -1->0, 0->1, 1->2
      return 0 + row * 3 + col;
    }
    // R: 9..17 (y: 1..-1, z: 1..-1)
    if (face === 'R') {
      const row = 1 - a; // y: 1->0, 0->1, -1->2
      const col = 1 - b; // z: 1->0, 0->1, -1->2
      return 9 + row * 3 + col;
    }
    // F: 18..26 (x: -1..1, y: 1..-1)
    if (face === 'F') {
      const row = 1 - b; // y: 1->0, 0->1, -1->2
      const col = a + 1; // x: -1->0, 0->1, 1->2
      return 18 + row * 3 + col;
    }
    // D: 27..35 (x: -1..1, z: 1..-1)
    if (face === 'D') {
      const row = 1 - b; // z: 1->0, 0->1, -1->2
      const col = a + 1; // x: -1->0, 0->1, 1->2
      return 27 + row * 3 + col;
    }
    // L: 36..44 (y: 1..-1, z: -1..1)
    if (face === 'L') {
      const row = 1 - a; // y: 1->0, 0->1, -1->2
      const col = b + 1; // z: -1->0, 0->1, 1->2
      return 36 + row * 3 + col;
    }
    // B: 45..53 (x: 1..-1, y: 1..-1)
    if (face === 'B') {
      const row = 1 - b; // y: 1->0, 0->1, -1->2
      const col = 1 - a; // x: 1->0, 0->1, -1->2
      return 45 + row * 3 + col;
    }
    return 0;
  }

  /**
   * Sync visual stickers directly from a 54-facelet array
   */
  public updateStickersFromFacelets(facelets: FaceletArray) {
    this.stickers.forEach(s => {
      const color = facelets[s.faceletIndex] || 'white';
      const mat = s.mesh.material as THREE.MeshStandardMaterial;
      mat.color.set(COLOR_HEX[color]);
      mat.emissive.set(0x000000);
      mat.emissiveIntensity = 0;
    });
  }

  /**
   * Highlight a specific face with subtle glow during step walkthrough
   */
  public highlightFace(face: Face | null) {
    this.stickers.forEach(s => {
      const mat = s.mesh.material as THREE.MeshStandardMaterial;
      if (!face) {
        mat.opacity = 1.0;
        mat.transparent = false;
        mat.emissive.set(0x000000);
        mat.emissiveIntensity = 0;
      } else if (s.face === face) {
        mat.opacity = 1.0;
        mat.transparent = false;
        mat.emissive.setHex(0x223355);
        mat.emissiveIntensity = 0.25;
      } else {
        mat.opacity = 0.72;
        mat.transparent = true;
        mat.emissive.set(0x000000);
        mat.emissiveIntensity = 0;
      }
    });
  }

  /**
   * Show or hide 3D curved move arrow over active face
   */
  public showMoveArrow(move: NotationMove | null) {
    if (this.currentArrow) {
      this.scene.remove(this.currentArrow);
      this.currentArrow = null;
    }

    if (!move) return;
    const base = move[0] as Face;
    if (!['U', 'D', 'L', 'R', 'F', 'B'].includes(base)) return;

    const isPrime = move.includes('\'');
    const isDouble = move.includes('2');
    this.currentArrow = createMoveArrow(base, isPrime, isDouble);
    this.scene.add(this.currentArrow);
  }

  /**
   * Animate a face turn smoothly on the 3D cube
   */
  public animateMove(
    move: NotationMove,
    durationMs: number = 220,
    onComplete?: () => void
  ): Promise<void> {
    return new Promise(resolve => {
      if (durationMs <= 0) {
        // Instant
        onComplete?.();
        resolve();
        return;
      }

      this.isAnimating = true;
      const base = move[0];
      const isPrime = move.includes('\'');
      const isDouble = move.includes('2');

      // Determine rotation axis, slice filter, and target angle
      let axis = new THREE.Vector3(0, 1, 0);
      let angle = isDouble ? Math.PI : (isPrime ? Math.PI / 2 : -Math.PI / 2);
      let filterFn = (_pos: THREE.Vector3) => true;

      switch (base) {
        case 'U':
          axis.set(0, 1, 0);
          angle = isDouble ? -Math.PI : (isPrime ? Math.PI / 2 : -Math.PI / 2);
          filterFn = pos => pos.y > 0.5;
          break;
        case 'D':
          axis.set(0, 1, 0);
          angle = isDouble ? Math.PI : (isPrime ? -Math.PI / 2 : Math.PI / 2);
          filterFn = pos => pos.y < -0.5;
          break;
        case 'R':
          axis.set(1, 0, 0);
          angle = isDouble ? -Math.PI : (isPrime ? Math.PI / 2 : -Math.PI / 2);
          filterFn = pos => pos.x > 0.5;
          break;
        case 'L':
          axis.set(1, 0, 0);
          angle = isDouble ? Math.PI : (isPrime ? -Math.PI / 2 : Math.PI / 2);
          filterFn = pos => pos.x < -0.5;
          break;
        case 'F':
          axis.set(0, 0, 1);
          angle = isDouble ? -Math.PI : (isPrime ? Math.PI / 2 : -Math.PI / 2);
          filterFn = pos => pos.z > 0.5;
          break;
        case 'B':
          axis.set(0, 0, 1);
          angle = isDouble ? Math.PI : (isPrime ? -Math.PI / 2 : Math.PI / 2);
          filterFn = pos => pos.z < -0.5;
          break;
        case 'M': // Middle slice between L and R
          axis.set(1, 0, 0);
          angle = isDouble ? Math.PI : (isPrime ? -Math.PI / 2 : Math.PI / 2);
          filterFn = pos => Math.abs(pos.x) < 0.5;
          break;
        case 'E': // Equator slice between U and D
          axis.set(0, 1, 0);
          angle = isDouble ? Math.PI : (isPrime ? -Math.PI / 2 : Math.PI / 2);
          filterFn = pos => Math.abs(pos.y) < 0.5;
          break;
        case 'S': // Standing slice between F and B
          axis.set(0, 0, 1);
          angle = isDouble ? -Math.PI : (isPrime ? Math.PI / 2 : -Math.PI / 2);
          filterFn = pos => Math.abs(pos.z) < 0.5;
          break;
        case 'x': // Whole cube X rotation
          axis.set(1, 0, 0);
          angle = isDouble ? -Math.PI : (isPrime ? Math.PI / 2 : -Math.PI / 2);
          filterFn = () => true;
          break;
        case 'y': // Whole cube Y rotation
          axis.set(0, 1, 0);
          angle = isDouble ? -Math.PI : (isPrime ? Math.PI / 2 : -Math.PI / 2);
          filterFn = () => true;
          break;
        case 'z': // Whole cube Z rotation
          axis.set(0, 0, 1);
          angle = isDouble ? -Math.PI : (isPrime ? Math.PI / 2 : -Math.PI / 2);
          filterFn = () => true;
          break;
      }

      // Reparent turning cubies to pivotGroup
      this.pivotGroup.rotation.set(0, 0, 0);
      this.pivotGroup.position.set(0, 0, 0);
      this.pivotGroup.updateMatrixWorld();

      const rotatingCubies: THREE.Group[] = [];
      const worldPos = new THREE.Vector3();

      this.cubies.forEach(cubie => {
        cubie.getWorldPosition(worldPos);
        if (filterFn(worldPos)) {
          this.pivotGroup.attach(cubie);
          rotatingCubies.push(cubie);
        }
      });

      const startTime = performance.now();

      const animateStep = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentAngle = angle * eased;

        this.pivotGroup.setRotationFromAxisAngle(axis, currentAngle);

        if (progress < 1) {
          requestAnimationFrame(animateStep);
        } else {
          // Finalize rotation: re-attach cubies back to cubeGroup
          this.pivotGroup.setRotationFromAxisAngle(axis, angle);
          this.pivotGroup.updateMatrixWorld();

          rotatingCubies.forEach(cubie => {
            this.cubeGroup.attach(cubie);
            // Snap position & orientation to exact grid coordinates
            cubie.position.x = Math.round(cubie.position.x * 10) / 10;
            cubie.position.y = Math.round(cubie.position.y * 10) / 10;
            cubie.position.z = Math.round(cubie.position.z * 10) / 10;
          });

          this.pivotGroup.rotation.set(0, 0, 0);
          this.isAnimating = false;
          onComplete?.();
          resolve();
        }
      };

      requestAnimationFrame(animateStep);
    });
  }

  public resetVisualTransforms() {
    this.cubies.forEach(cubie => {
      const { initialX, initialY, initialZ } = cubie.userData;
      cubie.position.set(initialX, initialY, initialZ);
      cubie.rotation.set(0, 0, 0);
      cubie.quaternion.identity();
    });
    this.cubeGroup.rotation.set(0, 0, 0);
    this.pivotGroup.rotation.set(0, 0, 0);
    if (this.currentArrow) {
      this.scene.remove(this.currentArrow);
      this.currentArrow = null;
    }
  }

  public dispose() {
    this.cubies.forEach(c => {
      c.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
    });
    this.scene.remove(this.cubeGroup);
    this.scene.remove(this.pivotGroup);
    if (this.currentArrow) this.scene.remove(this.currentArrow);
  }
}
