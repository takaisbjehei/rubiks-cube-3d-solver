import { SOLVED_FACELETS } from './cube/constants';
import { applyMoveToFacelets, applyAlgorithmToFacelets, parseMoves } from './cube/moves';
import { solveRubiksCube } from './cube/solver';
import { isCubeSolved } from './cube/validation';

console.log('Testing 4-move scramble and solver...');
const scramble = "B' F' R U";
const scrambled = applyAlgorithmToFacelets(SOLVED_FACELETS, scramble);
console.log('Is solved before solve?', isCubeSolved(scrambled));

const solRes = solveRubiksCube(scrambled);
console.log('Solver success:', solRes.success);
console.log('Moves:', solRes.moves);

let state = [...scrambled];
solRes.moves.forEach((m, idx) => {
  state = applyMoveToFacelets(state, m);
  console.log(`After step ${idx + 1} (${m}): is solved? ${isCubeSolved(state)}`);
});

console.log('Final isCubeSolved:', isCubeSolved(state));
