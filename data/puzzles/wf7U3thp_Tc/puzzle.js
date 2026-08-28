// Title: Deficit Sudoku
// Author: Cliff the Crafter
// Video: https://www.youtube.com/watch?v=wf7U3thp_Tc
// Source: https://cracking-the-cryptic.web.app/sudoku/2nj8HbmpdF

// Rows and columns contain 1-9 (standard). The grid carries no 3x3 boxes;
// instead it is drawn as 11 marked regions -- ten regions of 8 cells and
// one single-cell region -- and digits cannot repeat within a marked
// region. Because ten of the eleven regions hold only 8 cells, no region
// is required to hold every digit 1-9, so each is a plain AllDifferent
// group rather than a Jigsaw region (which would additionally require
// completeness). NoBoxes() drops the default box regions; the single-cell
// region imposes no constraint of its own and is omitted.

// Region cell lists, transcribed from the drawn region geometry.
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2'],
  ['R4C1', 'R4C2', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R5C4'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
  ['R1C4', 'R1C5', 'R2C4', 'R2C5', 'R3C4', 'R3C3', 'R4C3', 'R4C4'],
  ['R4C5', 'R4C6', 'R1C6', 'R2C6', 'R3C6', 'R3C5', 'R3C7', 'R4C7'],
  ['R7C4', 'R7C5', 'R8C4', 'R9C4', 'R7C3', 'R6C3', 'R6C4', 'R6C5'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C8', 'R3C9'],
  ['R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C8', 'R6C9', 'R5C6'],
  ['R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R9C5', 'R8C5', 'R9C6', 'R8C6', 'R7C6', 'R6C6', 'R6C7', 'R7C7'],
  // ['R5C5'] -- the eleventh, single-cell region; no constraint needed.
];

return [
  new Shape('9x9'),
  new NoBoxes(),

  ...regions.map((cells) => new AllDifferent(...cells)),

  // Givens, transcribed from the puzzle's drawn digits.
  new Given('R1C6', 2),
  new Given('R1C9', 5),
  new Given('R2C4', 6),
  new Given('R2C6', 8),
  new Given('R3C4', 8),
  new Given('R3C6', 6),
  new Given('R4C1', 6),
  new Given('R5C2', 5),
  new Given('R5C7', 9),
  new Given('R5C9', 3),
  new Given('R6C1', 3),
  new Given('R6C8', 8),
  new Given('R7C2', 6),
  new Given('R7C4', 1),
  new Given('R7C7', 8),
  new Given('R8C2', 3),
  new Given('R8C3', 2),
  new Given('R8C8', 5),
  new Given('R9C1', 5),
  new Given('R9C8', 4),
];
