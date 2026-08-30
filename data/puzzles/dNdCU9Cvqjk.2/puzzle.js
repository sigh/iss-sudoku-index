// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=dNdCU9Cvqjk
// Source: https://cracking-the-cryptic.web.app/sudoku/Gnf47gt6Pr

// The payload carries no rules text at all. Rows and columns are standard
// Sudoku all-different (default). The six drawn irregular regions replace
// the standard boxes, so the default boxes are removed (NoBoxes) and each
// is instead a Jigsaw all-different group; cell membership below is
// transcribed from the payload's `regions` array. Antiknight is included
// on the strength of the sibling puzzle at
// https://cracking-the-cryptic.web.app/sudoku/jF8BdgTHH7, whose video
// description names it "the original irregular antiknight Sudoku" and
// whose region partition is cell-for-cell identical to this one (see
// this puzzle's payload -- verified cell-for-cell); no rules text confirms
// it for this link directly.
//
// The payload gives no digits: every cell of the bottom row (and every
// other cell) arrives empty. Per the video description this is "the
// modified version where you put your own 1-6 in" of that antiknight
// sibling -- any permutation placed in the bottom row is claimed to force
// the same unique completion, i.e. the grid's solutions are exactly one
// pattern up to a relabelling of the six digits. The Given row below pins
// one representative of that relabelling (the sibling's own row) so the
// search can measure uniqueness of the pattern rather than counting all
// 6! relabellings as distinct solutions.

const regions = [
  ['R1C1', 'R2C1', 'R2C2', 'R2C3', 'R3C3', 'R3C4'],
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C4', 'R2C5'],
  ['R1C6', 'R2C6', 'R3C5', 'R3C6', 'R4C5', 'R4C6'],
  ['R3C1', 'R3C2', 'R4C1', 'R5C1', 'R5C2', 'R5C3'],
  ['R4C2', 'R4C3', 'R4C4', 'R5C4', 'R5C5', 'R5C6'],
  ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6'],
];

return [
  new Shape('6x6'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('6x6', ...cells)),
  new AntiKnight(),

  new Given('R6C1', 1),
  new Given('R6C2', 2),
  new Given('R6C3', 3),
  new Given('R6C4', 4),
  new Given('R6C5', 5),
  new Given('R6C6', 6),
];
