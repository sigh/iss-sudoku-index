// Title: 36x Even!
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Yv_RMyYTeRU
// Source: https://sudokupad.app/8df315rarb

// Normal sudoku. Grey squares are even. No three contiguous cells in any
// orthogonal or diagonal line may contain three consecutive digits in any order.

const graph = cellGraph('9x9');

const givens = [
  ['R3C5', 4],
  ['R6C4', 8],
  ['R6C6', 4],
  ['R7C3', 5],
  ['R7C5', 6],
  ['R7C7', 8],
  ['R8C5', 3],
];

const evenCells = [
  'R1C3', 'R1C5', 'R1C7', 'R1C9',
  'R2C2', 'R2C4', 'R2C6', 'R2C8',
  'R3C1', 'R3C3', 'R3C5', 'R3C9',
  'R4C2', 'R4C4', 'R4C6', 'R4C8',
  'R5C1', 'R5C3', 'R5C7', 'R5C9',
  'R6C2', 'R6C4', 'R6C6', 'R6C8',
  'R7C1', 'R7C5', 'R7C7', 'R7C9',
  'R8C2', 'R8C4', 'R8C6', 'R8C8',
  'R9C1', 'R9C3', 'R9C5', 'R9C7',
];

const noThreeConsecutiveDigits = NFA.encodeSpec({
  startState: { length: 0, first: 0, second: 0 },
  transition: (state, value) => {
    if (state.length === 0) return { length: 1, first: value, second: 0 };
    if (state.length === 1) return { length: 2, first: state.first, second: value };
    if (state.length === 2) {
      const values = [state.first, state.second, value];
      const sorted = [...values].sort((a, b) => a - b);
      const isConsecutiveSet = new Set(values).size === 3 && sorted[2] - sorted[0] === 2;
      if (isConsecutiveSet) return undefined;
      return { length: 3, first: 0, second: 0 };
    }
    return undefined;
  },
  accept: (state) => state.length === 3,
}, 9);

const startsFor = (rowMin, rowMax, colMin, colMax) => {
  const cells = [];
  for (let r = rowMin; r <= rowMax; r++) {
    for (let c = colMin; c <= colMax; c++) {
      cells.push(makeCellId(r, c));
    }
  }
  return cells;
};

const horizontalStarts = startsFor(1, 9, 1, 7);
const verticalStarts = startsFor(1, 7, 1, 9);
const diagonalBoundingAnchors = startsFor(1, 7, 1, 7);

const horizontalTriples = graph.makeReplicate(
  new NFA(noThreeConsecutiveDigits, 'no-3-consecutive',
    'R1C1', 'R1C2', 'R1C3'),
  horizontalStarts);
const verticalTriples = graph.makeReplicate(
  new NFA(noThreeConsecutiveDigits, 'no-3-consecutive',
    'R1C1', 'R2C1', 'R3C1'),
  verticalStarts);
const downRightTriples = graph.makeReplicate(
  new NFA(noThreeConsecutiveDigits, 'no-3-consecutive',
    'R1C1', 'R2C2', 'R3C3'),
  diagonalBoundingAnchors);
// The up-right triple sits inside the R1C1-anchored 3x3 bounding template.
// Its first scanned cell is R1C3; anchors identify bounding-box top-lefts.
const upRightTriples = graph.makeReplicate(
  new NFA(noThreeConsecutiveDigits, 'no-3-consecutive',
    'R1C3', 'R2C2', 'R3C1'),
  diagonalBoundingAnchors);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  horizontalTriples,
  verticalTriples,
  downRightTriples,
  upRightTriples,
];
