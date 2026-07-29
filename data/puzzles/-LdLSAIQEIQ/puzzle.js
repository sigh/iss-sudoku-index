// Title: P is for Prime
// Author: Chaos is Inevitable!
// Video: https://www.youtube.com/watch?v=-LdLSAIQEIQ
// Source: https://app.crackingthecryptic.com/H66NhnG9mm

// Normal Sudoku rules apply. On the red line, adjacent digits differ by at
// least 5 and each digit that occurs does so 1, 2, 3, 5, or 7 times (1 is
// prime in this puzzle). Cage digits are distinct; a cage is all prime digits
// (1,2,3,5,7) with a non-prime sum, or all non-prime digits (4,6,8,9) with a
// prime sum, so those two properties never both hold.
const redLine = [
  'R9C5', 'R9C4', 'R9C3', 'R8C3', 'R7C3', 'R6C3', 'R5C3',
  'R4C3', 'R3C3', 'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7',
  'R2C8', 'R3C8', 'R4C8', 'R5C7', 'R5C6', 'R5C5', 'R5C4',
];

// Cage cell lists are transcribed from the ten drawn no-total cages.
const cages = [
  ['R1C1', 'R1C2'], ['R1C4', 'R1C5'], ['R2C1', 'R2C2'],
  ['R3C6', 'R4C6'], ['R4C9', 'R5C9', 'R5C8'],
  ['R4C7', 'R5C7', 'R6C7', 'R6C8'], ['R6C6', 'R7C6', 'R8C6'],
  ['R9C6', 'R9C7'], ['R6C2', 'R7C2'], ['R8C1', 'R8C2'],
];
const primeDigits = [1, 2, 3, 5, 7];
const primeNonPrimeSum = NFA.encodeSpec({
  startState: { sum: 0 },
  transition: ({ sum }, value) => {
    if (!primeDigits.includes(value)) return undefined;
    return { sum: sum + value };
  },
  accept: ({ sum }) => ![2, 3, 5, 7, 11, 13, 17, 19, 23].includes(sum),
  maxDepth: 4,
}, 9);
const nonPrimePrimeSum = NFA.encodeSpec({
  startState: { sum: 0 },
  transition: ({ sum }, value) => {
    if (![4, 6, 8, 9].includes(value)) return undefined;
    return { sum: sum + value };
  },
  accept: ({ sum }) => [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31].includes(sum),
  maxDepth: 4,
}, 9);
function primeOccurrenceCount(digit) {
  return NFA.encodeSpec({
    // count is the occurrences of this digit, capped at the first impossible count.
    startState: { count: 0 },
    transition: ({ count }, value) => ({
      count: Math.min(count + (value === digit ? 1 : 0), 8),
    }),
    accept: ({ count }) => [0, 1, 2, 3, 5, 7].includes(count),
    maxDepth: 21,
  }, 9);
}

return [
  new Shape('9x9'),
  new Whisper(5, ...redLine),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) =>
    new NFA(primeOccurrenceCount(digit), `red-line ${digit} count`, redLine)),
  ...cages.map((cells) => new AllDifferent(...cells)),
  ...cages.map((cells) => new Or([
    // The NFA states keep the bounded cage sum while restricting its digit class.
    new NFA(primeNonPrimeSum, 'prime non-prime-sum cage', cells),
    new NFA(nonPrimePrimeSum, 'non-prime prime-sum cage', cells),
  ])),
];
