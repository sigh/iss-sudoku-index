// Title: I'll Halve What She's Halving
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=r0jA6QEbDPk
// Source: https://sudokupad.app/7b12b8k1tf

// Normal sudoku rules apply.
//
// Halvers: nine cells, one in each row, column and 3x3 box. Nothing marks
// them -- the solver places them. Each digit 1-9 must appear in a halver
// cell, so the nine halver digits are a permutation of 1-9. The value of a
// halver is half its digit; every other cell's value is its digit.
//
// Blue lines: the 3x3 box borders cut each blue line into segments (leaving
// and re-entering a box starts a new segment), and all segments of one line
// have the same sum of values. Different lines may differ.
//
// Shaded dominoes: the three shaded dominoes are clones, holding the same
// digits in the same positions -- the rules' own example (r2c3 = r5c7 =
// r9c4) fixes the correspondence as left cell to left cell, right to right.

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// The value range is widened to 0-9 so the halver overlay below can use 0 as
// its "not a halver" state; the playable grid cells are put back to 1-9.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const playableDigits = graph.makeReplicate(new Given(gridCells[0], ...digits));

// ---- Halver overlay ----
// VH(cell) is 0 when the cell is not a halver, and the cell's own digit when
// it is: one Var carries both "is this a halver" and "the halved digit".
const halver = graph.makeOverlay('VH');
const H = cell => halver.at(cell);
const zeroOrOwnDigit = Pair.fnToKey((h, d) => h === 0 || h === d, shape);
const halverStates = gridCells.map(
  cell => new Pair(zeroOrOwnDigit, 'halver flag: 0 or own digit', H(cell), cell));

// One halver per row, column and box: exactly eight of the nine overlay cells
// of each house are 0.
const eightZeros = Array(8).fill(0).join('_');
const oneHalverPerHouse = graph.houses().map(
  house => new ContainExact(eightZeros, ...halver.at(house)));

// The nine halver digits are all different, i.e. every digit is halved once.
// A row's overlay cells are eight zeroes plus the halver digit, so their sum
// is that digit.
const halverDigit = new Var('D', 'halver digit of each row', 9);
const halverDigitDomain = halverDigit.cells().map(cell => new Given(cell, ...digits));
const rowHalverDigit = graph.rows().map(
  (row, i) => new EqualSum(halver.at(row), [halverDigit.cell(i + 1)]));
const everyDigitHalved = new AllDifferent(...halverDigit.cells());

// ---- Blue lines ----
// Provenance: the seven drawn blue polylines, each listed in drawn order.
const blueLines = [
  ['R5C5', 'R5C4', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R7C4', 'R6C5', 'R7C6',
    'R7C7', 'R7C8', 'R6C8', 'R6C7'],
  ['R4C3', 'R4C2', 'R3C1', 'R3C2', 'R2C3', 'R3C4', 'R3C5', 'R2C6', 'R1C6',
    'R1C7', 'R1C8', 'R1C9'],
  ['R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9'],
  ['R6C2', 'R6C1', 'R7C1', 'R7C2', 'R8C2'],
  ['R9C3', 'R9C4', 'R9C5'],
  ['R7C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R2C9', 'R3C9', 'R4C9'],
];

const boxOfCell = new Map();
graph.boxes().forEach((cells, i) => cells.forEach(cell => boxOfCell.set(cell, i)));

// Split a drawn path wherever consecutive cells sit in different boxes. A
// path that leaves a box and comes back therefore yields two segments.
const segmentsOf = path => path.reduce((segments, cell) => {
  const current = segments[segments.length - 1];
  if (current && boxOfCell.get(current[current.length - 1]) === boxOfCell.get(cell)) {
    current.push(cell);
  } else {
    segments.push([cell]);
  }
  return segments;
}, []);

// Twice a cell's value as Sum coefficient terms: 2*digit, minus the overlay
// cell, which is the digit at a halver and 0 elsewhere. Doubling keeps the
// equations integral when an odd digit is halved.
const doubledValue = (cells, sign) =>
  cells.flatMap(cell => [[cell, 2 * sign], [H(cell), -sign]]);

// Equal segment sums, as a chain of consecutive-pair equations.
const equalSegmentSums = blueLines.flatMap(path => {
  const segments = segmentsOf(path);
  return segments.slice(1).map((segment, i) => new Sum(
    0, ...doubledValue(segments[i], 1), ...doubledValue(segment, -1)));
});

// ---- Clone dominoes ----
// Provenance: the six shaded cells, read as three left-right adjacent pairs.
const cloneDominoes = [['R2C2', 'R2C3'], ['R5C6', 'R5C7'], ['R9C3', 'R9C4']];
const clones = [0, 1].map(
  position => new SameValues(3, ...cloneDominoes.map(domino => domino[position])));

return [
  shape,
  playableDigits,
  halver.toVar('halver: 0, or the halved digit'),
  halverDigit,
  ...halverStates,
  ...oneHalverPerHouse,
  ...halverDigitDomain,
  ...rowHalverDigit,
  everyDigitHalved,
  ...equalSegmentSums,
  ...clones,
];
