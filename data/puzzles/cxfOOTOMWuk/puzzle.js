// Title: Near Symmetry
// Author: Anon
// Video: https://www.youtube.com/watch?v=cxfOOTOMWuk
// Source: https://sudokupad.app/htkeovqz4k

// Normal sudoku rules apply (rows, columns, and the standard nine 3x3 boxes,
// all enforced by default). Every cage sums to its top-left total and its
// digits do not repeat (Cage). A black dot between two cells means one value
// is double the other (BlackDot). A quadruple clue's listed digits must all
// appear among its surrounding 2x2 cells (Quad), anchored at the 2x2's
// top-left cell.

const cages = [
  [4, 'R4C1', 'R5C1'],
  [3, 'R4C9', 'R5C9'],
  [23, 'R3C4', 'R4C4', 'R5C2', 'R5C3', 'R5C4'],
  [23, 'R3C6', 'R4C6', 'R5C6', 'R5C7', 'R5C8'],
  [18, 'R7C5', 'R8C5', 'R9C5'],
  [19, 'R9C7', 'R9C8', 'R9C9'],
  [19, 'R9C1', 'R9C2', 'R9C3'],
  [18, 'R6C7', 'R6C8', 'R7C7', 'R7C8'],
  [18, 'R6C2', 'R6C3', 'R7C2', 'R7C3'],
  [8, 'R8C3', 'R8C4'],
  [8, 'R8C6', 'R8C7'],
];

// Black dots: drawn as small filled edge-centred marks rather than a cage or
// line, per the rules' "1:2 ratio" clause.
const blackDotPairs = [
  ['R6C4', 'R6C5'],
  ['R6C5', 'R6C6'],
  ['R2C5', 'R3C5'],
  ['R3C7', 'R4C7'],
  ['R3C3', 'R4C3'],
];

// Quadruple clues: drawn as an empty circle overlay at the shared 2x2 corner
// plus three separate single-digit text overlays clustered around that
// corner (no combined text string), one quad per grid half.
const quads = [
  ['R1C1', 1, 2, 3],
  ['R1C8', 1, 2, 3],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...blackDotPairs.map(([a, b]) => new BlackDot(a, b)),
  ...quads.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
];
