// Title: Unknown
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=USp1Ukz7KtU
// Source: https://cracking-the-cryptic.web.app/sudoku/PpD2pLGbHD

// Normal sudoku rules apply (9x9, standard boxes, no givens).
//
// X/V: an X is drawn between two orthogonally adjacent cells whenever they
// sum to 10, and a V whenever they sum to 5; every such pair in the whole
// grid is marked (the rule text states the marking rule with no scoping
// clause), so an unmarked adjacent pair sums to neither -- StrictXV encodes
// that global negative for every pair not covered by an X/V below.
//
// Quad: each circle's listed digits must each appear at least once among
// the 2x2 block of four cells at that intersection.

const xMarks = [
  ['R2C4', 'R2C5'],
  ['R6C4', 'R7C4'],
  ['R7C5', 'R7C6'],
];

const vMarks = [
  ['R5C1', 'R6C1'],
  ['R9C4', 'R9C5'],
];

// topLeftCell, digits required in its 2x2 block -- read from the six
// drawn circles, top-left to bottom-right.
const quads = [
  ['R2C2', 1, 2, 3, 4],
  ['R2C7', 1, 2, 3, 5],
  ['R7C2', 1, 2, 3, 5],
  ['R7C7', 1, 2, 3, 4],
  ['R4C3', 5, 7],
  ['R5C6', 5, 7],
];

return [
  new Shape('9x9'),
  new StrictXV(),
  ...xMarks.map(cells => new X(...cells)),
  ...vMarks.map(cells => new V(...cells)),
  ...quads.map(([cell, ...values]) => new Quad(cell, ...values)),
];
