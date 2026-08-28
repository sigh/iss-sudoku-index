// Title: Unknown
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=gzZl1EK4bww
// Source: https://cracking-the-cryptic.web.app/sudoku/9q2BNHH8p7

// The source publishes no rules text, so the ruleset is taken from the drawn
// art under the conventions those markings carry:
//   - Normal sudoku rules apply on the standard 3x3 boxes. The grid has no
//     given digits.
//   - Eight dashed cages each print a total in their top-left cell: killer
//     cages, so the digits sum to the total and do not repeat inside a cage.
//   - Two purple strokes run corner to corner across the frame, along both
//     main diagonals. A full-frame corner-to-corner stroke is how the drawing
//     tool marks the diagonals of a diagonal ("X") sudoku, and the strokes
//     carry no bulb, endpoint marker or other line-clue decoration, so they
//     are read as no-repeat diagonals.
// Nothing is omitted: the eight cages and the two diagonals are every clue in
// the puzzle.

// Totals and cells transcribed from the eight drawn cages, listed clockwise
// from the top-left corner of the grid.
const cages = [
  [42, 'R1C2', 'R1C3', 'R1C4', 'R2C4', 'R3C4', 'R3C5', 'R3C6'],
  [33, 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R2C8', 'R3C7', 'R3C8'],
  [38, 'R2C9', 'R3C9', 'R4C7', 'R4C8', 'R4C9', 'R5C7', 'R6C7'],
  [31, 'R5C9', 'R6C9', 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8'],
  [28, 'R7C4', 'R7C5', 'R7C6', 'R8C6', 'R9C6', 'R9C7', 'R9C8'],
  [37, 'R7C2', 'R7C3', 'R8C2', 'R8C3', 'R9C3', 'R9C4', 'R9C5'],
  [32, 'R4C3', 'R5C3', 'R6C1', 'R6C2', 'R6C3', 'R7C1', 'R8C1'],
  [39, 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R4C1', 'R5C1'],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  new Diagonal(-1),  // R1C1 to R9C9
  new Diagonal(1),   // R1C9 to R9C1
];
