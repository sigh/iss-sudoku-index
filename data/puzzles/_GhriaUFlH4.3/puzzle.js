// Title: Time After Time
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=_GhriaUFlH4
// Source: https://tinyurl.com/2rypnswv

// Normal Sudoku rules apply (rows, columns and boxes each contain 1-9, added
// by default). One additional rule: two grey plus-shaped 9-cell regions are
// clones of each other and must hold identical digits in identical relative
// positions -- i.e. each listed cell of regionA must equal the digit in the
// correspondingly-positioned cell of regionB.

const givens = [
  new Given('R1C4', 9), new Given('R2C5', 8), new Given('R2C7', 9),
  new Given('R2C9', 7), new Given('R3C6', 7), new Given('R3C9', 6),
  new Given('R4C1', 1), new Given('R4C7', 6), new Given('R5C2', 2),
  new Given('R5C5', 4), new Given('R5C8', 5), new Given('R6C3', 3),
  new Given('R6C9', 4), new Given('R7C1', 2), new Given('R7C4', 4),
  new Given('R8C1', 8), new Given('R8C3', 4), new Given('R8C5', 5),
  new Given('R9C6', 6),
];

// Clone regions, transcribed from the payload's `clone` entry: `cells` and
// `cloneCells` are already listed in matching positional order (regionB is
// regionA translated by +4 rows/+4 cols, no rotation or reflection), so
// zipping the two arrays index-by-index pairs each cell with its clone.
const regionA = ['R1C3', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R4C3', 'R5C3'];
const regionB = ['R5C7', 'R6C7', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R9C7'];

// One SameValues(2, a, b) per corresponding cell pair: two size-1 sets forces
// that single cell's value to match, i.e. positional equality at that
// position. (A single SameValues over the whole 9-cell regions would only
// require the two regions' value multisets to match, not that each position
// agrees, so the regions must be paired one cell at a time.)
const clones = regionA.map((a, i) => new SameValues(2, a, regionB[i]));

return [
  new Shape('9x9'),
  ...givens,
  ...clones,
];
