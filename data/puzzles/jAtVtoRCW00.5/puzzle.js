// Title: Nov 16, 2021: Fortress Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=jAtVtoRCW00
// Source: https://tinyurl.com/nwm3y2w

// Normal sudoku. Fortress: every shaded cell must be greater than each of
// its orthogonally adjacent unshaded cells. Shaded cells, per the payload's
// `#A8A8A8`-coloured cells:

const shadedCells = [
  'R1C2', 'R1C9',
  'R3C1', 'R3C4', 'R3C8',
  'R4C3', 'R4C5', 'R4C6',
  'R5C1', 'R5C5', 'R5C9',
  'R6C4', 'R6C5', 'R6C7',
  'R7C2', 'R7C6', 'R7C9',
  'R9C1', 'R9C8',
];
const shadedSet = new Set(shadedCells);

const graph = cellGraph('9x9');

// Derive the fortress boundary from the cell list above rather than
// hand-listing pairs: every orthogonal neighbour of a shaded cell that is
// itself not shaded must be smaller than it. Four pairs of shaded cells are
// themselves orthogonally adjacent (R4C5-R4C6, R4C5-R5C5, R5C5-R6C5,
// R6C4-R6C5); the rule only speaks of a shaded/unshaded pair, so those
// shaded-shaded boundaries are filtered out and left unconstrained.
const fortressBoundary = shadedCells.flatMap(cell =>
  graph.neighbours(cell)
    .filter(n => !shadedSet.has(n))
    .map(n => new GreaterThan(cell, n)));

return [
  new Shape('9x9'),
  new Given('R1C3', 6), new Given('R1C4', 8), new Given('R1C5', 1), new Given('R1C6', 3), new Given('R1C8', 5),
  new Given('R2C1', 7),
  new Given('R4C4', 6), new Given('R4C8', 8), new Given('R4C9', 2),
  new Given('R6C1', 2), new Given('R6C2', 6), new Given('R6C6', 7),
  new Given('R8C9', 8),
  new Given('R9C2', 2), new Given('R9C4', 9), new Given('R9C5', 4), new Given('R9C6', 1), new Given('R9C7', 6),
  ...fortressBoundary,
];
