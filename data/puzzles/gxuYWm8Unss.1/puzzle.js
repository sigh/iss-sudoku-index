// Title: Alphabet City
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=gxuYWm8Unss
// Source: https://tinyurl.com/yyhvvy96

// Normal Sudoku rules apply. Each listed outside clue is the sum of its indicated
// diagonal; the diagonal cell lists are transcribed from the source clues.
const geometry = cellGeometry('9x9');
const diagonals = [
  { total: 8, cells: ['R3C1', 'R2C2', 'R1C3'] },
  { total: 9, cells: ['R1C7', 'R2C8', 'R3C9'] },
  { total: 22, cells: ['R7C9', 'R8C8', 'R9C7'] },
  { total: 21, cells: ['R9C3', 'R8C2', 'R7C1'] },
  { total: 17, cells: ['R2C1', 'R1C2'] },
  { total: 3, cells: ['R8C9', 'R9C8'] },
  { total: 11, cells: ['R1C8', 'R2C9'] },
  { total: 9, cells: ['R9C2', 'R8C1'] },
  { total: 11, cells: ['R4C1', 'R3C2', 'R2C3', 'R1C4'] },
  { total: 21, cells: ['R6C9', 'R7C8', 'R8C7', 'R9C6'] },
];

return [
  new Shape('9x9'),
  new Given('R2C3', 4), new Given('R3C8', 2),
  new Given('R4C4', 3), new Given('R4C6', 1), new Given('R5C5', 9),
  new Given('R6C4', 7), new Given('R6C6', 5), new Given('R7C2', 8),
  new Given('R8C7', 6),
  ...diagonals.map(({ total, cells }) => LittleKiller.fromCells(total, cells, geometry)),
];
