// Title: Killers with a twist
// Author: siron2133
// Video: https://www.youtube.com/watch?v=CoSl4ys4XDw
// Source: https://sudokupad.app/ntqufgkvcx

// Normal Sudoku applies. Each coloured marker is contained in a non-repeating
// killer cage with its displayed fixed-orientation polyomino shape. Cages of
// the same colour have equal totals and cannot overlap.

const graph = cellGraph('9x9');
const pieces = graph.makeOverlay('VP');
const gridCells = graph.cells();
const PIECE = Array.from({ length: 14 }, (_, i) => i + 1);
const EMPTY = 15;

// Each marker is in its cage. Offsets are the miniature blocks in the archived
// artwork, read top-left to bottom-right; translating them cannot rotate or flip
// the displayed shape.
const pieceData = [
  { anchor: 'R1C2', color: 'cyan', shape: [[0, 0], [0, 1]] },
  { anchor: 'R1C8', color: 'cyan', shape: [[0, 0], [0, 1]] },
  { anchor: 'R2C3', color: 'orange', shape: [[0, 0], [0, 1], [1, 0]] },
  { anchor: 'R2C7', color: 'orange', shape: [[0, 1], [1, 0], [1, 1], [1, 2]] },
  { anchor: 'R3C5', color: 'cyan', shape: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
  { anchor: 'R5C2', color: 'cyan', shape: [[0, 0], [0, 1], [1, 0], [1, 1]] },
  { anchor: 'R5C8', color: 'orange', shape: [[0, 1], [1, 0], [1, 1], [2, 0]] },
  { anchor: 'R6C3', color: 'cyan', shape: [[0, 0], [0, 1], [0, 2]] },
  { anchor: 'R6C7', color: 'orange', shape: [[0, 0], [1, 0], [1, 1], [1, 2]] },
  { anchor: 'R7C2', color: 'orange', shape: [[0, 0], [1, 0], [1, 1], [1, 2]] },
  { anchor: 'R7C5', color: 'orange', shape: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]] },
  { anchor: 'R7C8', color: 'cyan', shape: [[0, 2], [1, 0], [1, 1], [1, 2], [2, 0]] },
  { anchor: 'R9C3', color: 'cyan', shape: [[0, 0], [0, 1], [1, 1], [1, 2]] },
  { anchor: 'R9C7', color: 'cyan', shape: [[0, 0], [0, 1], [0, 2]] },
];

function cellsForPlacement(anchor, shape) {
  const { row, col } = parseCellId(anchor);
  const placements = new Map();
  for (const [markerRow, markerCol] of shape) {
    const topRow = row - markerRow;
    const topCol = col - markerCol;
    const cells = shape.map(([dr, dc]) => {
      const r = topRow + dr;
      const c = topCol + dc;
      return r >= 1 && r <= 9 && c >= 1 && c <= 9 ? makeCellId(r, c) : null;
    });
    if (cells.every(Boolean)) placements.set(cells.join(','), cells);
  }
  return [...placements.values()];
}

// A two-cell base-16 representation lets each colour's deduced cage total be
// shared by all of its cages while leaving the main grid at digits 1 through 9.
const cyanTotal = ['VT1', 'VT2'];
const orangeTotal = ['VO1', 'VO2'];
const totals = { cyan: cyanTotal, orange: orangeTotal };

function cagePlacement(id, color, cells) {
  const [low, high] = totals[color];
  return new And([
    ...pieces.at(cells).map(cell => new Given(cell, id)),
    new AllDifferent(...cells),
    new Sum(-16, ...cells, [low, -1], [high, -16]),
  ]);
}

const placements = pieceData.map(({ anchor, color, shape }, index) => {
  const id = index + 1;
  return new Or(cellsForPlacement(anchor, shape)
    .map(cells => cagePlacement(id, color, cells)));
});

const exactSizes = pieceData.map(({ shape }, index) =>
  new ContainExact(Array(shape.length).fill(index + 1).join('_'), ...pieces.cells()));

return [
  new Shape('9x9', 16),
  pieces.toVar('piece placement'),
  new Var('T', 'cyan cage total', 2),
  new Var('O', 'orange cage total', 2),
  // The widened shape is only for the placement and total state.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  pieces.makeReplicate(new Given(pieces.cells()[0], ...PIECE, EMPTY)),
  ...pieceData.map(({ anchor }, index) => new Given(pieces.at(anchor), index + 1)),
  ...exactSizes,
  ...placements,
];
