// Title: Unusually Hot
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=bVB6D4T-g9k
// Source: https://sudokupad.app/pvo44ijd8p

// Normal sudoku rules (rows, columns, boxes) apply by default.
//
// The GREEN/ORANGE region split is the YinYang constraint's YY cell group.
// A cell's "value" is its digit when GREEN, or its fixed row+column number
// when ORANGE -- a constant that does not depend on the digit placed there.
// Thermometers increase strictly in value from bulb to tip; black dots
// relate two cells' values by doubling. Both rules are encoded as a
// disjunction over the four GREEN/ORANGE combinations of the pair, since
// "value" is a different function of the cell in each case:
//   - both GREEN: an ordinary Pair over the two digits.
//   - one GREEN, one ORANGE: the ORANGE side's value is a known constant, so
//     the rule collapses to a domain restriction on the GREEN side's digit.
//   - both ORANGE: both values are known constants, so the branch is either
//     always true or arithmetically impossible, decided once at build time.

const GREEN = 1;
const ORANGE = 2;

const graph = cellGraph('9x9');
const region = graph.makeOverlay('YY');

// row + column number for a cell, 1-indexed -- the ORANGE-region value.
function rowColSum(cell) {
  const { row, col } = parseCellId(cell);
  return row + col;
}

// value(a) `predicate` value(b), as an Or over which region each cell is in.
function valueRelation(name, a, b, predicate) {
  const rcA = rowColSum(a);
  const rcB = rowColSum(b);
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const branches = [];

  branches.push(new And([
    new Given(region.at(a), GREEN), new Given(region.at(b), GREEN),
    new Pair(Pair.fnToKey(predicate, 9), name, a, b),
  ]));

  const validA = digits.filter(x => predicate(x, rcB));
  if (validA.length) {
    branches.push(new And([
      new Given(region.at(a), GREEN), new Given(region.at(b), ORANGE),
      new Given(a, ...validA),
    ]));
  }

  const validB = digits.filter(y => predicate(rcA, y));
  if (validB.length) {
    branches.push(new And([
      new Given(region.at(a), ORANGE), new Given(region.at(b), GREEN),
      new Given(b, ...validB),
    ]));
  }

  if (predicate(rcA, rcB)) {
    branches.push(new And([
      new Given(region.at(a), ORANGE), new Given(region.at(b), ORANGE),
    ]));
  }

  return new Or(branches);
}

function increasingEdges(cells) {
  const edges = [];
  for (let i = 0; i + 1 < cells.length; i++) {
    edges.push(valueRelation(
      'thermo', cells[i], cells[i + 1], (x, y) => x < y));
  }
  return edges;
}

// Thermometers, bulb to tip -- cell order taken from each drawn line's own
// path, oriented so it starts at the cell carrying the bulb-shaped,
// bulb-coloured overlay circle.
const thermos = [
  ['R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C2', 'R4C3', 'R4C4', 'R3C4'],
  ['R7C5', 'R6C5', 'R6C6', 'R6C7', 'R7C7', 'R8C7', 'R8C8', 'R8C9', 'R9C9', 'R9C8'],
  ['R4C7', 'R5C7', 'R4C6', 'R3C5', 'R2C5', 'R1C5'],
  ['R7C1', 'R8C2', 'R8C3'],
  ['R1C6', 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8'],
  ['R3C3', 'R2C3', 'R1C3'],
  ['R6C3', 'R6C4'],
];
const thermoRules = thermos.flatMap(increasingEdges);

// Black dots: the value of one cell is double the value of the other.
const dots = [
  ['R6C8', 'R6C9'],
  ['R1C4', 'R2C4'],
  ['R6C2', 'R7C2'],
  ['R8C4', 'R8C5'],
  ['R3C9', 'R4C9'],
];
const dotRules = dots.map(([a, b]) => valueRelation(
  'dot', a, b, (x, y) => x === 2 * y || y === 2 * x));

return [
  new Shape('9x9'),
  new YinYang(),
  ...thermoRules,
  ...dotRules,
];
