// Title: The Chromatic Octagon
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=j4oD3Qh08lc
// Source: https://app.crackingthecryptic.com/sudoku/TQM4644NR7

// Normal sudoku (standard rows/cols/boxes, from the default Shape). Cages sum
// to their printed total when one is given and are always all-different; a
// no-total cage is drawn as a real cage (all-different only). White dots mark
// consecutive digits between the two cells they touch. Grey lines (all drawn
// in the same colour/thickness, long or short) are palindromes.

// Two cages carry a printed sum (top-left small clue), read from the cage data.
const SUM_CAGES = [
  [25, 'R2C2', 'R3C2', 'R4C2', 'R5C2'],
  [26, 'R5C8', 'R6C8', 'R7C8', 'R8C8'],
];

// Four cages are drawn with no printed total; each is a 9-cell region, so
// all-different forces it to a permutation of 1-9.
const NO_TOTAL_CAGES = [
  ['R5C6', 'R6C6', 'R7C6', 'R7C5', 'R7C4', 'R8C6', 'R9C6', 'R9C5', 'R9C4'],
  ['R5C4', 'R4C4', 'R3C4', 'R2C4', 'R1C4', 'R1C5', 'R1C6', 'R3C6', 'R3C5'],
  ['R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R5C3', 'R4C3', 'R6C4', 'R6C5'],
  ['R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R5C7', 'R6C7'],
];

// White dots, from the drawn overlay pairs.
const WHITE_DOTS = [
  ['R1C1', 'R1C2'],
  ['R2C1', 'R3C1'],
  ['R7C1', 'R8C1'],
  ['R9C1', 'R9C2'],
  ['R1C8', 'R2C8'],
  ['R6C9', 'R7C9'],
];

// Grey lines, from the drawn line paths. The first is the 16-cell octagon
// ring; the other eight are length-2 palindromes, which force each pair to
// hold equal digits (a palindrome must equal its own reverse).
const GREY_LINES = [
  ['R8C4', 'R8C5', 'R8C6', 'R7C7', 'R6C8', 'R5C8', 'R4C8', 'R3C7', 'R2C6',
    'R2C5', 'R2C4', 'R3C3', 'R4C2', 'R5C2', 'R6C2', 'R7C3'],
  ['R4C1', 'R3C2'],
  ['R6C1', 'R7C2'],
  ['R8C3', 'R9C4'],
  ['R9C6', 'R8C7'],
  ['R2C3', 'R1C4'],
  ['R1C6', 'R2C7'],
  ['R3C8', 'R4C9'],
  ['R6C9', 'R7C8'],
];

return [
  new Shape('9x9'),
  ...SUM_CAGES.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...NO_TOTAL_CAGES.map((cells) => new AllDifferent(...cells)),
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...GREY_LINES.map((cells) => new Palindrome(...cells)),
];
