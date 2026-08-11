// Title: Fortress Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=G5q9Vlwk7As
// Source: https://tinyurl.com/2p9xtt2e

// Normal sudoku (default 3x3 boxes). Fortress: wherever a shaded cell is
// orthogonally adjacent to an unshaded cell, the shaded cell's digit must be
// higher than the unshaded cell's. The rule names only shaded-unshaded pairs,
// so adjacent shaded-shaded pairs (e.g. R2C3/R3C3) are not compared. Shaded
// cells per the payload's `maximum` cell list:

const shadedCells = [
  'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7',
  'R3C3',
  'R4C3',
  'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7',
  'R6C3',
  'R7C3',
  'R8C3',
];
const shadedSet = new Set(shadedCells);

const graph = cellGraph('9x9');

// Derive the fortress boundary from the cell list above rather than
// hand-listing pairs: every orthogonal neighbour of a shaded cell that is
// itself unshaded must be smaller than it.
const fortressBoundary = shadedCells.flatMap(cell =>
  graph.neighbours(cell)
    .filter(n => !shadedSet.has(n))
    .map(n => new GreaterThan(cell, n)));

return [
  new Shape('9x9'),
  new Given('R1C4', 8), new Given('R1C5', 3), new Given('R1C6', 2),
  new Given('R3C2', 6), new Given('R3C8', 9),
  new Given('R4C2', 5), new Given('R4C8', 8),
  new Given('R5C2', 7), new Given('R5C4', 3), new Given('R5C5', 6), new Given('R5C6', 9), new Given('R5C8', 4),
  new Given('R6C2', 3), new Given('R6C8', 6),
  new Given('R7C2', 8), new Given('R7C8', 7),
  new Given('R9C4', 7), new Given('R9C5', 8), new Given('R9C6', 5),
  ...fortressBoundary,
];
