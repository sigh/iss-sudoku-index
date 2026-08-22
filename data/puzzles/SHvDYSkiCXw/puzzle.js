// Title: Ready SET Go
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=SHvDYSkiCXw
// Source: https://app.crackingthecryptic.com/sudoku/nT2mRJ3BMb

// Normal sudoku rules apply. Nine cages carry a printed sum in their top
// left cell: no repeats within the cage, digits sum to the printed total.
// Two cages carry no printed total; the rules text's "...must sum to the
// digit in the top left corner if given" makes the sum clause conditional,
// so these two are no-repeat-only.
// Each arrow's circle is its bulb cell (drawn as the first waypoint of the
// arrow stroke); the remaining path cells sum to the digit in that cell.
// Digits cannot repeat along either drawn corner-to-corner diagonal.

const shape = new Shape('9x9');

const summedCages = [
  [10, 'R1C1', 'R1C2', 'R2C2', 'R2C1'],
  [14, 'R5C1', 'R5C2'],
  [30, 'R8C1', 'R8C2', 'R9C2', 'R9C1'],
  [9, 'R8C5', 'R9C5'],
  [11, 'R8C8', 'R8C9', 'R9C9', 'R9C8'],
  [13, 'R5C8', 'R5C9'],
  [29, 'R1C8', 'R1C9', 'R2C9', 'R2C8'],
  [13, 'R1C5', 'R2C5'],
  [18, 'R4C5', 'R5C5', 'R6C5'],
].map(([sum, ...cells]) => new Cage(sum, ...cells));

// No-total cages: all-different only, since there is no printed sum to enforce.
const noTotalCages = [
  ['R3C3', 'R4C3', 'R4C4', 'R3C4', 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R3C7'],
  ['R6C3', 'R7C3', 'R6C4', 'R7C4', 'R7C5', 'R6C6', 'R6C7', 'R7C7', 'R7C6'],
].map(cells => new AllDifferent(...cells));

// Circle (bulb) cell first, then the arrow's addend cells.
const arrows = [
  ['R8C1', 'R7C2', 'R6C2', 'R6C3'],
  ['R4C3', 'R3C4', 'R2C4', 'R1C4'],
  ['R3C6', 'R2C6', 'R2C7'],
  ['R5C8', 'R6C8', 'R6C9'],
].map(cells => new Arrow(...cells));

const diagonals = [
  new Diagonal(-1), // R1C1..R9C9, top-left to bottom-right
  new Diagonal(1),  // R1C9..R9C1, top-right to bottom-left
];

return [
  shape,
  ...summedCages,
  ...noTotalCages,
  ...arrows,
  ...diagonals,
];
