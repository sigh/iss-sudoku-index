// Title: Two Truths and a Truth
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=ObWd6CUJ2VA
// Source: https://sudokupad.app/xtu2lb9ufm

// Normal Sudoku rules apply.
//
// For each set of 3 lines that share a colour, exactly 2 are Index Lines
// and 1 is a Thermometer; which is which is not shown and must be deduced
// ("no line can be ambiguously both").
//   Thermometer: digits strictly increase from the bulb (diamond marker).
//   Index Line: the digit in the Nth cell from the bulb gives the position
//     along the line where digit N sits -- a self-inverse permutation of
//     1..lineLength (worked example from the rules: 3214 -- the 1st digit
//     is 3, so digit 1 sits at the 3rd cell, and so on).
//
// Each triple below is one drawn colour, cells ordered from its diamond
// bulb: the drawn diamond marks the bulb end of each line, and one
// sky-blue line's raw stroke order ran bulb-to-end backwards, so its cell
// list here is reversed to start at the bulb.

// Each rule-check spec below never rejects mid-scan: it always reaches a
// final state after exactly n cells and reports pass/fail at accept() --
// so the same spec also yields the negated check needed to assert "not
// ambiguously the other type".
const thermoNFASpec = (n, negate) => ({
  startState: { prev: null, ok: true },
  maxDepth: n,
  transition: (state, value) => {
    if (state.prev === null) return { prev: value, ok: true };
    return { prev: value, ok: state.ok && value > state.prev };
  },
  accept: (state) => negate ? !state.ok : state.ok,
});

// Self-inverse permutation check: the value read at position p commits
// position `value` to eventually read `p`; a commitment is checked the
// moment its target position is reached, so state only needs the pending
// commitment map. Once violated the check stays "dead" (rather than
// rejecting the branch outright) so the negated automaton can still report
// "not a valid index line" at the end.
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

const SPEC_FOR_TYPE = { thermo: thermoNFASpec, index: indexNFASpec };
const OTHER_TYPE = { thermo: 'index', index: 'thermo' };

// Closed-form binary relations for the n=2 case, hand-traced from the specs
// above at maxDepth 2 (bulb cell `a`, second cell `b`):
//  - thermo: strictly increasing, so just b > a.
//  - index: only the swap {a,b} = {1,2} is a valid self-inverse permutation
//    of length 2 (a==b==1 or a==b==2 both fail the "expected" bookkeeping).
const PAIR_FN_FOR_TYPE = {
  thermo: (a, b) => b > a,
  index: (a, b) => (a === 1 && b === 2) || (a === 2 && b === 1),
};

// A 2-cell line is a plain binary relation on its two cells; use Pair (or
// the native GreaterThan for the direct thermo case) instead of an NFA.
const ruleConstraint = (type, negate, label, cells) => {
  if (cells.length === 2) {
    if (type === 'thermo' && !negate) return new GreaterThan(cells[1], cells[0]);
    const base = PAIR_FN_FOR_TYPE[type];
    const fn = negate ? (a, b) => !base(a, b) : base;
    return new Pair(Pair.fnToKey(fn, 9), label, cells[0], cells[1]);
  }
  return new NFA(NFA.encodeSpec(SPEC_FOR_TYPE[type](cells.length, negate), 9), label, ...cells);
};

// "Line is unambiguously type t": satisfies t's check and fails the other
// type's check.
const exactlyType = (type, label, cells) => new And([
  ruleConstraint(type, false, `${label}_${type}`, cells),
  ruleConstraint(OTHER_TYPE[type], true, `${label}_not${OTHER_TYPE[type]}`, cells),
]);

// One rule per same-coloured triple: exactly one of its 3 lines is the
// thermometer and the other two are index lines. Which one is not given,
// so all 3 placements are offered and the grid need only satisfy one.
const tripleConstraint = (label, lines) => new Or(
  lines.map((_, thermoIdx) => new And(
    lines.map((cells, i) =>
      exactlyType(i === thermoIdx ? 'thermo' : 'index', `${label}${i}`, cells))
  ))
);

// Sky-blue triple. Cells ordered from the bulb (diamond overlay); the
// third line's drawn stroke runs end-to-bulb, reversed here to start at
// the bulb.
const SKYBLUE = [
  ['R4C9', 'R5C9', 'R6C9', 'R6C8', 'R5C8', 'R4C8'],
  ['R4C4', 'R4C3', 'R3C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R4C5', 'R5C6', 'R4C6', 'R3C7', 'R3C8', 'R3C9', 'R2C9', 'R1C9'],
];

// Purple triple. Cells ordered from the bulb; each line's drawn stroke
// already starts there.
const PURPLE = [
  ['R9C9', 'R9C8', 'R9C7', 'R8C7', 'R8C8', 'R8C9'],
  ['R9C6', 'R9C5', 'R9C4', 'R8C4', 'R7C4', 'R7C5', 'R7C6'],
  ['R8C3', 'R8C2', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
];

// Orange triple. Cells ordered from the bulb; each line's drawn stroke
// already starts there.
const ORANGE = [
  ['R5C4', 'R6C3', 'R6C2', 'R5C2', 'R5C1'],
  ['R1C1', 'R2C1', 'R2C2', 'R1C2', 'R1C3'],
  ['R1C4', 'R2C4'],
];

return [
  new Shape('9x9'),
  tripleConstraint('Blue', SKYBLUE),
  tripleConstraint('Purple', PURPLE),
  tripleConstraint('Orange', ORANGE),
];
