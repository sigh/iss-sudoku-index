// Title: Big Zs
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=z1ZdqfIQdjE
// Source: https://sudokupad.app/69x5obq89n

// Normal sudoku rules apply. Fog/reveal is solving UI only and is not encoded.
//
// Seven Z-shaped arrows: the digits along each arrow's arm sum to the
// two-digit number formed (left to right) by the two cells in that arrow's
// pill. PillArrow(2, ...) takes the pill cells first, then the arm cells.
//
// Cells separated by a drawn X sum to 10, cells separated by a drawn V sum
// to 5; "not all possible Xs and Vs are necessarily given" means these are
// ordinary (non-strict) X/V marks, not an exhaustive-negative claim.

const arrows = [
  { pill: ['R3C7', 'R3C8'], line: ['R3C9', 'R4C8', 'R5C7', 'R5C8', 'R5C9'] },
  { pill: ['R3C5', 'R3C6'], line: ['R3C4', 'R2C5', 'R1C6', 'R1C5', 'R1C4'] },
  { pill: ['R1C1', 'R1C2'], line: ['R1C3', 'R2C2', 'R3C1', 'R3C2', 'R3C3'] },
  { pill: ['R7C6', 'R7C7'], line: ['R7C8', 'R8C7', 'R9C6', 'R9C7', 'R9C8'] },
  { pill: ['R4C5', 'R4C6'], line: ['R4C7', 'R5C6', 'R6C5', 'R6C6', 'R6C7'] },
  { pill: ['R5C3', 'R5C4'], line: ['R5C5', 'R6C4', 'R7C3', 'R7C4', 'R7C5'] },
  { pill: ['R6C1', 'R6C2'], line: ['R6C3', 'R7C2', 'R8C1', 'R8C2', 'R8C3'] },
];
const pillArrows = arrows.map(
  ({ pill, line }) => new PillArrow(2, ...pill, ...line));

// Drawn X marks (sum to 10); some coincide with an arrow's pill cells.
const xPairs = [
  ['R3C7', 'R3C8'],
  ['R3C5', 'R3C6'],
  ['R1C1', 'R1C2'],
];
// Drawn V marks (sum to 5); some coincide with an arrow's pill cells.
const vPairs = [
  ['R7C6', 'R7C7'],
  ['R4C8', 'R4C9'],
  ['R5C8', 'R5C9'],
  ['R6C4', 'R6C5'],
  ['R8C3', 'R8C4'],
];

return [
  new Shape('9x9'),
  new Given('R9C8', 3),
  ...pillArrows,
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
];
