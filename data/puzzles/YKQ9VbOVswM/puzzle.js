// Title: Amigos
// Author: Bram Cohen
// Video: https://www.youtube.com/watch?v=YKQ9VbOVswM
// Source: https://app.crackingthecryptic.com/sudoku/rRqpfMmFbJ

// Normal sudoku rules apply. Black dots join cells with a ratio of 1:2;
// white dots join cells with consecutive digits. A 1/2 pair could have a
// black or white dot, and not all possible dots are given, so an unmarked
// adjacent pair asserts nothing: no negative/exhaustive closure (no
// StrictKropki) is encoded, only the drawn dots below.

// Drawn white (consecutive) dot pairs, transcribed from the rounded
// edge-overlay marks filled white in the puzzle payload.
const whiteDotPairs = [
  ['R1C2', 'R2C2'], ['R1C5', 'R2C5'], ['R1C7', 'R1C8'], ['R2C6', 'R3C6'],
  ['R5C2', 'R6C2'], ['R5C4', 'R5C5'], ['R5C5', 'R5C6'], ['R5C7', 'R5C8'],
  ['R5C8', 'R5C9'], ['R6C4', 'R6C5'], ['R6C5', 'R6C6'], ['R7C8', 'R7C9'],
  ['R8C4', 'R9C4'], ['R8C5', 'R9C5'], ['R8C9', 'R9C9'], ['R9C3', 'R9C4'],
  ['R9C6', 'R9C7'],
];

// Drawn black (1:2 ratio) dot pairs, transcribed from the rounded
// edge-overlay marks filled black in the puzzle payload.
const blackDotPairs = [
  ['R2C3', 'R2C4'], ['R3C4', 'R4C4'], ['R3C6', 'R3C7'], ['R4C5', 'R4C6'],
  ['R5C3', 'R5C4'], ['R7C1', 'R7C2'], ['R7C3', 'R8C3'], ['R7C4', 'R7C5'],
  ['R8C5', 'R8C6'], ['R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...whiteDotPairs.map((cells) => new WhiteDot(...cells)),
  ...blackDotPairs.map((cells) => new BlackDot(...cells)),
];
