// Title: Region Tessellation
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=dm_JmuQT2Wk
// Source: https://sudokupad.app/vmnal5hbuj?setting-nogrid=1

// Only a diamond-shaped 41-cell subset of the 9x9 canvas is playable; the
// other 40 cells carry no tile, no region, no clue and no rules-text
// reference. Rows and columns do not span the diamond's partial lengths, so
// the grid is Raw: no implicit constraints, and every rule is stated
// explicitly below. The 40 cells outside the diamond are pinned to a fixed
// sentinel value so their otherwise-free domain cannot multiply the
// solution count.
//
// Encoded:
// - each row's and column's live cells hold a non-repeating consecutive
//   digit set: Renban over that row's or column's live cells. A length-1
//   row/column needs no constraint: a single digit is a consecutive set of
//   size one.
// - each of the five regions is AllDifferent over its own cells.
// - "cells sharing an edge can't have the same digit", over the edges of the
//   drawn tessellation (see TILING below): one two-cell AllDifferent per
//   shared edge.

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
const isLive = (r, c) => live.has(`${r},${c}`);

// The grid is Raw, so there are no automatic row/column all-different rules.
const shape = new Shape('9x9', '1-9', 'Raw');
const cell = (r, c) => makeCellId(r, c);

const regionConstraints = REGIONS.map(
  region => new AllDifferent(...region.map(([r, c]) => cell(r, c))));

// One Renban per row/column whose live-cell run is longer than one cell.
function lineConstraints(isRow) {
  const groups = [];
  for (let i = 1; i <= 9; i++) {
    const cells = [];
    for (let j = 1; j <= 9; j++) {
      const [r, c] = isRow ? [i, j] : [j, i];
      if (isLive(r, c)) cells.push(cell(r, c));
    }
    if (cells.length > 1) groups.push(new Renban(...cells));
  }
  return groups;
}

// TILING. The drawn art does not draw the playable cells as squares: it
// tiles the diamond as a truncated square tiling. A cell with r+c even is
// drawn as an octagon spanning 1.4 grid units (vertices at +/-0.3, +/-0.7
// from its centre); a cell with r+c odd is drawn as a small axis-aligned
// square of side 0.6 in the gap between four such octagons. Consequently an
// octagon has EIGHT edges -- four shared with the small squares orthogonally
// adjacent to it, and four (its slanted corner edges) shared with the
// octagons DIAGONALLY adjacent to it -- while a small square has only its
// four orthogonal edges. Two small squares touch at no point at all.
//
// So "cells sharing an edge" is: every orthogonally adjacent live pair, plus
// every diagonally adjacent live pair of octagons. Diagonal pairs of small
// squares are deliberately excluded: they share no edge in the drawing.
const isOctagon = (r, c) => (r + c) % 2 === 0;
function edgePairs() {
  const pairs = [];
  for (let r = 1; r <= 9; r++) {
    for (let c = 1; c <= 9; c++) {
      if (!isLive(r, c)) continue;
      // Only forward offsets, so each edge is emitted once.
      const offsets = isOctagon(r, c)
        ? [[0, 1], [1, 0], [1, 1], [1, -1]]
        : [[0, 1], [1, 0]];
      for (const [dr, dc] of offsets) {
        if (isLive(r + dr, c + dc)) {
          pairs.push(new AllDifferent(cell(r, c), cell(r + dr, c + dc)));
        }
      }
    }
  }
  return pairs;
}

// The 40 cells outside the diamond do not exist in the puzzle; pin each to
// the same fixed value so their unused domain adds no solutions of its own.
const deadCellGivens = [];
for (let r = 1; r <= 9; r++)
  for (let c = 1; c <= 9; c++)
    if (!isLive(r, c)) deadCellGivens.push(new Given(cell(r, c), 1));

// Givens, from the source's per-cell values (1-indexed here).
const givens = [
  new Given(cell(4, 4), 8),
  new Given(cell(5, 9), 4),
  new Given(cell(7, 3), 1),
];

return [
  shape,
  ...regionConstraints,
  ...lineConstraints(true),
  ...lineConstraints(false),
  ...edgePairs(),
  ...deadCellGivens,
  ...givens,
];
