// Title: Another World
// Author: Artham
// Video: https://www.youtube.com/watch?v=7pAnA8K5Ju0
// Source: https://sudokupad.app/00tjfy70pd

// Normal Sudoku rules do not apply: rows, columns and the outer regions may
// repeat digits, so the grid is Raw: no implicit constraints.
//
// Rules encoded below, in order:
//  - the 81 cells hold the digits 1-9, nine times each;
//  - within a row or a column, the occurrences of a digit are consecutive;
//  - over the whole grid, the cells that have an orthogonally adjacent equal
//    digit form at most one connected block per digit;
//  - the central 3x3 region has no repeated digit, and each of its cells gives
//    the number of odd digits in the correspondingly placed outer region;
//  - no two orthogonally adjacent cells sum to 10;
//  - green-dot pairs have opposite parity;
//  - each pink line is an arithmetic progression in drawn order;
//  - each outside clue is an X-sum for its row or column.
// Nothing in the rules text is left out.
const N = 9;
// Values 1-9 are the digits; 10 is the block layer's "not in a block" marker.
const VALUE_COUNT = 10;
const OFF = 10;
const DIGITS = Array.from({ length: N }, (_, i) => i + 1);

const shape = new Shape('9x9', VALUE_COUNT, 'Raw');
const graph = cellGraph(shape);
// The block marker layer of the one-block rule below. It comes after the
// main grid in cell layout, and ConnectedValues rejects the group that lands
// at cell offset 0.
const block = graph.makeOverlay('VZ');
const cells = graph.cells();

const multiset = DIGITS.flatMap(digit => Array(N).fill(digit)).join('_');

// The one-block rule, in two parts. VZ marks the cells of the selected block:
// a cell may carry its own digit ("selected") or OFF, and a cell with an equal
// orthogonal neighbour must be selected. ConnectedValues then forces the
// selected cells of each digit to be a single connected region, so the cells
// with an equal neighbour cannot split into two blocks.
const blockMembershipSpec = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'label', digit: value };
    if (state.phase === 'label') {
      if (value !== state.digit && value !== OFF) return undefined;
      return {
        phase: 'neighbours',
        digit: state.digit,
        selected: value === state.digit,
        hasSame: false,
      };
    }
    return { ...state, hasSame: state.hasSame || value === state.digit };
  },
  accept: ({ phase, selected, hasSame }) =>
    phase === 'neighbours' && (selected || !hasSame),
  maxDepth: 6,  // digit, label, and up to four neighbouring digits
}, VALUE_COUNT);
const blockMembership = graph.cells().map(cell => new NFA(
  blockMembershipSpec,
  'adjacent block membership',
  cell,
  block.at(cell),
  ...graph.neighbours(cell),
));
const digitBlocks = DIGITS.map(digit => new ConnectedValues('VZ', digit));

// ConnectedValues requires a non-empty selection, but a digit is allowed to
// have no block at all. Such a digit therefore selects one cell, and this pins
// it to the first occurrence in reading order so the marker layer stays
// determined by the digits. Two or more selected cells are the real block.
const interleavedDigitLabels = cells.flatMap((cell, i) => [cell, block.cells()[i]]);
const canonicalSingletons = DIGITS.map(target => {
  const spec = NFA.encodeSpec({
    startState: {
      phase: 'digit', targetSeen: false, selected: 0, loneIsFirst: false,
    },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        return { ...state, phase: 'label', currentIsTarget: value === target };
      }
      const isSelected = value === target;
      return {
        phase: 'digit',
        targetSeen: state.targetSeen || state.currentIsTarget,
        selected: Math.min(2, state.selected + (isSelected ? 1 : 0)),
        loneIsFirst: state.selected === 0 && isSelected
          ? !state.targetSeen
          : state.loneIsFirst,
      };
    },
    accept: ({ phase, selected, loneIsFirst }) =>
      phase === 'digit' && (selected >= 2 || (selected === 1 && loneIsFirst)),
    maxDepth: cells.length * 2,
  }, VALUE_COUNT);
  return new NFA(spec, `canonical block for ${target}`, ...interleavedDigitLabels);
});

// One target digit occupies at most one run of a row or column: the machine
// passes from before the run, through it, to after it, and may not re-enter.
const contiguousSpec = (target) => NFA.encodeSpec({
  startState: { phase: 'before' },
  transition: ({ phase }, value) => {
    if (phase === 'before') return { phase: value === target ? 'inside' : 'before' };
    if (phase === 'inside') return { phase: value === target ? 'inside' : 'after' };
    return value === target ? undefined : { phase: 'after' };
  },
  accept: () => true,
  maxDepth: N,
}, VALUE_COUNT);
const contiguousRuns = DIGITS.flatMap(target => {
  const spec = contiguousSpec(target);
  return [...graph.rows(), ...graph.columns()].map((line, index) => new NFA(
    spec,
    `contiguous ${target} ${index < N ? 'row' : 'column'}`,
    ...line,
  ));
});

// Boxes are built explicitly: a Raw grid has no default box regions.
const boxes = [];
for (let r = 1; r <= 9; r += 3) {
  for (let c = 1; c <= 9; c += 3) {
    boxes.push(graph.block(makeCellId(r, c), 3, 3));
  }
}

// The central region's cells point at the outer region in the same position,
// so R4C4 counts box 1, R4C5 box 2, and so on; R5C5 points at itself and is
// not a clue.
const centerRegion = boxes[4];
const regionCountPairs = [
  ['R4C4', 1], ['R4C5', 2], ['R4C6', 3], ['R5C4', 4],
  ['R5C6', 6], ['R6C4', 7], ['R6C5', 8], ['R6C6', 9],
];
// First cell is the count, the remaining nine are the region it counts.
const oddCountSpec = NFA.encodeSpec({
  startState: { phase: 'control' },
  transition: (state, value) => {
    if (state.phase === 'control') return { phase: 'count', target: value, count: 0 };
    const count = state.count + (value % 2);
    return count > state.target ? undefined : { ...state, count };
  },
  accept: ({ phase, target, count }) => phase === 'count' && count === target,
  maxDepth: 10,
}, VALUE_COUNT);
const regionCounts = regionCountPairs.map(([control, box]) => new NFA(
  oddCountSpec,
  'outer region odd count',
  control,
  ...boxes[box - 1],
));

const notXKey = Pair.fnToKey((a, b) => a + b !== 10, VALUE_COUNT);
const negativeX = [...graph.rows(), ...graph.columns()].map(line =>
  new Pair(notXKey, 'not X', ...line));

// Green dots, read off the drawn edge circles.
const oppositeParityKey = Pair.fnToKey((a, b) => a % 2 !== b % 2, VALUE_COUNT);
const greenDots = [
  ['R1C6', 'R2C6'], ['R5C9', 'R6C9'], ['R1C2', 'R1C3'],
  ['R9C7', 'R9C8'], ['R6C3', 'R7C3'], ['R6C1', 'R6C2'],
].map(pair => new Pair(oppositeParityKey, 'opposite parity', ...pair));

// The pink lines, in drawn waypoint order. The last one is drawn as a closed
// loop -- its waypoint list returns to R7C9 -- so that closing step is part of
// the sequence.
const sequenceLines = [
  ['R6C5', 'R7C5', 'R8C5'],
  ['R5C6', 'R5C7', 'R6C7'],
  ['R9C4', 'R9C3', 'R9C2'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R4C1', 'R3C1', 'R2C1'],
  ['R5C2', 'R4C2', 'R3C2'],
  ['R1C2', 'R1C1', 'R2C2'],
  ['R3C8', 'R4C8', 'R5C8'],
  ['R6C3', 'R5C3', 'R6C2'],
  ['R7C9', 'R8C9', 'R8C8', 'R7C8', 'R7C9'],
];
// The first two cells fix the difference; every later step must repeat it.
const sequenceSpec = NFA.encodeSpec({
  startState: { phase: 'first' },
  transition: (state, value) => {
    if (state.phase === 'first') return { phase: 'second', previous: value };
    if (state.phase === 'second') {
      return { phase: 'rest', previous: value, difference: value - state.previous };
    }
    return value - state.previous === state.difference
      ? { ...state, previous: value }
      : undefined;
  },
  accept: ({ phase }) => phase === 'rest',
  maxDepth: 5,
}, VALUE_COUNT);
const sequences = sequenceLines.map(line =>
  new NFA(sequenceSpec, 'constant-difference sequence', ...line));

// X-sums, over the cells in scanning order from the clued edge. The first cell
// both contributes to the sum and says how many cells are summed.
const xSumSpec = (target) => NFA.encodeSpec({
  startState: { phase: 'first' },
  transition: (state, value) => {
    if (state.phase === 'first') {
      return value > 1
        ? { phase: 'sum', remaining: value - 1, sum: value }
        : { phase: 'done', remaining: 0, sum: value };
    }
    if (state.phase === 'done') return state;
    const sum = state.sum + value;
    if (sum > target) return undefined;
    return state.remaining === 1
      ? { phase: 'done', remaining: 0, sum }
      : { phase: 'sum', remaining: state.remaining - 1, sum };
  },
  accept: ({ phase, sum }) => phase === 'done' && sum === target,
  maxDepth: N,
}, VALUE_COUNT);
const xSumClues = [
  [31, graph.column(1)],
  [16, graph.column(4)],
  [36, graph.column(5)],
  [25, [...graph.column(4)].reverse()],
  [16, [...graph.column(9)].reverse()],
  [42, graph.row(3)],
  [11, graph.row(5)],
  [28, graph.row(6)],
  [11, [...graph.row(3)].reverse()],
  [34, [...graph.row(9)].reverse()],
].map(([target, line]) => new NFA(
  xSumSpec(target),
  `X-sum ${target}`,
  ...line,
));

return [
  shape,
  block.toVar('adjacent block labels'),
  new Given(makeCellId(4, 5), 1),
  new ContainExact(multiset, ...cells),
  ...blockMembership,
  ...digitBlocks,
  ...canonicalSingletons,
  ...contiguousRuns,
  new AllDifferent(...centerRegion),
  ...regionCounts,
  ...negativeX,
  ...greenDots,
  ...sequences,
  ...xSumClues,
];
