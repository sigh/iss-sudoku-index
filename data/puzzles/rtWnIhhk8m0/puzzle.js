// Title: The Tilted Crown
// Author: fritzdis
// Video: https://www.youtube.com/watch?v=rtWnIhhk8m0
// Source: https://app.crackingthecryptic.com/sudoku/ft3J69J2hG

// Normal sudoku rules apply (default Shape('9x9') row/column/box).
//
// Minimal between lines: interior cells on a line must hold values strictly
// between its two circled ends (Between). The rules text's own worked
// example ("a circle in R1C2 ... to a circle in R5C6 would have a
// difference of 2 because it is possible and necessary to repeat the same
// digit in all 3 spots") computes the required difference purely from
// whether that line's own interior cells share a row/column/box with each
// other: interior cells that never share a house can all take one shared
// value, so a minimum gap of 2 suffices; each additional interior cell
// forced distinct from the others (same row/column/box) raises the minimum
// by one. `maxConflictClique` below reproduces that count per line, and
// each line gets an exact-difference `Pair` alongside its `Between`.
//
// Clones: the two grey 4x4 blocks (source underlays, R5C2 block and R1C6
// block) hold identical digits in identical relative position. Nothing in
// the drawing (no arrows/labels) suggests a rotation or reflection, so the
// only pairing the art supports is a direct cell-by-cell translation.
//
// Skyscrapers: standard outside-clue visible-building-count rule.

const graph = cellGraph();
const geometry = cellGeometry();

// --- Clones ---------------------------------------------------------------
// graph.block() walks both 4x4 regions in the same row-major order, so
// cloneA[i] and cloneB[i] are the corresponding cells without hand-pairing
// 16 cells twice. Each pair is its own SameValues(2, ...) (two singleton
// sets), which is per-cell equality -- kept separate per pair rather than
// merged into one 32-cell SameValues, since merging would only require the
// same *multiset* of 16 values in each block, not the same arrangement.
const cloneA = graph.block('R5C2', 4, 4);
const cloneB = graph.block('R1C6', 4, 4);
const clones = cloneA.map((cell, i) => new SameValues(2, cell, cloneB[i]));

// --- Skyscrapers ------------------------------------------------------------
// Source overlays: "3" left of R2, "3" left of R4, "3" right of R3.
const skyscrapers = [
  Skyscraper.fromCells(3, graph.row(2), geometry),
  Skyscraper.fromCells(3, graph.row(4), geometry),
  Skyscraper.fromCells(3, graph.row(3).slice().reverse(), geometry),
];

// --- Minimal between lines --------------------------------------------------
// Each entry is [circle, ...interior cells, circle], transcribed from the
// source `lines`/circle `overlays` geometry. Some circles anchor two lines
// (R1C1, R4C1, R9C6, R9C9).
const betweenLines = [
  ['R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R4C1', 'R5C2', 'R5C3', 'R6C3'],
  ['R9C6', 'R8C5', 'R7C5', 'R7C4'],
  ['R1C7', 'R2C7', 'R2C8', 'R3C8', 'R3C9'],
  ['R4C8', 'R5C9', 'R6C9', 'R7C9', 'R8C8', 'R9C9'],
  ['R2C6', 'R1C5', 'R1C4', 'R1C3', 'R2C2', 'R1C1'],
];

function sameHouse(a, b) {
  const A = parseCellId(a), B = parseCellId(b);
  if (A.row === B.row || A.col === B.col) return true;
  return Math.floor((A.row - 1) / 3) === Math.floor((B.row - 1) / 3) &&
    Math.floor((A.col - 1) / 3) === Math.floor((B.col - 1) / 3);
}

// Largest set of interior cells that are pairwise same-housed (a clique in
// the conflict graph). Brute force over subsets is fine: every line here
// has at most 4 interior cells.
function maxConflictClique(cells) {
  let best = cells.length ? 1 : 0;
  for (let mask = 1; mask < (1 << cells.length); mask++) {
    const subset = cells.filter((_, i) => mask & (1 << i));
    const isClique = subset.every((a, i) =>
      subset.slice(i + 1).every(b => sameHouse(a, b)));
    if (isClique) best = Math.max(best, subset.length);
  }
  return best;
}

function minimalBetweenLine(cells) {
  const circleA = cells[0], circleB = cells[cells.length - 1];
  const mids = cells.slice(1, -1);
  const minGap = maxConflictClique(mids) + 1;
  return [
    new Between(...cells),
    new Pair(
      Pair.fnToKey((a, b) => Math.abs(a - b) === minGap, 9),
      `MinGap${minGap}`, circleA, circleB),
  ];
}

return [
  new Shape('9x9'),
  ...clones,
  ...skyscrapers,
  ...betweenLines.flatMap(minimalBetweenLine),
];
