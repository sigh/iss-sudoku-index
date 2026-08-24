// Title: Lie Detector Sudoku
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=tvwduaUZT2s
// Source: https://app.crackingthecryptic.com/sudoku/f2bMfTnD36

// Rules encoded:
// - Normal sudoku rules (9x9, rows/columns/3x3 boxes all-different -- ISS
//   default; the payload's own `regions` are the ordinary nine boxes).
// - 22 killer cages are drawn, forming 11 pairs that share one printed total
//   (3, 4, 6, 8, 10, 11, 15, 16, 17, 19, 24 -- each printed on exactly two
//   cages). "Digits in cages sum to the total given, EXCEPT: for each given
//   cage total, one such cage is telling the truth and sums to the given
//   number, but the other is lying and does not." The rules text only
//   qualifies the total; a cage's no-repeated-digit property (what marks it
//   as a cage rather than an untotalled sum group) is not one of the things
//   being lied about, so it holds for both cages of every pair regardless of
//   which one is truthful. Each pair is encoded as an exclusive Or over
//   which side tells the truth.
// - Four given digits.

// Cage cell lists, transcribed from the drawn cages, grouped into the 11
// truth/lie pairs by shared printed total.
const TRUTH_PAIRS = [
  [3, ['R7C3'], ['R5C5', 'R6C5']],
  [4, ['R2C4'], ['R5C7', 'R6C7']],
  [6, ['R2C6', 'R2C7'], ['R4C1', 'R4C2']],
  [8, ['R1C8', 'R2C8', 'R3C8'], ['R5C8', 'R5C9', 'R6C8']],
  [10, ['R8C8', 'R9C8'], ['R4C4', 'R5C4', 'R6C4', 'R7C4']],
  [11, ['R1C1', 'R2C1', 'R2C2', 'R2C3'], ['R5C3', 'R6C1', 'R6C2', 'R6C3']],
  [15, ['R4C6', 'R5C6'], ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6']],
  [16, ['R3C9', 'R4C9'], ['R8C4', 'R8C5', 'R9C4', 'R9C5', 'R9C6']],
  [17, ['R7C7', 'R8C7'], ['R1C9', 'R2C9']],
  [19, ['R7C5', 'R7C6', 'R8C6'], ['R8C1', 'R8C2', 'R8C3', 'R9C2', 'R9C3']],
  [24, ['R6C9', 'R7C9', 'R8C9', 'R9C9'], ['R3C3', 'R3C4', 'R3C5', 'R3C6']],
];

const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// One NFA spec per distinct total, scanning a cage's cells (order-irrelevant,
// since only the sum matters) and accepting unless the running sum equals
// the total exactly. The sum is clamped at total+1, a shared sink for every
// overshoot, so the compiled state count stays at total+2 regardless of cage
// size.
const wrongSumSpecCache = new Map();
const wrongSumSpec = (total) => {
  if (!wrongSumSpecCache.has(total)) {
    wrongSumSpecCache.set(total, NFA.encodeSpec({
      startState: 0,
      transition: (sum, value) => Math.min(sum + value, total + 1),
      accept: (sum) => sum !== total,
    }, 9));
  }
  return wrongSumSpecCache.get(total);
};

// Key cache for the 2-cell liar case: distinct AND sum != total, as one
// binary relation (a 2-cell NFA is just a Pair, so the lint requires this
// form instead of the general NFA below).
const pairWrongSumKeyCache = new Map();
const pairWrongSumKey = (total) => {
  if (!pairWrongSumKeyCache.has(total)) {
    pairWrongSumKeyCache.set(
      total, Pair.fnToKey((a, b) => a !== b && a + b !== total, 9));
  }
  return pairWrongSumKeyCache.get(total);
};

// A cage whose digits must NOT sum to `total` (the liar of its pair), still
// subject to the killer no-repeat property. `Cage` requires >=2 cells, so a
// single-cell "cage" is just a Given excluding the one forbidden value; a
// 2-cell cage is a single Pair; 3+ cells need the running-sum NFA.
const liarCage = (total, cells) => {
  if (cells.length === 1) {
    return new Given(cells[0], ...ALL_DIGITS.filter(v => v !== total));
  }
  if (cells.length === 2) {
    return new Pair(pairWrongSumKey(total), `not-sum-${total}`, cells[0], cells[1]);
  }
  return new And([
    new AllDifferent(...cells),
    new NFA(wrongSumSpec(total), `not-sum-${total}`, ...cells),
  ]);
};

// A cage whose digits must sum to `total` (the truth-teller of its pair).
const truthCage = (total, cells) => cells.length === 1
  ? new Given(cells[0], total)
  : new Cage(total, ...cells);

const pairConstraints = TRUTH_PAIRS.map(([total, cellsA, cellsB]) => new Or([
  new And([truthCage(total, cellsA), liarCage(total, cellsB)]),
  new And([liarCage(total, cellsA), truthCage(total, cellsB)]),
]));

const givens = [
  new Given('R1C3', 2),
  new Given('R2C5', 3),
  new Given('R3C1', 9),
  new Given('R8C5', 6),
];

return [
  new Shape('9x9'),
  ...givens,
  ...pairConstraints,
];
