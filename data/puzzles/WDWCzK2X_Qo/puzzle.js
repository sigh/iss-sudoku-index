// Title: Cradle
// Author: Xenonetix
// Video: https://www.youtube.com/watch?v=WDWCzK2X_Qo
// Source: https://sudokupad.app/z7eug3yrqd

// Normal sudoku rules apply.
//
// Zipper Lines: digits an equal distance from the centre of the purple line
// sum to the centre digit -- Zipper(...cells) with cells listed in line
// order (drawn stroke order, centre cell mid-array; the drawn circles mark
// those centres).
//
// Consecutive Sums: an outside clue totals the digits in its row/column that
// are orthogonally next to a digit differing from them by exactly 1. Encoded
// as one NFA per clued row/column, scanning cells in row/column order.
//
// Kropki: the black dot forces a 1:2 ratio -- BlackDot(...cells).

const zippers = [
  new Zipper('R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'),
  new Zipper('R8C5', 'R9C4', 'R9C3', 'R9C2', 'R8C1', 'R7C1', 'R6C2', 'R5C3', 'R4C4'),
  new Zipper('R7C5', 'R6C6', 'R6C7', 'R7C8', 'R6C9'),
];

const blackDots = [
  new BlackDot('R1C7', 'R1C8'),
];

// Consecutive-Sums NFA: scans a row/column left-to-right (or top-to-bottom)
// and totals every cell that is orthogonally next to a digit exactly 1 away.
// State carries the previous cell's value, whether the previous cell has
// already qualified via ITS left neighbour, and the sum finalized so far
// (cells before the previous one). Each step finalizes the previous cell's
// contribution once its right-neighbour comparison is known, so a cell in a
// run of 3+ consecutive digits is still only counted once. The last cell has
// no right neighbour, so `accept` finalizes it directly from `marked`.
function consecutiveSumNFA(target) {
  return NFA.encodeSpec({
    startState: { prev: null, marked: false, sum: 0 },
    transition: ({ prev, marked, sum }, value) => {
      if (prev === null) return { prev: value, marked: false, sum: 0 };
      const qualifies = Math.abs(value - prev) === 1;
      const prevCounts = marked || qualifies;
      let newSum = sum + (prevCounts ? prev : 0);
      // Clamp: once the running total exceeds the target it can only fail.
      if (newSum > target) newSum = target + 1;
      return { prev: value, marked: qualifies, sum: newSum };
    },
    accept: ({ prev, marked, sum }) => (sum + (marked ? prev : 0)) === target,
  }, 9);
}

function consecutiveSum(target, cells) {
  return new NFA(consecutiveSumNFA(target), `consecutive sum ${target}`, ...cells);
}

const row = r => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c));
const col = c => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, c));

const consecutiveSums = [
  // Provenance: `text` entries in the puzzle payload, outside-grid clue cells.
  consecutiveSum(16, row(1)),
  consecutiveSum(29, row(3)),
  consecutiveSum(20, row(7)),
  consecutiveSum(0, col(1)),
  consecutiveSum(39, col(4)),
  consecutiveSum(22, col(7)),
];

return [
  new Shape('9x9'),
  ...zippers,
  ...blackDots,
  ...consecutiveSums,
];
