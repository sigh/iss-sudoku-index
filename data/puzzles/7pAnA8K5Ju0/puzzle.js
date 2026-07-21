// Title: Another World
// Author: Artham
// Video: https://www.youtube.com/watch?v=7pAnA8K5Ju0
// Source: https://sudokupad.app/00tjfy70pd

// Normal Sudoku rules do not apply. The puzzle digits live in a 9x9 Var
// overlay because ISS main-grid rows and columns are always all-different.
// ConnectedValues requires that overlay to match the main-grid dimensions, so
// the backing 9x9 grid is pinned to a fixed completed Sudoku and is inert.
const N = 9;
const VALUE_COUNT = 10;
const OFF = 10;
const DIGITS = Array.from({ length: N }, (_, i) => i + 1);
const ref = cellGraph('9x9');
const digits = ref.makeOverlay('VG');
const block = ref.makeOverlay('VB');
const cells = digits.cells();
const placeholder = ref.cells();
const placeholderSolution = [
  '123456789', '456789123', '789123456',
  '234567891', '567891234', '891234567',
  '345678912', '678912345', '912345678',
].join('');
const at = (row, col) => digits.at(makeCellId(row, col));

// Each digit occurs exactly nine times. A cell with an equal neighbour must be
// marked in VB with its digit; an isolated occurrence may be marked or OFF.
// ConnectedValues therefore selects the one adjacent block, or one canonical
// singleton when that digit has no block at all.
const multiset = Array.from({ length: N }, (_, i) =>
  Array(N).fill(i + 1)).flat().join('_');
const blockMembershipSpec = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'label', digit: value };
    if (state.phase === 'label') {
      if (value !== state.digit && value !== OFF) return undefined;
      return { phase: 'neighbours', digit: state.digit, selected: value === state.digit, hasSame: false };
    }
    return { ...state, hasSame: state.hasSame || value === state.digit };
  },
  accept: ({ phase, selected, hasSame }) =>
    phase === 'neighbours' && (selected || !hasSame),
  maxDepth: 6,
}, VALUE_COUNT);
const blockMembership = ref.cells().map(cell => new NFA(
  blockMembershipSpec,
  'adjacent block membership',
  digits.at(cell),
  block.at(cell),
  ...digits.at(ref.neighbours(cell)),
));
const digitBlocks = DIGITS.map(digit => new ConnectedValues('VB', digit));

// When a digit has no adjacent block, ConnectedValues needs one selected cell.
// Select its first row-major occurrence to remove that auxiliary symmetry. If
// two or more cells are selected, they are the real adjacent block instead.
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

// Within every row and column, a given digit may occupy only one contiguous
// run. One compact three-phase machine enforces this for one target digit.
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
const contiguousRuns = Array.from({ length: N }, (_, i) => i + 1).flatMap(target => {
  const spec = contiguousSpec(target);
  return [...ref.rows(), ...ref.columns()].map((line, index) => new NFA(
    spec,
    `contiguous ${target} ${index < N ? 'row' : 'column'}`,
    ...digits.at(line),
  ));
});

// The center 3x3 region has no repeats. Its eight perimeter cells count odd
// digits in the correspondingly positioned outer 3x3 region.
const centerRegion = digits.at(ref.box(5));
const regionCountPairs = [
  ['R4C4', 1], ['R4C5', 2], ['R4C6', 3], ['R5C4', 4],
  ['R5C6', 6], ['R6C4', 7], ['R6C5', 8], ['R6C6', 9],
];
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
  digits.at(control),
  ...digits.at(ref.box(box)),
));

// Negative X applies to every orthogonal grid adjacency.
const notXKey = Pair.fnToKey((a, b) => a + b !== 10, VALUE_COUNT);
const negativeX = [...ref.rows(), ...ref.columns()].map(line =>
  new Pair(notXKey, 'not X', ...digits.at(line)));

const oppositeParityKey = Pair.fnToKey((a, b) => a % 2 !== b % 2, VALUE_COUNT);
const greenDots = [
  ['R1C6', 'R2C6'], ['R5C9', 'R6C9'], ['R1C2', 'R1C3'],
  ['R9C7', 'R9C8'], ['R6C3', 'R7C3'], ['R6C1', 'R6C2'],
].map(pair => new Pair(oppositeParityKey, 'opposite parity', ...digits.at(pair)));

// Each pink line is an arithmetic progression in drawn order. The repeated
// first cell on the final path includes its visually drawn closing edge.
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
  new NFA(sequenceSpec, 'constant-difference sequence', ...digits.at(line)));

// X-sums are scanned from the indicated edge. The first value sets how many
// cells contribute, and the bounded running sum is compared with the clue.
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
  [31, ref.column(1)],
  [16, ref.column(4)],
  [36, ref.column(5)],
  [25, [...ref.column(4)].reverse()],
  [16, [...ref.column(9)].reverse()],
  [42, ref.row(3)],
  [11, ref.row(5)],
  [28, ref.row(6)],
  [11, [...ref.row(3)].reverse()],
  [34, [...ref.row(9)].reverse()],
].map(([target, line]) => new NFA(
  xSumSpec(target),
  `X-sum ${target}`,
  ...digits.at(line),
));

return [
  new Shape('9x9', VALUE_COUNT),
  digits.toVar('Another World grid'),
  block.toVar('adjacent block labels'),
  ...placeholder.map((cell, i) => new Given(cell, Number(placeholderSolution[i]))),
  digits.makeReplicate(new Given(cells[0], ...DIGITS)),
  new Given(at(4, 5), 1),
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
