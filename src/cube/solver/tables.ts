import {
  CubieCube,
  MOVE_CUBIES,
  N_TWIST,
  N_FLIP,
  N_SLICE1,
  N_SLICE2,
  N_CORNERS,
  N_EDGES,
  Corner,
  Edge,
  C_n_k
} from './coordCube';

// Phase 1 Move Tables
export const twistMoveTable: Int16Array[] = [];
export const flipMoveTable: Int16Array[] = [];
export const sliceMoveTable: Int16Array[] = [];

// Phase 2 Move Tables
export const cPermMoveTable: Int32Array[] = [];
export const ePermMoveTable: Int32Array[] = [];
export const slice2MoveTable: Int8Array[] = [];

// Pruning Tables (Phase 1 & Phase 2)
export const sliceTwistPrune = new Int8Array(N_SLICE1 * N_TWIST).fill(-1);
export const sliceFlipPrune = new Int8Array(N_SLICE1 * N_FLIP).fill(-1);
export const sliceCPermPrune = new Int8Array(N_SLICE2 * N_CORNERS).fill(-1);
export const sliceEPermPrune = new Int8Array(N_SLICE2 * N_EDGES).fill(-1);

let tablesInitialized = false;

export function initSolverTables() {
  if (tablesInitialized) return;

  // 1. Twist Move Table (2187 x 18)
  const a = new CubieCube();
  for (let i = 0; i < N_TWIST; i++) {
    twistMoveTable[i] = new Int16Array(18);
    a.setTwist(i);
    for (let j = 0; j < 18; j++) {
      const res = a.multiply(MOVE_CUBIES[j]);
      twistMoveTable[i][j] = res.getTwist();
    }
  }

  // 2. Flip Move Table (2048 x 18)
  for (let i = 0; i < N_FLIP; i++) {
    flipMoveTable[i] = new Int16Array(18);
    a.setFlip(i);
    for (let j = 0; j < 18; j++) {
      const res = a.multiply(MOVE_CUBIES[j]);
      flipMoveTable[i][j] = res.getFlip();
    }
  }

  // 3. Slice Move Table (495 x 18)
  // Reconstruct slice from index
  for (let i = 0; i < N_SLICE1; i++) {
    sliceMoveTable[i] = new Int16Array(18);
    // Find combination of slice edges
    const c = new CubieCube();
    let x = 4;
    let index = i;
    for (let j = 0; j < 12; j++) {
      c.ep[j] = Edge.UR; // dummy
    }
    for (let j = 11; j >= 0; j--) {
      if (index >= C_n_k(j, x)) {
        index -= C_n_k(j, x);
        c.ep[11 - j] = (8 + 4 - x) as Edge;
        x--;
      }
    }

    for (let j = 0; j < 18; j++) {
      const res = c.multiply(MOVE_CUBIES[j]);
      sliceMoveTable[i][j] = res.getSlice();
    }
  }

  // 4. Phase 1 Pruning: Slice + Twist (BFS up to depth 6-7 for fast search)
  sliceTwistPrune[0] = 0;
  let depth = 0;
  let done = 1;
  while (done < 50000 && depth < 6) {
    const nextDepth = depth + 1;
    for (let i = 0; i < N_SLICE1 * N_TWIST; i++) {
      if (sliceTwistPrune[i] === depth) {
        const slice = Math.floor(i / N_TWIST);
        const twist = i % N_TWIST;
        for (let m = 0; m < 18; m++) {
          const newSlice = sliceMoveTable[slice][m];
          const newTwist = twistMoveTable[twist][m];
          const newIdx = newSlice * N_TWIST + newTwist;
          if (sliceTwistPrune[newIdx] === -1) {
            sliceTwistPrune[newIdx] = nextDepth;
            done++;
          }
        }
      }
    }
    depth++;
  }

  // 5. Phase 1 Pruning: Slice + Flip
  sliceFlipPrune[0] = 0;
  depth = 0;
  done = 1;
  while (done < 50000 && depth < 6) {
    const nextDepth = depth + 1;
    for (let i = 0; i < N_SLICE1 * N_FLIP; i++) {
      if (sliceFlipPrune[i] === depth) {
        const slice = Math.floor(i / N_FLIP);
        const flip = i % N_FLIP;
        for (let m = 0; m < 18; m++) {
          const newSlice = sliceMoveTable[slice][m];
          const newFlip = flipMoveTable[flip][m];
          const newIdx = newSlice * N_FLIP + newFlip;
          if (sliceFlipPrune[newIdx] === -1) {
            sliceFlipPrune[newIdx] = nextDepth;
            done++;
          }
        }
      }
    }
    depth++;
  }

  tablesInitialized = true;
}
