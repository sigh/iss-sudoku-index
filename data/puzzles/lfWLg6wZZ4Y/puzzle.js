// Title: Stitched Rainbow
// Author: thoughtbyte
// Video: https://www.youtube.com/watch?v=lfWLg6wZZ4Y
// Source: https://app.crackingthecryptic.com/sudoku/24PFG9bTdn

// Normal sudoku, no givens, standard boxes. X marks sum to 10, V marks sum to
// 5, a white dot marks consecutive digits, a black dot marks a 1:2 ratio
// (not every dot/X/V possible is drawn). Four 9-cell cages are drawn with no
// total, so their only effect is the stated "digits cannot repeat within
// cages" rule.

const shape = new Shape('9x9');

// Each cage runs along one border row/column and "stitches" one cell inward
// at its midpoint; drawn as SudokuPad cages with an empty total.
const cages = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R5C2'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R8C5'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R5C8'],
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C5'],
];

const xPairs = [
  ['R2C5', 'R3C5'], ['R7C5', 'R8C5'], ['R5C7', 'R5C8'], ['R5C2', 'R5C3'],
  ['R3C1', 'R4C1'], ['R6C9', 'R7C9'], ['R4C6', 'R4C7'], ['R6C3', 'R6C4'],
  ['R3C4', 'R4C4'], ['R6C6', 'R7C6'], ['R1C6', 'R1C7'], ['R9C3', 'R9C4'],
];

const vPairs = [
  ['R9C8', 'R9C9'], ['R8C1', 'R9C1'], ['R1C1', 'R1C2'], ['R1C9', 'R2C9'],
];

return [
  shape,
  ...cages.map(cells => new AllDifferent(...cells)),
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
  new WhiteDot('R1C4', 'R2C4'),
  new BlackDot('R1C6', 'R2C6'),
];
