// Title: The Ultimate Prime Cages
// Author: Xenonetix
// Video: https://www.youtube.com/watch?v=CkVzEDR9O0c
// Source: https://sudokupad.app/FF7LtbJ3Hn

// Normal Sudoku applies. Each outlined cage has a prime digit sum, repeats are
// allowed within a cage, and different cages have different sums.

const cages = [
  ['R1C1', 'R1C2', 'R2C1'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R4C4', 'R5C4'],
  ['R3C3', 'R3C4', 'R4C3'],
  ['R4C5', 'R4C6'],
  ['R5C5', 'R6C5'],
  ['R5C6', 'R6C6'],
  ['R6C3', 'R6C4', 'R7C3', 'R7C4'],
  ['R6C7', 'R7C5', 'R7C6', 'R7C7', 'R8C5'],
  ['R2C5', 'R2C7', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C7'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9'],
  ['R8C9', 'R9C8', 'R9C9'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C2', 'R2C3', 'R2C4', 'R2C6', 'R3C2', 'R4C2'],
  ['R3C1', 'R4C1', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R7C1', 'R7C2', 'R8C2'],
  ['R3C9', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C8', 'R6C9', 'R7C8', 'R7C9', 'R8C3', 'R8C4', 'R8C6', 'R8C7', 'R8C8', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
];

const primes = new Set([
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41,
  43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
]);

// State is the cage's bounded running total; 98 or more cannot be one of the
// stated primes.
const primeSumNFA = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => sum + value <= 97 ? sum + value : undefined,
  accept: sum => primes.has(sum),
}, 9);

// The two segments are cage sums. A signed running difference avoids storing
// two totals, and the segment break changes from adding the first to subtracting
// the second. A magnitude above 97 cannot end at a stated prime total.
const distinctSumNFA = NFA.encodeSpec({
  startState: { phase: 'first', difference: 0 },
  transition: ({ phase, difference }, value) => {
    if (value === SEGMENT_BREAK) {
      return phase === 'first' ? { phase: 'second', difference } : undefined;
    }
    const next = difference + (phase === 'first' ? value : -value);
    return Math.abs(next) <= 97 ? { phase, difference: next } : undefined;
  },
  accept: ({ phase, difference }) => phase === 'second' && difference !== 0,
}, 9, { multiSegment: true });

// Cage cell lists are transcribed from the 15 drawn outlines.
const primeCages = cages.map(cells => new NFA(primeSumNFA, 'prime cage sum', ...cells));
const distinctCageSums = cages.flatMap((left, i) =>
  cages.slice(i + 1).map(right =>
    new NFA(distinctSumNFA, 'different cage sums', left, right)));

return [
  new Shape('9x9'),
  ...primeCages,
  ...distinctCageSums,
];
