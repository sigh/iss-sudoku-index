// Title: Little Killer Sudoku
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=y4eKdI3ZJ78
// Source: https://app.crackingthecryptic.com/sudoku/nQHjr7Ggpg

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). Each outside clue gives the sum
// of the digits along its indicated diagonal; digits may repeat along a
// diagonal except where row/column/box all-different already applies to a
// stretch of it.

const geometry = cellGeometry(9);

// Four givens, transcribed from cells[row][col].value in the payload.
const givens = [
  new Given('R3C2', 5),
  new Given('R3C7', 2),
  new Given('R5C4', 3),
  new Given('R5C5', 7),
];

// Seven little-killer diagonal-sum clues. LittleKiller.fromCells derives the
// canonical corner from the explicit cell list, walking the drawn arrow's
// diagonal starting at the cell nearest the outside clue badge.
const littleKillers = [
  [22, ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9']],
  [28, ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8']],
  [26, ['R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7']],
  [23, ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1']],
  [34, ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1']],
  [40, ['R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1']],
  [42, ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  ...givens,
  ...littleKillers,
];
