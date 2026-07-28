// Title: Seicentomila
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=PZ20tjjcU9o
// Source: https://sudokupad.app/m7yoyjrok3

// Normal 9x9 Sudoku rules apply. Every red line is partitioned into contiguous
// sum-6 segments; the closed lines have no distinguished cut point. Outside
// clues are sandwich sums, and the three drawn cages are killer cages.
const segmentSpec = NFA.encodeSpec({
  // `sum` is the running total in the current segment; reaching 6 starts the
  // next segment, while exceeding 6 rejects that proposed partition.
  startState: {sum: 0},
  transition: ({sum}, value) => {
    const next = sum + value;
    if (next > 6) return undefined;
    return {sum: next === 6 ? 0 : next};
  },
  accept: ({sum}) => sum === 0,
  maxDepth: 8,
}, 9);

const openLine = [
  'R3C2', 'R4C3', 'R5C2', 'R4C1', 'R3C1', 'R2C1', 'R1C2',
];
const rightLoop = [
  'R3C9', 'R4C9', 'R5C8', 'R4C7', 'R3C7', 'R2C7', 'R1C8', 'R2C9',
];
const centralLoop = [
  'R3C5', 'R4C4', 'R5C4', 'R6C4', 'R7C5', 'R6C6', 'R5C6', 'R4C6',
];
const geometry = cellGeometry('9x9');
const row = r => Array.from({length: 9}, (_, c) => makeCellId(r, c + 1));
const column = c => Array.from({length: 9}, (_, r) => makeCellId(r + 1, c));

// A cyclic sum-6 partition has some boundary at which the loop can be cut into
// a linear sequence of complete segments, so every drawn cell is tried as that cut.
const cyclicSegments = cells => new Or(cells.map((_, cut) =>
  new NFA(segmentSpec, 'sum-6 segments',
    cells.slice(cut).concat(cells.slice(0, cut)))));

return [
  new Shape('9x9'),
  new NFA(segmentSpec, 'sum-6 segments', openLine),
  cyclicSegments(rightLoop),
  cyclicSegments(centralLoop),

  Sandwich.fromCells(6, row(1), geometry),
  Sandwich.fromCells(0, row(5), geometry),
  Sandwich.fromCells(0, row(9), geometry),
  Sandwich.fromCells(6, column(2), geometry),
  Sandwich.fromCells(0, column(5), geometry),
  Sandwich.fromCells(0, column(8), geometry),

  // The drawn killer cages, transcribed with their printed totals.
  new Cage(6, 'R6C1', 'R6C2'),
  new Cage(6, 'R6C3', 'R7C3'),
  new Cage(12, 'R8C8', 'R8C9'),
];
