// Title: Argyle Sudoku
// Author: Li Qianzi
// Video: https://www.youtube.com/watch?v=VdDaafMnCQ4
// Source: https://cracking-the-cryptic.web.app/sudoku/7N3dGTnh97

// Normal sudoku rules apply. Digits may not repeat along any one of the eight
// marked grey diagonals. Nothing is omitted.

// Each entry is the pair of end cells of one drawn grey diagonal stroke: four
// run down-right, four down-left. Transcribed from the eight #CFCFCF strokes.
const DIAGONALS = [
  ['R1C5', 'R5C9'], ['R1C2', 'R8C9'], ['R2C1', 'R9C8'], ['R5C1', 'R9C5'],
  ['R1C5', 'R5C1'], ['R1C8', 'R8C1'], ['R2C9', 'R9C2'], ['R5C9', 'R9C5'],
];

// Transcribed from the 16 printed digits.
const GIVENS = [
  ['R1C4', 2], ['R2C1', 3], ['R2C3', 2], ['R3C7', 8],
  ['R4C1', 7], ['R4C6', 9], ['R4C9', 2], ['R5C2', 8],
  ['R5C8', 1], ['R6C1', 4], ['R6C4', 1], ['R6C9', 7],
  ['R7C3', 5], ['R8C7', 6], ['R8C9', 9], ['R9C6', 2],
];

// A stroke covers every cell from one end cell to the other in unit diagonal
// steps, so the two ends determine the whole cell list.
const strokeCells = ([from, to]) => {
  const a = parseCellId(from), b = parseCellId(to);
  const dr = Math.sign(b.row - a.row), dc = Math.sign(b.col - a.col);
  const n = Math.abs(b.row - a.row);
  return Array.from(
    { length: n + 1 }, (_, i) => makeCellId(a.row + i * dr, a.col + i * dc));
};

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...DIAGONALS.map(d => new AllDifferent(...strokeCells(d))),
];
