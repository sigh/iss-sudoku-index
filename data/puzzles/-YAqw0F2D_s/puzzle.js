// Title: Distant Neighbors
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=-YAqw0F2D_s
// Source: https://sudokupad.app/yh755nnm1j

// A VL overlay records the two loop edges used in each cell. Edge agreement
// joins those local shapes into one or more closed loops without forbidding a
// loop from running alongside itself. The row clues count non-OFF shapes; the
// column clues sum their Sudoku digits.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = shape => shape === VERT || shape === UL || shape === UR;
const usesDown = shape => shape === VERT || shape === DL || shape === DR;
const usesLeft = shape => shape === HORIZ || shape === UL || shape === DL;
const usesRight = shape => shape === HORIZ || shape === UR || shape === DR;
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const ODD_COUNTS = [1, 3, 5, 7, 9];
const EVEN_COUNTS = [0, 2, 4, 6, 8];
const PRIME_COUNTS = [2, 3, 5, 7];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VL');

const rows = graph.rows();
const columns = graph.columns();

// Border cells cannot take a shape whose loop edge points outside the grid.
const shapeDomains = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = ALL_SHAPES.filter(shape =>
    !(row === 1 && usesUp(shape)) &&
    !(row === geometry.numRows && usesDown(shape)) &&
    !(col === 1 && usesLeft(shape)) &&
    !(col === geometry.numCols && usesRight(shape)));
  return new Given(loop.at(cell), ...allowed);
});

// Digits differ by something other than one when the first shape uses the edge
// towards the second. Edge agreement guarantees that the second shape agrees.
const distantDigitMachine = towardsOther => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') {
      return { phase: 'firstDigit', joined: towardsOther(value) };
    }
    if (state.phase === 'firstDigit') {
      return { phase: 'secondDigit', joined: state.joined, firstDigit: value };
    }
    if (!state.joined || Math.abs(state.firstDigit - value) !== 1) return { done: true };
    return undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

const agreeRight = Pair.fnToKey(
  (first, second) => usesRight(first) === usesLeft(second), geometry.numValues);
const agreeDown = Pair.fnToKey(
  (first, second) => usesDown(first) === usesUp(second), geometry.numValues);
const distantRight = distantDigitMachine(usesRight);
const distantDown = distantDigitMachine(usesDown);
const rightOrigins = gridCells.filter(cell => graph.step(cell, 0, 1));
const downOrigins = gridCells.filter(cell => graph.step(cell, 1, 0));
const edgeAgreements = [
  loop.makeReplicate(
    new Pair(agreeRight, 'loop edge agreement', ...loop.at(['R1C1', 'R1C2'])),
    loop.at(rightOrigins),
  ),
  loop.makeReplicate(
    new Pair(agreeDown, 'loop edge agreement', ...loop.at(['R1C1', 'R2C1'])),
    loop.at(downOrigins),
  ),
];
const edgeRules = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [
    ...(right ? [
      new NFA(distantRight, 'distant loop digits', loop.at(cell), cell, right),
    ] : []),
    ...(down ? [
      new NFA(distantDown, 'distant loop digits', loop.at(cell), cell, down),
    ] : []),
  ];
});

// Row clue machines scan alternating (membership, digit) pairs. The digits are
// ignored; the count changes when the shape is not OFF.
const makeCountMachine = allowed => NFA.encodeSpec({
  startState: { phase: 'membership', count: 0 },
  transition: ({ phase, count }, value) => {
    if (phase === 'digit') return { phase: 'membership', count };
    const next = count + (value !== OFF ? 1 : 0);
    return next > 9 ? undefined : { phase: 'digit', count: next };
  },
  accept: ({ phase, count }) => phase === 'membership' && allowed.includes(count),
}, geometry.numValues);
const rowCountClues = [
  ODD_COUNTS,
  ODD_COUNTS,
  [9],
  ODD_COUNTS,
  EVEN_COUNTS,
  EVEN_COUNTS,
  [6],
  PRIME_COUNTS,
  [4],
];
const rowCounts = rows.map((cells, index) => new NFA(
  makeCountMachine(rowCountClues[index]),
  'row loop count',
  ...cells.flatMap(cell => [loop.at(cell), cell]),
));

// Column clue machines add a digit only when its shape is not OFF.
const makeSumMachine = allowed => NFA.encodeSpec({
  startState: { phase: 'membership', sum: 0, selected: false },
  transition: ({ phase, sum, selected }, value) => {
    if (phase === 'membership') {
      return { phase: 'digit', sum, selected: value !== OFF };
    }
    const next = sum + (selected ? value : 0);
    return next > 45
      ? undefined
      : { phase: 'membership', sum: next, selected: false };
  },
  accept: ({ phase, sum }) => phase === 'membership' && allowed(sum),
}, geometry.numValues);
const exactSum = target => sum => sum === target;
const columnSumClues = [
  exactSum(12),
  exactSum(27),
  exactSum(6),
  exactSum(19),
  exactSum(38),
  exactSum(10),
  exactSum(13),
  sum => sum % 2 === 0,
  exactSum(42),
];
const columnSums = columns.map((cells, index) => new NFA(
  makeSumMachine(columnSumClues[index]),
  'column loop sum',
  ...cells.flatMap(cell => [loop.at(cell), cell]),
));

const whiteDots = [
  ['R1C7', 'R1C8'],
  ['R5C6', 'R5C7'],
  ['R6C3', 'R7C3'],
  ['R7C5', 'R8C5'],
].map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),
  loop.toVar('loop shape'),
  ...shapeDomains,
  ...edgeAgreements,
  ...edgeRules,
  ...rowCounts,
  ...columnSums,
  ...whiteDots,
];
