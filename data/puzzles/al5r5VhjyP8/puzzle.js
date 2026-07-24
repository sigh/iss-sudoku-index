// Title: Once a Copycat, Always a Copycat
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=al5r5VhjyP8
// Source: https://sudokupad.app/kn2gf9mjm7

// Normal sudoku, no givens. COPYCAT CELLS: nine cells (one per row, column and
// box, undetermined which) all contain the same digit X (to be deduced); each
// copycat cell's "value" is the digit in the cell 180-degrees rotationally
// opposite it, and the nine values are all different from each other.
// MULTIPLE LINES (grey): for every adjacent pair of cells on a line, one value
// divides the other exactly. BLACK DOTS: one value is exactly double the
// other. YELLOW DOT: the two values are neither equal nor consecutive. All
// three rules act on the substituted VALUE of each cell (own digit if not a
// copycat, opposite cell's digit if a copycat), exactly as the copycat rule's
// own wording ("value") implies. The row of nine circles beneath the grid is
// solving UI for tracking copycat values, not a grid rule.
//
// ENCODED HERE (validated against the known solution): normal sudoku, the
// copycat selection (one per row/column/box, all sharing one digit X, with
// nine distinct opposite-cell values), and every multiples-line, black-dot,
// and yellow-dot pair evaluated on the substituted VALUE. Nothing is omitted.
//
// Copycat is modelled as a per-cell flag Var (PLAIN=1, COPY=2), following the
// same pattern used for RAT RUN 22: Copyrat (9CkHikmSpJE). A copycat cell's
// value is the digit of its 180-opposite cell; a plain cell's value is its own
// digit. Geometry note: the line through R5C4-R6C4-R6C5-R6C6-R5C6-R4C6-R4C5-
// R5C5 is an OPEN path (its wayPoints end near the start, but treating it as a
// closed loop back to R5C4 rejects the known solution: R5C5=7, R5C4=4, and 7
// divides neither 4 nor conversely -- so that closing edge is decorative, not
// a rule edge).

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;

const PLAIN = 1, COPY = 2;

const flags = graph.makeOverlay('VC');           // one flag Var per grid cell
const flagOf = cell => flags.at(cell);
const gridCells = graph.cells();

// 180-degree opposite cell (1-indexed r,c -> 10-r, 10-c).
const opposite = cell => {
  const { row, col } = parseCellId(cell);
  return makeCellId(10 - row, 10 - col);
};

// --- Copycat flag domain: every cell is PLAIN or COPY. ---
const copycatDomain = (() => {
  const targets = flags.at(gridCells);
  const origin = targets[0];
  return flags.makeReplicate(
    [new Given(origin, PLAIN, COPY)],
    targets,
  );
})();

// --- Exactly one copycat per row, per column, and per box. ---
const oneCopy = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, v) => {
    const next = count + (v === COPY ? 1 : 0);
    return next > 1 ? undefined : { count: next };
  },
  accept: ({ count }) => count === 1,
}, numValues);
const houses = [];
for (let i = 1; i <= 9; i++) {
  houses.push(graph.row(i));
  houses.push(graph.column(i));
}
houses.push(...graph.boxes());
const oneCopyCopyatConstraints = houses.map(house =>
  new NFA(oneCopy, 'one-copycat', ...flags.at(house))
);

// --- Every copycat cell holds the same digit X: scan [flag, digit] over the
// whole grid, remembering the first copycat digit seen and requiring every
// later copycat digit to match it. ---
const sameDigit = NFA.encodeSpec({
  startState: { phase: 'flag', ref: 0 },
  transition: (s, v) => {
    if (s.phase === 'flag') return { phase: 'digit', ref: s.ref, isCopy: v === COPY };
    if (!s.isCopy) return { phase: 'flag', ref: s.ref };
    if (s.ref === 0) return { phase: 'flag', ref: v };
    return v === s.ref ? { phase: 'flag', ref: s.ref } : undefined;
  },
  accept: ({ phase }) => phase === 'flag',
}, numValues);
const sameDigitScan = gridCells.flatMap(cell => [flagOf(cell), cell]);
const sameDigitConstraint = new NFA(sameDigit, 'same-copycat-digit', ...sameDigitScan);

// --- The nine copycat cells have nine different VALUES (opposite-cell
// digits): for each digit, at most one copycat cell's opposite cell holds it.
// Reads [flag, digit, oppDigit] for every cell (digit itself is unused here
// but keeps the scan uniform with the value-pair NFAs below). ---
const distinctValue = d => NFA.encodeSpec({
  startState: { i: 0, isCopy: false, count: 0 },
  transition: (s, v) => {
    if (s.i === 0) return { i: 1, isCopy: v === COPY, count: s.count };
    if (s.i === 1) return { i: 2, isCopy: s.isCopy, count: s.count };
    const next = s.count + (s.isCopy && v === d ? 1 : 0);
    return next > 1 ? undefined : { i: 0, isCopy: false, count: next };
  },
  accept: ({ i }) => i === 0,
}, numValues);
const distinctValueConstraints = Array.from({ length: 9 }, (_, d) => {
  const scan = gridCells.flatMap(cell => [flagOf(cell), cell, opposite(cell)]);
  return new NFA(distinctValue(d + 1), `distinct-value-${d + 1}`, ...scan);
});

// --- Value-pair rules: resolve each cell's value from [flag, ownDigit,
// oppDigit] as soon as the three symbols are read, then check the pair rule.
// Reads A's triple, then B's triple. ---
const valuePairNFA = check => NFA.encodeSpec({
  startState: { i: 0 },
  transition: (st, v) => {
    switch (st.i) {
      case 0: return { i: 1, fa: v };                              // flagA
      case 1: return { i: 2, need: st.fa === COPY, va: v };        // digitA (kept if plain)
      case 2: return { i: 3, va: st.need ? v : st.va };            // oppA (kept if copy)
      case 3: return { i: 4, va: st.va, fb: v };                   // flagB
      case 4: return { i: 5, va: st.va, need: st.fb === COPY, vb: v }; // digitB
      default: {                                                   // oppB -> resolve + check
        const vb = st.need ? v : st.vb;
        return check(st.va, vb) ? { i: 6 } : undefined;
      }
    }
  },
  accept: s => s.i === 6,
}, numValues);

const multipleNFA = valuePairNFA((a, b) => a % b === 0 || b % a === 0);
const blackNFA = valuePairNFA((a, b) => a === 2 * b || b === 2 * a);
const yellowNFA = valuePairNFA((a, b) => a !== b && Math.abs(a - b) !== 1);

// Multiple lines (grey): each adjacent pair divides evenly.
const multiplePaths = [
  ['R3C2', 'R2C3', 'R1C3'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R3C3', 'R4C4', 'R3C5'],
  ['R4C4', 'R3C4', 'R2C4'],
  ['R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6', 'R4C6', 'R4C5', 'R5C5'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R3C1', 'R4C1'],
];
const multipleLineConstraints = multiplePaths.flatMap(path =>
  Array.from({ length: path.length - 1 }, (_, i) =>
    new NFA(multipleNFA, 'multiple-line', flagOf(path[i]), path[i], opposite(path[i]), flagOf(path[i + 1]), path[i + 1], opposite(path[i + 1]))
  )
);

// Black dots: one value double the other.
const blackDots = [
  ['R2C7', 'R2C8'], ['R2C7', 'R3C7'], ['R2C8', 'R3C8'], ['R3C7', 'R3C8'],
  ['R7C2', 'R7C3'], ['R7C2', 'R8C2'], ['R7C3', 'R8C3'], ['R8C2', 'R8C3'],
  ['R5C3', 'R5C4'],
  ['R3C1', 'R3C2'],
];
const blackDotConstraints = blackDots.map(([a, b]) =>
  new NFA(blackNFA, 'black-dot', flagOf(a), a, opposite(a), flagOf(b), b, opposite(b))
);

// Yellow dot: values not equal and not consecutive.
const yellowDots = [
  ['R8C8', 'R8C9'],
];
const yellowDotConstraints = yellowDots.map(([a, b]) =>
  new NFA(yellowNFA, 'yellow-dot', flagOf(a), a, opposite(a), flagOf(b), b, opposite(b))
);

return [
  new Shape('9x9'),
  flags.toVar('copycat'),
  copycatDomain,
  ...oneCopyCopyatConstraints,
  sameDigitConstraint,
  ...distinctValueConstraints,
  ...multipleLineConstraints,
  ...blackDotConstraints,
  ...yellowDotConstraints,
];
