// Title: May 1, 2023: Raspberry Lemon
// Author: clover!
// Video: https://www.youtube.com/watch?v=xVCTL0Bc52o
// Source: https://tinyurl.com/4b92mrtc
//
// Normal sudoku rules (default row/column/box all-different).
// Renban: every line's digits form a non-repeating consecutive set, in any
// order.
// Lemon: each lemon's arc digits sum to the two-digit number read left to
// right from its two interior cells (not on the arc). The lemon target is
// `10*tens + ones`, expressed with Sum coefficients.

// Givens, transcribed from the source grid.
const givens = [
  ['R1C3', 4],
  ['R2C2', 5],
  ['R2C4', 9],
  ['R3C7', 2],
  ['R3C8', 1],
  ['R4C4', 7],
  ['R4C6', 4],
  ['R6C4', 5],
  ['R6C6', 8],
  ['R7C2', 2],
  ['R7C3', 7],
  ['R8C6', 3],
  ['R8C8', 4],
  ['R9C7', 6],
];

// Each lemon is drawn as a closed hexagonal loop: a 6-cell arc (`arc`) plus a
// short segment connecting the arc's two endpoints, closing it into an
// eye/lemon outline. The source's `renban` array draws the arc and the
// closing segment as two stroke fragments of one continuous path sharing
// endpoints, both styled as Renban; the closing segment adds no cell beyond
// the arc's own two endpoints, so it is taken as the same 6-cell Renban set
// drawn in two strokes, not a second, independently-constrained 2-cell line.
//
// `tens`/`ones` are the two cells sitting inside the closed loop, between its
// two side points in the row the closing segment occupies; they are not on
// the arc. Their placement is fixed by the rules text's worked example for
// the topmost lemon (R2C3, R2C4), and the same left/right positioning holds
// for the other three lemons by the identical drawn hexagon shape.
const lemons = [
  { arc: ['R2C2', 'R1C3', 'R1C4', 'R2C5', 'R3C4', 'R3C3'], tens: 'R2C3', ones: 'R2C4' },
  { arc: ['R3C6', 'R2C7', 'R2C8', 'R3C9', 'R4C8', 'R4C7'], tens: 'R3C7', ones: 'R3C8' },
  { arc: ['R7C1', 'R6C2', 'R6C3', 'R7C4', 'R8C3', 'R8C2'], tens: 'R7C2', ones: 'R7C3' },
  { arc: ['R8C5', 'R7C6', 'R7C7', 'R8C8', 'R9C7', 'R9C6'], tens: 'R8C6', ones: 'R8C7' },
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...lemons.flatMap(({ arc, tens, ones }) => [
    new Renban(...arc),
    new Sum(0, ...arc, [tens, -10], [ones, -1]),
  ]),
];
