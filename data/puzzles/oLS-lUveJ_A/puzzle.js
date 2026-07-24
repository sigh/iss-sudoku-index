// Title: Halfway There
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=oLS-lUveJ_A
// Source: https://sudokupad.app/james-sinclair/halfway-there

// Normal Sudoku rules apply. One halver lies in every row, column, and box;
// the nine halvers hold 1-9 once each. Values are doubled here: a halver has
// scaled value digit, while an ordinary cell has scaled value twice its digit.
const HALF = 1;
const FULL = 2;
const graph = cellGraph('9x9');
const halver = graph.makeOverlay('VH');
const halverOf = cell => halver.at(cell);
const cells = graph.cells();
const halverCells = halver.at(cells);

const scaledSum = target => NFA.encodeSpec({
  startState: { phase: 'flag', total: 0 },
  transition: ({ phase, total, flag }, value) => phase === 'flag'
    ? (value === HALF || value === FULL ? { phase: 'digit', total, flag: value } : undefined)
    : (() => {
      const next = total + (flag === HALF ? value : 2 * value);
      return next > target ? undefined : { phase: 'flag', total: next };
    })(),
  accept: ({ phase, total }) => phase === 'flag' && total === target,
}, 9);

const arrowSum = NFA.encodeSpec({
  startState: { phase: 'circle-flag', circle: null, total: 0 },
  transition: (state, value) => {
    if (state.phase === 'circle-flag') {
      return value === HALF || value === FULL ? { ...state, phase: 'circle-digit', flag: value } : undefined;
    }
    if (state.phase === 'circle-digit') {
      return { phase: 'arm-flag', circle: state.flag === HALF ? value : 2 * value, total: 0 };
    }
    if (state.phase === 'arm-flag') {
      return value === HALF || value === FULL ? { ...state, phase: 'arm-digit', flag: value } : undefined;
    }
    const total = state.total + (state.flag === HALF ? value : 2 * value);
    return total > state.circle ? undefined : { phase: 'arm-flag', circle: state.circle, total };
  },
  accept: ({ phase, circle, total }) => phase === 'arm-flag' && total === circle,
}, 9);

const increasingValues = NFA.encodeSpec({
  startState: { phase: 'flag', previous: null },
  transition: ({ phase, previous, flag }, value) => {
    if (phase === 'flag') return value === HALF || value === FULL
      ? { phase: 'digit', previous, flag: value } : undefined;
    const next = flag === HALF ? value : 2 * value;
    return previous !== null && next <= previous ? undefined : { phase: 'flag', previous: next };
  },
  accept: ({ phase }) => phase === 'flag',
}, 9);

const halverDigits = NFA.encodeSpec({
  startState: { phase: 'flag', seen: 0 },
  transition: ({ phase, seen, flag }, value) => {
    if (phase === 'flag') return value === HALF || value === FULL
      ? { phase: 'digit', seen, flag: value } : undefined;
    if (flag !== HALF) return { phase: 'flag', seen };
    const bit = 1 << (value - 1);
    return (seen & bit) ? undefined : { phase: 'flag', seen: seen | bit };
  },
  accept: ({ phase, seen }) => phase === 'flag' && seen === 511,
}, 9);

const valueStream = group => group.flatMap(cell => [halverOf(cell), cell]);
const sumValues = (target, group) => new NFA(scaledSum(target), 'scaled-sum', ...valueStream(group));
const arrowValues = (circle, arm) => new NFA(arrowSum, 'scaled-arrow', ...valueStream([circle, ...arm]));

const cages = [
  { sum: 36, cells: ['R3C1', 'R3C2', 'R4C1', 'R4C2', 'R5C1', 'R6C1'] },
  { sum: 36, cells: ['R1C3', 'R1C4', 'R1C5', 'R2C3', 'R2C4', 'R2C5'] },
  { sum: 48, cells: ['R7C8', 'R8C7', 'R8C8'] },
];

const thermos = [
  ['R6C1', 'R5C1', 'R4C1', 'R3C1', 'R3C2', 'R4C2'],
  ['R9C2', 'R9C3', 'R8C2'],
];

const arrows = [
  ['R6C8', ['R7C7', 'R8C6']],
  ['R4C3', ['R5C4', 'R4C5']],
  ['R9C9', ['R9C8', 'R8C9']],
  ['R4C6', ['R3C5', 'R2C5']],
];

const vPairs = [['R8C2', 'R9C2'], ['R5C4', 'R5C5']];
const xPairs = [['R3C2', 'R3C3'], ['R1C9', 'R2C9'], ['R2C9', 'R3C9'], ['R7C7', 'R7C8'], ['R5C5', 'R6C5']];

return [
  new Shape('9x9'),
  halver.toVar('halver status'),
  halver.makeReplicate([new Given(halverCells[0], HALF, FULL)], halverCells),
  ...graph.rows().map(row => new Sum(17, ...halver.at(row))),
  ...graph.columns().map(column => new Sum(17, ...halver.at(column))),
  ...graph.boxes().map(box => new Sum(17, ...halver.at(box))),
  new NFA(halverDigits, 'halver-digits', ...valueStream(cells)),
  ...cages.flatMap(({ sum, cells: cage }) => [new AllDifferent(...cage), sumValues(sum, cage)]),
  ...thermos.map(thermo => new NFA(increasingValues, 'value-thermo', ...valueStream(thermo))),
  ...arrows.map(([circle, arm]) => arrowValues(circle, arm)),
  ...vPairs.map(pair => sumValues(10, pair)),
  ...xPairs.map(pair => sumValues(20, pair)),
];
