// Title: April 13, 2023: Position Sums
// Author: clover!
// Video: https://www.youtube.com/watch?v=WlxWJ3pPtLY
// Source: https://tinyurl.com/yzbdsvxc
//
// Normal sudoku rules apply.
//
// For every row, A and B are its leftmost two digits (reading left to right);
// for every column, A and B are its topmost two digits (reading top to
// bottom). Some rows/columns carry an "immediate" outside clue giving A+B
// directly (`Sum` over the row/column's first two cells below). Some carry a
// "further" outside clue giving the sum of the digit at position A and the
// digit at position B of that row/column, counting from the same end
// (1-indexed) -- encoded as `positionSumNFA` below, since A and B are
// themselves grid digits (not fixed positions) that select which later
// position to read.

const graph = cellGraph('9x9');
const row = n => graph.row(n);
const col = n => graph.column(n);

// Digit at position A plus digit at position B, where A is the line's own
// first digit and B its second digit -- both read off the line itself as it
// is scanned, not supplied separately. `step` tracks the 1-indexed position
// just consumed; once known, A/B stay fixed for the rest of the scan. `count`
// (clamped to 2) and `sum` track how many of the two target positions have
// been passed and their digit total; accept requires both hits and the given
// total. Sum only ever accumulates at most two hits so no clamp is needed
// beyond the final target+1 sink.
function positionSumNFA(targetSum) {
  return NFA.encodeSpec({
    startState: { step: 1, A: null, B: null, count: 0, sum: 0 },
    transition: (state, value) => {
      const { step, count, sum } = state;
      let { A, B } = state;
      if (step === 1) A = value;
      else if (step === 2) B = value;
      const hit = (step === A || step === B);
      const newCount = Math.min(count + (hit ? 1 : 0), 2);
      const newSum = hit ? Math.min(sum + value, targetSum + 1) : sum;
      return { step: step + 1, A, B, count: newCount, sum: newSum };
    },
    accept: ({ count, sum }) => count === 2 && sum === targetSum,
    maxDepth: 9,
  }, 9);
}

function positionSum(targetSum, cells) {
  return new NFA(
    positionSumNFA(targetSum), `position-sum-${targetSum}`, cells);
}

// Row outside clues: immediate = A+B over the row's first two cells; further
// = Ath+Bth digit sum over the whole row. Values transcribed from the printed
// outside-clue labels; only these rows/columns carry a clue.
const rowImmediate = { 1: 4, 3: 13, 5: 10, 7: 4, 9: 9 };
const rowFurther = { 3: 5, 5: 8, 9: 4 };

// Column outside clues: same shape, over columns.
const colImmediate = { 1: 3, 3: 9, 5: 10, 7: 17, 9: 10 };
const colFurther = { 3: 10, 5: 3, 7: 9, 9: 9 };

const rowSums = Object.entries(rowImmediate).map(
  ([n, k]) => new Sum(k, ...row(+n).slice(0, 2)));
const rowPositionSums = Object.entries(rowFurther).map(
  ([n, k]) => positionSum(k, row(+n)));

const colSums = Object.entries(colImmediate).map(
  ([n, k]) => new Sum(k, ...col(+n).slice(0, 2)));
const colPositionSums = Object.entries(colFurther).map(
  ([n, k]) => positionSum(k, col(+n)));

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R2C5', 6),
  new Given('R3C4', 9),
  new Given('R3C6', 3),
  new Given('R4C3', 1),
  new Given('R4C7', 4),
  new Given('R5C2', 4),
  new Given('R5C8', 7),
  new Given('R6C3', 3),
  new Given('R6C7', 5),
  new Given('R7C4', 2),
  new Given('R7C6', 4),
  new Given('R8C5', 7),
  new Given('R9C9', 9),

  ...rowSums,
  ...rowPositionSums,
  ...colSums,
  ...colPositionSums,
];
