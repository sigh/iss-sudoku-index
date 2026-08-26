// Title: 6/11/22: B1G3 Countdown: 1...
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=CanpWWhvjgk
// Source: https://tinyurl.com/2p95n5jk

// Normal sudoku rules apply (rows, columns and boxes each contain 1-6, added
// by default). One additional rule: the two grey regions are clones and
// must hold identical digits in identical relative positions.

const givens = [
  new Given('R1C6', 1), new Given('R2C5', 2), new Given('R3C4', 3),
  new Given('R5C2', 4), new Given('R6C1', 5), new Given('R6C4', 1),
];

// Clone regions, transcribed from the payload's `clone` entry: `cells` and
// `cloneCells` are already listed in matching positional order (region B is
// region A translated by +1 row/+3 cols, no rotation or reflection), so
// zipping the two arrays index-by-index pairs each cell with its clone.
const regionA = [
  'R1C2', 'R2C1', 'R2C2', 'R3C2', 'R4C2', 'R5C1', 'R5C2', 'R5C3',
];
const regionB = [
  'R2C5', 'R3C4', 'R3C5', 'R4C5', 'R5C5', 'R6C4', 'R6C5', 'R6C6',
];

// Each clone pair must hold the same digit; a single SameValues over the
// whole regions would only require the two regions' value multisets to
// match, not that each position agrees, so the pairs are enforced one cell
// at a time (matching the standing convention for clone regions).
const clones = regionA.map((a, i) => new SameValues(2, a, regionB[i]));

return [
  new Shape('6x6'),
  ...givens,
  ...clones,
];
