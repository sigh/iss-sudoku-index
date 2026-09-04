// Title: Minesweeper Sudoku
// Author: Cliff The Crafter
// Video: https://www.youtube.com/watch?v=SXXmx9ehUdM
// Source: https://cracking-the-cryptic.web.app/sudoku/hrD6pHTQn4

// Rules (video rules panel, transcribed from a captured frame -- the payload
// itself carries no rules text): "Each row/column/box contains two of the
// digits 1,2,3,4 and one 9. 9s represent mines and numbers in grey cells
// indicate the number of mines in adjacent cells (including diagonals)."
//
// Read as: every row, column and box holds 1,2,3,4 exactly twice each and 9
// exactly once (2*4+1 = 9 cells), so 5,6,7,8 never appear. Rows repeat
// digits, so this is not a Sudoku-type grid: it runs on a Raw grid with an
// explicit exact-multiset constraint per line/box instead of the implicit
// all-different rows/columns/boxes.
//
// A grey cell's own digit equals the number of its king-move neighbours
// (orthogonal + diagonal, board-edge-clipped) holding a 9. Since a cell has
// at most 8 such neighbours, this constraint alone forbids a grey cell from
// ever holding a 9 (the required count would have to be 9, impossible) --
// consistent with the minesweeper convention that a numbered cell isn't
// itself a mine, with no separate clause needed for it.

const shape = new Shape('9x9', 9, 'Raw');
const graph = cellGraph(shape);

// Exactly two each of 1,2,3,4 and one 9 -- the full 9-cell content of every
// row/column/box, so no other digit fits alongside it.
const MULTISET = '1_1_2_2_3_3_4_4_9';

const rows = graph.rows().map(row => new ContainExact(MULTISET, ...row));
const cols = graph.columns().map(col => new ContainExact(MULTISET, ...col));

// Raw grids have no default boxes (graph.boxes() is empty), so build the
// standard 3x3 tiling explicitly.
const boxes = [];
for (let br = 0; br < 3; br++) {
  for (let bc = 0; bc < 3; bc++) {
    const cells = [];
    for (let r = 1; r <= 3; r++) {
      for (let c = 1; c <= 3; c++) {
        cells.push(makeCellId(br * 3 + r, bc * 3 + c));
      }
    }
    boxes.push(new ContainExact(MULTISET, ...cells));
  }
}

// Givens.
const givens = [
  new Given('R2C1', 3),
  new Given('R3C3', 3),
  new Given('R3C9', 2),
  new Given('R8C8', 3),
  new Given('R9C1', 3),
  new Given('R9C9', 3),
];

// Grey underlay cells (drawn as light-grey single-cell fills), 1-indexed
// [row, col].
const GREY_CELLS = [
  [1, 6], [1, 7],
  [3, 2], [3, 5], [3, 7],
  [4, 1], [4, 2], [4, 7], [4, 9],
  [5, 1], [5, 4],
  [6, 1], [6, 3],
  [7, 4],
  [8, 2], [8, 6],
  [9, 4], [9, 5], [9, 6],
];

// "This cell's digit equals the count of [neighbour cells] holding 9": the
// grey cell is the origin symbol (sets the target), each neighbour after it
// contributes 1 when it is a 9, clamped at target+1 -- a rejecting sink once
// the count can only fail. maxDepth covers the origin plus up to 8
// neighbours.
const mineCountSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const hit = value === 9 ? 1 : 0;
    return { target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 9,
}, 9);

const mineCounts = GREY_CELLS.map(([row, col], i) => {
  const cell = makeCellId(row, col);
  return new NFA(
    mineCountSpec, `mineCount${i}`, cell, ...graph.kingNeighbours(cell));
});

return [
  shape,
  ...rows,
  ...cols,
  ...boxes,
  ...givens,
  ...mineCounts,
];
