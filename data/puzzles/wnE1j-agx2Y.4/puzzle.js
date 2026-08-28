// Title: Apr 16, 2022: Magic Squares
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=wnE1j-agx2Y
// Source: https://tinyurl.com/2p9crkbt

// Normal sudoku rules apply. Each blue 3x3 area is a magic square: its 3
// rows, 3 columns and 2 diagonals all sum to the same total. The rules text
// does not name the total; each square's own all-different (from the
// standard box rule, since every shaded square is a real sudoku box) then
// forces the shared row/column/diagonal sum to 15 by itself.

const graph = cellGraph('9x9');

const givens = [
  ['R1C4', 8],
  ['R2C8', 1],
  ['R3C6', 5],
  ['R3C9', 2],
  ['R4C9', 4],
  ['R6C1', 5],
  ['R7C1', 6],
  ['R7C4', 5],
  ['R8C2', 8],
  ['R9C6', 3],
];

// The 3 blue-shaded magic squares (drawn geometry) are boxes 1, 5 and 9 --
// top-left, center and bottom-right -- each reshaped into its 3 rows, 3
// columns and 2 diagonals.
function magicSegments(box) {
  return [
    [box[0], box[1], box[2]],
    [box[3], box[4], box[5]],
    [box[6], box[7], box[8]],
    [box[0], box[3], box[6]],
    [box[1], box[4], box[7]],
    [box[2], box[5], box[8]],
    [box[0], box[4], box[8]],
    [box[2], box[4], box[6]],
  ];
}
const magicBoxNumbers = [1, 5, 9];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...magicBoxNumbers.map(n => new EqualSum(...magicSegments(graph.box(n)))),
];
