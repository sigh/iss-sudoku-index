// Title: Yin Yang Killer Deconstruction [9x9]
// Author: Christounet
// Video: https://www.youtube.com/watch?v=i_465Hc01hY
// Source: https://sudokupad.app/bL36N3P9tH

// Select nine non-overlapping 3x3 regions on the 11x11 canvas. Each contains
// 1-9 once, digits do not repeat in any row or column, and other cells are empty.
//
// The whole canvas is a Yin-Yang grid: both shades are orthogonally connected
// and no 2x2 is monochromatic. Cage digits do not repeat, and each numeric clue
// sums either its shaded digits or its unshaded digits. Every rule is encoded.

const EMPTY = 10;
const SHADED = 1;
const UNSHADED = 2;
const UNSELECTED = 1;
const SELECTED = 2;

// Off-region cells repeat EMPTY, which a Sudoku grid's implicit row/column
// all-different would reject, so the grid is Raw: no implicit constraints.
const shape = new Shape('11x11', 10, 'Raw');
const graph = cellGraph(shape);
const cornerGrid = cellGraph('9x9');
const shade = graph.makeOverlay('YY');
const occupied = graph.makeOverlay('VO');
const corner = cornerGrid.makeOverlay('VC');

const canvasCells = graph.cells();
const cornerCells = cornerGrid.cells();

// Drawn cage cell lists and top-left totals.
const cages = [
  { total: 2, cells: ['R2Cb', 'R3Cb', 'R4Cb', 'R5Cb', 'R6Cb', 'R7Cb', 'R8Cb', 'R9Cb', 'RaCb'] },
  { total: 25, cells: ['R1C8', 'R1C9', 'R1Ca', 'R2C8', 'R2C9', 'R2Ca'] },
  { total: 24, cells: ['R3C5', 'R3C6', 'R3C7', 'R4C7'] },
  { total: 20, cells: ['R1C7', 'R2C5', 'R2C6', 'R2C7'] },
  { total: 10, cells: ['R3C8', 'R3C9', 'R3Ca'] },
  { total: 16, cells: ['R5C3', 'R6C2', 'R6C3'] },
  { total: 16, cells: ['R7C2', 'R7C3', 'R8C3'] },
  { total: 1, cells: ['R9C3', 'R9C4', 'R9C5', 'RaC3'] },
  { total: 6, cells: ['R6C4', 'R7C4', 'R8C4', 'R8C5'] },
  { total: 23, cells: ['R8C2', 'R9C2', 'RaC2', 'RaC4', 'RaC5', 'RaC6', 'RbC2', 'RbC3', 'RbC4', 'RbC6'] },
  { total: 3, cells: ['RaC7', 'RaC8', 'RbC7', 'RbC8'] },
  { total: 10, cells: ['R4C8', 'R4C9', 'R5C9', 'R6C9'] },
  { total: 24, cells: ['R1C4', 'R2C2', 'R2C3', 'R2C4'] },
  { total: 19, cells: ['R6Ca', 'R7Ca', 'R8Ca', 'R9Ca'] },
  { total: 16, cells: ['R8C9', 'R9C9', 'RaC9', 'RaCa', 'RbCa'] },
  { total: 45, cells: ['R4C4', 'R4C5', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C6', 'R6C8', 'R7C5', 'R7C6', 'R7C8', 'R8C6', 'R8C7', 'R8C8', 'R9C7', 'R9C8'] },
  { total: 14, cells: ['R3C2', 'R3C3', 'R4C3'] },
  { total: 4, cells: ['R4C2', 'R5C2'] },
  { total: 1, cells: ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'RaC1'] },
];
const greaterThanFourCell = 'R3C4';

const domains = [
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9, EMPTY)),
  occupied.makeReplicate(new Given(occupied.cells()[0], UNSELECTED, SELECTED)),
  corner.makeReplicate(new Given(corner.cells()[0], UNSELECTED, SELECTED)),
];

// Exactly nine top-left corners are chosen.
const cornerCount = new Sum(corner.cells().length + 9, ...corner.cells());

// A canvas cell is occupied exactly when one selected 3x3 corner covers it.
// Since occupancy is binary, the same equations also forbid overlapping blocks.
const coverage = canvasCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const covering = [];
  for (let topRow = Math.max(1, row - 2); topRow <= Math.min(9, row); topRow++) {
    for (let topCol = Math.max(1, col - 2); topCol <= Math.min(9, col); topCol++) {
      covering.push(corner.cells()[(topRow - 1) * 9 + topCol - 1]);
    }
  }
  // Flags are 1/2 rather than 0/1, so the baseline is covering.length - 1.
  if (covering.length === 1) {
    return new SameValues(2, covering[0], occupied.at(cell));
  }
  return new Sum(covering.length - 1, ...covering, [occupied.at(cell), -1]);
});

const digitOccupancyKey = Pair.fnToKey(
  (value, isOccupied) =>
    isOccupied === UNSELECTED ? value === EMPTY : value >= 1 && value <= 9,
  shape,
);
const digitOccupancy = canvasCells.map(cell =>
  new Pair(digitOccupancyKey, 'region occupancy', cell, occupied.at(cell)));

// A selected corner makes its whole 3x3 block a 1-9 all-different region.
const candidateRegions = cornerCells.map(topLeft => {
  const block = graph.block(topLeft, 3, 3);
  return new Or([
    new Given(corner.at(topLeft), UNSELECTED),
    new AllDifferent(...block),
  ]);
});

// Zero means empty and may repeat; nonzero digits may not repeat in a group.
const noRepeatedDigitsMachine = NFA.encodeSpec({
  startState: { mask: 0 },
  transition: ({ mask }, value) => {
    if (value === EMPTY) return { mask };
    if (value > 9) return undefined;
    const bit = 1 << (value - 1);
    return mask & bit ? undefined : { mask: mask | bit };
  },
  accept: () => true,
}, shape);
const noRowColumnRepeats = [...graph.rows(), ...graph.columns()].map(cells =>
  new NFA(noRepeatedDigitsMachine, 'no repeated digits', ...cells));
const noCageRepeats = cages.map(({ cells }) =>
  new NFA(noRepeatedDigitsMachine, 'no repeated cage digits', ...cells));

// Sum digits of one chosen shade. Inputs alternate shade, digit.
const shadeSumMachine = target => NFA.encodeSpec({
  startState: [
    { targetShade: SHADED, sum: 0, shade: null },
    { targetShade: UNSHADED, sum: 0, shade: null },
  ],
  transition: ({ targetShade, sum, shade: pendingShade }, value) => {
    if (pendingShade === null) {
      return value === SHADED || value === UNSHADED
        ? { targetShade, sum, shade: value }
        : undefined;
    }
    const contribution = value === EMPTY ? 0 : value;
    const next = sum + (pendingShade === targetShade ? contribution : 0);
    return next <= target
      ? { targetShade, sum: next, shade: null }
      : undefined;
  },
  accept: ({ sum, shade: pendingShade }) =>
    pendingShade === null && sum === target,
}, shape);

const cageSums = cages.map(({ total, cells }) => {
  const inputs = cells.flatMap(cell => [shade.at(cell), cell]);
  return new NFA(shadeSumMachine(total), 'one-colour cage sum', ...inputs);
});

return [
  shape,
  new YinYang(),
  occupied.toVar('region occupancy'),
  corner.toVar('3x3 region top-left'),
  ...domains,
  cornerCount,
  ...coverage,
  ...digitOccupancy,
  ...candidateRegions,
  ...noRowColumnRepeats,
  ...noCageRepeats,
  new Given(shade.cells()[0], SHADED),
  ...cageSums,
  new Given(greaterThanFourCell, 5, 6, 7, 8, 9),
];
