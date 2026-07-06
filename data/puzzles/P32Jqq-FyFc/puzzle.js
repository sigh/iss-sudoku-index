// One and Only by PrissyP
// https://sudokupad.app/sxsm_PrissyP_dd0fc95c45b8fd8c4e505d249ef8efaf
// https://www.youtube.com/watch?v=P32Jqq-FyFc
//
// Normal Sudoku. A single unknown value X (deduced by the solver) ties every
// constraint together:
//   - Pink Renban lines: each is a set of consecutive digits; ALL Renban digits
//     taken together sum to X.
//   - Yellow Addition lines: each sums to X.
//   - Red Multiplication lines: each has product X.
//   - Little Killer diagonals: each sums to X.
// Also: a digit may be used in at most ONE type of constraint (Renban / Addition
// / Multiplication / Little Killer digit-sets are pairwise disjoint).
// (Dynamic Fog is a display-only mechanic and imposes no constraint.)
//
// X is a shared unknown, so it is NOT hard-coded. All the sum-type totals
// (Addition line, each Little Killer diagonal, and the combined Renban digits)
// are tied equal with one EqualSum; a small NFA forces the Multiplication
// product to equal that same total.

const givens = [
  ['R1C8', 2], ['R1C9', 7],
  ['R5C2', 5], ['R5C9', 4],
  ['R6C4', 8],
  ['R7C6', 2],
  ['R8C3', 8], ['R8C6', 7],
];

// Pink Renban lines (each a consecutive set).
const renbanLines = [
  ['R1C2', 'R2C2'],
  ['R3C5', 'R4C5'],
  ['R5C6', 'R5C7'],
  ['R6C7', 'R7C6'],
  ['R6C1', 'R7C1'],
  ['R9C3', 'R9C4'],
  ['R8C8', 'R8C9'],
  ['R4C3', 'R3C4'],
  ['R2C9', 'R1C8'],
];
const renbanAll = renbanLines.flat();

// Yellow Addition line (sum = X).
const additionLine = ['R6C2', 'R7C3', 'R8C4'];

// Red Multiplication line (product = X).
const multLine = ['R4C2', 'R3C3', 'R2C4'];

// Little Killer diagonals (each sum = X).
const littleKillers = [
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
  ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
];
// Distinct Little Killer cells (R5C9 lies on two diagonals).
const lkCells = [...new Set(littleKillers.flat())];

// Multiplication product == Addition-line sum. Segment 0 = product line,
// segment 1 = addition line; accept iff product(seg0) === sum(seg1). Chaining
// through EqualSum, this pins the product to the shared total X.
// The Addition line is 3 cells, so the shared total X is at most 9+9+9 = 27;
// the product only grows, so prune any partial product or sum that passes 27.
const MAX_X = 27;
const productEqualsSumNFA = NFA.encodeSpec({
  startState: { phase: 0, prod: 1, sum: 0 },
  transition: (s, value) => {
    if (value === SEGMENT_BREAK) return { phase: 1, prod: s.prod, sum: 0 };
    if (s.phase === 0) {
      const prod = s.prod * value;
      if (prod > MAX_X) return undefined;
      return { phase: 0, prod, sum: 0 };
    }
    const sum = s.sum + value;
    if (sum > s.prod) return undefined;
    return { phase: 1, prod: s.prod, sum };
  },
  accept: (s) => s.phase === 1 && s.prod === s.sum,
}, 9, { multiSegment: true });

// Exclusivity: for a value v, scan the four constraint-cell groups (Addition,
// Multiplication, Little Killer, Renban) as segments and require v appear in at
// most one group. State: done = completed groups that contained v, cur = seen in
// current group.
function exclusivityNFA(v) {
  return NFA.encodeSpec({
    startState: { done: 0, cur: 0 },
    transition: (s, value) => {
      if (value === SEGMENT_BREAK) {
        const done = s.done + s.cur;
        if (done >= 2) return undefined;
        return { done, cur: 0 };
      }
      return { done: s.done, cur: s.cur | (value === v ? 1 : 0) };
    },
    accept: (s) => (s.done + s.cur) <= 1,
  }, 9, { multiSegment: true });
}

const constraints = [];

for (const [cell, val] of givens) constraints.push(new Given(cell, val));

for (const line of renbanLines) constraints.push(new Renban(...line));

// All sum-type totals equal (Addition line, each LK diagonal, combined Renban).
constraints.push(new EqualSum(
  additionLine, ...littleKillers, renbanAll));

// Multiplication product == that shared total.
constraints.push(new NFA(
  productEqualsSumNFA, 'product=X', multLine, additionLine));

// One-type-per-digit exclusivity, one machine per value.
for (let v = 1; v <= 9; v++) {
  constraints.push(new NFA(
    exclusivityNFA(v), `excl${v}`,
    additionLine, multLine, lkCells, renbanAll));
}

return constraints;
