// Title: 7/6/23: Squaring the Square
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=KlH18ihoZlI
// Source: https://tinyurl.com/mv25jy6z

// Normal sudoku rules apply. 16 killer cages (digits in a cage cannot repeat
// and must sum to the given total) and 16 white dots (digits across a white
// dot are consecutive; absence of a dot carries no negative constraint, per
// the rules text).

// Cage cells and totals transcribed from the payload's `killercage` array.
const cages = [
  [4, 'R1C2', 'R1C3'],
  [5, 'R1C4', 'R2C4'],
  [15, 'R8C6', 'R9C6'],
  [16, 'R9C7', 'R9C8'],
  [14, 'R7C6', 'R7C7'],
  [6, 'R3C3', 'R3C4'],
  [7, 'R2C2', 'R3C2'],
  [13, 'R7C8', 'R8C8'],
  [16, 'R6C3', 'R7C3'],
  [4, 'R3C7', 'R4C7'],
  [14, 'R2C9', 'R3C9'],
  [6, 'R7C1', 'R8C1'],
  [10, 'R6C1', 'R6C2'],
  [10, 'R8C2', 'R8C3'],
  [10, 'R2C7', 'R2C8'],
  [10, 'R4C8', 'R4C9'],
];

// Dot cell pairs transcribed from the payload's `difference` array.
const dots = [
  ['R1C3', 'R1C4'],
  ['R2C4', 'R3C4'],
  ['R9C7', 'R9C6'],
  ['R7C6', 'R8C6'],
  ['R7C7', 'R7C8'],
  ['R3C3', 'R3C2'],
  ['R8C8', 'R9C8'],
  ['R6C1', 'R7C1'],
  ['R6C2', 'R6C3'],
  ['R7C3', 'R8C3'],
  ['R8C2', 'R8C1'],
  ['R2C8', 'R2C9'],
  ['R3C9', 'R4C9'],
  ['R4C7', 'R4C8'],
  ['R3C7', 'R2C7'],
  ['R2C2', 'R1C2'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...dots.map(cells => new WhiteDot(...cells)),
];
