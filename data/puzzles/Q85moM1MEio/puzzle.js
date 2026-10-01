// Title: Reflective Vortex
// Author: Julink
// Video: https://www.youtube.com/watch?v=Q85moM1MEio
// Source: https://sudokupad.app/5ea8g3bxow

// Rules:
// - Normal sudoku.
// - Region-sum lines: box borders divide each blue line into segments with
//   equal sums (sums may differ between lines).
// - Mirrors: each mirror cell has one reflective side (solver's choice). The
//   two half-lines it faces (part of its row and part of its column, mirror
//   cell excluded, running to the grid edge) share no digit. Per the rules'
//   example, a "/" mirror in R4C7 facing South-East forbids R4C8-R4C9 digits
//   in R5C7-R9C7.
// A row half-line and a column half-line are each already all-different, so
// "no digit of one appears in the other" is AllDifferent over their union.

// Blue lines, in drawn order.
const blueLines = [
  ['R8C4', 'R7C3', 'R7C2', 'R7C1', 'R6C1'],
  ['R9C6', 'R8C7', 'R8C8', 'R7C9', 'R6C8'],
  ['R4C8', 'R3C8', 'R2C8', 'R2C7', 'R2C6'],
  ['R4C2', 'R3C2', 'R2C2', 'R2C3', 'R1C4'],
  ['R8C2', 'R8C3', 'R9C4', 'R9C5', 'R8C5'],
  ['R3C1', 'R4C1', 'R5C1'],
  ['R1C8', 'R1C7', 'R1C6', 'R2C5'],
];

// Grey mirror strokes: '/' runs bottom-left to top-right, '\' top-left to
// bottom-right, as drawn in each cell.
const mirrors = [
  ['R5C5', '/'],
  ['R8C6', '\\'],
  ['R4C7', '/'],
  ['R2C4', '\\'],
  ['R6C3', '/'],
];

// Cells from the mirror (exclusive) to the grid edge in direction [dr, dc].
const arm = (cell, [dr, dc]) => {
  const out = [];
  let { row, col } = parseCellId(cell);
  for (row += dr, col += dc; row >= 1 && row <= 9 && col >= 1 && col <= 9;
       row += dr, col += dc) {
    out.push(makeCellId(row, col));
  }
  return out;
};
const N = [-1, 0], S = [1, 0], W = [0, -1], E = [0, 1];
// The two sides of each stroke, as the (row direction, column direction)
// pair that side faces: '/' faces NW or SE; '\' faces NE or SW.
const SIDES = { '/': [[W, N], [E, S]], '\\': [[E, N], [W, S]] };

const mirrorRules = mirrors.map(([cell, kind]) => new Or(
  SIDES[kind].map(([h, v]) =>
    new AllDifferent(...arm(cell, h), ...arm(cell, v)))));

return [
  new Shape('9x9'),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
  ...mirrorRules,
];
