// Title: 7/7/23: Half Correct Quadruple
// Author: clover!
// Video: https://www.youtube.com/watch?v=-SbL3gEtxaM
// Source: https://tinyurl.com/2ckf7dk9
//
// Normal sudoku rules apply (standard 3x3 boxes).
// Each circle lists four distinct digits; exactly two of the four appear
// somewhere in the surrounding four cells, and the other two appear nowhere
// in those four cells -> one NFA per circle, tracking as a 4-bit mask which
// of its four digits have been seen so far across the scan, accepting only
// masks with exactly two bits set. The rule is a set-membership condition
// over the four cells (cell order carries no meaning), so the mask's
// bitwise-OR accumulation is order independent and the listed cell order
// (from the payload's `circle` array) does not matter.
//
// Circle cells and digit lists were read off the payload's `circle` array.

const givens = [
  ['R1C3', 2], ['R1C4', 5], ['R1C7', 4], ['R2C2', 9], ['R2C8', 8],
  ['R3C1', 1], ['R3C9', 5], ['R4C9', 3], ['R6C1', 8], ['R7C1', 3],
  ['R7C9', 1], ['R8C2', 8], ['R8C8', 9], ['R9C3', 6], ['R9C6', 2],
  ['R9C7', 3],
];

const circles = [
  [['R1C2', 'R1C1', 'R2C2', 'R2C1'], [1, 2, 3, 4]],
  [['R3C2', 'R3C3', 'R2C2', 'R2C3'], [3, 4, 5, 6]],
  [['R2C7', 'R2C8', 'R3C7', 'R3C8'], [4, 5, 6, 7]],
  [['R1C8', 'R1C9', 'R2C8', 'R2C9'], [1, 2, 6, 7]],
  [['R9C1', 'R9C2', 'R8C1', 'R8C2'], [3, 4, 5, 6]],
  [['R8C3', 'R8C2', 'R7C3', 'R7C2'], [1, 2, 4, 5]],
  [['R8C8', 'R8C7', 'R7C8', 'R7C7'], [1, 2, 3, 4]],
  [['R8C9', 'R8C8', 'R9C9', 'R9C8'], [2, 4, 5, 6]],
  [['R1C5', 'R1C4', 'R2C5', 'R2C4'], [1, 2, 3, 4]],
  [['R5C1', 'R5C2', 'R6C1', 'R6C2'], [1, 2, 3, 4]],
  [['R4C9', 'R4C8', 'R5C9', 'R5C8'], [1, 2, 3, 4]],
  [['R9C5', 'R9C6', 'R8C5', 'R8C6'], [1, 2, 3, 4]],
  [['R4C2', 'R4C3', 'R5C2', 'R5C3'], [2, 3, 4, 8]],
  [['R2C6', 'R2C5', 'R3C6', 'R3C5'], [2, 3, 4, 8]],
  [['R5C7', 'R5C8', 'R6C7', 'R6C8'], [5, 6, 7, 8]],
  [['R7C5', 'R7C4', 'R8C5', 'R8C4'], [6, 7, 8, 9]],
];

function popcount4(mask) {
  return (mask & 1) + ((mask >> 1) & 1) + ((mask >> 2) & 1) + ((mask >> 3) & 1);
}

function halfCorrectQuadNFA(digits) {
  return NFA.encodeSpec({
    startState: 0,
    transition: (mask, value) => {
      const idx = digits.indexOf(value);
      return idx === -1 ? mask : (mask | (1 << idx));
    },
    accept: mask => popcount4(mask) === 2,
  }, 9);
}

function halfCorrectQuad(cells, digits) {
  return new NFA(
    halfCorrectQuadNFA(digits),
    `half-correct quad (${digits.join('')})`,
    ...cells);
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...circles.map(([cells, digits]) => halfCorrectQuad(cells, digits)),
];
