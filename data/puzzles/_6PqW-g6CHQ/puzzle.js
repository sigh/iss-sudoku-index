// Title: 9/9/21
// Author: SSG
// Video: https://www.youtube.com/watch?v=_6PqW-g6CHQ
// Source: https://tinyurl.com/ywnrc8fp

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes). Killer cages: digits do not repeat and sum to the printed
// total. Little killer diagonals: digits sum to the printed total and may
// repeat where not already forbidden by row/column/box all-different. No
// given digits.

const geometry = cellGeometry(9);

// Killer cage cells and totals, transcribed from the payload's `killercage`
// array.
const cages = [
  [9, 'R1C2', 'R1C3', 'R2C2'],
  [9, 'R1C5', 'R2C5', 'R2C6'],
  [9, 'R4C2', 'R4C3'],
  [9, 'R5C4', 'R5C5', 'R5C6'],
  [21, 'R2C7', 'R2C8', 'R3C7', 'R3C8', 'R3C9'],
  [21, 'R6C7', 'R6C8', 'R6C9'],
  [9, 'R7C2', 'R8C2', 'R8C3'],
  [9, 'R8C5', 'R9C5'],
  [21, 'R7C7', 'R7C8', 'R8C7', 'R8C8', 'R9C8', 'R9C9'],
];

// Little-killer diagonal totals and their expanded in-grid cell paths,
// transcribed from the payload's `littlekillersum` array.
// LittleKiller.fromCells derives the canonical corner from the explicit
// cell list, walking the drawn diagonal.
const littleKillers = [
  [9, ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5']],
  [9, ['R6C1', 'R7C2', 'R8C3', 'R9C4']],
  [21, ['R7C1', 'R8C2', 'R9C3']],
  [21, ['R1C7', 'R2C8', 'R3C9']],
  [9, ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9']],
  [9, ['R1C2', 'R2C1']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...littleKillers,
];
