// Title: SVS (302) - Y-Sums Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=Hxj43ZsmfBE
// Source: https://app.crackingthecryptic.com/sudoku/N8NmGQpmRF

// Rules encoded:
// - Normal sudoku rules apply (default Shape('9x9'): row/column/box
//   all-different).
// - Fifteen outside clues (5 top, 4 left, 2 right, 4 bottom), one per marked
//   row/column. For the lane running from the clue into the grid with cells
//   c1 (nearest) .. c9 (farthest): X = c1, Y = the cell at position X (c_X),
//   and the clue equals c1 + ... + c_Y (per the puzzle's video description:
//   "clues outside the grid indicate the sum of the first Y digits from
//   that side where Y is the Xth digit from that side and X is the first
//   digit from that side").

const graph = cellGraph('9x9');

// [side, row/col index, printed clue] per outside-clue overlay.
const lanes = [
  { side: 'top', idx: 2, clue: 33 },
  { side: 'top', idx: 4, clue: 30 },
  { side: 'top', idx: 5, clue: 26 },
  { side: 'top', idx: 6, clue: 13 },
  { side: 'top', idx: 7, clue: 13 },
  { side: 'left', idx: 4, clue: 11 },
  { side: 'left', idx: 5, clue: 7 },
  { side: 'left', idx: 7, clue: 13 },
  { side: 'left', idx: 9, clue: 9 },
  { side: 'right', idx: 2, clue: 6 },
  { side: 'right', idx: 4, clue: 5 },
  { side: 'bottom', idx: 4, clue: 16 },
  { side: 'bottom', idx: 5, clue: 20 },
  { side: 'bottom', idx: 6, clue: 31 },
  { side: 'bottom', idx: 8, clue: 17 },
];

function laneCells(side, idx) {
  if (side === 'top') return graph.column(idx);
  if (side === 'bottom') return graph.column(idx).slice().reverse();
  if (side === 'left') return graph.row(idx);
  if (side === 'right') return graph.row(idx).slice().reverse();
  throw new Error('bad side: ' + side);
}

// One aux cell per lane holding Y (the value at position X within that
// lane); domain is the grid's own 1-9, which already covers every valid
// lane position and every valid digit.
const yVar = new Var('Y', 'y-sums lane targets', lanes.length);

const laneConstraints = lanes.flatMap((lane, i) => {
  const cells = laneCells(lane.side, lane.idx);
  const yCell = yVar.cell(i + 1);

  // ValueIndexing(valueCell, controlCell, ...indexedCells) forces valueCell
  // to equal indexedCells[controlCell - 1]. Using the lane's own first cell
  // as the control cell makes the index X (=c1's value) itself, so this
  // pins yCell to c_X = Y.
  const indexer = new ValueIndexing(yCell, cells[0], ...cells);

  // Sum of the first Y lane cells equals the printed clue. Y is already
  // pinned by the ValueIndexing constraint above; this only selects, for
  // each of Y's 9 possible values, which prefix of the lane the sum runs
  // over.
  const sumChoice = new Or(Array.from({ length: 9 }, (_, k) => k + 1).map(
    y => new And([
      new Given(yCell, y),
      new Sum(lane.clue, ...cells.slice(0, y)),
    ])));

  return [indexer, sumChoice];
});

return [
  new Shape('9x9'),
  yVar,
  ...laneConstraints,
];
