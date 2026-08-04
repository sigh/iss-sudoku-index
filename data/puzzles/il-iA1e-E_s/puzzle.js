// Title: Pillboxes
// Author: Allagem
// Video: https://www.youtube.com/watch?v=il-iA1e-E_s
// Source: https://app.crackingthecryptic.com/sudoku/MpdTnQ4TfP

// Normal sudoku (default rows/columns/boxes). Four killer cages: digits inside
// do not repeat and sum to the corner total (`Cage`). Every cage is also a
// "fortress": each digit inside a cage is greater than every orthogonally
// adjacent neighbor outside that cage (a neighbor belonging to a *different*
// cage still counts as outside). One `GreaterThan(cageCell, outsideNeighbor)`
// per boundary edge encodes that direction; the boundary edges are derived
// from each cage's own cell set via the grid graph rather than hand-listed,
// and cages are handled one at a time so no pair between two cells of the
// same cage is ever produced (which a single multi-cell `GreaterThan` over a
// cage's cells would risk, since it constrains every adjacent pair it is
// given).

const graph = cellGraph('9x9');

const cages = [
  { total: 13, cells: ['R2C2', 'R3C1', 'R3C2'] },
  { total: 21, cells: ['R1C6', 'R2C6', 'R2C7', 'R2C8'] },
  { total: 19, cells: ['R6C8', 'R7C7', 'R7C8', 'R8C7'] },
  { total: 18, cells: ['R8C3', 'R8C4', 'R9C3'] },
];

const cageConstraints = cages.map(
  ({ total, cells }) => new Cage(total, ...cells));

const fortressConstraints = cages.flatMap(({ cells }) => {
  const cageSet = new Set(cells);
  return cells.flatMap(cell =>
    graph.neighbours(cell)
      .filter(n => !cageSet.has(n))
      .map(n => new GreaterThan(cell, n)));
});

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...fortressConstraints,
];
