// Title: March 13, 2023: Clone Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=BqmW8Cw_Mn8
// Source: https://tinyurl.com/2p83jkh9

// Normal sudoku rules apply. Two 4x4 shaded regions must hold exactly the
// same arrangement of digits: each cell of region A equals the digit at the
// corresponding relative position in region B, as the rules' own example
// establishes (R1C2 = R6C5). Encoded as one SameValues(2, a, b) equality per
// corresponding pair, since SameValues on the full 32-cell union would only
// require the two 16-cell sets to share a multiset, not enforce this
// cell-by-cell correspondence.

// Region A cells, row-major (drawn shading).
const regionA = [
  'R1C2', 'R1C3', 'R1C4', 'R1C5',
  'R2C2', 'R2C3', 'R2C4', 'R2C5',
  'R3C2', 'R3C3', 'R3C4', 'R3C5',
  'R4C2', 'R4C3', 'R4C4', 'R4C5',
];

// Region B cells, paired index-by-index with regionA (drawn shading).
const regionB = [
  'R6C5', 'R6C6', 'R6C7', 'R6C8',
  'R7C5', 'R7C6', 'R7C7', 'R7C8',
  'R8C5', 'R8C6', 'R8C7', 'R8C8',
  'R9C5', 'R9C6', 'R9C7', 'R9C8',
];

const cloneLinks = regionA.map(
  (cell, i) => new SameValues(2, cell, regionB[i]));

return [
  new Shape('9x9'),

  new Given('R1C1', 1), new Given('R1C6', 8), new Given('R1C9', 2),
  new Given('R2C1', 2), new Given('R2C6', 4), new Given('R2C9', 7),
  new Given('R3C1', 3), new Given('R3C6', 6), new Given('R3C9', 5),
  new Given('R7C1', 7), new Given('R7C4', 3), new Given('R7C9', 4),
  new Given('R8C1', 6), new Given('R8C4', 4), new Given('R8C9', 3),
  new Given('R9C1', 9), new Given('R9C4', 5), new Given('R9C9', 6),

  ...cloneLinks,
];
