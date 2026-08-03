// Title: Hangman
// Author: ThePedallingPianist & his Granddad
// Video: https://www.youtube.com/watch?v=0jNztZ_8_14
// Source: https://app.crackingthecryptic.com/sudoku/2nqGgL8L7h

// Normal sudoku on the 9x9 grid, no digit givens.
//
// Arrow: R1C5 circle, arm R2C5-R3C5.
// Blue equal-sum line: EqualSum over the four per-box runs the drawn 13-cell
// path makes as it crosses box boundaries (R7-9C1-3 / R4-6C1-3 / R1-3C1-3 /
// R1-3C4-6).
// Branching thermometer: one grey line whose 10 drawn polylines all share
// the root R3C5-R4C5 and then fork; encoded as one Thermo per root-to-leaf
// arm (four arms; the shared prefix cells repeat across arms, which is fine
// since Thermo only asserts strict increase between consecutive listed
// cells).
// Cage R7C8/R8C8/R9C8: real cage, no drawn numeric total (its corner label
// is the letter "G"); already same-column, so no separate AllDifferent is
// needed -- its cells feed the letter machine below instead.
//
// Letters (H, A, N, G, M): each names the sum of the digits strictly between
// the 1 and the 9 of one row (the "sandwich" outside clue), read as a letter
// instead of a number outside rows R2-R8; G additionally names the R7C8-
// R9C8 cage's total. Repeated letters (A: R3 and R7; N: R4 and R8) must
// match, and the five letters must be pairwise different. A sandwich sum can
// run past 9 (up to 35), over ISS's 16-value Var/Shape cap, so the totals
// are never materialized as Vars: each relation is instead its own
// two-segment NFA that accumulates both sides' totals independently and
// compares them once at the end (a single NFA carrying all eight groups'
// totals together blows the 4096-state compile cap, since each running sum
// is its own ~36-value field).

const graph = cellGraph('9x9');
const row = n => graph.rows()[n - 1];
const cageCells = ['R7C8', 'R8C8', 'R9C8'];

// Segment modes: 'sandwich' finds the first 1-or-9, then sums cells up to
// (not including) the second 1-or-9; 'plain' sums every cell (used for the
// G cage, which has no 1/9 boundary to find).
// The compiler explores every symbol sequence, not just ones a real
// all-different row can produce, so an uncapped running sum reaches far past
// the true max (35, all digits but 1 and 9 sandwiched) and blows the
// 4096-state limit. 36 is one past that true max, so real rows/cages never
// reach the sink and no legitimate total is merged with another.
const SUM_CAP = 36;
const addClamped = (sum, value) => Math.min(sum + value, SUM_CAP);

const initSub = (mode) =>
  mode === 'plain' ? { phase: 'accum', sum: 0 } : { phase: 'before', sum: 0 };

const stepSub = (mode, sub, value) => {
  if (mode === 'plain') return { phase: 'accum', sum: addClamped(sub.sum, value) };
  const isBoundary = value === 1 || value === 9;
  switch (sub.phase) {
    case 'before':
      return isBoundary ? { phase: 'between', sum: 0 } : sub;
    case 'between':
      return isBoundary
        ? { phase: 'after', sum: sub.sum }
        : { phase: 'between', sum: addClamped(sub.sum, value) };
    default: // 'after': trailing cells (none here, rows are exactly 9 long)
      return sub;
  }
};

// One NFA per relation: scans cellsA then cellsB (SEGMENT_BREAK between),
// freezes cellsA's total at the break, and compares it with cellsB's total
// (equal or different, per `relation`) once cellsB is fully read.
function totalsRelation(relation, modeA, cellsA, modeB, cellsB) {
  const spec = NFA.encodeSpec({
    startState: { seg: 0, sub: initSub(modeA), frozen: null },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return { seg: 1, sub: initSub(modeB), frozen: state.sub.sum };
      }
      const mode = state.seg === 0 ? modeA : modeB;
      return { seg: state.seg, sub: stepSub(mode, state.sub, value), frozen: state.frozen };
    },
    accept: (state) => relation === 'eq'
      ? state.frozen === state.sub.sum
      : state.frozen !== state.sub.sum,
  }, 9, { multiSegment: true });
  return new NFA(spec, `letters-${relation}`, cellsA, cellsB);
}

// Letter ties: same letter on two rows (A: R3/R7) or a row and the cage (G).
const letterTies = [
  totalsRelation('eq', 'sandwich', row(3), 'sandwich', row(7)), // A
  totalsRelation('eq', 'sandwich', row(4), 'sandwich', row(8)), // N
  totalsRelation('eq', 'sandwich', row(5), 'plain', cageCells), // G
];

// All-different across the five distinct letters. G is represented by row5
// (already tied to the cage above, so either representative gives the same
// value); H/A/N/M by their own row.
const letterRows = { H: row(2), A: row(3), N: row(4), G: row(5), M: row(6) };
const letterNames = Object.keys(letterRows);
const letterDifferences = [];
for (let i = 0; i < letterNames.length; i++) {
  for (let j = i + 1; j < letterNames.length; j++) {
    letterDifferences.push(totalsRelation(
      'neq', 'sandwich', letterRows[letterNames[i]],
      'sandwich', letterRows[letterNames[j]]));
  }
}

return [
  new Shape('9x9'),

  new Arrow('R1C5', 'R2C5', 'R3C5'),

  new EqualSum(
    ['R9C1', 'R8C1', 'R7C1'],
    ['R6C1', 'R5C1', 'R4C1'],
    ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
    ['R1C4', 'R1C5']),

  new Thermo('R3C5', 'R4C5', 'R5C4'),
  new Thermo('R3C5', 'R4C5', 'R5C6', 'R6C7'),
  new Thermo('R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C4', 'R8C3', 'R9C3'),
  new Thermo('R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C6', 'R8C7', 'R9C7'),

  ...letterTies,
  ...letterDifferences,
];
