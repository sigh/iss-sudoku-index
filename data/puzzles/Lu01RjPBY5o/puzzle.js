// Title: Can't Touch This!
// Author: Theasylm & Friends!
// Video: https://www.youtube.com/watch?v=Lu01RjPBY5o
// Source: https://app.crackingthecryptic.com/sudoku/nMqP9RD7rd

// Normal sudoku rules (default 9x9 rows/cols/boxes, no givens). Outside each
// row/column, the printed clue(s) give the sums of the yellow-shaded
// contiguous runs in that line, in order along the line. A run is a maximal
// block of shaded cells, so "there must be an unshaded cell between runs of
// the same colour" is already implied by "run" (only one colour, yellow, is
// used here) and needs no separate constraint. "?" (row 4's middle clue)
// stands for a shaded run of unconstrained positive sum -- any run of one or
// more shaded cells already sums to a positive number, so it only requires
// that the run exists, of any length and any sum.
//
// Which end of a multi-value outside-clue lane is read first is not stated
// by the rules text (it says only that the clues "indicate the sums") and
// is not settled by the drawn art: the multi-run row clues (R4, R5, R8, R9)
// are each a single merged text label with no independent per-number
// coordinate, and the multi-run column clues (C2, C4, C6, C8) are drawn at
// only two depths (near/far) with no further cue about which one is read
// first. Two of the row lists (R4, R9) are palindromes, so direction does
// not matter there. For the six lanes where the two directions give
// different results (R5, R8, C2, C4, C6, C8), both directions are encoded
// via `Or` rather than picked, since which end of a line is which is
// genuinely open here.

const R = (r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => makeCellId(r, c));
const C = (c) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => makeCellId(r, c));

// Marks the '?' clue: a run must exist (>=1 shaded cell) but its sum is
// otherwise unconstrained.
const ANY = 'ANY';

// One NFA per lane (targets = the run sums in line order, ANY for '?').
// State {idx, sum}: idx is the run (0-based) currently open or next due;
// sum is null between runs, ANY inside the unconstrained run, or the
// running total inside a numbered run. At each cell the machine
// nondeterministically either treats it as unshaded (closes any open run,
// which must already sit exactly on its target) or as shaded (starts or
// extends the run at `idx`, only while its running sum would not exceed the
// target). Accepting requires every run to have closed on target, including
// one still open right at the last cell of the line.
function runNFA(targets) {
  const n = targets.length;
  const spec = NFA.encodeSpec({
    startState: { idx: 0, sum: null },
    transition: ({ idx, sum }, value) => {
      const out = [];
      if (sum === null) {
        // Unshaded: keep waiting for run `idx` (or stay done if idx === n).
        out.push({ idx, sum: null });
        if (idx < n) {
          const target = targets[idx];
          if (target === ANY || value <= target) {
            out.push({ idx, sum: target === ANY ? ANY : value });
          }
        }
      } else {
        const target = targets[idx];
        const closed = target === ANY || sum === target;
        if (closed) out.push({ idx: idx + 1, sum: null });
        if (target === ANY) {
          out.push({ idx, sum: ANY });
        } else {
          const next = sum + value;
          if (next <= target) out.push({ idx, sum: next });
        }
      }
      return out.length ? out : undefined;
    },
    accept: ({ idx, sum }) => {
      if (sum === null) return idx === n;
      const target = targets[idx];
      return idx === n - 1 && (target === ANY || sum === target);
    },
  }, 9);
  return spec;
}

// altTargets, when given, is the reverse-direction reading; the lane
// constraint is then Or(printed-order NFA, reversed-order NFA).
const laneConstraint = (cells, name, targets, altTargets) => {
  const fwd = new NFA(runNFA(targets), name, ...cells);
  if (!altTargets) return fwd;
  const rev = new NFA(runNFA(altTargets), name, ...cells);
  return new Or([fwd, rev]);
};

// Row/column run sums, transcribed from the drawn outside-clue text (left
// lane = row clues, top lane = column clues). `targets` is the printed
// order; `alt` is that order reversed, supplied only where it differs
// (omitted for the two palindromic row lists, R4 and R9).
const rowClues = [
  { r: 1, targets: [4] },
  { r: 2, targets: [16] },
  { r: 3, targets: [30] },
  { r: 4, targets: [18, ANY, 18] },
  { r: 5, targets: [6, 6, 10], alt: [10, 6, 6] },
  { r: 6, targets: [31] },
  { r: 7, targets: [15] },
  { r: 8, targets: [15, 8], alt: [8, 15] },
  { r: 9, targets: [11, 11] },
];

const colClues = [
  { c: 1, targets: [1] },
  { c: 2, targets: [6, 10], alt: [10, 6] },
  { c: 3, targets: [40] },
  { c: 4, targets: [20, 7], alt: [7, 20] },
  { c: 5, targets: [41] },
  { c: 6, targets: [9, 10], alt: [10, 9] },
  { c: 7, targets: [40] },
  { c: 8, targets: [4, 6], alt: [6, 4] },
  { c: 9, targets: [7] },
];

return [
  new Shape('9x9'),
  ...rowClues.map(({ r, targets, alt }) =>
    laneConstraint(R(r), `row ${r} yellow runs`, targets, alt)),
  ...colClues.map(({ c, targets, alt }) =>
    laneConstraint(C(c), `col ${c} yellow runs`, targets, alt)),
];
