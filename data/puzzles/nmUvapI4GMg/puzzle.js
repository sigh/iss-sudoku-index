// Title: Add On
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=nmUvapI4GMg
// Source: https://sudokupad.app/s22t2sbanr

// Normal sudoku on a 9x9 grid.
//
// Each box has one circled cell (drawn underlay, one per box). That cell's
// own digit is the box's "addend"; every cell's value = its digit + its
// box's addend (so a circled cell's own value is its digit doubled). The
// nine circled digits are pairwise different: AllDifferent below, since
// normal sudoku alone does not force it (two circled cells share row 3,
// two share row 9, two share column 1, two share column 5, two share
// column 7).
//
// Every line segment below lies entirely within one box (segments are cut
// at box borders), so a segment's value-sum is a plain sum of grid digits
// plus one repeat-weighted addend term: sum(digits in segment) +
// length(segment) * addend(box). Listing the box's addend cell an extra
// `length` times alongside the segment's own cells turns that into an
// ordinary cell-sum, so both the equal-line-sum and black-dot rules --
// both about VALUES rather than digits -- reduce to sums over plain digit
// cells; no materialized "value" cell is needed.
//
// Black dot: the two cells' VALUES are in a 2:1 ratio, i.e. one of the two
// possible orderings' linear value-equation holds -> Or of two Sum(0, ...)
// equations. Not every valid dot is necessarily drawn, so only the two
// drawn edges are constrained.
//
// Blue line: each line is split into segments by box borders; within one
// line every segment's VALUES sum to the same total, independently per
// line -> EqualSum over each segment's digit cells plus repeated addend.

const graph = cellGraph('9x9');

// One circled cell per box: the drawn circle underlay in each box.
const addendCells = [
  'R3C1', 'R3C5', 'R1C8',
  'R6C1', 'R4C4', 'R5C7',
  'R9C3', 'R9C5', 'R8C7',
];

// Map every grid cell to its box's addend cell.
const addendOf = {};
for (const box of graph.boxes()) {
  const addendCell = box.find(cell => addendCells.includes(cell));
  for (const cell of box) addendOf[cell] = addendCell;
}

// [cell, coeff] terms for `coeff * value(cell)`, i.e.
// coeff * (digit(cell) + addend(cell's box)).
function valueTerms(cell, coeff) {
  return [[cell, coeff], [addendOf[cell], coeff]];
}

// A segment's own cells, plus its box's addend cell repeated once per
// cell -- an ordinary cell list whose sum equals the segment's value-sum.
function segmentValueCells(cells) {
  return [...cells, ...cells.map(() => addendOf[cells[0]])];
}

// Blue lines, drawn order, split into segments at box-border crossings
// (the deepskyblue stroke paths).
const lineSegments = [
  [
    ['R5C7'],
    ['R5C6', 'R6C6', 'R6C5', 'R6C4'],
    ['R6C3', 'R5C3', 'R4C3'],
    ['R3C3', 'R2C3', 'R1C3'],
  ],
  [
    ['R5C8', 'R6C7'],
    ['R7C6', 'R7C5', 'R7C4'],
    ['R7C3', 'R7C2'],
  ],
  [
    ['R7C7'],
    ['R8C6'],
  ],
  [
    ['R3C7'],
    ['R4C6'],
  ],
  [
    ['R3C6'],
    ['R2C7', 'R3C8'],
    ['R4C9'],
  ],
];

const lineConstraints = lineSegments.map(
  segments => new EqualSum(...segments.map(segmentValueCells)),
);

// Black dots: the two drawn edge marks, both lying on line 2 above.
const blackDots = [
  ['R7C2', 'R7C3'],
  ['R7C3', 'R7C4'],
];

const blackDotConstraints = blackDots.map(([a, b]) => new Or([
  new Sum(0, ...valueTerms(a, 1), ...valueTerms(b, -2)),
  new Sum(0, ...valueTerms(b, 1), ...valueTerms(a, -2)),
]));

return [
  new Shape('9x9'),
  new AllDifferent(...addendCells),
  ...lineConstraints,
  ...blackDotConstraints,
];
