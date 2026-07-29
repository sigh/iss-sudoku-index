// Title: Chock-a-Block
// Author: Marty Sears and Justin Vitanza
// Video: https://www.youtube.com/watch?v=eREMbxX_5TY
// Source: https://sudokupad.app/1j53hl97cx

// Normal 9x9 Sudoku plus the coloured-line rules. The unlabelled, globally
// distinct N values of all 27 lines are not encoded.
const evenSumSpec = NFA.encodeSpec({
  startState: { parity: 0 },
  transition: ({ parity }, value) => ({ parity: (parity + value) % 2 }),
  accept: ({ parity }) => parity === 0,
  maxDepth: 3,
}, 9);

// The state retains the first adjacent absolute difference and checks it on the
// final edge of each three-cell turquoise line.
const sameDifferenceSpec = NFA.encodeSpec({
  startState: { phase: 'first', previous: 0, difference: 0 },
  transition: ({ phase, previous, difference }, value) => {
    if (phase === 'first') return { phase: 'second', previous: value, difference: 0 };
    if (phase === 'second') {
      return { phase: 'rest', previous: value, difference: Math.abs(value - previous) };
    }
    return Math.abs(value - previous) === difference
      ? { phase: 'rest', previous: value, difference }
      : undefined;
  },
  accept: ({ phase }) => phase === 'rest',
  maxDepth: 3,
}, 9);

const primeSum = Pair.fnToKey((a, b) => [2, 3, 5, 7, 11, 13, 17].includes(a + b), 9);
const antiKropki = Pair.fnToKey((a, b) =>
  Math.abs(a - b) !== 1 && a !== 2 * b && b !== 2 * a, 9);

const pinkRenbans = [
  ['R1C2', 'R1C1', 'R2C2'], ['R9C1', 'R9C2', 'R8C3'],
  ['R8C8', 'R8C7', 'R9C8'], ['R9C9', 'R8C9', 'R7C9'],
];
const blueEvenSums = [
  ['R5C1', 'R6C1', 'R7C2'], ['R6C2', 'R7C3', 'R8C4'],
  ['R2C1', 'R3C2', 'R3C3'],
];
const purplePrimes = [
  ['R4C3', 'R5C2', 'R6C3'], ['R4C4', 'R5C3', 'R6C4'],
  ['R2C6', 'R3C7', 'R4C8'],
];
const redAntiKropkis = [
  ['R4C1', 'R3C1', 'R4C2'], ['R3C4', 'R4C5', 'R5C6'],
  ['R8C1', 'R7C1', 'R8C2'], ['R8C5', 'R9C6', 'R9C7'],
  ['R7C5', 'R6C6', 'R5C5'], ['R7C4', 'R6C5', 'R5C4'],
  ['R7C8', 'R6C9', 'R5C9'], ['R2C7', 'R1C8', 'R1C7'],
];
const turquoiseDifferences = [
  ['R2C5', 'R3C5', 'R4C6'], ['R3C6', 'R4C7', 'R5C7'],
  ['R8C6', 'R7C7', 'R6C8'],
];
const everyPair = cells => cells.flatMap((cell, i) =>
  cells.slice(i + 1).map(other => [cell, other]));

return [
  new Shape('9x9'),
  ...pinkRenbans.map(cells => new Renban(...cells)),
  ...blueEvenSums.map((cells, i) => new NFA(evenSumSpec, `even sum ${i + 1}`, ...cells)),
  ...purplePrimes.map((cells, i) => new Pair(primeSum, `prime line ${i + 1}`, ...cells)),
  // The red negative rule applies to every pair anywhere on each drawn line.
  ...redAntiKropkis.flatMap((cells, line) => everyPair(cells).map(([a, b], pair) =>
    new Pair(antiKropki, `anti-Kropki line ${line + 1}, pair ${pair + 1}`, a, b))),
  ...turquoiseDifferences.map((cells, i) => new NFA(sameDifferenceSpec, `same difference ${i + 1}`, ...cells)),
];
