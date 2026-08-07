// Title: Unusually Hot
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=bVB6D4T-g9k
// Source: https://sudokupad.app/pvo44ijd8p

// Normal sudoku rules (rows, columns, boxes) apply by default.
//
// The solver partitions every cell into two orthogonally connected regions,
// GREEN and ORANGE (VG overlay below), with no 2x2 area fully inside one
// region. A cell's "value" is its digit when GREEN, or its fixed row+column
// number when ORANGE -- a constant that does not depend on the digit placed
// there. Thermometers increase strictly in value from bulb to tip; black
// dots relate two cells' values by doubling. Both rules are encoded as a
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
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const region = graph.makeOverlay('VG');

// Every cell is GREEN or ORANGE.
const firstRegion = region.cells()[0];
const regionDomain = region.makeReplicate(
  new Given(firstRegion, GREEN, ORANGE));

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

// No 2x2 area may lie fully within one region: one NFA machine checking the
// top-left block's four cells are not all the same region, replicated to
// every block origin. This scans the 2-valued (GREEN/ORANGE) region overlay,
// never grid digits, but takes the Shape's numValues (9) as its declared
// alphabet -- a safe upper bound the lint tool can verify.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = region.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...region.at(graph.block(gridCells[0], 2, 2))),
  region.at(blockOrigins));

return [
  new Shape('9x9'),
  region.toVar('region'),
  regionDomain,
  // Region connectivity: each colour forms one orthogonally connected area.
  new ConnectedValues('VG', GREEN),
  new ConnectedValues('VG', ORANGE),
  noMono2x2,
  ...thermoRules,
  ...dotRules,
];
