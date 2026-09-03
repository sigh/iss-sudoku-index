// Title: Untitled
// Author: Sed Holaysan
// Video: https://www.youtube.com/watch?v=qXmd4BJgBdg
// Source: https://cracking-the-cryptic.web.app/sudoku/hMQ6gdBggN

// Rules encoded:
//   Normal sudoku -- 1-9 once per row, column and 3x3 box (the engine
//   baseline; the nine regions the source draws are the standard boxes).
//
// Omitted: eight letter markers ("L" x3, "C" x5), each centred on the border
// between two orthogonally adjacent cells -- R1C2/R1C3, R6C2/R6C3, R5C6/R5C7
// ("L"); R3C2/R3C3, R4C2/R4C3, R6C6/R6C7, R7C2/R7C3, R7C5/R8C5 ("C"). What
// they assert about the pair they separate is stated nowhere in the source or
// in the text that links it. The X/V reading of a letter in this position --
// the Roman numeral is the pair's sum -- is arithmetically impossible here
// (L = 50, C = 100, while two cells sharing a row or column hold distinct
// digits summing to at most 17), and nothing drawn picks out a replacement,
// so no constraint is placed on the marked pairs.

// The nine drawn givens.
const givens = [
  ['R1C7', 1],
  ['R1C9', 2],
  ['R3C1', 5],
  ['R4C7', 3],
  ['R4C9', 4],
  ['R5C4', 1],
  ['R6C1', 7],
  ['R7C7', 5],
  ['R7C9', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
