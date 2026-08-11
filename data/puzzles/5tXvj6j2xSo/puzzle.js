// Title: Product 2520
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=5tXvj6j2xSo
// Source: https://app.crackingthecryptic.com/sudoku/nqRP3L4PbD

// Rules: Normal sudoku rules apply (standard rows/cols/3x3 boxes, from the
// default 9x9 Shape). The digits along each of the 7 drawn lines (grey or
// green) multiply together to make 2520. Repeats are allowed along a line
// except where row/column/box already forbids them.
//
// The two long grey lines are the full anti-diagonal (R1C9..R9C1) and full
// main diagonal (R1C1..R9C9), 9 cells each, crossing at R5C5. Four shorter
// grey lines are shallow V-shapes near each edge midpoint, 5 cells each. One
// green line is a closed 4-cell diamond loop around the centre (R4C5-R5C4-
// R6C5-R5C6-R4C5); its 4 distinct cells are passed once each -- a product is
// a whole-line total, not a pairwise chain, so the closed-loop repeat-first-
// cell convention (for Whisper/Pair-style consecutive-pair classes) does not
// apply here.
//
// Product-line NFA: state = running product of digits read so far, starting
// at 1. Each digit multiplies the state; any state exceeding the 2520 target
// is rejected (dead state). Accept iff the state equals 2520 exactly after
// all of the line's cells are read. One shared spec is reused for every line
// regardless of length, since the automaton has no notion of position, only
// of accumulated product.
const TARGET = 2520;
const productLineSpec = NFA.encodeSpec({
  startState: 1,
  transition: (state, value) => {
    const next = state * value;
    if (next > TARGET) return; // dead: no digit sequence can multiply back down
    return next;
  },
  accept: (state) => state === TARGET,
}, 9);

function productLine(name, ...cells) {
  return new NFA(productLineSpec, name, ...cells);
}

// Line cells, transcribed from the drawn line paths (interpolated where a
// segment skips a diagonally-adjacent cell):
const antiDiagonal = ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'];
const mainDiagonal = ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'];
const topV = ['R1C3', 'R2C4', 'R2C5', 'R2C6', 'R1C7'];
const rightV = ['R3C9', 'R4C8', 'R5C8', 'R6C8', 'R7C9'];
const leftV = ['R3C1', 'R4C2', 'R5C2', 'R6C2', 'R7C1'];
const bottomV = ['R9C3', 'R8C4', 'R8C5', 'R8C6', 'R9C7'];
const centreLoop = ['R4C5', 'R5C4', 'R6C5', 'R5C6'];

// Givens, transcribed from the drawn grid.
const givens = [
  new Given('R2C6', 2),
  new Given('R2C8', 1),
  new Given('R2C9', 7),
  new Given('R4C9', 6),
  new Given('R5C2', 5),
  new Given('R5C8', 3),
  new Given('R6C1', 3),
  new Given('R8C1', 9),
  new Given('R8C2', 1),
  new Given('R8C4', 8),
];

return [
  new Shape('9x9'),
  ...givens,
  productLine('anti-diagonal product', ...antiDiagonal),
  productLine('main diagonal product', ...mainDiagonal),
  productLine('top V product', ...topV),
  productLine('right V product', ...rightV),
  productLine('left V product', ...leftV),
  productLine('bottom V product', ...bottomV),
  productLine('centre loop product', ...centreLoop),
];
