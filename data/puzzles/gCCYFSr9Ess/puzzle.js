// Title: Inner Sanctum
// Author: Sotek
// Video: https://www.youtube.com/watch?v=gCCYFSr9Ess
// Source: https://tinyurl.com/3vx36uwz

// Normal sudoku rules apply; no regions are drawn so the default 3x3 boxes
// stand. Killer rule: digits in a cage are distinct and sum to the cage's
// total. Little killer rule: digits along the marked diagonal sum to the
// given total and may repeat (subject only to the row/column/box they cross).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Killer cages: [total, ...cells], transcribed from the puzzle's drawn cages
// (upper-left cell of each cage carries its total).
const cages = [
  [40, 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R3C3', 'R3C7'],
  [40, 'R7C3', 'R7C7', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'],
  [42, 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2'],
  [42, 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8'],
  [12, 'R8C9', 'R9C8', 'R9C9'],
  [14, 'R1C1', 'R1C2', 'R2C1'],
  [11, 'R1C8', 'R1C9', 'R2C9'],
  [14, 'R8C1', 'R9C1', 'R9C2'],
  [5, 'R3C4', 'R3C5'],
  [5, 'R7C5', 'R7C6'],
  [11, 'R6C4', 'R7C4'],
  [9, 'R3C6', 'R4C6'],
  [7, 'R4C4', 'R4C5'],
  [6, 'R6C5', 'R6C6'],
  [45, 'R4C3', 'R4C7', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C3', 'R6C7'],
];

return [
  new Shape('9x9'),
  new Given('R5C5', 7),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),

  // Little killer: off-grid badge above the grid between C3/C4, pointing
  // down-right, entering the grid at R1C4 and running to R6C9.
  LittleKiller.fromCells(30, graph.ray('R1C4', 1, 1), geometry),
];
