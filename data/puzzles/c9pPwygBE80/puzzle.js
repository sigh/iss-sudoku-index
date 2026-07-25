// Title: Box o' donuts
// Author: Hexadoodle
// Video: https://www.youtube.com/watch?v=c9pPwygBE80
// Source: https://sudokupad.app/zipkes4xie

// Normal sudoku rules apply (default row/column/box all-different from
// Shape). Four "donuts" -- identical 4x4 blocks with their center 2x2
// removed (12 cells each) -- are placed somewhere in the grid, translated
// only (no rotation or reflection), without overlapping. "Identical copies"
// is read as: the four donuts carry matching digits cell-for-cell at each
// shared offset within the 4x4 block, not merely the same footprint shape --
// otherwise "donut" would describe only a hole shape, never a "copy". A
// thermometer runs through the four cells around the grid's center.

// Donut footprint: a 4x4 block minus its center 2x2 (12 of the 16 cells).
// This shape is fixed by the rules text; only its four placements in the
// grid are unknown.
const SHAPE_OFFSETS = [];
for (let dr = 0; dr < 4; dr++) {
  for (let dc = 0; dc < 4; dc++) {
    if (dr >= 1 && dr <= 2 && dc >= 1 && dc <= 2) continue; // center 2x2 hole
    SHAPE_OFFSETS.push([dr, dc]);
  }
}

// Every top-left corner that keeps a 4x4 block inside the 9x9 grid (6x6 = 36
// candidate placements), expressed as its 12 donut cells.
const PLACEMENTS = [];
for (let r = 0; r < 6; r++) {
  for (let c = 0; c < 6; c++) {
    PLACEMENTS.push(SHAPE_OFFSETS.map(([dr, dc]) => makeCellId(r + dr + 1, c + dc + 1)));
  }
}

function footprintsOverlap(a, b) {
  const setA = new Set(a);
  return b.some(cell => setA.has(cell));
}

function chooseFour(n) {
  // All 4-element index combinations from n placements.
  const out = [];
  const combo = [];
  (function recurse(start) {
    if (combo.length === 4) {
      out.push([...combo]);
      return;
    }
    for (let i = start; i < n; i++) {
      combo.push(i);
      recurse(i + 1);
      combo.pop();
    }
  })(0);
  return out;
}

// Every way to pick four of the 36 placements whose 12-cell footprints are
// pairwise disjoint -- this is the puzzle's full "where are the donuts"
// search space (36 placements -> 79 valid non-overlapping quadruples).
const validQuads = chooseFour(PLACEMENTS.length).filter(([i, j, k, l]) => {
  const quad = [i, j, k, l].map(idx => PLACEMENTS[idx]);
  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      if (footprintsOverlap(quad[a], quad[b])) return false;
    }
  }
  return true;
});

// One branch per valid quadruple: for each of the 12 shape offsets, the four
// cells at that offset (one per placement) must share one value --
// SameValues(4, ...) over 4 single-cell sets pins all four to equal values.
const donutBranches = validQuads.map(idxs => {
  const quad = idxs.map(i => PLACEMENTS[i]);
  const sameValueConstraints = SHAPE_OFFSETS.map((_, offset) =>
    new SameValues(4, ...quad.map(cells => cells[offset]))
  );
  return new And(sameValueConstraints);
});

return [
  new Shape('9x9'),

  new Given('R1C1', 4),
  new Given('R1C9', 6),
  new Given('R3C3', 5),
  new Given('R3C7', 7),
  new Given('R7C3', 3),
  new Given('R7C7', 1),
  new Given('R9C1', 2),
  new Given('R9C9', 8),

  new Thermo('R5C6', 'R6C5', 'R5C4', 'R4C5'),

  new Or(donutBranches),
];
