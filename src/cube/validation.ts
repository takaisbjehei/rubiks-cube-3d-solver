import { CubeColor, FaceletArray, ValidationDetail } from '../types/cube';
import { CORNER_FACELETS, EDGE_FACELETS, CENTER_INDICES } from './constants';

const VALID_COLORS: CubeColor[] = ['white', 'yellow', 'red', 'orange', 'blue', 'green'];

// Standard reference piece color sets (in standard Western orientation: U=white, D=yellow, F=green, B=blue, L=orange, R=red)
const STANDARD_CORNERS = [
  ['white', 'red', 'green'],    // URF
  ['white', 'green', 'orange'], // UFL
  ['white', 'orange', 'blue'],  // ULB
  ['white', 'blue', 'red'],     // UBR
  ['yellow', 'green', 'red'],   // DFR
  ['yellow', 'orange', 'green'],// DLF
  ['yellow', 'blue', 'orange'], // DBL
  ['yellow', 'red', 'blue'],    // DRB
];

const STANDARD_EDGES = [
  ['white', 'red'],    // UR
  ['white', 'green'],  // UF
  ['white', 'orange'], // UL
  ['white', 'blue'],   // UB
  ['yellow', 'red'],   // DR
  ['yellow', 'green'], // DF
  ['yellow', 'orange'],// DL
  ['yellow', 'blue'],  // DB
  ['green', 'red'],    // FR
  ['green', 'orange'], // FL
  ['blue', 'orange'],  // BL
  ['blue', 'red'],     // BR
];

/**
 * Validate a 54-facelet cube state and return detailed diagnostic errors and warnings
 */
export function validateCubeState(facelets: FaceletArray): ValidationDetail {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check array length
  if (!facelets || facelets.length !== 54) {
    return {
      isValid: false,
      errors: ['Cube data is incomplete. Exactly 54 facelets are required.'],
      warnings: [],
      counts: getStickerCounts(facelets || []),
    };
  }

  // 2. Count stickers
  const counts = getStickerCounts(facelets);
  let totalMissing = 0;
  const countErrors: string[] = [];

  VALID_COLORS.forEach(color => {
    const c = counts[color] || 0;
    if (c !== 9) {
      if (c < 9) {
        countErrors.push(`Missing ${9 - c} ${color.toUpperCase()} sticker${9 - c > 1 ? 's' : ''} (found ${c}/9)`);
        totalMissing += 9 - c;
      } else {
        countErrors.push(`Too many ${color.toUpperCase()} stickers (found ${c}/9, need 9)`);
      }
    }
  });

  if (countErrors.length > 0) {
    errors.push(...countErrors);
  }

  // 3. Validate centers
  const centerColors = [
    facelets[CENTER_INDICES.U],
    facelets[CENTER_INDICES.R],
    facelets[CENTER_INDICES.F],
    facelets[CENTER_INDICES.D],
    facelets[CENTER_INDICES.L],
    facelets[CENTER_INDICES.B],
  ];

  const uniqueCenters = new Set(centerColors);
  if (uniqueCenters.size !== 6) {
    errors.push('Centers must have 6 unique colors. Check that opposite and adjacent centers are distinct.');
  }

  // If sticker counts are wrong, stop early with informative count messages
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      counts,
    };
  }

  // Map center colors to standard U, R, F, D, L, B faces
  const colorToFace: Record<string, string> = {};
  colorToFace[facelets[CENTER_INDICES.U]] = 'U';
  colorToFace[facelets[CENTER_INDICES.R]] = 'R';
  colorToFace[facelets[CENTER_INDICES.F]] = 'F';
  colorToFace[facelets[CENTER_INDICES.D]] = 'D';
  colorToFace[facelets[CENTER_INDICES.L]] = 'L';
  colorToFace[facelets[CENTER_INDICES.B]] = 'B';

  const uColor = facelets[CENTER_INDICES.U];
  const dColor = facelets[CENTER_INDICES.D];
  const fColor = facelets[CENTER_INDICES.F];
  const bColor = facelets[CENTER_INDICES.B];
  const lColor = facelets[CENTER_INDICES.L];
  const rColor = facelets[CENTER_INDICES.R];

  // 4. Validate Corner pieces
  const cornerPerm: number[] = [];
  const cornerOri: number[] = [];
  const foundCornerIndices = new Set<number>();
  let cornerOriSum = 0;

  for (let i = 0; i < 8; i++) {
    const [i1, i2, i3] = CORNER_FACELETS[i];
    const c1 = facelets[i1];
    const c2 = facelets[i2];
    const c3 = facelets[i3];
    const pieceColors = [c1, c2, c3];

    // Find matching physical corner
    let matchIdx = -1;
    for (let cIdx = 0; cIdx < STANDARD_CORNERS.length; cIdx++) {
      const std = STANDARD_CORNERS[cIdx];
      if (std.includes(c1) && std.includes(c2) && std.includes(c3)) {
        matchIdx = cIdx;
        break;
      }
    }

    if (matchIdx === -1) {
      errors.push(`Invalid corner piece at slot #${i + 1} (${c1}, ${c2}, ${c3}). These three colors cannot physically touch on a corner.`);
    } else if (foundCornerIndices.has(matchIdx)) {
      errors.push(`Duplicate corner piece found: ${STANDARD_CORNERS[matchIdx].join('-')} appears more than once.`);
    } else {
      foundCornerIndices.add(matchIdx);
      cornerPerm.push(matchIdx);

      // Determine corner orientation (twist 0, 1, 2)
      // Reference sticker should be U or D color
      let ori = 0;
      if (c1 === uColor || c1 === dColor) {
        ori = 0;
      } else if (c2 === uColor || c2 === dColor) {
        ori = 1;
      } else if (c3 === uColor || c3 === dColor) {
        ori = 2;
      } else {
        // Center mismatch
        ori = 0;
      }
      cornerOri.push(ori);
      cornerOriSum += ori;
    }
  }

  // 5. Validate Edge pieces
  const edgePerm: number[] = [];
  const edgeOri: number[] = [];
  const foundEdgeIndices = new Set<number>();
  let edgeOriSum = 0;

  for (let i = 0; i < 12; i++) {
    const [i1, i2] = EDGE_FACELETS[i];
    const c1 = facelets[i1];
    const c2 = facelets[i2];

    let matchIdx = -1;
    for (let eIdx = 0; eIdx < STANDARD_EDGES.length; eIdx++) {
      const std = STANDARD_EDGES[eIdx];
      if (std.includes(c1) && std.includes(c2)) {
        matchIdx = eIdx;
        break;
      }
    }

    if (matchIdx === -1) {
      errors.push(`Invalid edge piece at slot #${i + 1} (${c1}-${c2}). Opposite or illegal color combination.`);
    } else if (foundEdgeIndices.has(matchIdx)) {
      errors.push(`Duplicate edge piece found: ${STANDARD_EDGES[matchIdx].join('-')} appears more than once.`);
    } else {
      foundEdgeIndices.add(matchIdx);
      edgePerm.push(matchIdx);

      // Determine edge orientation (flip 0 or 1)
      let ori = 0;
      if (c1 === uColor || c1 === dColor) {
        ori = 0;
      } else if (c2 === uColor || c2 === dColor) {
        ori = 1;
      } else if (c1 === fColor || c1 === bColor) {
        ori = 0;
      } else if (c2 === fColor || c2 === bColor) {
        ori = 1;
      } else {
        ori = 0;
      }
      edgeOri.push(ori);
      edgeOriSum += ori;
    }
  }

  // If pieces are already invalid, return early
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      counts,
    };
  }

  // 6. Check Corner Orientation Parity (sum % 3 === 0)
  const cornerOriParityValid = (cornerOriSum % 3 === 0);
  if (!cornerOriParityValid) {
    errors.push('Corner twist parity error: Exactly one corner piece is twisted in place. Twist one corner to resolve.');
  }

  // 7. Check Edge Orientation Parity (sum % 2 === 0)
  const edgeOriParityValid = (edgeOriSum % 2 === 0);
  if (!edgeOriParityValid) {
    errors.push('Edge flip parity error: Exactly one edge piece is flipped in place. Flip one edge to resolve.');
  }

  // 8. Check Permutation Parity (sgn(corners) === sgn(edges))
  const cornerSign = getPermutationSign(cornerPerm);
  const edgeSign = getPermutationSign(edgePerm);
  const permParityValid = (cornerSign === edgeSign);

  if (!permParityValid) {
    errors.push('Permutation parity error: Exactly two pieces are swapped. On a physical cube, this occurs if pieces were disassembled and assembled incorrectly.');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    counts,
    parityStatus: {
      cornerPermutationParity: cornerSign === 1,
      edgePermutationParity: edgeSign === 1,
      cornerOrientationParity: cornerOriParityValid,
      edgeOrientationParity: edgeOriParityValid,
      totalPermutationParity: permParityValid,
    },
  };
}

function getStickerCounts(facelets: CubeColor[]): Record<CubeColor, number> {
  const counts: Record<CubeColor, number> = {
    white: 0,
    yellow: 0,
    red: 0,
    orange: 0,
    blue: 0,
    green: 0,
  };
  for (const c of facelets) {
    if (counts[c] !== undefined) {
      counts[c]++;
    }
  }
  return counts;
}

function getPermutationSign(arr: number[]): number {
  let inversions = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) inversions++;
    }
  }
  return inversions % 2 === 0 ? 1 : -1;
}

export function isCubeSolved(facelets: FaceletArray): boolean {
  for (let face = 0; face < 6; face++) {
    const base = face * 9;
    const centerColor = facelets[base + 4];
    for (let i = 0; i < 9; i++) {
      if (facelets[base + i] !== centerColor) return false;
    }
  }
  return true;
}
