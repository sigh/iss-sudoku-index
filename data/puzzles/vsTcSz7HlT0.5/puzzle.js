// Title: 7/27: The Castle Aaaarrrrrgghh
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=vsTcSz7HlT0
// Source: https://tinyurl.com/34m4a5h7

// Normal sudoku. Fortress: every grey cell must be greater than each of its
// orthogonally adjacent (white) cells. Grey cells, per the "maximum" cell list:

const greyCells = [
  'R1C5',
  'R2C4', 'R2C6',
  'R3C3', 'R3C5', 'R3C7',
  'R4C2', 'R4C4', 'R4C6', 'R4C8',
  'R5C1', 'R5C3', 'R5C5', 'R5C7', 'R5C9',
  'R6C2', 'R6C4', 'R6C6', 'R6C8',
  'R7C3', 'R7C5', 'R7C7',
  'R8C4', 'R8C6',
  'R9C5',
];
const greySet = new Set(greyCells);

const graph = cellGraph('9x9');

// Derive the fortress boundary from the cell list above rather than
// hand-listing pairs: every orthogonal neighbour of a grey cell that is
// itself not grey must be smaller than it. (No grey cell is adjacent to
// another grey cell here, so this never has to arbitrate a grey-grey pair.)
const fortressBoundary = greyCells.flatMap(cell =>
  graph.neighbours(cell)
    .filter(n => !greySet.has(n))
    .map(n => new GreaterThan(cell, n)));

return [
  new Shape('9x9'),
  new Given('R1C1', 9), new Given('R1C9', 8),
  new Given('R2C4', 9),
  new Given('R3C4', 6), new Given('R3C6', 5),
  new Given('R4C3', 2), new Given('R4C5', 3), new Given('R4C7', 5),
  new Given('R5C4', 4), new Given('R5C6', 2),
  new Given('R6C3', 3), new Given('R6C5', 1), new Given('R6C7', 4),
  new Given('R7C4', 3), new Given('R7C6', 4),
  new Given('R8C6', 8),
  new Given('R9C1', 6), new Given('R9C9', 7),
  ...fortressBoundary,
];
