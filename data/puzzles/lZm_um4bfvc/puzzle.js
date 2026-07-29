// Title: Kingsroad
// Author: Scojo
// Video: https://www.youtube.com/watch?v=lZm_um4bfvc
// Source: https://sudokupad.app/6ul7danidn

// Normal sudoku rules apply (default row/column/box all-different from Shape).
// Anti-king: diagonally touching cells cannot repeat a digit. Each drawn line
// is both a region sum line (box borders split it into equal-sum segments) and
// a parity line (digits alternate odd and even). The thin red stroke is the
// centre of the thick blue stroke, so the duplicate visual layer is encoded once.
// Paths are transcribed from the five drawn line clues.
const lines = [
  [
    'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R5C3', 'R4C3',
    'R3C3', 'R2C2', 'R2C3', 'R1C3', 'R1C4', 'R2C4', 'R2C5',
    'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R5C5',
  ],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R8C7'],
  ['R6C8', 'R5C8', 'R4C8', 'R4C7', 'R3C7', 'R2C7', 'R1C7', 'R1C8'],
  ['R1C5', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R4C5', 'R5C6'],
  ['R6C9', 'R7C8', 'R8C8'],
];

return [
  new Shape('9x9'),
  new AntiKing(),
  ...lines.flatMap(cells => [
    new RegionSumLine(...cells),
    new Modular(2, ...cells),
  ]),
];
