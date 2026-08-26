// Title: 5/29/22: Tilting at Windoku
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=j4Tz1rHWCOg
// Source: https://tinyurl.com/38nnmtpw

// Normal sudoku (givens, rows, columns, boxes). Rule: each colored region
// must contain 1-9 exactly once; no printed totals, so each region is
// AllDifferent only.

const givens = [
  new Given('R1C1', 8),
  new Given('R2C5', 1),
  new Given('R3C4', 2),
  new Given('R3C6', 3),
  new Given('R4C3', 4),
  new Given('R4C5', 5),
  new Given('R4C7', 6),
  new Given('R5C2', 7),
  new Given('R5C4', 8),
  new Given('R5C6', 9),
  new Given('R5C8', 1),
  new Given('R6C3', 2),
  new Given('R6C5', 3),
  new Given('R6C7', 4),
  new Given('R7C4', 5),
  new Given('R7C6', 6),
  new Given('R8C5', 7),
  new Given('R9C9', 9),
];

// The four lavender 3x3 blocks (payload `cage[]`, no printed total): each is
// its own all-different region, orthogonally shaped like a normal box but
// offset from the standard box grid.
const lavenderRegions = [
  ['R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R4C3'],
  ['R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8'],
  ['R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4', 'R9C2', 'R9C3', 'R9C4'],
  ['R6C7', 'R6C8', 'R6C9', 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9'],
].map((cells) => new AllDifferent(...cells));

// The gold region (payload shading `#FFE060`), explicitly noted in the rules
// as diagonally connected rather than orthogonally: a 9-cell diamond centered
// on R5C5.
const goldRegion = new AllDifferent(
  'R3C5', 'R4C4', 'R4C6',
  'R5C3', 'R5C5', 'R5C7',
  'R6C4', 'R6C6', 'R7C5'
);

return [
  new Shape('9x9'),
  ...givens,
  ...lavenderRegions,
  goldRegion,
];
