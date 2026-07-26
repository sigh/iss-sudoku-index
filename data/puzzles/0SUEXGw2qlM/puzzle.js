// Title: Quantum Entanglement
// Author: Scojo
// Video: https://www.youtube.com/watch?v=0SUEXGw2qlM
// Source: https://sudokupad.app/9ryz1zmsa7

// Normal sudoku rules apply (rows, columns, 3x3 boxes: default).
// Kropki: white dots mark consecutive digits (not all dots shown).
//
// Omitted: "Entangled Cages" (every cage pairs with exactly one other cage
// of the same color; digits in a pair don't repeat and sum to a
// concatenation of the two cages' corner numbers). The grid has 34 cages in
// 5 colors (10/6/4/6/8 cages per color), so most colors group more than one
// pair of cages together. Nothing in the drawing -- not the cage outlines,
// not corner values, not cell adjacency, not center-to-center distance --
// singles out which two same-colored cages are actually paired. Deciding a
// specific pairing would be resolving a puzzle-internal deduction out of
// band rather than reading it off the drawing, so it is left out entirely
// rather than guessed.

return [
  new Shape('9x9'),

  // Kropki white dots -- edge-sized white-fill/black-border marks.
  new WhiteDot('R1C2', 'R1C3'),
  new WhiteDot('R1C2', 'R2C2'),
  new WhiteDot('R2C7', 'R2C8'),
  new WhiteDot('R6C2', 'R7C2'),
];
