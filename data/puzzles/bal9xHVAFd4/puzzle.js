// Title: Hijinks
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=bal9xHVAFd4
// Source: https://sudokupad.app/2hk0wen7pj

// Normal sudoku rules apply. Along each line the hexagon cell is
// "position 1", the next cell is "position 2", and so on. Digits never
// repeat along a line.
//
// Thermometer: digits strictly increase away from the hexagon.
// Index line: the digit in the Nth position gives the position where
//   digit N sits (a self-inverse permutation of 1..lineLength).
// Hit-line: the digit in the hexagon gives the count of positions
//   (hexagon included) whose digit equals their own position number.
//
// Shenanigans: one digit 1-9 is the "mischief digit" VM (solver
// determined, not given). Every line follows exactly one of the three
// rules above (never zero, never more than one), but a line containing
// the mischief digit is painted the wrong colour: its true rule differs
// from its painted colour. A line not containing the mischief digit is
// painted correctly: its true rule matches its painted colour.

// Each rule check below never dies mid-scan (no early rejection); it
// always reaches a final state after exactly `n` cells and reports a
// boolean at accept(). That makes it trivial to also build the negated
// check (same automaton, accept flipped), which is needed to assert a
// line's *other* two rules do not also hold.

const thermoNFASpec = (n, negate) => ({
  startState: { prev: null, ok: true },
  maxDepth: n,
  transition: (state, value) => {
    if (state.prev === null) return { prev: value, ok: true };
    return { prev: value, ok: state.ok && value > state.prev };
  },
  accept: (state) => negate ? !state.ok : state.ok,
});

// Self-inverse permutation check for an index line: value read at
// position p commits position `value` to eventually read `p`; a
// commitment is checked the moment its target position is reached, so
// state only needs the pending commitment map, not the full history.
// Once a commitment is violated the check is permanently "dead" (kept
// as a flag, rather than rejecting the branch outright) so the negated
// automaton can still report "not a valid index line" at the end.
const indexNFASpec = (n, negate) => ({
  startState: { p: 0, expected: {}, dead: false },
  maxDepth: n,
  transition: (state, value) => {
    const p = state.p + 1;
    if (state.dead) return { p, expected: {}, dead: true };
    if (value < 1 || value > n) return { p, expected: {}, dead: true };
    const expected = { ...state.expected };
    let resolved = false;
    if (expected[p] !== undefined) {
      if (expected[p] !== value) return { p, expected: {}, dead: true };
      delete expected[p];
      resolved = true;
    }
    if (value < p) {
      if (!resolved) return { p, expected: {}, dead: true };
    } else if (value > p) {
      if (expected[value] !== undefined && expected[value] !== p) {
        return { p, expected: {}, dead: true };
      }
      expected[value] = p;
    }
    return { p, expected, dead: false };
  },
  accept: (state) => {
    const ok = !state.dead && state.p === n && Object.keys(state.expected).length === 0;
    return negate ? !ok : ok;
  },
});

const hitNFASpec = (n, negate) => ({
  startState: null,
  maxDepth: n,
  transition: (state, value) => {
    if (state === null) return { p: 1, hex: value, matches: value === 1 ? 1 : 0 };
    const p = state.p + 1;
    const matches = state.matches + (value === p ? 1 : 0);
    return { p, hex: state.hex, matches };
  },
  accept: (state) => {
    const ok = state !== null && state.p === n && state.matches === state.hex;
    return negate ? !ok : ok;
  },
});

const SPEC_FOR_TYPE = { thermo: thermoNFASpec, index: indexNFASpec, hit: hitNFASpec };

// Closed-form binary relations for the n=2 case of each rule, derived by
// hand-tracing the NFA specs above at maxDepth 2 (hexagon cell `a`, second
// cell `b`):
//  - thermo: strictly increasing, so just b > a.
//  - index: only the swap {a,b} = {1,2} is a valid self-inverse permutation
//    of length 2 (a==b==1 or a==b==2 both fail the "expected" bookkeeping).
//  - hit: hex is `a`; matches = (a==1) + (b==2); accept iff matches === a,
//    which reduces to a==1 && b!=2 (a>=2 can never reach its own count).
const PAIR_FN_FOR_TYPE = {
  thermo: (a, b) => b > a,
  index: (a, b) => (a === 1 && b === 2) || (a === 2 && b === 1),
  hit: (a, b) => a === 1 && b !== 2,
};

// 2-cell lines are a genuine binary relation on their two cells; use Pair
// instead of an NFA for the same semantics. The direct (non-negated) thermo
// case on 2 cells is plain "second cell > first cell", which is exactly the
// native GreaterThan relation (reversed cell order gives that direction).
const ruleConstraint = (type, negate, label, cells) => {
  if (cells.length === 2) {
    if (type === 'thermo' && !negate) {
      return new GreaterThan(cells[1], cells[0]);
    }
    const base = PAIR_FN_FOR_TYPE[type];
    const fn = negate ? (a, b) => !base(a, b) : base;
    return new Pair(Pair.fnToKey(fn, 9), label, cells[0], cells[1]);
  }
  return new NFA(NFA.encodeSpec(SPEC_FOR_TYPE[type](cells.length, negate), 9), label, ...cells);
};


// Whether the line's cells contain the mischief digit VM.
const containsMischief = (cells) =>
  new Or(cells.map(c => new SameValues(2, 'VM', c)));
const notContainsMischief = (cells) =>
  new And(cells.map(c => new AllDifferent('VM', c)));

const LINES = [
  ['thermo', ['R1C3', 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R3C2', 'R2C2', 'R2C3', 'R3C3']],
  ['thermo', ['R7C3', 'R8C3', 'R9C3', 'R9C2', 'R8C2']],
  ['thermo', ['R9C7', 'R8C7', 'R8C8', 'R9C9']],
  ['index', ['R3C1', 'R2C1', 'R1C1', 'R1C2']],
  ['index', ['R9C1', 'R8C1', 'R7C1', 'R7C2']],
  ['index', ['R9C4', 'R8C4', 'R7C4']],
  ['index', ['R3C9', 'R3C8', 'R4C7', 'R5C8']],
  ['index', ['R8C6', 'R9C6', 'R8C5', 'R7C5', 'R7C6', 'R6C5']],
  ['hit', ['R6C1', 'R5C1', 'R4C1']],
  ['hit', ['R5C3', 'R5C2', 'R6C2', 'R6C3', 'R6C4', 'R5C5', 'R6C6']],
  ['hit', ['R2C5', 'R1C4', 'R1C5', 'R1C6']],
  ['hit', ['R3C7', 'R2C7']],
  ['hit', ['R4C2', 'R3C2', 'R2C2']],
];

const TYPES = ['thermo', 'index', 'hit'];

const constraints = [
  new Shape('9x9'),
  new Var('M', 'Mischief digit', 1),
];

LINES.forEach(([paintedType, cells], i) => {
  constraints.push(new AllDifferent(...cells));

  // For each candidate true type t: t holds AND neither other type holds
  // (the line's true rule is unique), combined with the colour-vs-mischief
  // requirement for that t (painted type needs no mischief digit present;
  // any other true type needs the mischief digit present).
  const branches = TYPES.map((t) => {
    const others = TYPES.filter(u => u !== t);
    const exactlyT = new And([
      ruleConstraint(t, false, `Line${i + 1}_${t}`, cells),
      ...others.map(u => ruleConstraint(u, true, `Line${i + 1}_not${u}`, cells)),
    ]);
    const colourTerm = t === paintedType ? notContainsMischief(cells) : containsMischief(cells);
    return new And([exactlyT, colourTerm]);
  });

  constraints.push(new Or(branches));
});

return constraints;
