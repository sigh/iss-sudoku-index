// Title: Region Tessellation
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=dm_JmuQT2Wk
// Source: https://sudokupad.app/vmnal5hbuj?setting-nogrid=1

// Only a diamond-shaped 41-cell subset of the 9x9 canvas is playable; the
// other 40 cells carry no region, no clue, and no rules-text reference.
// ISS's main-grid Shape always adds full 9-cell row/column AllDifferent
// groups over every declared grid cell, which would wrongly force the
// empty corner cells into those groups alongside the real ones. So the
// main grid is left as an unused 1x1 dummy purely to declare the 1-9 value
// range, and the whole diamond lives in a 9x9 Var overlay ('D') addressed
// by row/column -- Var cells are never swept into the automatic
// row/column/box groups, which are built solely from the Shape's own
// dimensions. Only the 41 live Var cells get puzzle constraints; the other
// 40 (the corners outside the diamond) are pinned to a fixed sentinel
// value so their otherwise-free domain cannot multiply the solution count.
//
// Encoded:
// - each row's and column's live cells hold a non-repeating consecutive
//   digit set: Renban (a set-wise, not sequential-pairs-only, "consecutive
//   and non-repeating" constraint) over that row's or column's live cells.
//   A length-1 row/column needs no constraint: a single digit is trivially
//   a consecutive set of size one.
// - each of the five regions is AllDifferent over its own cells.
// - "cells sharing an edge can't have the same digit" is not separately
//   encoded: every adjacent live pair already shares a row or column, and
//   the Renban above forces that row's/column's cells pairwise distinct.

// Region cells, transcribed from the source's drawn regions (each a
// hidden, no-total, all-different cage). Together they union to exactly
// the playable diamond.
const REGIONS = [
  [[3, 3], [4, 2], [4, 3], [5, 1], [5, 2], [5, 3], [6, 2], [6, 3], [7, 3]], // A
  [[1, 5], [2, 4], [2, 5], [2, 6], [3, 4], [3, 5], [3, 6], [4, 4], [4, 6]], // B
  [[4, 5], [5, 4], [5, 5], [5, 6], [6, 5]],                                 // C
  [[6, 4], [6, 6], [7, 4], [7, 5], [7, 6], [8, 4], [8, 5], [8, 6], [9, 5]], // D
  [[3, 7], [4, 7], [4, 8], [5, 7], [5, 8], [5, 9], [6, 7], [6, 8], [7, 7]], // E
];

// The playable diamond, derived (not re-enumerated by hand) as the union of
// the region cells above.
const live = new Set();
for (const region of REGIONS) for (const [r, c] of region) live.add(`${r},${c}`);

const diamond = new Var('D', 'diamond cells', '9x9');
const cell = (r, c) => diamond.cell(r, c);

const regionConstraints = REGIONS.map(
  region => new AllDifferent(...region.map(([r, c]) => cell(r, c))));

// One Renban per row/column whose live-cell run is longer than one cell.
function lineConstraints(isRow) {
  const groups = [];
  for (let i = 1; i <= 9; i++) {
    const cells = [];
    for (let j = 1; j <= 9; j++) {
      const [r, c] = isRow ? [i, j] : [j, i];
      if (live.has(`${r},${c}`)) cells.push(cell(r, c));
    }
    if (cells.length > 1) groups.push(new Renban(...cells));
  }
  return groups;
}

// The 40 cells outside the diamond do not exist in the puzzle; pin each to
// the same fixed value so their unused domain adds no solutions of its own.
const deadCellGivens = [];
for (let r = 1; r <= 9; r++)
  for (let c = 1; c <= 9; c++)
    if (!live.has(`${r},${c}`)) deadCellGivens.push(new Given(cell(r, c), 1));

// Givens, from the source's per-cell values (1-indexed here).
const givens = [
  new Given(cell(4, 4), 8),
  new Given(cell(5, 9), 4),
  new Given(cell(7, 3), 1),
];

return [
  new Shape('1x1', 9),
  new NoBoxes(),
  // The dummy main-grid cell holds no puzzle content; pin it so it does not
  // multiply the solution count with its own free, unconstrained value.
  new Given('R1C1', 1),
  diamond,
  ...regionConstraints,
  ...lineConstraints(true),
  ...lineConstraints(false),
  ...deadCellGivens,
  ...givens,
];
