// Title: Equilibrium 2
// Author: GemmaOane
// Video: https://www.youtube.com/watch?v=hn0Ww2BPAyM
// Source: https://app.crackingthecryptic.com/sudoku/P97Nt3HLmP

// Standard Sudoku, R7C2=8, four XV pairs summing to 15, purple counter-digit
// lines, and blue lines with equal sums in every box each line visits.
const purpleLines = [
  ['R2C7', 'R1C7', 'R1C8', 'R2C8', 'R2C9', 'R1C9'],
  ['R1C3', 'R1C2', 'R1C1'],
  ['R6C3', 'R6C2', 'R7C1', 'R8C1', 'R8C2'],
  ['R9C4', 'R8C4', 'R8C5', 'R9C5'],
  ['R8C7', 'R9C7'],
  ['R7C8', 'R7C9', 'R6C9'],
  ['R5C6', 'R5C5', 'R6C5', 'R6C6'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C9'],
];

// State is the bitmask of digits already seen. Duplicate digits reject; the
// accepting masks are closed under the counter-digit involution d -> 10-d.
const counterDigitLine = NFA.encodeSpec({
  startState: 0,
  transition: (seen, digit) => (seen & (1 << (digit - 1))) ? undefined : seen | (1 << (digit - 1)),
  accept: seen => [1, 2, 3, 4].every(d => Boolean(seen & (1 << (d - 1))) === Boolean(seen & (1 << (9 - d)))),
}, 9);

// Each nested array is one drawn blue line, split into its consecutive visits
// to 3x3 boxes; EqualSum preserves the per-line (not global) common total.
const blueBoxSegments = [
  [['R3C9', 'R3C8', 'R3C7'], ['R3C6', 'R2C6']],
  [['R2C2', 'R2C3'], ['R2C4', 'R2C5']],
  [['R3C2', 'R3C1'], ['R4C1', 'R5C1', 'R6C1']],
  [['R5C4', 'R6C4'], ['R7C5', 'R7C6']],
  [['R8C6'], ['R8C7', 'R8C8']],
];

return [
  new Shape('9x9'),
  new Given('R7C2', 8),
  new Sum(15, 'R3C3', 'R3C4'),
  new Sum(15, 'R4C4', 'R4C5'),
  new Sum(15, 'R6C7', 'R6C8'),
  new Sum(15, 'R8C6', 'R9C6'),
  ...purpleLines.map(cells => new NFA(counterDigitLine, 'counter-digit line', ...cells)),
  ...blueBoxSegments.map(segments => new EqualSum(...segments)),
];
