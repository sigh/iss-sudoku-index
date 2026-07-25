// Title: Modulus Operandi
// Author: JamNCheez
// Video: https://www.youtube.com/watch?v=jtyq9-X8ep8
// Source: https://sudokupad.app/e75z3n6ld5

// Normal sudoku rules apply (standard 3x3 boxes; no givens).
// Little killer: each outside clue sums the digits along the marked
// diagonal, from just outside the grid to the far edge.
// Modular lines: every consecutive run of 3 cells along a line contains one
// digit from each residue class mod 3 -- {1,4,7}, {2,5,8}, {3,6,9}. Digits
// on a line may repeat, subject to normal sudoku. This is exactly
// Modular(3, ...cells) semantics, so no extra non-repeat gloss is added.

const geometry = cellGeometry('9x9');

// Modular lines, transcribed from the payload's `line` array (cell order as
// drawn; order doesn't matter to Modular's sliding-window check).
const modularLines = [
  ['R5C9', 'R6C9', 'R5C8', 'R6C7', 'R7C7', 'R7C6', 'R7C5', 'R8C6', 'R9C6', 'R9C5'],
  ['R9C4', 'R8C4', 'R7C4'],
  ['R7C3', 'R8C3', 'R7C2', 'R7C1', 'R8C1'],
  ['R6C5', 'R6C6', 'R5C6', 'R5C5', 'R5C4', 'R4C5', 'R3C5'],
  ['R6C2', 'R6C1', 'R5C2', 'R4C2', 'R3C3', 'R2C3'],
  ['R2C5', 'R2C4', 'R1C4', 'R1C5', 'R1C6'],
  ['R8C9', 'R9C8', 'R9C7', 'R8C7', 'R8C8', 'R7C9', 'R7C8'],
];

// Little killer diagonals, transcribed from the payload's `littlekillersum`
// array. Each `cells` list already runs from the cell nearest the badge to
// the far grid edge, matching LittleKiller.fromCells's expected diagonal.
// The R0C2/DL clue's diagonal is a single cell (R1C1) -- ISS's LittleKiller
// cellMap excludes length-1 diagonals as degenerate, so that one clue is
// encoded below as the Given it's equivalent to (the "sum" of one cell is
// just that cell's digit).
const littleKillers = [
  [6, ['R3C9', 'R2C8', 'R1C7']],
  [6, ['R9C8', 'R8C9']],
  [20, ['R9C7', 'R8C8', 'R7C9']],
  [19, ['R9C6', 'R8C7', 'R7C8', 'R6C9']],
  [14, ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9']],
  [8, ['R8C1', 'R9C2']],
  [15, ['R7C1', 'R8C2', 'R9C3']],
  [14, ['R1C2', 'R2C1']],
  [25, ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6']],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 8),

  ...modularLines.map((cells) => new Modular(3, ...cells)),

  ...littleKillers.map(([total, cells]) =>
    LittleKiller.fromCells(total, cells, geometry)),
];
