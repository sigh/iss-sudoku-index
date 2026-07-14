// Title: Rat: Chinese Zodiac
// Author: Ratfinkz
// Video: https://www.youtube.com/watch?v=GYt6eBX6kUw
// Source: https://sudokupad.app/a8e1r5ewfy

const circles = [
  'R6C4', 'R6C6', 'R4C4', 'R4C6', 'R9C5',
  'R5C1', 'R5C9', 'R2C8', 'R2C2',
];

// `directed` lines start at their drawn square. The remaining paths have no
// square and may be read from either end.
const hitLines = [
  { circle: 'R6C4', directed: true, cells: ['R6C3', 'R6C4', 'R5C3'] },
  { circle: 'R6C6', directed: true, cells: ['R6C7', 'R6C6', 'R5C7'] },
  { circle: 'R4C4', directed: true, cells: ['R4C3', 'R4C4', 'R3C4', 'R3C3'] },
  { circle: 'R4C6', directed: false, cells: ['R3C6', 'R3C7', 'R4C7', 'R4C6'] },
  {
    circle: 'R9C5',
    directed: false,
    cells: ['R8C6', 'R9C5', 'R8C4', 'R8C5', 'R7C5'],
  },
  {
    circle: 'R5C1',
    directed: true,
    cells: ['R9C2', 'R8C1', 'R7C2', 'R6C1', 'R5C1', 'R4C1'],
  },
  {
    circle: 'R5C9',
    directed: true,
    cells: ['R4C9', 'R5C9', 'R6C9', 'R7C8', 'R8C9', 'R9C8'],
  },
  {
    circle: 'R2C8',
    directed: false,
    cells: ['R3C8', 'R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R2C8'],
  },
  {
    circle: 'R2C2',
    directed: false,
    cells: ['R2C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C2'],
  },
];

const whiteDots = [
  ['R4C6', 'R4C7'], ['R4C3', 'R4C4'],
  ['R8C3', 'R8C4'], ['R8C6', 'R8C7'],
  ['R7C3', 'R8C3'], ['R7C7', 'R8C7'],
];

// Scan the circle first to obtain the target, then scan the line in positional
// order. A digit contributes exactly when it equals its 1-based position.
const hitPointMachine = NFA.encodeSpec({
  startState: { phase: 'target', target: null, position: 0, total: 0 },
  transition: (state, value) => {
    if (state.phase === 'target') {
      return { phase: 'break', target: value, position: 0, total: 0 };
    }
    if (value === SEGMENT_BREAK) {
      return state.phase === 'break'
        ? { phase: 'line', target: state.target, position: 0, total: 0 }
        : undefined;
    }
    if (state.phase !== 'line') return undefined;
    const position = state.position + 1;
    const total = state.total + (value === position ? value : 0);
    return total <= state.target
      ? { phase: 'line', target: state.target, position, total }
      : undefined;
  },
  accept: state => state.phase === 'line' && state.total === state.target,
  // Target, segment break, and at most eight line cells.
  maxDepth: 10,
}, 9, { multiSegment: true });

const hitPointNFA = (circle, cells) =>
  new NFA(hitPointMachine, 'hit-point', [circle], cells);

const lineRules = hitLines.flatMap(({ circle, directed, cells }) => [
  new AllDifferent(...cells),
  directed
    ? hitPointNFA(circle, cells)
    : new Or([
      hitPointNFA(circle, cells),
      hitPointNFA(circle, cells.slice().reverse()),
    ]),
]);

return [
  new Shape('9x9'),
  new Given('R9C9', 3),
  new AllDifferent(...circles),
  ...lineRules,
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  new Given('R6C5', 1, 3, 5, 7, 9),
];
