// Title: Exclusive Lines
// Author: Nurator
// Video: https://www.youtube.com/watch?v=nRUk80-7SvA
// Source: https://sudokupad.app/iovwq0jc5n

// Normal sudoku rules apply.

// Kropki dots: white = consecutive, black = one digit double the other.
// "Not all dots are given" -- absence of a dot elsewhere carries no
// information, so no negative constraint is added.
const WHITE_DOTS = [
  ['R4C1', 'R4C2'],
  ['R7C1', 'R7C2'],
  ['R7C3', 'R7C4'],
  ['R7C9', 'R8C9'],
  ['R8C8', 'R8C9'],
  ['R4C9', 'R5C9'],
  ['R3C6', 'R4C6'],
  ['R1C7', 'R2C7'],
  ['R2C4', 'R2C5'],
  ['R1C5', 'R1C6'],
];
const BLACK_DOTS = [
  ['R2C9', 'R3C9'],
];

// The six drawn lines. Each is exactly one of Region Sum Line / German
// Whisper / Parity, and the solver must work out which -- the dynamic-fog
// checkpoints only control *when* each line's cells and each line type
// become visible during solving; that reveal order is solving UI, not a
// rule on the finished grid.
const LINES = [
  ['R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R2C2', 'R3C2', 'R4C2'],
  ['R7C3', 'R8C3', 'R8C4', 'R7C4', 'R7C5'],
  ['R8C6', 'R7C6', 'R7C7', 'R8C8'],
  ['R3C9', 'R4C9', 'R5C8', 'R5C9', 'R6C9'],
  ['R3C8', 'R3C7', 'R4C7', 'R4C6', 'R4C5'],
];

// Line-type marker cells: 1 = Region Sum Line, 2 = German Whisper, 3 = Parity.
const typeVar = new Var('T', 'Line type', LINES.length);
const typeCells = LINES.map((_, i) => typeVar.cell(i + 1));

// Parity line: adjacent digits alternate odd/even along the whole line.
const parityLineSpec = {
  startState: null,
  transition(prevParity, value) {
    const parity = value % 2;
    if (prevParity === null) return parity;
    if (parity === prevParity) return undefined;
    return parity;
  },
  accept: () => true,
};
const parityLineNFA = NFA.encodeSpec(parityLineSpec, 9);

// Each line is exactly one of the three types. Mutual exclusion is free:
// a type-marker cell can only hold one value, so at most one `And` branch
// can actually be satisfied by any given grid.
const lineTypeConstraints = LINES.map((cells, i) => new Or([
  new And([new Given(typeCells[i], 1), new RegionSumLine(...cells)]),
  new And([new Given(typeCells[i], 2), new Whisper(5, ...cells)]),
  new And([new Given(typeCells[i], 3), new NFA(parityLineNFA, 'Parity', ...cells)]),
]));

// "Each line constraint type may contain NO REPEATED DIGITS anywhere in the
// puzzle": pool every cell whose line was assigned type `t`, across all six
// lines (not just within one line), and forbid a repeated digit within that
// pool. One state machine per type scans a segment per line -- [typeCell,
// ...lineCells] -- accumulating a seen-digit bitmask only while the current
// line's type marker matches `t`. `SEGMENT_BREAK` marks each line boundary so
// the state doesn't need to separately track a position/remaining-count
// field (that alone kept the compiled state count under the 4096 limit).
function makePoolSpec(t) {
  return {
    startState: { seen: 0, active: false, expectMarker: true },
    transition(state, value) {
      if (value === SEGMENT_BREAK) {
        return { seen: state.seen, active: state.active, expectMarker: true };
      }
      if (state.expectMarker) {
        // `value` is the type marker for this line.
        return { seen: state.seen, active: value === t, expectMarker: false };
      }
      // `value` is a grid digit belonging to the current line.
      let seen = state.seen;
      if (state.active) {
        const bit = 1 << (value - 1);
        if (seen & bit) return undefined;
        seen |= bit;
      }
      return { seen, active: state.active, expectMarker: false };
    },
    accept: () => true,
  };
}
const poolSegments = LINES.map((cells, i) => [typeCells[i], ...cells]);
const poolConstraints = [1, 2, 3].map(t => new NFA(
  NFA.encodeSpec(makePoolSpec(t), 9, { multiSegment: true }),
  `No repeats: type ${t}`, ...poolSegments));

const dots = [
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
];

return [
  new Shape('9x9'),
  typeVar,
  ...typeCells.map(c => new Given(c, 1, 2, 3)),
  ...dots,
  ...lineTypeConstraints,
  ...poolConstraints,
];
