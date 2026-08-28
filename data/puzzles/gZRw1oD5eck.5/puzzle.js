// Title: February 1, 2022: Punisher
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=gZRw1oD5eck
// Source: https://tinyurl.com/2dzys2mj
//
// Normal sudoku rules apply. Digits in cages cannot repeat and must sum to
// the total given (Cage). Digits along the indicated diagonals must sum to
// the total given, and may repeat (LittleKiller).

const geometry = cellGeometry('9x9');

// Killer cages, transcribed from the drawn cage outlines and totals.
const cages = [
  [12, 'R1C3', 'R1C4'],
  [11, 'R3C1', 'R4C1'],
  [8, 'R9C6', 'R9C7'],
  [9, 'R6C9', 'R7C9'],
  [7, 'R1C6', 'R1C7'],
  [14, 'R9C3', 'R9C4'],
  [13, 'R6C1', 'R7C1'],
  [6, 'R3C9', 'R4C9'],
  [10, 'R4C2', 'R4C3'],
  [16, 'R6C7', 'R6C8'],
];

// Little-killer diagonal sums, transcribed from the drawn outside-clue
// arrows; each cell list walks outside-in along the indicated diagonal.
const littleKillers = [
  [6, ['R1C3', 'R2C2', 'R3C1']],
  [23, ['R9C7', 'R8C8', 'R7C9']],
  [7, ['R3C9', 'R2C8', 'R1C7']],
  [24, ['R7C1', 'R8C2', 'R9C3']],
  [14, ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1']],
  [33, ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9']],
];

return [
  new Shape('9x9'),
  new Given('R5C5', 9),

  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),

  ...littleKillers.map(([total, cells]) =>
    LittleKiller.fromCells(total, cells, geometry)),
];
