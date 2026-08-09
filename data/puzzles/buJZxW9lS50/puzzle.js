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
// cells"). The 81 playable cells (data below, copied from the puzzle's own
// drawn 3x3 box regions) are packed in physical reading order onto a 9x9
// Raw grid: no implicit constraints, so row, column, and box groups are
// computed from the physical cell list and added explicitly as
// AllDifferent, exactly mirroring the stated rule.

// The nine drawn 3x3 boxes, [row, col] 1-indexed, copied from the puzzle's
// region data.
const BOXES = [
  [[1, 8], [1, 9], [1, 10], [2, 8], [2, 9], [2, 10], [3, 8], [3, 9], [3, 10]],
  [[3, 4], [3, 5], [3, 6], [4, 4], [4, 5], [4, 6], [5, 4], [5, 5], [5, 6]],
  [[4, 1], [4, 2], [4, 3], [5, 1], [5, 2], [5, 3], [6, 1], [6, 2], [6, 3]],
  [[4, 9], [4, 10], [4, 11], [5, 9], [5, 10], [5, 11], [6, 9], [6, 10], [6, 11]],
  [[6, 6], [6, 7], [6, 8], [7, 6], [7, 7], [7, 8], [8, 6], [8, 7], [8, 8]],
  [[8, 3], [8, 4], [8, 5], [9, 3], [9, 4], [9, 5], [10, 3], [10, 4], [10, 5]],
  [[8, 11], [8, 12], [8, 13], [9, 11], [9, 12], [9, 13], [10, 11], [10, 12], [10, 13]],
  [[9, 8], [9, 9], [9, 10], [10, 8], [10, 9], [10, 10], [11, 8], [11, 9], [11, 10]],
  [[11, 4], [11, 5], [11, 6], [12, 4], [12, 5], [12, 6], [13, 4], [13, 5], [13, 6]],
];

const shape = new Shape('9x9', 9, 'Raw');
const graph = cellGraph(shape);
const key = (r, c) => `${r},${c}`;
const playableSet = new Set(BOXES.flat().map(([r, c]) => key(r, c)));

// Playable cells in reading order; this fixes which Raw-grid cell each
// [row, col] gets below (R1C1, R1C2, ... in this same order).
const playable = [];
for (let r = 1; r <= 13; r++) {
  for (let c = 1; c <= 13; c++) {
    if (playableSet.has(key(r, c))) playable.push([r, c]);
  }
}

// The puzzle's whole board: the 81 playable cells packed onto the 9x9 Raw
// grid in reading order. `idOf` pairs each Raw-grid cell with the physical
// [row, col] it stands in for.
const gridCells = graph.cells();
const idOf = new Map(playable.map(([r, c], i) => [key(r, c), gridCells[i]]));
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

// Killer cages: [total, ...cells], 1-indexed [row, col]. Cell lists copied
// from the puzzle's drawn cages.
const CAGES = [
  [28, [4, 1], [4, 2], [5, 1], [5, 2]],
  [12, [3, 4], [3, 5], [3, 6]],
  [18, [2, 8], [2, 9], [2, 10], [3, 10]],
  [10, [4, 10], [5, 10]],
  [19, [4, 11], [5, 11], [6, 11]],
  [28, [9, 12], [9, 13], [10, 12], [10, 13]],
  [10, [9, 4], [10, 4]],
  [18, [8, 3], [9, 3], [10, 3]],
  [11, [11, 8], [11, 9], [11, 10]],
];
const cages = CAGES.map(([sum, ...cells]) =>
  new Cage(sum, ...cells.map(([r, c]) => cellAt(r, c))));

// The R11C4/R12C4/R12C5/R12C6 cage shows ">14" rather than a total. Its
// cells already sit inside one box (BOXES[8]), so all-different is already
// enforced; only the sum bound needs adding. 4 distinct digits from 1-9 sum
// to 10-30, so ">14" leaves 15-30.
const overCage = [[11, 4], [12, 4], [12, 5], [12, 6]].map(([r, c]) => cellAt(r, c));
const overCageSumBound = new Or(
  Array.from({ length: 30 - 15 + 1 }, (_, i) => new Sum(15 + i, ...overCage)));

// Thermometers, bulb cell first (confirmed by the drawn bulb circle sitting
// on the line's first waypoint).
const THERMOS = [
  [[4, 9], [5, 9], [6, 9]],
  [[10, 5], [9, 5], [8, 5]],
  [[5, 2], [4, 2]],
  [[9, 12], [10, 12]],
];
const thermos = THERMOS.map(cells => new Thermo(...cells.map(([r, c]) => cellAt(r, c))));

// German whisper lines (drawn yellowgreen, read as the rules' "green").
const WHISPERS = [
  [[8, 11], [8, 12], [9, 13]],
  [[11, 4], [12, 5], [12, 4], [13, 5], [13, 4]],
  [[11, 6], [12, 6]],
];
const whispers = WHISPERS.map(cells => new Whisper(...cells.map(([r, c]) => cellAt(r, c))));

// Renban lines (drawn mediumorchid/purple, read as the rules' "pink").
const RENBANS = [
  [[5, 1], [6, 2], [6, 3]],
  [[2, 8], [3, 8]],
  [[1, 10], [1, 9], [2, 10], [2, 9], [3, 10]],
];
const renbans = RENBANS.map(cells => new Renban(...cells.map(([r, c]) => cellAt(r, c))));

return [
  shape,
  ...boxGroups,
  ...rowGroups,
  ...colGroups,
  ...cages,
  overCageSumBound,
  ...thermos,
  ...whispers,
  ...renbans,
];
