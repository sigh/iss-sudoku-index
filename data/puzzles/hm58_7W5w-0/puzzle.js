// Title: Potting the Pink
// Author: BPH Mills
// Video: https://www.youtube.com/watch?v=hm58_7W5w-0
// Source: https://app.crackingthecryptic.com/fPr4BGqb36

// Normal Sudoku rules apply. Pink-dot cells are both prime; black-dot cells
// have a 1:2 ratio; white-dot cells are consecutive; red-dot cells sum to 8.
// Each table below is transcribed from the corresponding coloured edge dots.
const PINK_DOTS = [
  ['R1C8', 'R1C9'], ['R3C8', 'R3C9'], ['R3C9', 'R4C9'],
  ['R7C7', 'R7C8'], ['R9C7', 'R9C8'], ['R8C6', 'R9C6'],
  ['R8C4', 'R9C4'], ['R7C3', 'R8C3'], ['R7C2', 'R8C2'],
  ['R4C2', 'R5C2'], ['R4C1', 'R5C1'], ['R1C1', 'R2C1'],
  ['R1C3', 'R2C3'], ['R2C4', 'R2C5'], ['R3C4', 'R3C5'],
  ['R5C5', 'R6C5'], ['R5C6', 'R6C6'],
];
const BLACK_DOTS = [
  ['R1C9', 'R2C9'], ['R5C7', 'R5C8'], ['R6C7', 'R6C8'],
  ['R6C6', 'R7C6'], ['R7C4', 'R7C5'], ['R8C3', 'R9C3'],
  ['R6C2', 'R6C3'], ['R5C2', 'R6C2'], ['R1C1', 'R1C2'],
  ['R3C1', 'R3C2'], ['R3C5', 'R4C5'], ['R4C2', 'R4C3'],
  ['R2C5', 'R2C6'],
];
const WHITE_DOTS = [['R1C6', 'R1C7'], ['R7C9', 'R8C9'], ['R3C1', 'R4C1']];
const RED_DOTS = [['R7C7', 'R8C7'], ['R1C8', 'R2C8']];

// Pair keys encode the two symmetric custom domino predicates over digits 1-9.
const bothPrime = Pair.fnToKey((a, b) => [2, 3, 5, 7].includes(a) && [2, 3, 5, 7].includes(b), 9);
const sumEight = Pair.fnToKey((a, b) => a + b === 8, 9);

return [
  new Shape('9x9'),
  ...PINK_DOTS.map(([a, b]) => new Pair(bothPrime, 'Pink dots: both prime', a, b)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...RED_DOTS.map(([a, b]) => new Pair(sumEight, 'Red dots: sum to 8', a, b)),
];
