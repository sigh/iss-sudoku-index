// Title: The Jail
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=KCNEyY81iCs
// Source: https://app.crackingthecryptic.com/sudoku/3RBd3qMndd

// Normal sudoku rules apply. Cages sum to the corner total with no repeated
// digit (Cage). A digit in a shaded cell must be greater than every digit in
// an orthogonally-adjacent unshaded cell (GreaterThan, cell list = shaded
// cell first, then its unshaded neighbours -- none of the 20 shaded cells
// below are adjacent to each other, so every neighbour is unshaded).

const fortressCells = [
  'R1C1', 'R1C5', 'R1C9',
  'R2C4', 'R2C6',
  'R3C3', 'R3C7',
  'R4C2', 'R4C8',
  'R5C1', 'R5C9',
  'R6C2', 'R6C8',
  'R7C3', 'R7C7',
  'R8C4', 'R8C6',
  'R9C1', 'R9C5', 'R9C9',
];

const graph = cellGraph('9x9');
const fortresses = fortressCells.map(
  cell => new GreaterThan(cell, ...graph.neighbours(cell)));

const cages = [
  new Cage(16, 'R5C2', 'R5C3', 'R6C3', 'R6C4', 'R7C4'),
  new Cage(24, 'R6C6', 'R6C7', 'R7C5', 'R7C6', 'R8C5'),
  new Cage(34, 'R3C6', 'R4C6', 'R4C7', 'R5C7', 'R5C8'),
  new Cage(27, 'R2C5', 'R3C4', 'R3C5', 'R4C3', 'R4C4'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...fortresses,
];
