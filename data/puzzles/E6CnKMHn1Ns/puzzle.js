// Title: Windowku
// Author: Shintaro Fushida-Hardy and Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=E6CnKMHn1Ns
// Source: https://sudokupad.app/t9yym962w0?setting-nogrid=1

// Rules:
//   In each of the four stacked grids, normal 4x4 Sudoku rules apply.
//   The value of a cell with a window is the sum of its digit and the digit in
//   the cell from a different grid that can be seen through the window.
//   Each value in a circle is the sum of the values on the attached arrow.
//   Adjacent values along a green line differ by at least five.
// Nothing is omitted. A cell without a window has its digit as its value.
//
// The four grids are drawn in the corners of a 9x9 canvas (row 5 and column 5
// are the gap between them and hold no cells); all coordinates below are that
// canvas's R#C#. TL is the solver's main grid; the other three are Var groups
// with their own row/column/box groups, so nothing is all-different across the
// gap. The value range is widened to 8 because a window value runs 2-8; the 64
// digit cells are restricted back to 1-4.

const shape = new Shape('4x4', 8);

// Stacked front-to-back. The canvas draws each grid's 3D frame with the grids
// behind it nested inside, inset a further 1/8 cell per layer: behind TL it
// draws TR, BR, BL; behind TR only BR, BL; behind BR only BL; behind BL
// nothing.
const STACKS = [
  { name: 'TL', r0: 1, c0: 1 },
  { name: 'TR', r0: 1, c0: 6 },
  { name: 'BR', r0: 6, c0: 6 },
  { name: 'BL', r0: 6, c0: 1 },
];

const stackVars = new Map([
  ['TR', new Var('B', 'TR', 16)],
  ['BR', new Var('C', 'BR', 16)],
  ['BL', new Var('D', 'BL', 16)],
]);

const IDX = [0, 1, 2, 3];

// Canvas position -> which grid holds it, and where inside that grid.
function locate(r, c) {
  const stack = STACKS.find(
    (s) => r >= s.r0 && r < s.r0 + 4 && c >= s.c0 && c < s.c0 + 4);
  if (!stack) {
    throw new Error(`${makeCellId(r, c)} lies in the gap between the grids`);
  }
  return { stack, i: r - stack.r0, j: c - stack.c0 };
}

function cellAt(r, c) {
  const { stack, i, j } = locate(r, c);
  const v = stackVars.get(stack.name);
  return v ? v.cell(i * 4 + j + 1) : makeCellId(i + 1, j + 1);
}

// Rows, columns and 2x2 boxes of the three off-grid stacks; the main grid gets
// the same groups from Shape('4x4').
const stackGroups = [...stackVars.values()].flatMap((v) => {
  const at = (i, j) => v.cell(i * 4 + j + 1);
  return [
    ...IDX.map((i) => new AllDifferent(...IDX.map((j) => at(i, j)))),
    ...IDX.map((j) => new AllDifferent(...IDX.map((i) => at(i, j)))),
    ...[0, 2].flatMap((bi) => [0, 2].map((bj) => new AllDifferent(
      at(bi, bj), at(bi, bj + 1), at(bi + 1, bj), at(bi + 1, bj + 1)))),
  ];
});

const digitCells = [
  ...cellGraph(shape).cells(),
  ...[...stackVars.values()].flatMap(
    (v) => IDX.flatMap((i) => IDX.map((j) => v.cell(i * 4 + j + 1)))),
];
const digitRange = digitCells.map((c) => new Given(c, 1, 2, 3, 4));

// Cells drawn with a window pane. Each is filled white and tinted with the
// identity colour of the grid one layer further back, and that grid's own
// gridlines and line art show through the pane at the pane's own position --
// so a window shows the cell at the same position within the next grid back.
const WINDOW_CELLS = [
  [1, 1], [1, 3], [2, 2], [3, 3],  // TL, looking into TR
  [2, 8], [3, 7], [4, 7],          // TR, looking into BR
  [6, 6], [7, 6],                  // BR, looking into BL
];

const windowValues = new Var('W', 'window values', WINDOW_CELLS.length);

const windowSums = WINDOW_CELLS.map(([r, c], n) => {
  const { stack, i, j } = locate(r, c);
  const behind = STACKS[STACKS.indexOf(stack) + 1];
  return new EqualSum(
    [cellAt(r, c), cellAt(behind.r0 + i, behind.c0 + j)],
    [windowValues.cell(n + 1)]);
});

const windowIndex = new Map(WINDOW_CELLS.map(([r, c], n) => [`${r},${c}`, n]));

function valueAt(r, c) {
  const n = windowIndex.get(`${r},${c}`);
  return n === undefined ? cellAt(r, c) : windowValues.cell(n + 1);
}

// Circled cell first, then the cells the drawn arrow runs through.
const ARROWS = [
  [[3, 3], [2, 2], [1, 1]],
  [[2, 4], [1, 3]],
  [[8, 8], [7, 8], [6, 8]],
  [[7, 6], [6, 6]],
  [[7, 4], [8, 3], [9, 2]],
];
const arrows = ARROWS.map(
  (cells) => new Arrow(...cells.map(([r, c]) => valueAt(r, c))));

const GREEN_LINE = [[4, 7], [3, 7], [2, 8], [1, 9]];
const greenLine = new Whisper(5, ...GREEN_LINE.map(([r, c]) => valueAt(r, c)));

return [
  shape,
  ...stackVars.values(),
  windowValues,
  ...digitRange,
  ...stackGroups,
  ...windowSums,
  ...arrows,
  greenLine,
];
