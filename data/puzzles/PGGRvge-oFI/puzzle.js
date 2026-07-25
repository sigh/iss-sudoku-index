// Title: 19 Crimes
// Author: Fenners
// Video: https://www.youtube.com/watch?v=PGGRvge-oFI
// Source: https://sudokupad.app/5b9zqb4idr

// Normal Sudoku rules apply (standard rows/cols/boxes, from Shape).
// Killer Cages: digits in each cage do not repeat and sum to 19.
// Marked diagonals: digits cannot repeat along either main diagonal.
// German Whispers: adjacent digits on a green line differ by at least 5.

const cages = [
  ['R1C1', 'R1C2', 'R2C1'],
  ['R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7'],
  ['R4C6', 'R5C5', 'R5C6', 'R6C4', 'R6C5'],
  ['R7C2', 'R7C3', 'R8C2', 'R9C1', 'R9C2'],
  ['R7C7', 'R7C8', 'R8C7', 'R8C8'],
];

const whispers = [
  ['R5C2', 'R4C2', 'R3C2', 'R2C2', 'R2C3', 'R2C4', 'R2C5'],
  ['R8C5', 'R8C6', 'R8C7', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C9'],
  ['R3C3', 'R4C4'],
  ['R6C4', 'R7C3'],
  ['R1C9', 'R2C8'],
];

return [
  new Shape('9x9'),
  ...cages.map(cells => new Cage(19, ...cells)),
  // Both main diagonals: direction 1 is bottom-left-to-top-right, -1 is
  // top-left-to-bottom-right. The payload draws both as blue lines and as
  // hidden no-total all-different cages coincident with these diagonals.
  new Diagonal(1),
  new Diagonal(-1),
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
