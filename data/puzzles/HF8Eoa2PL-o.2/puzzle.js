// Title: Point to Next Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=HF8Eoa2PL-o
// Source: https://tinyurl.com/2p8jxupx

// Standard sudoku (rows, columns, boxes), plus: some cells carry a small
// drawn arrow glyph pointing in one of the 8 compass directions, entirely
// within that one cell (not a line drawn across cells). If such a cell holds
// digit N, the single adjacent cell in the arrow's direction must hold N+1.
// N = 9 can never sit on an arrow cell: the rule would require "digit 10" in
// the pointed-at cell, and 10 is not a grid digit, so no placement satisfies
// it. Per the rules text, "not all possible arrows are given": absence of a
// drawn arrow asserts nothing about that cell.
//
// The 28 glyphs are drawn as two icon styles:
//  - a single-tipped kite pointing straight up or straight down: unambiguous.
//  - a square with one corner replaced by a forked notch, used only for the
//    4 diagonals (cells listed below). This notch shape is symmetric under a
//    180-degree rotation, so geometry alone does not say whether the notch is
//    the arrowhead (pointing into the missing corner) or the tail/fletching
//    (arrow points through the cell to the opposite corner). Reading it as
//    the arrowhead sends R1C3's arrow off the top edge (row 1): the cell it
//    would need to point at does not exist, so any digit 1-8 there is
//    unsatisfiable and R1C3 is forced to 9 -- contradicting the given
//    R1C1 = 9 in the same row. The same reading also sends R9C7 off the
//    bottom edge. Reading the notch as the tail instead removes both
//    off-grid targets, so that is the reading encoded here.

const graph = cellGraph('9x9');

// (dRow, dCol) per arrow cell, transcribed from the drawn glyphs.
const arrows = {
  // single-tipped kite, points up (N)
  R2C1: [-1, 0], R2C3: [-1, 0], R3C1: [-1, 0], R3C3: [-1, 0],
  R4C1: [-1, 0], R4C3: [-1, 0], R5C1: [-1, 0], R6C1: [-1, 0], R7C1: [-1, 0],
  // single-tipped kite, points down (S)
  R3C9: [1, 0], R4C9: [1, 0], R5C9: [1, 0], R6C7: [1, 0], R6C9: [1, 0],
  R7C7: [1, 0], R7C9: [1, 0], R8C7: [1, 0], R8C9: [1, 0],
  // notched square, notch at the cell's top-right -> points SW (see note above)
  R1C3: [1, -1], R2C2: [1, -1],
  // notched square, notch at the cell's bottom-right -> points NW
  R2C5: [-1, -1], R2C7: [-1, -1], R2C8: [-1, -1],
  // notched square, notch at the cell's top-left -> points SE
  R8C2: [1, 1], R8C3: [1, 1], R8C5: [1, 1],
  // notched square, notch at the cell's bottom-left -> points NE
  R8C8: [-1, 1], R9C7: [-1, 1],
};

// origin value a, pointed-at value b: b must be one more than a. a = 9 is
// impossible on an arrow cell -- "the digit N+1" would have to be 10, which
// is not a grid digit at all, so no placement can satisfy the rule.
const nextDigitKey = Pair.fnToKey((a, b) => a <= 8 && b === a + 1, 9);

const arrowConstraints = Object.entries(arrows).map(([cell, [dr, dc]]) =>
  new Pair(nextDigitKey, 'NextDigit', cell, graph.step(cell, dr, dc)));

return [
  new Shape('9x9'),
  new Given('R1C1', 9),
  new Given('R5C4', 6),
  new Given('R5C6', 7),
  new Given('R9C9', 8),
  ...arrowConstraints,
];
