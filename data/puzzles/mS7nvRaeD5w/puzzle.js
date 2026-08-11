// Title: The Ugly Duckling
// Author: Staxioms
// Video: https://www.youtube.com/watch?v=mS7nvRaeD5w
// Source: https://app.crackingthecryptic.com/sudoku/D2hGJbfh3J

// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Digits in cages cannot repeat, and all cages sum to the same total, which
// the rules never print -- encoded as one equal-sum constraint over every
// cage's cells, alongside a distinctness constraint on each cage of size > 1.
// Digits cannot repeat along the marked diagonal.
// A number drawn in a circle at a 2x2 corner must appear among that
// corner's four cells (unlabelled circle + text-overlay pattern).
// A white dot marks two consecutive digits; only one dot is drawn, and the
// rules say not all dots are shown, so no non-consecutive pair is inferred
// from its absence elsewhere.

// Cage cell lists, transcribed from the drawn cage outlines. None carries a
// printed total.
const CAGES = [
  ['R2C7', 'R2C6', 'R3C6'],
  ['R3C7'],
  ['R3C5', 'R4C5'],
  ['R5C7', 'R5C6'],
  ['R5C4', 'R5C5', 'R6C5'],
  ['R6C4'],
  ['R7C3'],
  ['R6C2', 'R6C1', 'R7C1'],
  ['R3C1', 'R4C1'],
  ['R9C6', 'R9C7'],
  ['R6C9', 'R7C9'],
  ['R8C9', 'R9C9', 'R9C8'],
];

// Quad clues: each corner is drawn as an unlabelled circle plus a text
// overlay giving its digits, stacked at the same grid-line intersection;
// the topLeft cell is the intersection's row/col read directly as R#C#.
const QUADS = [
  ['R2C6', 1, 2],
  ['R2C2', 9],
  ['R3C2', 1, 2],
  ['R5C4', 1, 2],
  ['R6C1', 1, 2],
  ['R8C1', 9],
  ['R8C8', 1, 2],
];

const DIAGONAL = ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'];

return [
  new Shape('9x9'),

  // Cage distinctness (size-1 cages add nothing here; they still take part
  // in the equal-sum constraint below).
  ...CAGES.filter(c => c.length > 1).map(c => new AllDifferent(...c)),

  // All cages share one unstated total.
  new EqualSum(...CAGES),

  // Diagonal all-different.
  new AllDifferent(...DIAGONAL),

  // Circle quadruples.
  ...QUADS.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),

  // The single drawn white dot.
  new WhiteDot('R2C4', 'R2C5'),
];
