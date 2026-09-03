// Title: Cloned Strands Sudoku
// Author: David McNeill
// Video: https://www.youtube.com/watch?v=DsrTuqlaj7s
// Source: https://cracking-the-cryptic.web.app/sudoku/GDBjhTJ9Tn

// Rules encoded:
//  1. Normal sudoku: each row, column and 3x3 box contains 1-9 once.
//  2. The three grey strands are clones of one another: read from one end to
//     the other, all three show the same nine digits in the same order, so the
//     cells in matching positions along the strands hold equal digits.
// Nothing is omitted.
//
// The strands' paths are not congruent, so the only correspondence the drawing
// offers is position along the path. Nothing drawn on a strand (no bulb,
// arrowhead, gradient or colour change) says which end is its start, so every
// relative orientation is left open below rather than chosen here.

// The three grey (#CFCFCF, thickness 4) lines, each in the order its stroke is
// drawn.
const strandA = ['R4C1', 'R5C2', 'R5C3', 'R4C3', 'R3C4', 'R3C5', 'R4C5', 'R5C5', 'R5C4'];
const strandB = ['R3C6', 'R3C7', 'R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R8C8'];
const strandC = ['R6C4', 'R7C4', 'R8C4', 'R8C5', 'R7C5', 'R6C6', 'R6C7', 'R6C8', 'R7C8'];

// The 17 printed digits.
const givens = [
  ['R1C3', 7], ['R1C4', 3], ['R1C5', 9],
  ['R2C2', 4], ['R2C6', 8],
  ['R3C1', 8], ['R3C9', 7],
  ['R6C3', 1],
  ['R9C1', 4], ['R9C2', 8], ['R9C3', 2], ['R9C4', 6], ['R9C5', 1],
  ['R9C6', 7], ['R9C7', 9], ['R9C8', 5], ['R9C9', 3],
].map(([cell, value]) => new Given(cell, value));

const reversed = (strand) => strand.slice().reverse();

// One orientation of the clone rule: strand A's i-th cell, strand B's i-th and
// strand C's i-th are three one-cell sets that must hold the same value.
const clones = (b, c) => new And(
  strandA.map((cell, i) => new SameValues(3, cell, b[i], c[i])));

// Reversing all three strands at once pairs exactly the same cells, so the
// eight orientations collapse to these four: strand A fixed as drawn, with
// each of strands B and C read either way.
const orientations = new Or([
  clones(strandB, strandC),
  clones(strandB, reversed(strandC)),
  clones(reversed(strandB), strandC),
  clones(reversed(strandB), reversed(strandC)),
]);

return [
  new Shape('9x9'),
  ...givens,
  orientations,
];
