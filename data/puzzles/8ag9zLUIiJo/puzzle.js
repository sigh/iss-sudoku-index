// Title: The Cross
// Author: Tom1i
// Video: https://www.youtube.com/watch?v=8ag9zLUIiJo
// Source: https://app.crackingthecryptic.com/sudoku/6NMrnGH9n7

// Normal sudoku rules (rows, columns, boxes). Two 3-cell killer cages (sum +
// all-different). Four 9-cell no-total cages, all-different only, per "digits
// cannot repeat within a cage". Nine outside diagonal-sum clues (repeats
// allowed along the diagonal, per the stated rule); LittleKiller.fromCells
// derives ISS's canonical corner id from the drawn cell list so the arrow's
// drawn direction/order doesn't need to be tracked by hand.

const geometry = cellGeometry('9x9');

const littleKillers = [
  [55, ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9']],
  [11, ['R2C1', 'R1C2']],
  [10, ['R3C1', 'R2C2', 'R1C3']],
  [11, ['R7C1', 'R8C2', 'R9C3']],
  [11, ['R8C1', 'R9C2']],
  [10, ['R7C9', 'R8C8', 'R9C7']],
  [14, ['R8C9', 'R9C8']],
  [11, ['R3C9', 'R2C8', 'R1C7']],
  [7, ['R2C9', 'R1C8']],
];

return [
  new Shape('9x9'),

  // Two 3-cell sum cages in the centre column.
  new Cage(16, 'R2C5', 'R3C5', 'R4C5'),
  new Cage(12, 'R6C5', 'R7C5', 'R8C5'),

  // Four 9-cell no-total cages: all-different only.
  new AllDifferent('R1C3', 'R1C4', 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2', 'R4C1', 'R3C1'),
  new AllDifferent('R1C7', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R4C7', 'R4C8', 'R4C9', 'R3C9'),
  new AllDifferent('R7C1', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R7C4', 'R8C4', 'R9C4', 'R9C3'),
  new AllDifferent('R9C7', 'R9C6', 'R8C6', 'R7C6', 'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C9'),

  ...littleKillers.map(
    ([total, cells]) => LittleKiller.fromCells(total, cells, geometry)),
];
