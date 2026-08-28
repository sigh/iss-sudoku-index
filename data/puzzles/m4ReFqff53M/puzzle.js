// Title: The Puzzle One Of Us Failed To Solve
// Author: Philipp Huber
// Video: https://www.youtube.com/watch?v=m4ReFqff53M
// Source: https://cracking-the-cryptic.web.app/sudoku/q9N3bjQJtQ
//
// Standard sudoku (rows, columns, boxes) with no given digits.
// Magic square: the center box's three rows, three columns, and two
// diagonals each sum to the same total -- EqualSum over those 8 segments;
// the box's own AllDifferent (from the default box regions) then forces
// that common total to 15 on its own.
// Cages: each dotted box's cells are all different and sum to its printed
// total -- a plain killer Cage per box.

// Magic-square segments: the center box, R4C4-R6C6.
const magicRows = [
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
];
const magicCols = [
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R5C6', 'R6C6'],
];
const magicDiagonals = [
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
];

// Dotted-box cages: [total, ...cells], transcribed from the payload's
// `cages` array (top-left cell of each box carries the printed total).
const cages = [
  [16, 'R3C2', 'R2C2', 'R2C3'],
  [12, 'R3C3', 'R3C4', 'R2C4'],
  [10, 'R4C2', 'R4C3'],
  [16, 'R2C6', 'R3C6'],
  [10, 'R3C7', 'R2C7', 'R2C8'],
  [20, 'R3C8', 'R4C8', 'R4C7'],
  [22, 'R6C3', 'R6C2', 'R7C2', 'R8C2'],
  [15, 'R7C3', 'R8C3'],
  [14, 'R7C4', 'R8C4'],
  [7, 'R7C6', 'R8C6'],
  [16, 'R7C7', 'R6C7', 'R6C8'],
  [24, 'R7C8', 'R8C8', 'R8C7'],
];

return [
  new Shape('9x9'),
  new EqualSum(...magicRows, ...magicCols, ...magicDiagonals),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
