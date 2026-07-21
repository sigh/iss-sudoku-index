// Title: Hit Count
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=qOxkiXk12Pw
// Source: https://sudokupad.app/o39fgip872

// Cells are listed from the marked square (position 1). The separate circle
// identifies the cell whose digit gives that line's required hit count.
const hitlines = [
  {
    circle: 'R5C1',
    cells: [
      'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1',
      'R8C1', 'R7C1', 'R6C1', 'R5C1',
    ],
  },
  {
    circle: 'R5C2',
    cells: ['R6C2', 'R5C2', 'R4C2', 'R4C1', 'R3C2'],
  },
  {
    circle: 'R5C3',
    cells: [
      'R7C3', 'R8C3', 'R7C4', 'R6C3',
      'R5C3', 'R4C3', 'R3C3',
    ],
  },
  {
    circle: 'R5C7',
    cells: ['R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7'],
  },
  {
    circle: 'R5C6',
    cells: [
      'R1C6', 'R2C7', 'R2C6', 'R3C6',
      'R4C6', 'R5C6', 'R6C6', 'R5C5',
    ],
  },
  {
    circle: 'R5C8',
    cells: [
      'R9C8', 'R8C8', 'R8C9', 'R7C9', 'R7C8',
      'R6C8', 'R5C8', 'R4C8', 'R3C8',
    ],
  },
  {
    circle: 'R5C9',
    cells: [
      'R1C7', 'R1C8', 'R1C9', 'R2C8', 'R2C9',
      'R3C9', 'R4C9', 'R5C9', 'R6C9',
    ],
  },
  {
    circle: 'R2C5',
    cells: ['R3C5', 'R2C5', 'R1C4', 'R1C3'],
  },
  {
    circle: 'R2C1',
    cells: ['R2C1', 'R1C2', 'R2C2', 'R3C1'],
  },
  {
    circle: 'R5C4',
    cells: ['R6C4', 'R5C4', 'R4C5'],
  },
];

// Read the circle first to obtain the target, then scan the line in positional
// order. A cell contributes one hit exactly when its digit equals its 1-based
// position. The longest input is target + break + nine line cells.
const hitCountMachine = NFA.encodeSpec({
  startState: { phase: 'target', target: null, position: 0, count: 0 },
  transition: (state, value) => {
    if (state.phase === 'target') {
      return { phase: 'break', target: value, position: 0, count: 0 };
    }
    if (value === SEGMENT_BREAK) {
      return state.phase === 'break'
        ? { phase: 'line', target: state.target, position: 0, count: 0 }
        : undefined;
    }
    if (state.phase !== 'line') return undefined;

    const position = state.position + 1;
    const count = state.count + (value === position ? 1 : 0);
    return count <= state.target
      ? { phase: 'line', target: state.target, position, count }
      : undefined;
  },
  accept: state => state.phase === 'line' && state.count === state.target,
  maxDepth: 11,
}, 9, { multiSegment: true });

const lineRules = hitlines.flatMap(({ circle, cells }) => [
  new AllDifferent(...cells),
  new NFA(hitCountMachine, 'hit-count', [circle], cells),
]);

return [
  new Shape('9x9'),
  ...lineRules,
];
