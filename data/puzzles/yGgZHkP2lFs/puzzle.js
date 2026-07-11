// Title: Dueling Cages
// Author: Deckatron
// Video: https://www.youtube.com/watch?v=yGgZHkP2lFs
// Source: https://sudokupad.app/sxsm_Deckatron_6dd0c5a868bfce8cc0c0a826862b141b

// Normal sudoku, no givens. Dueling killer cages are drawn without printed
// totals: digits in a cage do not repeat, and every cage sums to one of TWO
// hidden values determined by the solver, with both hidden totals used by
// at least one cage. The Or over sum pairs plus the cage-sum NFA encodes
// exactly that hidden-two-totals rule. White dots mark consecutive digits;
// black dots mark a 1:2 ratio. The negative Kropki rule is scoped to cage
// interiors: all dots inside cages are given, so unmarked adjacent pairs in
// the same cage are neither consecutive nor 1:2; dots on cage borders or
// outside cages are not necessarily given.

const cages = [
  ['R1C7', 'R1C8'],
  ['R2C7', 'R2C8', 'R2C9'],
  ['R3C7', 'R3C8', 'R3C9'],
  ['R7C4', 'R8C4', 'R9C4'],
  ['R7C5', 'R8C5', 'R9C5'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R5C2', 'R5C3'],
  ['R5C7', 'R6C7'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R3C6', 'R4C6', 'R4C7'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R8C1', 'R8C2'],
  ['R8C8', 'R8C9'],
  ['R4C4', 'R5C4'],
  ['R5C9', 'R6C9', 'R7C9'],
  ['R6C2', 'R7C2'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R1C2', 'R2C2', 'R3C2'],
];

const whiteDots = [
  ['R5C7', 'R6C7'],
  ['R2C7', 'R2C8'],
  ['R2C8', 'R2C9'],
  ['R3C8', 'R3C9'],
  ['R3C7', 'R3C8'],
  ['R1C2', 'R2C2'],
];

const blackDots = [
  ['R5C2', 'R5C3'],
  ['R4C5', 'R5C5'],
];

const noDotEdges = [
  ['R1C7', 'R1C8'],
  ['R7C4', 'R8C4'],
  ['R8C4', 'R9C4'],
  ['R7C5', 'R8C5'],
  ['R8C5', 'R9C5'],
  ['R7C6', 'R8C6'],
  ['R8C6', 'R9C6'],
  ['R5C5', 'R6C5'],
  ['R3C6', 'R4C6'],
  ['R4C6', 'R4C7'],
  ['R2C4', 'R2C5'],
  ['R2C5', 'R2C6'],
  ['R8C1', 'R8C2'],
  ['R8C8', 'R8C9'],
  ['R4C4', 'R5C4'],
  ['R5C9', 'R6C9'],
  ['R6C9', 'R7C9'],
  ['R6C2', 'R7C2'],
  ['R4C1', 'R5C1'],
  ['R5C1', 'R6C1'],
  ['R2C2', 'R3C2'],
];

function cageSumNFA(allowedSums, requiredSums) {
  const allowed = new Set(allowedSums);
  const required = new Set(requiredSums);
  const maxSum = Math.max(...allowedSums);
  return NFA.encodeSpec({
    startState: { sum: 0, seen: [] },

    transition: ({ sum, seen }, value) => {
      if (value !== SEGMENT_BREAK) {
        const nextSum = sum + value;
        return nextSum <= maxSum ? { sum: nextSum, seen } : undefined;
      }
      if (!allowed.has(sum)) return undefined;
      return {
        sum: 0,
        seen: required.has(sum) && !seen.includes(sum) ? [...seen, sum] : seen,
      };
    },

    accept: ({ sum, seen }) => {
      if (!allowed.has(sum)) return false;
      const finalSeen = required.has(sum) && !seen.includes(sum)
        ? [...seen, sum]
        : seen;
      return requiredSums.every(requiredSum => finalSeen.includes(requiredSum));
    },
  }, 9, { multiSegment: true });
}

const hiddenSumPairs = [];
for (let a = 3; a <= 24; a++) {
  for (let b = a + 1; b <= 24; b++) {
    hiddenSumPairs.push([a, b]);
  }
}

const noHiddenKropki = Pair.fnToKey(
  (a, b) => Math.abs(a - b) !== 1 && a !== 2 * b && b !== 2 * a,
  9,
);

return [
  new Shape('9x9'),
  ...cages.map(cage => new AllDifferent(...cage)),
  new Or(hiddenSumPairs.map(pair => new NFA(
    cageSumNFA(pair, pair),
    'hidden cage sums',
    ...cages,
  ))),
  ...whiteDots.map(dot => new WhiteDot(...dot)),
  ...blackDots.map(dot => new BlackDot(...dot)),
  ...noDotEdges.map(edge => new Pair(noHiddenKropki, 'no hidden Kropki dot', ...edge)),
];
