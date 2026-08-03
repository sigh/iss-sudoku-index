// Title: June 30, 2023: June 30, 2023
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=1ApDRSPPpvg
// Source: https://tinyurl.com/yz5zuu2n

// Normal sudoku rules apply (rows, columns and boxes each contain 1-9, added
// by default). One additional rule: two grey 19-cell regions are clones of
// each other and must hold identical digits in identical relative positions.

const givens = [
  new Given('R1C6', 4), new Given('R1C9', 7), new Given('R2C6', 6),
  new Given('R3C6', 3), new Given('R4C7', 3), new Given('R4C8', 4),
  new Given('R4C9', 5), new Given('R6C1', 1), new Given('R6C2', 2),
  new Given('R6C3', 3), new Given('R7C4', 4), new Given('R8C4', 3),
  new Given('R9C1', 8), new Given('R9C4', 2),
];

// Clone regions, transcribed from the payload's `clone` entry: `cells` and
// `cloneCells` are already listed in matching positional order (regionB is
// regionA translated by +4 rows/+4 cols, no rotation or reflection), so
// zipping the two arrays index-by-index pairs each cell with its clone.
const regionA = [
  'R1C3', 'R1C4', 'R1C5', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R3C1', 'R3C2',
  'R3C3', 'R3C4', 'R3C5', 'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R5C1', 'R5C2',
  'R5C3',
];
const regionB = [
  'R5C7', 'R5C8', 'R5C9', 'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C5', 'R7C6',
  'R7C7', 'R7C8', 'R7C9', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R9C5', 'R9C6',
  'R9C7',
];

// One SameValues(2, a, b) per corresponding cell pair: two size-1 sets forces
// that single cell's value to match, i.e. positional equality at that
// position. (A single SameValues over the whole 19-cell regions would only
// require the two regions' value multisets to match, not that each position
// agrees, so the regions must be paired one cell at a time.)
const clones = regionA.map((a, i) => new SameValues(2, a, regionB[i]));

return [
  new Shape('9x9'),
  ...givens,
  ...clones,
];
