// Title: Samurai Sudoku
// Author: Angelo
// Video: https://www.youtube.com/watch?v=LEpobQHVVIg
// Source: https://app.crackingthecryptic.com/sudoku/bRdpR6rNrb

// Five overlapping 9x9 classic sudoku grids on a 21x21 canvas, arranged in
// the standard Samurai cross: top-left (rows 1-9, cols 1-9), top-right
// (rows 1-9, cols 13-21), centre (rows 7-15, cols 7-15), bottom-left (rows
// 13-21, cols 1-9), bottom-right (rows 13-21, cols 13-21) -- origins read
// off the payload's own `regions` array (41 distinct 3x3 boxes) and
// cross-checked against its 4 yellow-filled 3x3 underlay groups, which
// mark the shared boxes below. Each corner grid overlaps the centre grid
// in exactly one shared 3x3 box (the rules' "(yellow) regions"); the four
// corner grids never touch each other directly. The 72 physical cells
// outside all five grids are decorative holes: no givens, no clues, no
// constraints.
//
// ISS caps a single grid/Raw shape at 16x16 (CellGeometry.MAX_SIZE), so
// this 21-wide canvas cannot be one ISS grid. Each area is instead its own
// Var overlay with the ordinary Sudoku row/column/box all-differents built
// explicitly, and the four shared 3x3 boxes are tied cell-for-cell between
// the corner area and the centre area with SameValues (36 ties, matching
// the payload's 36 yellow cells). The main grid is a pinned 1x1
// placeholder; the answer lives entirely in the five Var overlays.
const graph = cellGraph('9x9');
const overlays = {
  TL: graph.makeOverlay('VTL'),
  TR: graph.makeOverlay('VTR'),
  C: graph.makeOverlay('VC'),
  BL: graph.makeOverlay('VBL'),
  BR: graph.makeOverlay('VBR'),
};

// Physical (row, col), 1-indexed, of each area's top-left cell.
const GRID_ORIGINS = { TL: [1, 1], TR: [1, 13], C: [7, 7], BL: [13, 1], BR: [13, 13] };

// Which area(s) a physical cell belongs to; a cell in two areas is one of
// the 36 cells shared between a corner area and the centre area C.
function gridsAt(row, col) {
  return Object.keys(GRID_ORIGINS).filter(name => {
    const [r0, c0] = GRID_ORIGINS[name];
    return row >= r0 && row < r0 + 9 && col >= c0 && col < c0 + 9;
  });
}

// A physical cell's id within one area's own 9x9 local frame.
function localId(name, row, col) {
  const [r0, c0] = GRID_ORIGINS[name];
  return makeCellId(row - r0 + 1, col - c0 + 1);
}

// The Var cell representing a physical board cell. For a cell shared with
// C, this picks the outer area's copy (gridsAt lists the corners before C
// in GRID_ORIGINS' own key order); the SameValues equalities below tie it
// to C's own copy, so either choice names the same value.
function varAt(row, col) {
  const [name] = gridsAt(row, col);
  return overlays[name].at(localId(name, row, col));
}

// Each area's own 9 rows, 9 columns and nine 3x3 boxes -- a full-grid
// overlay's rows()/columns()/boxes() mirror the underlying 9x9 Sudoku
// shape's default tiling, which lines up with the puzzle's drawn box
// regions (verified against the payload's `regions` array during decode).
const structureConstraints = Object.values(overlays).flatMap(overlay =>
  [...overlay.rows(), ...overlay.columns(), ...overlay.boxes()]
    .map(cells => new AllDifferent(...cells)));

// A shared cell is the same physical cell in two areas' Var overlays; pin
// them equal. Computed from GRID_ORIGINS rather than hand-listed.
const ALL_COORDS = Array.from({ length: 21 }, (_, r) => r + 1)
  .flatMap(r => Array.from({ length: 21 }, (_, c) => c + 1).map(c => [r, c]));
const equalityConstraints = ALL_COORDS
  .filter(([r, c]) => gridsAt(r, c).length === 2)
  .map(([r, c]) => {
    const [outer, centre] = gridsAt(r, c);
    return new SameValues(
      2, overlays[outer].at(localId(outer, r, c)), overlays[centre].at(localId(centre, r, c)));
  });

// Givens, transcribed from the payload's per-cell digits (0-indexed in the
// source; converted to 1-indexed row/col here).
const givens = [
  [1, 1, 3], [1, 9, 7], [1, 13, 6], [1, 14, 5], [1, 19, 1],
  [2, 3, 6], [2, 6, 9], [2, 15, 8], [2, 17, 7], [2, 19, 3], [2, 20, 9],
  [3, 1, 9], [3, 2, 2], [3, 3, 1], [3, 7, 4], [3, 9, 8], [3, 17, 3], [3, 21, 6],
  [4, 1, 1], [4, 4, 8], [4, 15, 5], [4, 16, 7], [4, 18, 2],
  [5, 2, 4], [5, 4, 6], [5, 8, 2], [5, 13, 4], [5, 16, 8], [5, 21, 9],
  [6, 2, 3], [6, 4, 4], [6, 5, 7], [6, 19, 8], [6, 21, 1],
  [7, 3, 5], [7, 6, 2], [7, 11, 5], [7, 18, 3],
  [8, 1, 2], [8, 3, 4], [8, 4, 3], [8, 18, 7],
  [9, 5, 6], [9, 16, 2], [9, 21, 8],
  [10, 7, 9], [10, 10, 6],
  [11, 7, 4], [11, 8, 3], [11, 11, 7], [11, 12, 5], [11, 15, 6],
  [12, 11, 9], [12, 13, 8],
  [13, 4, 9], [13, 5, 2], [13, 17, 3], [13, 19, 8],
  [14, 4, 8], [14, 9, 7], [14, 18, 6], [14, 20, 3],
  [15, 6, 4], [15, 8, 9], [15, 13, 6], [15, 21, 2],
  [16, 2, 4], [16, 8, 1], [16, 14, 6], [16, 20, 7],
  [17, 5, 8], [17, 9, 2], [17, 14, 8], [17, 15, 1], [17, 19, 5],
  [18, 2, 9], [18, 3, 7], [18, 15, 3], [18, 18, 1],
  [19, 5, 5], [19, 8, 6], [19, 13, 9], [19, 18, 8], [19, 20, 6], [19, 21, 4],
  [20, 1, 3], [20, 2, 8], [20, 9, 1], [20, 16, 1],
  [21, 1, 6], [21, 5, 1], [21, 8, 4], [21, 9, 5], [21, 16, 2], [21, 18, 4], [21, 20, 5],
].map(([row, col, value]) => new Given(varAt(row, col), value));

return [
  // The answer lives in the five overlays; the main grid is a pinned
  // placeholder.
  new Shape('1x1', 9),
  new Given('R1C1', 1),
  overlays.TL.toVar('top-left area'),
  overlays.TR.toVar('top-right area'),
  overlays.C.toVar('centre area'),
  overlays.BL.toVar('bottom-left area'),
  overlays.BR.toVar('bottom-right area'),
  ...structureConstraints,
  ...equalityConstraints,
  ...givens,
];
