// Title: The reckoning
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=8e8NrFkUqT8
// Source: https://sudokupad.app/9702l0djmf

// Normal sudoku, no givens. Digits do not repeat within a cage. Self-counting
// cages: if the digits in a cage sum to N, exactly N of the 23 cages sum to N.
// Encoded as an Or over the possible sets of cage sums, with NFAs enforcing
// the exact count for each sum in the set.

const cages = [
  ['R5C1', 'R5C2'],
  ['R5C3', 'R5C4'],
  ['R5C6', 'R5C7'],
  ['R5C8', 'R5C9'],
  ['R1C5', 'R2C5', 'R3C5'],
  ['R4C5', 'R5C5'],
  ['R6C5', 'R7C5'],
  ['R8C5', 'R9C5'],
  ['R7C6', 'R7C7'],
  ['R7C3', 'R7C4'],
  ['R3C6', 'R3C7', 'R3C8'],
  ['R3C2', 'R3C3', 'R3C4'],
  ['R3C1', 'R4C1'],
  ['R3C9', 'R4C9'],
  ['R8C4', 'R9C4'],
  ['R8C6', 'R9C6'],
  ['R6C2', 'R7C1', 'R7C2'],
  ['R9C2', 'R9C3'],
  ['R6C9', 'R7C8', 'R7C9'],
  ['R4C2', 'R4C3'],
  ['R9C8', 'R9C9'],
  ['R1C1', 'R1C2'],
  ['R2C6', 'R2C7'],
];

const possibleSumSets = [
  [3, 4, 5, 11],
  [3, 4, 6, 10],
  [3, 4, 7, 9],
  [3, 4, 16],
  [3, 5, 6, 9],
  [3, 5, 7, 8],
  [3, 5, 15],
  [3, 6, 14],
  [3, 7, 13],
  [3, 8, 12],
  [3, 9, 11],
  [3, 20],
  [4, 5, 6, 8],
  [4, 5, 14],
  [4, 6, 13],
  [4, 7, 12],
  [4, 8, 11],
  [4, 9, 10],
  [4, 19],
  [5, 6, 12],
  [5, 7, 11],
  [5, 8, 10],
  [5, 18],
  [6, 7, 10],
  [6, 8, 9],
  [6, 17],
  [7, 16],
  [8, 15],
  [9, 14],
  [10, 13],
  [11, 12],
  [23],
];

function exactCageSumCountNFA(target) {
  return NFA.encodeSpec({
    startState: { count: 0, currentSum: 0 },

    transition: ({ count, currentSum }, value) => {
      if (value !== SEGMENT_BREAK) {
        const nextSum = currentSum + value;
        return nextSum <= 24 ? { count, currentSum: nextSum } : undefined;
      }

      const nextCount = count + (currentSum === target ? 1 : 0);
      if (nextCount > target) return undefined;
      return { count: nextCount, currentSum: 0 };
    },

    accept: ({ count, currentSum }) => (
      count + (currentSum === target ? 1 : 0) === target
    ),
  }, 9, { multiSegment: true });
}

function allowedCageSumsNFA(sumSet) {
  const allowed = new Set(sumSet);
  const maxSum = Math.max(...sumSet);
  return NFA.encodeSpec({
    startState: 0,

    transition: (currentSum, value) => {
      if (value !== SEGMENT_BREAK) {
        const nextSum = currentSum + value;
        return nextSum <= maxSum ? nextSum : undefined;
      }

      return allowed.has(currentSum) ? 0 : undefined;
    },

    accept: currentSum => allowed.has(currentSum),
  }, 9, { multiSegment: true });
}

return [
  new Shape('9x9'),

  ...cages.map(cage => new AllDifferent(...cage)),

  new Or(possibleSumSets.map(sumSet => new And([
    new NFA(
      allowedCageSumsNFA(sumSet),
      `only cage sums ${sumSet.join(',')}`,
      ...cages,
    ),
    ...sumSet.map(sum => new NFA(
      exactCageSumCountNFA(sum),
      `exactly ${sum} cages sum ${sum}`,
      ...cages,
    )),
  ]))),
];
