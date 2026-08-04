// Title: Mean Samurai
// Author: JayForty
// Video: https://www.youtube.com/watch?v=fU6H11tRCmM
// Source: https://app.crackingthecryptic.com/sudoku/FnhPdg2LDq

// Five overlapping 4x4 sudoku areas on a 12x12 canvas (north, east, west,
// south, centre); each places four of the digits 1-9 once per row, column
// and 2x2 box, and different areas may use different four-digit sets.
// Centre shares two cells with each of the other four areas (those cells are
// literally the same board cell, obeying both areas' row/column/box rules);
// north/east/west/south never touch directly. No ISS main grid can hold this
// shape, so each area is its own Var group, tied together at the shared
// cells with SameValues. Other rules: a yellow-green-drawn line needs
// adjacent digits to differ by at least 5 (the rules' "green" line); a
// purple-drawn line holds a set of consecutive digits in any order (the
// rules' "pink" line). Digits on an arrow sum to the arrow's circle; cells
// joined by a black dot are in a 1:2 ratio; cells joined by an X sum to 10.
// The payload lists one more purple line, one more yellow-green line, and
// one more arrow, each with only style attributes and no waypoints -- no
// cells, no stroke. Constructor-export residue, not a drawn clue.

// GRID_ORIGINS: physical (row, col), 1-indexed, of each area's top-left
// cell, read off the puzzle's own 2x2 box regions (raw payload `regions`,
// [row, col] pairs, 0-indexed) and cross-checked against each area's
// coloured background fill (raw payload `underlays`).
const GRID_ORIGINS = { A: [2, 3], B: [3, 8], C: [7, 2], D: [8, 7], E: [5, 5] };

// Which area(s) (0, 1 or 2) a physical cell belongs to; a cell in two areas
// is one of the eight cells shared with the centre area E.
function gridsAt(row, col) {
  return Object.keys(GRID_ORIGINS).filter(name => {
    const [r0, c0] = GRID_ORIGINS[name];
    return row >= r0 && row < r0 + 4 && col >= c0 && col < c0 + 4;
  });
}

// A physical cell's id within one area's own 4x4 local frame.
function localId(name, row, col) {
  const [r0, c0] = GRID_ORIGINS[name];
  return makeCellId(row - r0 + 1, col - c0 + 1);
}

const graph = cellGraph('4x4');
const overlays = {
  A: graph.makeOverlay('VA'),
  B: graph.makeOverlay('VB'),
  C: graph.makeOverlay('VC'),
  D: graph.makeOverlay('VD'),
  E: graph.makeOverlay('VE'),
};

// The Var cell representing a physical board cell. For a cell shared with
// E, this picks the outer area's copy (gridsAt lists A/B/C/D before E); the
// SameValues equalities below tie it to E's own copy, so either choice
// names the same value.
function varAt(row, col) {
  const [name] = gridsAt(row, col);
  return overlays[name].at(localId(name, row, col));
}

// Each area's own 4 rows, 4 columns and 2x2 boxes -- the boxes are the
// default 4x4 tiling, which lines up with the puzzle's drawn 2x2 box
// regions (verified against the `regions` payload during decode).
const structureConstraints = Object.values(overlays).flatMap(overlay =>
  [...overlay.rows(), ...overlay.columns(), ...overlay.boxes()]
    .map(cells => new AllDifferent(...cells)));

// A shared cell is the same physical cell in two areas' Var overlays; pin
// them equal. Computed from GRID_ORIGINS rather than hand-listed.
const ALL_COORDS = Array.from({ length: 12 }, (_, r) => r + 1)
  .flatMap(r => Array.from({ length: 12 }, (_, c) => c + 1).map(c => [r, c]));
const equalityConstraints = ALL_COORDS
  .filter(([r, c]) => gridsAt(r, c).length === 2)
  .map(([r, c]) => {
    const [outer, centre] = gridsAt(r, c);
    return new SameValues(
      2, overlays[outer].at(localId(outer, r, c)), overlays[centre].at(localId(centre, r, c)));
  });

// "Four of the digits 1-9": each area's 16 cells hold exactly four distinct
// values (combined with the row/column/box all-different above, this forces
// every row/column/box of an area to be a permutation of that same
// four-digit set). One CountDistinct control Var per area, pinned to 4.
const areaNames = Object.keys(overlays);
const digitSetControl = new Var('N', 'areaDigitCount', areaNames.length);
const digitSetConstraints = areaNames.flatMap((name, i) => {
  const controlCell = digitSetControl.cell(i + 1);
  return [
    new Given(controlCell, 4),
    new CountDistinct(controlCell, ...overlays[name].cells()),
  ];
});

// Yellow-green lines (#A3E048 in the payload): adjacent digits differ by at
// least 5 (German whisper -- the rules' "green" line). Cell paths read from
// the payload's line waypoints (row-first). A fourth yellow-green line
// exists in the payload's line list but carries no waypoints and is
// omitted.
const whisperLines = [
  [[8, 2], [7, 3]],
  [[10, 2], [9, 3], [10, 4], [9, 5]],
  [[11, 9], [11, 10]],
].map(coords => new Whisper(...coords.map(([r, c]) => varAt(r, c))));

// Purple lines (#D23BE7): a set of consecutive digits, any order (Renban --
// the rules' "pink" line). The first and third of these cross geometrically
// at the corner shared by R4C3/R4C4/R5C3/R5C4. A fourth purple line exists
// in the payload's line list but carries no waypoints and is omitted.
const renbanLines = [
  [[5, 3], [4, 4], [3, 5]],
  [[4, 5], [5, 6]],
  [[5, 4], [4, 3], [3, 3], [2, 4]],
].map(coords => new Renban(...coords.map(([r, c]) => varAt(r, c))));

// Arrows: digits on the arm sum to the circled bulb digit. Bulb cells read
// from the payload's circle overlays; arm cells from the arrow waypoints. A
// fifth arrow exists in the payload's arrow list but carries no waypoints
// and is omitted.
const arrows = [
  { bulb: [2, 5], arm: [[3, 6], [4, 6]] },
  { bulb: [3, 10], arm: [[3, 9], [4, 8]] },
  { bulb: [6, 10], arm: [[5, 10], [4, 11]] },
  { bulb: [9, 8], arm: [[8, 9]] },
].map(({ bulb, arm }) =>
  new Arrow(varAt(...bulb), ...arm.map(([r, c]) => varAt(r, c))));

// Black-dot pairs (1:2 ratio) and the X pair (sum to 10), read from the
// payload's edge overlays.
const blackDots = [
  [[9, 7], [10, 7]],
  [[9, 9], [10, 9]],
  [[9, 10], [10, 10]],
].map(coords => new BlackDot(...coords.map(([r, c]) => varAt(r, c))));
const xPairs = [
  [[10, 9], [10, 10]],
].map(coords => new X(...coords.map(([r, c]) => varAt(r, c))));

return [
  // The answer lives in VA/VB/VC/VD/VE, so the main grid is a pinned
  // placeholder; '9' gives the Var groups their real 1-9 domain.
  new Shape('1x1', 9),
  new Given('R1C1', 1),
  overlays.A.toVar('north area'),
  overlays.B.toVar('east area'),
  overlays.C.toVar('west area'),
  overlays.D.toVar('south area'),
  overlays.E.toVar('centre area'),
  digitSetControl,
  ...structureConstraints,
  ...equalityConstraints,
  ...digitSetConstraints,
  ...whisperLines,
  ...renbanLines,
  ...arrows,
  ...blackDots,
  ...xPairs,
];
