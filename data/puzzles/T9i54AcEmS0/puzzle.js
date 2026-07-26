// Title: Odds and Ends
// Author: Ul-Rhymm
// Video: https://www.youtube.com/watch?v=T9i54AcEmS0
// Source: https://sudokupad.app/r1jg7q3rbs

// Normal sudoku (default 3x3 boxes). Each pink line is a Renban (consecutive,
// non-repeating digits in any order). Cages hold non-repeating digits; the
// three numbered cages also sum to their label. The five "O" cages have no
// printed total but must sum to an odd number (rules: 'Cages marked with an
// "O" sum to an odd number').

// Sum cages: distinct digits, sum to the top-left total.
// Cell tables transcribed from the source's numbered cage clues.
const sumCages = [
  new Cage(20, 'R2C4', 'R3C3', 'R3C4', 'R4C2', 'R4C3'),
  new Cage(18, 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R8C6'),
  new Cage(17, 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R5C7'),
];

// "O" cages: distinct digits (AllDifferent), no fixed total, plus an odd-sum
// NFA below. Cell tables transcribed from the source's "O"-marked cage clues.
const oddCageCells = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2'],
  ['R7C8', 'R8C7', 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R4C4', 'R4C5', 'R5C4'],
  ['R5C6', 'R6C5', 'R6C6'],
  ['R6C3', 'R6C4', 'R7C4'],
];
const oddCageDistinct = oddCageCells.map(cells => new AllDifferent(...cells));

// Odd-sum NFA: tracks the running sum's parity (2 states) and accepts when
// the total is odd. The scan order of an unordered cage's cells doesn't
// matter because sum parity is order-independent.
const oddSumSpec = NFA.encodeSpec({
  startState: 0,
  transition: (parity, value) => (parity + value) % 2,
  accept: (parity) => parity === 1,
}, 9);
const oddCageSums = oddCageCells.map(cells => new NFA(oddSumSpec, 'OddSum', ...cells));

// Pink Renban lines: consecutive, non-repeating digits in any order.
// Cell paths transcribed from the drawn pink strokes; each is a separately
// drawn stroke (no shared endpoints or split-line flags), so each is its own
// Renban.
const renbanLines = [
  ['R6C7', 'R6C8', 'R7C8', 'R8C9'],
  ['R7C6', 'R8C6', 'R8C7', 'R9C8'],
  ['R4C3', 'R4C2', 'R3C2', 'R2C1'],
  ['R1C2', 'R2C3', 'R2C4', 'R3C4'],
  ['R8C8', 'R9C9'],
  ['R1C1', 'R2C2'],
  ['R3C3', 'R4C4'],
  ['R6C6', 'R7C7'],
  ['R3C7', 'R4C6'],
  ['R4C7', 'R5C7', 'R5C6', 'R6C5'],
  ['R3C6', 'R3C5', 'R4C5', 'R5C4'],
  ['R7C4', 'R7C5'],
  ['R5C3', 'R6C3'],
].map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  ...sumCages,
  ...oddCageDistinct,
  ...oddCageSums,
  ...renbanLines,
];
