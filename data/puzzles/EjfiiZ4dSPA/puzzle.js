// Title: Disconnection
// Author: fritzdis
// Video: https://www.youtube.com/watch?v=EjfiiZ4dSPA
// Source: https://app.crackingthecryptic.com/sudoku/9m9LpmQ8JF

// Rules encoded: "Fill each box with the digits 1-9 once each" (box
// all-different). "Digits may not repeat in any row, column" -- over the
// canvas's real (non-black) cells only, however many share a given canvas
// row/column (3, 6 or 9; only 3 of each are a full 9). "...or same relative
// box position (e.g. the bottom left corner of each box)" -- the cell at each
// of the 9 positions within a box, taken across all 9 boxes, is its own
// all-different group (disjoint groups, one group per cell position). Cages
// sum; purple lines are pairwise-consecutive; green lines have adjacent
// difference >= 5.
//
// The source also lists a sixth green-coloured line entry with no coordinate
// data at all (no cells, no path) -- it covers nothing and draws no stroke,
// so it is not a clue to encode.
//
// The nine boxes sit disconnected on a 13x13 canvas, and the row/column
// groups the rules describe cross box boundaries -- they are not any
// rectangular grid's default row/column groups (every ISS main-grid cell
// always gets row and column all-different; there is no "hole" cell). So the
// 81 real cells live entirely off the main grid as Var cells (one 3x3 group
// per box): Var cells + explicit AllDifferent + NoBoxes. The main grid is an
// unused 1x1 placeholder, pinned so it adds no extra solution multiplicity.

// Box top-left corners (row, col), 1-indexed, from the drawn geometry (9
// disconnected 3x3 blocks on the 13x13 canvas).
const BOX_TOP_LEFT = [
  [1, 3], [2, 7], [3, 11], [5, 2], [6, 6], [7, 10], [9, 1], [10, 5], [11, 9],
];
const LETTER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const boxes = LETTER.map((L, i) => new Var(L, `Box ${i + 1}`, '3x3'));

// Map every real cell's canvas (row, col) to its Var cell id.
const cellAt = new Map();
BOX_TOP_LEFT.forEach(([r0, c0], i) => {
  for (let dr = 0; dr < 3; dr++)
    for (let dc = 0; dc < 3; dc++)
      cellAt.set(`${r0 + dr},${c0 + dc}`, boxes[i].cell(dr + 1, dc + 1));
});
const at = (r, c) => cellAt.get(`${r},${c}`);

// "Fill each box with the digits 1-9 once each."
const boxAllDifferent = boxes.map(b => new AllDifferent(...b.cells()));

// "Digits may not repeat in any row, column" -- group the real cells sharing
// a canvas row, and separately a canvas column; derived from cellAt above,
// not hand-enumerated.
const byRow = new Map(), byCol = new Map();
for (const [key, id] of cellAt) {
  const [r, c] = key.split(',').map(Number);
  (byRow.get(r) ?? byRow.set(r, []).get(r)).push([c, id]);
  (byCol.get(c) ?? byCol.set(c, []).get(c)).push([r, id]);
}
const rowGroups = [...byRow.values()]
  .filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells.sort((a, b) => a[0] - b[0]).map(([, id]) => id)));
const colGroups = [...byCol.values()]
  .filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells.sort((a, b) => a[0] - b[0]).map(([, id]) => id)));

// "...or same relative box position (e.g. the bottom left corner of each
// box)": the cell at position (dr, dc) within a box, across all 9 boxes.
const positionGroups = Array.from({ length: 9 }, (_, p) => {
  const dr = Math.floor(p / 3) + 1, dc = (p % 3) + 1;
  return new AllDifferent(...boxes.map(b => b.cell(dr, dc)));
});

// Cages -- the four drawn cages.
const cages = [
  new Cage(17, at(2, 8), at(2, 9), at(3, 9), at(4, 9), at(4, 8)),
  new Cage(33, at(10, 6), at(10, 5), at(11, 5), at(12, 5), at(12, 6)),
  new Cage(27, at(6, 7), at(7, 7), at(8, 7), at(7, 6), at(7, 8)),
  new Cage(15, at(10, 3), at(11, 3)),
];

// Purple lines: "Adjacent digits on purple lines are consecutive." One `Pair`
// per edge -- these cells are Var cells, not grid-adjacent, so the
// adjacency-bound dot classes (WhiteDot etc.) don't apply.
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const purpleLines = [
  new Pair(consecutiveKey, 'purple consecutive', at(8, 12), at(7, 12)),
  new Pair(consecutiveKey, 'purple consecutive', at(6, 8), at(7, 8)),
];

// Green lines: "Adjacent digits on green lines differ by at least 5."
// `Whisper` binds consecutive pairs by list order, not grid adjacency, so it
// applies directly to the Var cell lists. These are #2-#4 of the drawn set;
// #5 is the coordinate-less rendering artifact described above.
const greenLines = [
  new Whisper(5, at(7, 8), at(7, 7), at(7, 6)),
  new Whisper(5, at(5, 2), at(6, 2), at(7, 2)),
  new Whisper(5, at(11, 10), at(11, 11)),
];

return [
  new Shape('1x1', 9),
  new Given('R1C1', 1), // pin the unused placeholder cell so it adds no extra solutions
  new NoBoxes(),
  ...boxes,
  ...boxAllDifferent,
  ...rowGroups,
  ...colGroups,
  ...positionGroups,
  ...cages,
  ...purpleLines,
  ...greenLines,
];
