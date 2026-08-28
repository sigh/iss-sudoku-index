// Title: Progressive Divisors
// Author: DiMono
// Video: https://www.youtube.com/watch?v=8hF548RzOT0
// Source: https://tinyurl.com/progressivedivisors

// Rules encoded here:
//  * Normal sudoku rules (default Shape gives rows/columns/boxes AllDifferent).
//  * A Progressive Divisor number reads left to right; for every prefix length
//    k from 1 up to the number's own length, the first k digits, taken as a
//    k-digit number, divide by k. Length-1 divisibility is automatic (every
//    number is divisible by 1), so it adds no constraint below.
//  * Row 1, left to right, is a 9-digit Progressive Divisor number.
//  * Each outside-grid arrow marks a row or column whose first N cells,
//    counted inward from that edge, are a Progressive Divisor number, where N
//    is the digit of the cell next to the arrow -- itself the number's own
//    first digit, and not separately printed. Digits are 1-9, so N is exactly
//    one of 1..9: encoded as one branch per candidate N, selected by pinning
//    that first cell to N (a real filter on the drawn clue, not solved
//    structure) and applying the chain up to that length.
//  * The two drawn cages (R8C8-R8C9, R6C5-R6C6) carry no printed total. The
//    ruleset instead reads each, left to right per the payload's own cell
//    order, as a two-digit number that divides by both its digits or by
//    neither -- never by exactly one. A cage border's usual "cells are
//    distinct" reading is not overridden by this and still applies; only the
//    usual sum is replaced.
//  * Omitted: the invisible regions anchored on row 1's digits, each summing
//    to 3x its digit -- no faithful encoding was found for this rule.

// --- Progressive Divisor number chain -------------------------------------
// A checkpoint at length k requires the k-digit prefix's remainder mod k to
// be 0. k=1 needs no constraint (see above). k=2 is a genuine two-cell
// relation -- (d1*10+d2) % 2 == 0, i.e. d2 even -- so it's a Pair. For k=3..9
// the checkpoint depends on the whole prefix, so it's a tiny NFA: state is
// the prefix's own remainder mod k, updated one digit at a time as
// remainder' = (remainder*10 + digit) % k (digits are always 1-9, never 0),
// accepting only when that remainder is 0. Both are built once per k and
// reused across every lane below.
const pdPairKey = Pair.fnToKey((a, b) => (a * 10 + b) % 2 === 0, 9);
const pdSpecs = new Map();
for (let k = 3; k <= 9; k++) {
  pdSpecs.set(k, NFA.encodeSpec({
    startState: 0,
    transition: (state, value) => (state * 10 + value) % k,
    accept: (state) => state === 0,
  }, 9));
}

// The Progressive-Divisor checkpoints for every length up to `n`, over the
// first `n` cells of `cells` (already in reading order for this lane).
const pdChain = (cells, n) => {
  const out = [];
  if (n >= 2) out.push(new Pair(pdPairKey, 'PD2', cells[0], cells[1]));
  for (let k = 3; k <= n; k++) {
    out.push(new NFA(pdSpecs.get(k), `PD${k}`, ...cells.slice(0, k)));
  }
  return out;
};

// Row 1 is a fixed 9-digit Progressive Divisor number, left to right.
const row1Cells = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(1, c));
const row1Constraints = pdChain(row1Cells, 9);

// --- Outside-clue Progressive Divisor lanes --------------------------------
// cells[0] is the cell nearest the arrow; N = its own digit, and the branch
// for each candidate N pins that cell and applies the chain to length N.
const outsideClue = (cells) => new Or(
  [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => new And([
    new Given(cells[0], n),
    ...pdChain(cells, n),
  ]))
);

const colCells = (c, topDown) => {
  const rows = topDown
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
    : [9, 8, 7, 6, 5, 4, 3, 2, 1];
  return rows.map(r => makeCellId(r, c));
};
const rowCells = (r, leftRight) => {
  const cols = leftRight
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
    : [9, 8, 7, 6, 5, 4, 3, 2, 1];
  return cols.map(c => makeCellId(r, c));
};

// Every outside arrow drawn on the board, by its margin cell:
//   R0C1 '>' (top, col 1, reads down), R10C1 '<' (bottom, col 1, reads up),
//   R0C6 '>' (top, col 6, reads down), R5C0 '>' (left, row 5, reads right),
//   R8C0 '>' (left, row 8, reads right), R9C0 '>' (left, row 9, reads right),
//   R2C10 '<' (right, row 2, reads left), R6C10 '<' (right, row 6, reads left),
//   R7C10 '<' (right, row 7, reads left), R9C10 '<' (right, row 9, reads left).
// Each arrow points into the grid -- the only direction "outside-in" can mean
// from its own margin -- so the glyph itself settles no separate choice.
const outsideClueConstraints = [
  outsideClue(colCells(1, true)),   // R0C1  top of column 1, downward
  outsideClue(colCells(1, false)),  // R10C1 bottom of column 1, upward
  outsideClue(colCells(6, true)),   // R0C6  top of column 6, downward
  outsideClue(rowCells(5, true)),   // R5C0  left of row 5, rightward
  outsideClue(rowCells(8, true)),   // R8C0  left of row 8, rightward
  outsideClue(rowCells(9, true)),   // R9C0  left of row 9, rightward
  outsideClue(rowCells(2, false)),  // R2C10 right of row 2, leftward
  outsideClue(rowCells(6, false)),  // R6C10 right of row 6, leftward
  outsideClue(rowCells(7, false)),  // R7C10 right of row 7, leftward
  outsideClue(rowCells(9, false)),  // R9C10 right of row 9, leftward
];

// --- The two undotted cages: divisible by both digits, or by neither ------
// Both cages are drawn as left-to-right pairs, so the first cell of each is
// the tens digit and the second the units digit.
const divBothOrNeither = Pair.fnToKey((tens, units) => {
  const n = 10 * tens + units;
  return (n % tens === 0) === (n % units === 0);
}, 9);

const cages = [
  ['R8C8', 'R8C9'],
  ['R6C5', 'R6C6'],
];
const cageConstraints = cages.flatMap(([a, b]) => [
  new AllDifferent(a, b),
  new Pair(divBothOrNeither, 'div-both-or-neither', a, b),
]);

return [
  new Shape('9x9'),
  ...row1Constraints,
  ...outsideClueConstraints,
  ...cageConstraints,
];
