// Title: September 3, 2021: Made Ya LK
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=z-CQLijElrk
// Source: https://tinyurl.com/8dbz4n6d

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes). Each outside clue gives the sum of the digits along its
// indicated diagonal; digits may repeat along a diagonal except where
// row/column/box all-different already applies to a stretch of it.

const geometry = cellGeometry(9);

// Eight givens, transcribed from cells[row][col].value in the payload.
const givens = [
  new Given('R2C5', 2),
  new Given('R3C6', 3),
  new Given('R4C3', 7),
  new Given('R5C2', 8),
  new Given('R5C8', 4),
  new Given('R6C7', 5),
  new Given('R7C4', 9),
  new Given('R8C5', 6),
];

// Ten little-killer diagonal-sum clues, transcribed from the payload's
// littlekillersum array's [value, cells] pairs. LittleKiller.fromCells
// derives the canonical corner from the explicit cell list.
const littleKillers = [
  [4, ['R1C8', 'R2C9']],
  [11, ['R1C7', 'R2C8', 'R3C9']],
  [16, ['R1C6', 'R2C7', 'R3C8', 'R4C9']],
  [5, ['R9C4', 'R8C3', 'R7C2', 'R6C1']],
  [12, ['R9C3', 'R8C2', 'R7C1']],
  [13, ['R9C2', 'R8C1']],
  [5, ['R8C9', 'R9C8']],
  [10, ['R7C9', 'R8C8', 'R9C7']],
  [9, ['R3C1', 'R2C2', 'R1C3']],
  [11, ['R2C1', 'R1C2']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  ...givens,
  ...littleKillers,
];
