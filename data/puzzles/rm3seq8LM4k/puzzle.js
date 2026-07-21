// Title: Oblique and Unique
// Author: Blobz
// Video: https://www.youtube.com/watch?v=rm3seq8LM4k
// Source: https://sudokupad.app/blobz/oblique-and-unique

// Each line has a fixed sum and contains no repeated digit. Lines with
// different lengths or sums necessarily have different digit collections.
const lines = [
  { total: 16, cells: ['R3C1', 'R4C2'] },
  { total: 11, cells: ['R1C6', 'R2C7'] },
  { total: 15, cells: ['R6C7', 'R7C8', 'R8C9'] },
  { total: 15, cells: ['R6C6', 'R7C7', 'R8C8'] },
  { total: 15, cells: ['R7C6', 'R8C7', 'R9C8'] },
  { total: 15, cells: ['R7C4', 'R6C5', 'R5C6'] },
  { total: 15, cells: ['R5C4', 'R4C5', 'R3C6'] },
  { total: 15, cells: ['R4C4', 'R3C3', 'R2C2'] },
  { total: 15, cells: ['R4C3', 'R3C2', 'R2C1'] },
  { total: 15, cells: ['R3C4', 'R2C3', 'R1C2'] },
  { total: 11, cells: ['R3C8', 'R4C9'] },
  { total: 3, cells: ['R1C3', 'R2C4'] },
  { total: 11, cells: ['R8C6', 'R9C7'] },
  { total: 11, cells: ['R6C8', 'R7C9'] },
  { total: 15, cells: ['R4C8', 'R5C9'] },
  { total: 15, cells: ['R2C6', 'R3C5'] },
  { total: 8, cells: ['R7C5', 'R8C4'] },
  { total: 8, cells: ['R8C5', 'R9C6'] },
  { total: 8, cells: ['R6C1', 'R7C2'] },
  { total: 15, cells: ['R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'] },
];

// Nondeterministically select a digit on the first line and require it to be
// absent from the second. Equal-sized non-repeating sets differ exactly when
// such a witness exists.
const differentSetNFA = NFA.encodeSpec({
  startState: { phase: 'first', witness: null },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return state.witness === null
        ? undefined
        : { phase: 'second', witness: state.witness };
    }
    if (state.phase === 'first') {
      return [state, { phase: 'first', witness: value }];
    }
    return value === state.witness ? undefined : state;
  },
  accept: state => state.phase === 'second',
  maxDepth: 7,
}, 9, { multiSegment: true });

const comparableGroups = Map.groupBy(
  lines,
  line => `${line.total}:${line.cells.length}`,
);
const differentCollections = [...comparableGroups.values()].flatMap(group =>
  group.flatMap((line, i) => group.slice(i + 1).map(other =>
    new NFA(differentSetNFA, 'different line collections', line.cells, other.cells)
  ))
);

return [
  new Shape('9x9'),
  ...lines.map(line => new Cage(line.total, ...line.cells)),
  ...differentCollections,
  new AllDifferent(
    'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2',
    'R3C3', 'R3C4', 'R4C3', 'R4C4',
  ),
  new AllDifferent(
    'R6C6', 'R6C7', 'R7C6', 'R7C7', 'R7C8',
    'R8C7', 'R8C8', 'R8C9', 'R9C8',
  ),
];
