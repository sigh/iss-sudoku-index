// Title: May 10, 2022: Clone Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=G9Ve4kxxzjs
// Source: https://tinyurl.com/2p849yt2

// Normal sudoku rules. The two grey regions must contain exactly the same
// numbers in the same places (a "clone" pair): region A is the 16-cell
// perimeter of the 6x4 block at rows 1-6, cols 1-4; region B is the 16-cell
// perimeter of the 6x4 block at rows 4-9, cols 6-9, offset from region A by
// (+3 rows, +5 cols). The payload's `cells`/`cloneCells` arrays list both
// perimeters in the same walk order, so index i of one corresponds to index i
// of the other; every one of the 16 corresponding pairs is pinned equal below
// with a 2-cell SameValues (numSets=2 splits a pair into two singleton sets,
// so "same values including counts" reduces to plain equality of that one
// pair -- not the family's multiset-of-the-whole-region reading).

const regionA = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4',
  'R2C1', 'R2C4',
  'R3C1', 'R3C4',
  'R4C1', 'R4C4',
  'R5C1', 'R5C4',
  'R6C1', 'R6C2', 'R6C3', 'R6C4',
];
const regionB = [
  'R4C6', 'R4C7', 'R4C8', 'R4C9',
  'R5C6', 'R5C9',
  'R6C6', 'R6C9',
  'R7C6', 'R7C9',
  'R8C6', 'R8C9',
  'R9C6', 'R9C7', 'R9C8', 'R9C9',
];

const clonePairs = regionA.map(
  (cell, i) => new SameValues(2, cell, regionB[i]));

return [
  new Shape('9x9'),

  new Given('R2C2', 1), new Given('R2C3', 2),
  new Given('R3C2', 3), new Given('R3C3', 4),
  new Given('R4C2', 4), new Given('R4C3', 5),
  new Given('R5C2', 6), new Given('R5C3', 7),
  new Given('R5C7', 5), new Given('R5C8', 8),
  new Given('R6C7', 2), new Given('R6C8', 4),
  new Given('R7C7', 6), new Given('R7C8', 5),
  new Given('R8C7', 1), new Given('R8C8', 3),

  ...clonePairs,
];
