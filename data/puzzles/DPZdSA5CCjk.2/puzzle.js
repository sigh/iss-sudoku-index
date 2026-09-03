// Title: September 4, 2022: Two for One
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=DPZdSA5CCjk
// Source: https://tinyurl.com/2pjh85jw

// Rules: normal sudoku rules apply; digits in cells separated by a black dot
// must have a ratio of 2:1. The rules state there is no negative constraint --
// unmarked pairs may also be in a 2:1 ratio -- so the dots are encoded
// individually and no StrictKropki-style exhaustiveness is added.
// Nothing else is drawn on the board; no rule is omitted.

// The 20 printed given digits, read off the grid.
const givens = [
  ['R1C1', 1], ['R1C3', 8], ['R2C2', 2], ['R3C1', 4], ['R3C3', 3],
  ['R3C8', 7], ['R3C9', 5], ['R4C2', 5], ['R4C4', 4], ['R5C3', 6],
  ['R5C5', 5], ['R5C7', 4], ['R6C6', 6], ['R6C8', 5], ['R7C1', 8],
  ['R7C7', 7], ['R7C9', 6], ['R8C8', 8], ['R9C6', 5], ['R9C9', 9],
];

// The 10 drawn black dots, each as the pair of cells it separates. Every dot
// sits on a horizontal edge; the two staircases are 180-degree symmetric.
const blackDots = [
  ['R1C6', 'R1C7'], ['R1C8', 'R1C9'],
  ['R2C5', 'R2C6'], ['R2C7', 'R2C8'],
  ['R3C4', 'R3C5'],
  ['R7C5', 'R7C6'],
  ['R8C2', 'R8C3'], ['R8C4', 'R8C5'],
  ['R9C1', 'R9C2'], ['R9C3', 'R9C4'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  // One BlackDot per drawn dot, so only the marked pair is related.
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
