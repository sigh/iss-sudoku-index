// Title: RAT RUN 22: Copyrat
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=9CkHikmSpJE
// Source: https://sudokupad.app/m9qm0m5qj0

// Normal sudoku. Two rats (Finkz, Phinx) each trace a self-avoiding maze path
// from a rat to a cupcake; the paths never cross, share cells, or pass through
// thick maze walls. COPYCAT CELLS: nine cells (one per row, column and box, all
// different digits) whose "value" equals the digit in the 180-degree opposite
// cell (regardless of the digit they themselves contain). BLACKCURRANT: one
// value is double the other. REDCURRANT: one value even, one odd. GRAPE: values
// differ by at least 5. TEST: in every box, the sum of Finkz-visited values
// equals the sum of Phinx-visited values.
//
// ENCODED HERE (validated against the known solution): normal sudoku, the nine
// copycat cells (an unknown transversal the solver must find) with the value =
// 180-opposite-digit substitution, and all blackcurrant / redcurrant / grape
// pairs evaluated on those substituted VALUES. The two rat paths (movement,
// self-avoidance, non-crossing, wall-blocking, the diagonal-through-2x2 /
// round-wall-spot rule, and rat->cupcake connectivity) and the per-box TEST
// constraint that depends on path membership are OMITTED. This
// is therefore a PARTIAL encoding: it never rejects the true solution but does
// not pin the digits down on its own.
//
// Copycat is modelled as a per-cell flag Var (PLAIN=1, COPY=2). A copycat cell's
// "value" is the contained digit of its 180-opposite cell; a plain cell's value
// is its own digit. The currant NFAs read [flagA, digitA, oppA, flagB, digitB,
// oppB] and apply the pair rule to the two computed values, so the flags and the
// grid are tied together exactly as the copycat mechanic requires.

const PLAIN = 1, COPY = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;

const flags = graph.makeOverlay('VC');           // one flag Var per grid cell
const flagOf = cell => flags.at(cell);
const gridCells = graph.cells();

const constraints = [new Shape('9x9'), flags.toVar('copycat')];
const add = (...cs) => constraints.push(...cs);

// 180-degree opposite cell (1-indexed r,c -> 10-r, 10-c).
const opposite = cell => {
  const { row, col } = parseCellId(cell);
  return makeCellId(10 - row, 10 - col);
};

// --- Copycat flag domain: every cell is PLAIN or COPY. ---
const flagTargets = gridCells.map(flagOf);
const flagOrigin = flagTargets[0];
add(new Replicate(
  [new Given(flagOrigin, PLAIN, COPY)],
  Replicate.encodeTargetCells(flagTargets, flagOrigin, flags),
  flagOrigin,
));

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
for (const house of houses) {
  add(new NFA(oneCopy, 'one-copycat', ...house.map(flagOf)));
}

// --- The nine copycat cells contain nine different digits: for each digit, at
// most one copycat cell holds it. Reads [flag, digit] for every cell. ---
const distinctDigit = d => NFA.encodeSpec({
  startState: { phase: 'flag', count: 0, isCopy: false },
  transition: (s, v) => {
    if (s.phase === 'flag') return { phase: 'digit', count: s.count, isCopy: v === COPY };
    const next = s.count + (s.isCopy && v === d ? 1 : 0);
    return next > 1 ? undefined : { phase: 'flag', count: next, isCopy: false };
  },
  accept: ({ phase }) => phase === 'flag',
}, numValues);
for (let d = 1; d <= 9; d++) {
  const scan = [];
  for (const cell of gridCells) { scan.push(flagOf(cell), cell); }
  add(new NFA(distinctDigit(d), `distinct-${d}`, ...scan));
}

// --- Currants act on the substituted VALUE of each cell: a copycat cell's value
// is the digit of its 180-opposite cell, a plain cell's value is its own digit.
// Each NFA reads [flagA, digitA, oppDigitA, flagB, digitB, oppDigitB]. ---
// Resolves each cell's value from [flag, ownDigit, oppDigit] as soon as the three
// symbols are read, keeping only the resolved value in state (so the machine stays
// small). Reads A's triple, then B's triple, then checks the pair rule.
const currantNFA = check => NFA.encodeSpec({
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

const blackNFA = currantNFA((a, b) => a === 2 * b || b === 2 * a);
const redNFA = currantNFA((a, b) => (a % 2) !== (b % 2));
const grapeNFA = currantNFA((a, b) => Math.abs(a - b) >= 5);

const addCurrant = (spec, label, a, b) =>
  add(new NFA(spec, label, flagOf(a), a, opposite(a), flagOf(b), b, opposite(b)));

// Blackcurrants: one value double the other.
const blackcurrants = [
  ['R9C2', 'R9C3'], ['R8C2', 'R9C2'], ['R7C2', 'R8C2'],
  ['R7C1', 'R7C2'], ['R7C4', 'R8C4'], ['R8C6', 'R9C6'],
];
for (const [a, b] of blackcurrants) addCurrant(blackNFA, 'blackcurrant', a, b);

// Redcurrants: one value even, one odd.
const redcurrants = [
  ['R2C8', 'R3C8'], ['R2C8', 'R2C9'], ['R1C8', 'R1C9'],
  ['R1C9', 'R2C9'], ['R7C3', 'R8C3'],
];
for (const [a, b] of redcurrants) addCurrant(redNFA, 'redcurrant', a, b);

// Grapes: values differ by at least 5.
const grapes = [
  ['R1C7', 'R1C8'], ['R1C8', 'R2C8'], ['R3C3', 'R4C3'],
  ['R2C3', 'R3C3'], ['R1C1', 'R2C1'], ['R3C2', 'R4C2'],
];
for (const [a, b] of grapes) addCurrant(grapeNFA, 'grape', a, b);

return constraints;
