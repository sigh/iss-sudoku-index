// Title: Polar Foil
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=BEbVKbSyZK0
// Source: https://sudokupad.app/james-sinclair/polar-foil

// Select nine non-overlapping 3x3 regions on the 11x11 canvas. Each region
// contains 1-9 once, digits do not repeat in a row or column, and other cells
// are empty. Digit cells are connected. Empty cells form one orthogonal loop
// that does not branch or touch itself diagonally.
//
// Every drawn clue is "wrogn": active thermometer digits strictly decrease;
// each region-sum-line segment has a different sum; renban digits are mutually
// unequal and nonconsecutive; Nabner digits form a nonrepeating consecutive
// set; squares are odd and circles are even. Empty clue cells are ignored.
// Anti-rook is the chess constraint that applies, as it is already required by
// the row/column no-repeat rule. Every rule is encoded.
//
// Rows/columns repeat digits (cells outside the nine selected 3x3 regions are
// empty, not a Latin square), so the grid is Raw: no implicit constraints.

const EMPTY = 10;
const UNSELECTED = 1;
const SELECTED = 2;

const shape = new Shape('11x11', EMPTY, 'Raw');
const canvas = cellGraph(shape);
const cornerGrid = cellGraph('9x9');
const occupied = canvas.makeOverlay('VO');
const corner = cornerGrid.makeOverlay('VC');
const occupiedVar = occupied.toVar('region occupancy and empty loop');
const cornerVar = corner.toVar('3x3 region top-left');
const canvasCells = canvas.cells();
const cornerCells = cornerGrid.cells();

const cells = coordinates => coordinates.map(([row, col]) => makeCellId(row, col));

// Drawn typed paths and parity markers from the committed f-puzzles geometry.
const thermometers = [
  cells([[9,7],[9,6],[9,5],[8,4],[8,3],[8,2]]),
  cells([[3,7],[3,6],[3,5],[4,4],[4,3],[4,2],[4,1],[3,1],[2,1],[1,1]]),
  cells([[1,9],[1,10],[1,11],[2,11],[3,11],[4,11],[5,10],[6,10]]),
  cells([[7,3],[7,2],[6,2],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1]]),
  cells([[10,9],[10,10],[10,11],[11,11],[11,10],[11,9],[11,8],[11,7],[11,6],[11,5]]),
];
const renbans = [
  cells([[3,8],[3,9],[3,10]]),
  cells([[9,8],[9,9],[9,10]]),
  cells([[1,2],[2,2],[2,3],[1,3]]),
];
const regionSumLines = [
  cells([[2,5],[2,4],[3,4],[3,3],[3,2]]),
  cells([[5,1],[5,2],[5,3],[6,3],[6,4],[7,4],[7,5],[8,5]]),
  cells([[11,4],[11,3],[11,2],[10,2],[9,2],[9,3],[9,4],[10,5]]),
  cells([[8,7],[8,8]]),
  cells([[10,7],[10,8]]),
];
const nabners = [
  cells([[6,6],[5,6],[4,6]]),
  cells([[5,8],[4,8]]),
  cells([[7,6],[7,7],[7,8]]),
  cells([[9,11],[8,11],[8,10],[7,10],[7,11],[6,11],[5,11]]),
  cells([[2,9],[2,8],[2,7],[1,7],[1,6],[1,5],[1,4]]),
];
const drawnSquares = cells([[2,6],[5,4],[6,6]]);
const drawnCircles = cells([[6,9],[8,9]]);

const domains = [
  canvas.makeReplicate(new Given(canvasCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9, EMPTY)),
  occupied.makeReplicate(new Given(occupied.cells()[0], UNSELECTED, SELECTED)),
  corner.makeReplicate(new Given(corner.cells()[0], UNSELECTED, SELECTED)),
];

// Exactly nine top-left corners are chosen. Coverage equations make a canvas
// cell occupied iff one chosen 3x3 corner covers it, also forbidding overlap.
const cornerCount = new Sum(corner.cells().length + 9, ...corner.cells());
const regions = cornerCells.map(topLeft => ({
  topLeft,
  cornerCell: corner.at(topLeft),
  block: canvas.block(topLeft, 3, 3),
  canvasBlock: canvas.block(topLeft, 3, 3),
}));
const coverage = canvasCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const covering = [];
  for (let topRow = Math.max(1, row - 2); topRow <= Math.min(9, row); topRow++) {
    for (let topCol = Math.max(1, col - 2); topCol <= Math.min(9, col); topCol++) {
      covering.push(cornerVar.cell(topRow, topCol));
    }
  }
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
const candidateRegions = regions.map(({ cornerCell, block }) => new Or([
  new Given(cornerCell, UNSELECTED),
  new AllDifferent(...block),
]));

// Empty may repeat; nonempty digits may not repeat in any row or column.
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
const noRowColumnRepeats = [...canvas.rows(), ...canvas.columns()].map(group =>
  new NFA(noRepeatedDigitsMachine, 'no repeated digits', ...group));

// The empty cells are a connected degree-2 set, hence one loop. A 2x2 cannot
// contain only a diagonal empty pair, which closes the no-diagonal-touch rule.
const emptyDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: ({ phase, count }, value) => {
    if (phase === 'self') {
      return value === UNSELECTED
        ? { phase: 'empty', count: 0 }
        : { phase: 'digit' };
    }
    if (phase === 'digit') return { phase: 'digit' };
    const next = count + (value === UNSELECTED ? 1 : 0);
    return next > 2 ? undefined : { phase: 'empty', count: next };
  },
  accept: ({ phase, count }) => phase === 'digit' || count === 2,
}, shape);
const interiorCells = canvasCells.filter(cell => canvas.neighbours(cell).length === 4);
const boundaryCells = canvasCells.filter(cell => canvas.neighbours(cell).length !== 4);
const degreeTemplateCell = interiorCells[0];
const emptyDegrees = [
  new Replicate(
    [new NFA(
      emptyDegreeMachine,
      'empty-loop degree',
      ...occupied.at([degreeTemplateCell, ...canvas.neighbours(degreeTemplateCell)]),
    )],
    Replicate.encodeTargetCells(
      occupied.at(interiorCells),
      occupied.at(degreeTemplateCell),
      occupied,
    ),
    occupied.at(degreeTemplateCell),
  ),
  ...boundaryCells.map(cell => new NFA(
    emptyDegreeMachine,
    'empty-loop degree',
    ...occupied.at([cell, ...canvas.neighbours(cell)]),
  )),
];
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === UNSELECTED];
    if (next.length < 4) return { block: next };
    const [a, b, c, d] = next;
    const diagonalOnly = (a && d && !b && !c) || (b && c && !a && !d);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, shape);
const blockOrigins = canvasCells.filter(cell => canvas.block(cell, 2, 2));
const noDiagonalTouches = occupied.makeReplicate(
  new NFA(
    noDiagonalTouchMachine,
    'empty-loop no diagonal touch',
    ...occupied.at(canvas.block(canvasCells[0], 2, 2)),
  ),
  occupied.at(blockOrigins),
);

// A wrogn thermometer's active subsequence is strictly decreasing.
const decreasingMachine = NFA.encodeSpec({
  startState: { previous: null },
  transition: ({ previous }, value) => {
    if (value === EMPTY) return { previous };
    return previous === null || previous > value ? { previous: value } : undefined;
  },
  accept: () => true,
}, shape);
const wrognThermometers = thermometers.map(path =>
  new NFA(decreasingMachine, 'wrogn thermometer', ...path));

// A wrogn renban has no equal or consecutive pair among its active digits.
const antiRenbanMachine = NFA.encodeSpec({
  startState: { mask: 0 },
  transition: ({ mask }, value) => {
    if (value === EMPTY) return { mask };
    const bit = 1 << (value - 1);
    const neighbours = bit | (bit >> 1) | (bit << 1);
    return mask & neighbours ? undefined : { mask: mask | bit };
  },
  accept: () => true,
}, shape);
const wrognRenbans = renbans.map(path =>
  new NFA(antiRenbanMachine, 'wrogn renban', ...path));

// The stated wrogn-Nabner degree conditions are exactly a nonrepeating,
// gap-free interval of at least two active digits.
const renbanSetMachine = NFA.encodeSpec({
  startState: { mask: 0 },
  transition: ({ mask }, value) => {
    if (value === EMPTY) return { mask };
    const bit = 1 << (value - 1);
    return mask & bit ? undefined : { mask: mask | bit };
  },
  accept: ({ mask }) => {
    if ((mask & (mask - 1)) === 0) return false;
    let shifted = mask;
    while ((shifted & 1) === 0) shifted >>= 1;
    while ((shifted & 1) === 1) shifted >>= 1;
    return shifted === 0;
  },
}, shape);
const wrognNabners = nabners.map(path =>
  new NFA(renbanSetMachine, 'wrogn nabner', ...path));

// A selected 3x3 region cuts each blue path wherever that block intersects the
// ordered path. Every resulting selected segment must have a distinct sum.
const blocksOverlap = (left, right) => {
  const rightCells = new Set(right.canvasBlock);
  return left.canvasBlock.some(cell => rightCells.has(cell));
};
const unequalSumMachines = new Map();
function unequalSumMachine(flagCount, leftLength, rightLength) {
  const key = `${flagCount}:${leftLength}:${rightLength}`;
  if (unequalSumMachines.has(key)) return unequalSumMachines.get(key);
  const total = flagCount + leftLength + rightLength;
  const machine = NFA.encodeSpec({
    startState: { index: 0, enabled: true, difference: 0 },
    transition: ({ index, enabled, difference }, value) => {
      if (index >= total) return undefined;
      if (index < flagCount) {
        return {
          index: index + 1,
          enabled: enabled && value === SELECTED,
          difference,
        };
      }
      if (!enabled) return { index: index + 1, enabled, difference };
      const puzzleValue = value === EMPTY ? 0 : value;
      const leftEnd = flagCount + leftLength;
      const nextDifference = index < leftEnd
        ? difference + puzzleValue
        : difference - puzzleValue;
      return { index: index + 1, enabled, difference: nextDifference };
    },
    accept: ({ index, enabled, difference }) =>
      index === total && (!enabled || difference !== 0),
  }, shape);
  unequalSumMachines.set(key, machine);
  return machine;
}
function lineSegments(path) {
  const segments = [];
  for (const region of regions) {
    const block = new Set(region.canvasBlock);
    let run = [];
    for (const cell of path) {
      if (block.has(cell)) {
        run.push(cell);
      } else if (run.length) {
        segments.push({ region, cells: run });
        run = [];
      }
    }
    if (run.length) segments.push({ region, cells: run });
  }
  return segments;
}
const wrognRegionSumLines = regionSumLines.flatMap(path => {
  const segments = lineSegments(path);
  return segments.flatMap((left, leftIndex) =>
    segments.slice(leftIndex + 1).flatMap(right => {
      if (left.region !== right.region && blocksOverlap(left.region, right.region)) return [];
      const sameRegion = left.region === right.region;
      const flags = sameRegion
        ? [left.region.cornerCell]
        : [left.region.cornerCell, right.region.cornerCell];
      return [new NFA(
        unequalSumMachine(flags.length, left.cells.length, right.cells.length),
        'wrogn region-sum segments',
        ...flags,
        ...left.cells,
        ...right.cells,
      )];
    }));
});

// Wrogn parity reverses the standard square/circle meanings; empty cells are
// permitted because every clue ignores cells outside the selected regions.
const wrognParity = [
  ...drawnSquares.map(cell => new Given(cell, 1, 3, 5, 7, 9, EMPTY)),
  ...drawnCircles.map(cell => new Given(cell, 2, 4, 6, 8, EMPTY)),
];

return [
  shape,
  occupiedVar,
  cornerVar,
  ...domains,
  cornerCount,
  ...coverage,
  ...digitOccupancy,
  ...candidateRegions,
  ...noRowColumnRepeats,
  new ConnectedValues('VO', SELECTED),
  new ConnectedValues('VO', UNSELECTED),
  ...emptyDegrees,
  noDiagonalTouches,
  ...wrognThermometers,
  ...wrognRegionSumLines,
  ...wrognRenbans,
  ...wrognNabners,
  ...wrognParity,
];
