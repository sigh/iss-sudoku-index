// Title: Fortress Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=EIWX3buriUE
// Source: https://app.crackingthecryptic.com/sudoku/N7fqrL2gtD

// Normal sudoku rules apply (rows, columns, boxes all-different, given by the
// default Shape). A digit in a grey (fortress) cell must be greater than all
// of its orthogonal neighbours.
//
// Fortress cells are the 9 grey-shaded cells drawn on the grid.

const givens = [
  new Given('R1C1', 4), new Given('R1C4', 1), new Given('R1C6', 2),
  new Given('R3C4', 3), new Given('R3C6', 4), new Given('R3C7', 7),
  new Given('R4C3', 8), new Given('R4C7', 1),
  new Given('R6C1', 7), new Given('R6C9', 3),
  new Given('R7C4', 6), new Given('R7C6', 7),
  new Given('R9C4', 8), new Given('R9C6', 9), new Given('R9C9', 2),
];

const fortressCells = [
  'R4C1', 'R5C2', 'R9C2', 'R8C5', 'R6C5', 'R4C5', 'R2C5', 'R1C8', 'R5C8',
];

// For each fortress cell, GreaterThan(cell, ...neighbours) constrains the
// fortress cell to be greater than each orthogonal neighbour: GreaterThan
// binds by grid adjacency (not list order for who's adjacent to whom) but
// enforces "earlier in the list > later, when grid-adjacent" -- so listing
// the fortress cell first makes it the required maximum over its neighbours.
// A fortress cell's own orthogonal neighbours are never orthogonally adjacent
// to each other, so no spurious pair is added between them.
const DELTAS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const fortresses = fortressCells.map(cellId => {
  const { row, col } = parseCellId(cellId);
  const neighbours = [];
  for (const [dr, dc] of DELTAS) {
    const r = row + dr, c = col + dc;
    if (r >= 1 && r <= 9 && c >= 1 && c <= 9) {
      neighbours.push(makeCellId(r, c));
    }
  }
  return new GreaterThan(cellId, ...neighbours);
});

return [
  new Shape('9x9'),
  ...givens,
  ...fortresses,
];
