// Title: Aug 3, 2022: Consecutive Pairs
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=5US7HIamSKI
// Source: https://tinyurl.com/2f8tts6f

// Normal sudoku rules apply (standard 3x3 boxes). White dots are drawn
// between exactly the listed adjacent pairs; the rules state that pairs
// without a dot may or may not be consecutive, so no negative (Strict
// Kropki) constraint is added for undotted pairs.

const givens = [
  ['R1C1', 4], ['R1C4', 8], ['R1C6', 9],
  ['R5C3', 3], ['R5C8', 5],
  ['R9C4', 5], ['R9C6', 3], ['R9C9', 7],
].map(([cell, value]) => new Given(cell, value));

// White dot pairs, transcribed from the payload's `difference` array.
const whiteDots = [
  ['R3C1', 'R4C1'], ['R4C1', 'R5C1'], ['R6C1', 'R5C1'], ['R7C1', 'R6C1'],
  ['R7C1', 'R7C2'], ['R8C2', 'R7C2'], ['R8C3', 'R7C3'], ['R3C2', 'R3C1'],
  ['R3C2', 'R2C2'], ['R2C3', 'R3C3'], ['R3C6', 'R4C6'], ['R4C6', 'R5C6'],
  ['R6C6', 'R5C6'], ['R6C6', 'R7C6'], ['R7C6', 'R7C7'], ['R8C7', 'R7C7'],
  ['R8C8', 'R7C8'], ['R3C6', 'R3C7'], ['R3C7', 'R2C7'], ['R2C8', 'R3C8'],
  ['R3C4', 'R3C3'], ['R7C4', 'R7C3'], ['R3C8', 'R3C9'], ['R7C9', 'R7C8'],
].map((cells) => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDots,
];
