// Title: Jigsaw Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=wuduuLVGKDQ
// Source: https://app.crackingthecryptic.com/fTbNFPQ44g

// Rows, columns, and 9 irregular jigsaw regions each contain 1-9 once.
// No boxes; the regions replace them. No other clues are present.

// Region cells, transcribed from the drawn jigsaw region layout.
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R2C5'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R7C2', 'R6C2'],
  ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R5C3', 'R5C4', 'R6C3', 'R7C3', 'R7C4'],
  ['R2C3', 'R2C4', 'R3C3', 'R3C4', 'R4C3', 'R4C4', 'R3C5', 'R3C6', 'R2C6'],
  ['R4C5', 'R4C6', 'R4C7', 'R3C7', 'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R1C8'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R6C8', 'R6C7', 'R5C7'],
  ['R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6', 'R7C5', 'R7C6', 'R7C7', 'R7C8'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R8C6', 'R8C7', 'R8C8'],
  ['R9C1', 'R9C2', 'R8C2', 'R8C3', 'R9C3', 'R9C4', 'R8C4', 'R8C5', 'R9C5'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),

  // Givens, transcribed from the drawn grid.
  new Given('R1C1', 3),
  new Given('R1C9', 7),
  new Given('R2C1', 1),
  new Given('R2C9', 5),
  new Given('R3C5', 6),
  new Given('R3C6', 8),
  new Given('R4C3', 5),
  new Given('R4C5', 1),
  new Given('R4C6', 9),
  new Given('R5C4', 9),
  new Given('R6C9', 2),
  new Given('R7C1', 8),
  new Given('R7C6', 3),
  new Given('R8C4', 2),
  new Given('R8C5', 3),
  new Given('R8C6', 5),
  new Given('R8C9', 1),
  new Given('R9C8', 9),
];
