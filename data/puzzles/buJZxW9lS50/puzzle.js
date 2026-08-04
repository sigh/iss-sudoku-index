// Title: Centrifugal Force
// Author: 3good5you
// Video: https://www.youtube.com/watch?v=buJZxW9lS50
// Source: https://app.crackingthecryptic.com/sudoku/Qqbf8mFL6b

// Fill all (non-shaded) cells 1-9 so no digit repeats in any row, column, or
// 3x3 box. Killer cages add to the top-left total; the R11C4/R12C4/R12C5/
// R12C6 cage shows ">14" instead of a total, so only a sum bound is encoded
// (its cells are already inside one box, so uniqueness there is already
// covered by the box constraint). Green lines are German whispers (adjacent
// cells differ by >= 5); pink lines are renban (a consecutive, non-repeating
// run in any order); thermometers strictly increase from the bulb.
//
// The canvas is 13x13 but only 81 of the 169 cells are playable; the rest
// are drawn solid black and are not part of the grid ("Fill all (non-shaded)
// cells"). ISS's row/column all-different is mandatory and always spans the
// full grid width/height, so a 13-wide row of mixed playable/shaded cells
// can't be modelled on a real 13x13 Shape. Instead the 81 playable cells
// (data below, copied from the puzzle's own drawn 3x3 box regions) live on a
// single Var group, with the grid reduced to an unused, pinned 1x1 dummy.
// Row, column, and box groups are then computed from that cell list and
// added explicitly as AllDifferent, exactly mirroring the stated rule.

// The nine drawn 3x3 boxes, [row, col] 0-indexed, copied from the puzzle's
// region data.
const BOXES = [
  [[0, 7], [0, 8], [0, 9], [1, 7], [1, 8], [1, 9], [2, 7], [2, 8], [2, 9]],
  [[2, 3], [2, 4], [2, 5], [3, 3], [3, 4], [3, 5], [4, 3], [4, 4], [4, 5]],
  [[3, 0], [3, 1], [3, 2], [4, 0], [4, 1], [4, 2], [5, 0], [5, 1], [5, 2]],
  [[3, 8], [3, 9], [3, 10], [4, 8], [4, 9], [4, 10], [5, 8], [5, 9], [5, 10]],
  [[5, 5], [5, 6], [5, 7], [6, 5], [6, 6], [6, 7], [7, 5], [7, 6], [7, 7]],
  [[7, 2], [7, 3], [7, 4], [8, 2], [8, 3], [8, 4], [9, 2], [9, 3], [9, 4]],
  [[7, 10], [7, 11], [7, 12], [8, 10], [8, 11], [8, 12], [9, 10], [9, 11], [9, 12]],
  [[8, 7], [8, 8], [8, 9], [9, 7], [9, 8], [9, 9], [10, 7], [10, 8], [10, 9]],
  [[10, 3], [10, 4], [10, 5], [11, 3], [11, 4], [11, 5], [12, 3], [12, 4], [12, 5]],
];

const key = (r, c) => `${r},${c}`;
const playableSet = new Set(BOXES.flat().map(([r, c]) => key(r, c)));

// Playable cells in reading order; this fixes the Var index each [row, col]
// gets below.
const playable = [];
for (let r = 0; r < 13; r++) {
  for (let c = 0; c < 13; c++) {
    if (playableSet.has(key(r, c))) playable.push([r, c]);
  }
}

// Declared 9x9 (81 = 9*9) so the group has real dimensions for the pipeline's
// off-grid solution check; it is bookkeeping for Var indexing only -- these
// are not the puzzle's own (non-rectangular) rows/columns, which rowGroups
// and colGroups encode separately from the actual physical geometry.
const GRID = new Var('G', 'Playable cells', '9x9');
const idOf = new Map(playable.map(([r, c], i) => [key(r, c), GRID.cell(i + 1)]));
const cellAt = (r, c) => idOf.get(key(r, c));

// Box groups: the drawn regions themselves.
const boxGroups = BOXES.map(cells => new AllDifferent(...cells.map(([r, c]) => cellAt(r, c))));

// Row/column groups: every physical row and column, restricted to its
// playable cells (some rows/columns fall entirely inside one box, so their
// group is implied by that box's AllDifferent; they are still stated here
// as the literal row/column rule).
const groupBy = (pick) => {
  const buckets = new Map();
  for (const [r, c] of playable) {
    const k = pick(r, c);
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(cellAt(r, c));
  }
  return [...buckets.values()].filter(cells => cells.length > 1)
    .map(cells => new AllDifferent(...cells));
};
const rowGroups = groupBy((r) => r);
const colGroups = groupBy((r, c) => c);

// Killer cages: [total, ...cells], 0-indexed [row, col]. Cell lists copied
// from the puzzle's drawn cages.
const CAGES = [
  [28, [3, 0], [3, 1], [4, 0], [4, 1]],
  [12, [2, 3], [2, 4], [2, 5]],
  [18, [1, 7], [1, 8], [1, 9], [2, 9]],
  [10, [3, 9], [4, 9]],
  [19, [3, 10], [4, 10], [5, 10]],
  [28, [8, 11], [8, 12], [9, 11], [9, 12]],
  [10, [8, 3], [9, 3]],
  [18, [7, 2], [8, 2], [9, 2]],
  [11, [10, 7], [10, 8], [10, 9]],
];
const cages = CAGES.map(([sum, ...cells]) =>
  new Cage(sum, ...cells.map(([r, c]) => cellAt(r, c))));

// The R11C4/R12C4/R12C5/R12C6 cage ("R11C4"-style ids below use 0-indexed
// [row, col]) shows ">14" rather than a total. Its cells already sit inside
// one box (BOXES[8]), so all-different is already enforced; only the sum
// bound needs adding. 4 distinct digits from 1-9 sum to 10-30, so ">14"
// leaves 15-30.
const overCage = [[10, 3], [11, 3], [11, 4], [11, 5]].map(([r, c]) => cellAt(r, c));
const overCageSumBound = new Or(
  Array.from({ length: 30 - 15 + 1 }, (_, i) => new Sum(15 + i, ...overCage)));

// Thermometers, bulb cell first (confirmed by the drawn bulb circle sitting
// on the line's first waypoint).
const THERMOS = [
  [[3, 8], [4, 8], [5, 8]],
  [[9, 4], [8, 4], [7, 4]],
  [[4, 1], [3, 1]],
  [[8, 11], [9, 11]],
];
const thermos = THERMOS.map(cells => new Thermo(...cells.map(([r, c]) => cellAt(r, c))));

// German whisper lines (drawn yellowgreen, read as the rules' "green").
const WHISPERS = [
  [[7, 10], [7, 11], [8, 12]],
  [[10, 3], [11, 4], [11, 3], [12, 4], [12, 3]],
  [[10, 5], [11, 5]],
];
const whispers = WHISPERS.map(cells => new Whisper(...cells.map(([r, c]) => cellAt(r, c))));

// Renban lines (drawn mediumorchid/purple, read as the rules' "pink").
const RENBANS = [
  [[4, 0], [5, 1], [5, 2]],
  [[1, 7], [2, 7]],
  [[0, 9], [0, 8], [1, 9], [1, 8], [2, 9]],
];
const renbans = RENBANS.map(cells => new Renban(...cells.map(([r, c]) => cellAt(r, c))));

return [
  new Shape('1x1', 9),
  new Given('R1C1', 1),
  GRID,
  ...boxGroups,
  ...rowGroups,
  ...colGroups,
  ...cages,
  overCageSumBound,
  ...thermos,
  ...whispers,
  ...renbans,
];
