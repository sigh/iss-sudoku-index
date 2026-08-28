// Title: Untitled
// Author: Djmelee3000
// Video: https://www.youtube.com/watch?v=kq2hG7GKv88
// Source: https://cracking-the-cryptic.web.app/sudoku/NRQ9BD2M96

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). Digits in cages must sum to the
// number in the cage's top-left corner, without repeating a digit within the
// cage. Each outside clue gives the sum of the digits along its indicated
// diagonal; digits may repeat along a diagonal.

const geometry = cellGeometry(9);

// Twelve killer cages, transcribed from the payload's `cages` array (two
// further entries are metadata stubs with no cells and draw nothing).
const cages = [
  [10, ['R2C3', 'R2C4', 'R3C4']],
  [9, ['R2C5', 'R3C5', 'R4C5']],
  [11, ['R2C6', 'R3C6', 'R2C7']],
  [10, ['R4C7', 'R4C8', 'R3C8']],
  [18, ['R5C6', 'R5C7', 'R5C8', 'R6C7']],
  [6, ['R6C8', 'R7C8']],
  [12, ['R7C6', 'R8C6', 'R8C7']],
  [18, ['R6C5', 'R7C5', 'R8C5']],
  [12, ['R7C4', 'R8C4', 'R8C3']],
  [11, ['R7C2', 'R6C2', 'R6C3']],
  [22, ['R5C2', 'R5C3', 'R5C4', 'R4C3']],
  [9, ['R4C2', 'R3C2']],
].map(([sum, cells]) => new Cage(sum, ...cells));

// Four little-killer diagonal-sum clues. Each raw `arrows[]` entry is a short
// off-grid stub whose waypoints run from just outside a grid corner to the
// grid boundary at 45 degrees; the waypoints' direction gives the on-grid
// start cell and heading for each diagonal. LittleKiller.fromCells derives
// the canonical corner from the explicit cell list.
const littleKillers = [
  [50, ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9']],
  [40, ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1']],
  [9, ['R3C9', 'R2C8', 'R1C7']],
  [8, ['R7C1', 'R8C2', 'R9C3']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  ...cages,
  ...littleKillers,
];
