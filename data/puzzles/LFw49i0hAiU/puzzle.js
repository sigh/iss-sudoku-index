// Title: Full House
// Author: Michael Lefkowitz & Lulero
// Video: https://www.youtube.com/watch?v=LFw49i0hAiU
// Source: https://sudokupad.app/4pqenuxwmn?setting-nogrid=1

// Rules:
//   In each N-by-N grid, normal N-by-N Sudoku rules apply; overlapping cells
//   contain the same digit.
//   COUNTING CARDS - a digit on a suit indicates how many times that digit
//   appears on that suit.
//
// The board is a 14x13 card table carrying four separate Sudoku grids that
// overlap.  Rows, columns and boxes of the table itself carry no rule, so the
// grid type is Raw and every unit below is stated explicitly.  "Overlapping
// cells contain the same digit" then needs no constraint: a shared table cell
// is one cell.
//
// Nothing is omitted.

const shape = new Shape('14x13', 9, 'Raw');
const graph = cellGraph(shape);

// Grid frames, read off the drawn borders (the source is played with
// setting-nogrid=1, so every line is drawn by hand: 6px = a grid outline,
// 4px = that grid's box dividers, 1px = its cell borders).
// [label, top row, left column, size, box height, box width]
const GRIDS = [
  ['9x9 black', 1, 1, 9, 3, 3],
  ['6x6 red', 6, 8, 6, 2, 3],
  ['4x4 red', 9, 2, 4, 2, 2],
  ['4x4 black', 11, 5, 4, 2, 2],
];

const range = n => [...Array(n).keys()];

// One AllDifferent per row, column and box of each grid, and the digit range of
// each grid's cells: an N-by-N Sudoku uses 1..N, so a cell shared by two grids
// takes the smaller range.
const units = [];
const digitCap = new Map();
for (const [, top, left, n, boxH, boxW] of GRIDS) {
  const at = (i, j) => makeCellId(top + i, left + j);
  for (const i of range(n)) {
    units.push(range(n).map(j => at(i, j)));
    units.push(range(n).map(j => at(j, i)));
  }
  for (let r = 0; r < n; r += boxH) {
    for (let c = 0; c < n; c += boxW) {
      units.push(range(boxH).flatMap(i => range(boxW).map(j => at(r + i, c + j))));
    }
  }
  for (const i of range(n)) {
    for (const j of range(n)) {
      digitCap.set(at(i, j), Math.min(digitCap.get(at(i, j)) ?? 9, n));
    }
  }
}

const sudokuUnits = units.map(cells => new AllDifferent(...cells));
const digitRanges = [...digitCap].filter(([, n]) => n < 9).map(
  ([cell, n]) => new Given(cell, ...range(n).map(v => v + 1)));

// The 48 table cells outside every grid hold no digit.  They are padding on a
// Raw board that has no holes, so pin them to one value; nothing else in the
// script refers to them.
const padding = graph.rows().flat().filter(cell => !digitCap.has(cell)).map(
  cell => new Given(cell, 1));

// Suit badges, one per marked table cell, transcribed from the drawn symbols.
const SUITS = {
  diamonds: [[1, 2], [1, 4], [2, 3], [2, 9], [3, 1], [3, 3], [3, 4], [3, 8],
             [4, 1], [4, 7], [4, 8], [5, 2], [5, 8], [6, 3], [6, 5], [6, 6],
             [7, 2], [7, 7], [7, 11], [8, 5], [8, 8], [8, 11], [8, 12], [8, 13],
             [9, 1], [9, 11], [10, 8], [10, 13], [11, 2], [11, 4], [11, 7],
             [11, 10], [12, 2], [12, 6], [13, 5], [13, 8]],
  hearts: [[12, 7], [14, 7], [14, 8]],
  clubs: [[1, 7], [4, 3], [4, 4], [5, 3], [5, 6], [7, 10], [10, 2], [10, 9],
          [10, 11], [11, 12]],
  spades: [[6, 13], [8, 10], [9, 10], [10, 4], [10, 5], [14, 5], [14, 6]],
};

// One counting set per suit, covering that suit's cells across all four grids.
// The rules sentence puts no grid scope on "on that suit"; a per-grid count is
// also arithmetically impossible, because the red 4x4 carries exactly two
// spades in one row (R10C4, R10C5), whose two distinct digits would each have
// to be their own count of 1.
const countingCards = Object.values(SUITS).map(
  cells => new CountingCircles(...cells.map(([r, c]) => makeCellId(r, c))));

return [
  shape,
  ...digitRanges,
  ...padding,
  ...sudokuUnits,
  ...countingCards,
];
