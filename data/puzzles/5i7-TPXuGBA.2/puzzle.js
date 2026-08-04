// Title: Extra Diagonal Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=5i7-TPXuGBA
// Source: https://tinyurl.com/3c5jmmp5

// Normal Sudoku Rules Apply: standard row/column/box all-different over the
// 9x9 grid (digits 1-9).
//
// Each grey diagonal must contain the digits 1 to 7: the source draws four
// 7-cell diagonal runs radiating from the grid's four corner boxes. Each
// run's 3 in-grid cells are one corner box's own diagonal (box0's
// anti-diagonal; box2's and box6's main diagonals; box8's anti-diagonal, in
// this grid's row-major box numbering), extended 2 cells past the grid edge
// in each direction. The runs meet in pairs at the four extended corners
// (top, left, right, bottom), so 12 distinct off-grid cells cover all four
// runs' extensions. They are modelled as Var cells VE1-VE12 (VE1/VE4/VE7/VE10
// are the shared corners); every run cell's candidates are cut to 1-7, and
// AllDifferent over each 7-cell run then forces a 1-7 permutation.

const diagCandidates = (id) => new Given(id, 1, 2, 3, 4, 5, 6, 7);

const ve = new Var('E', 'extra diagonal cell', 12);
const VE1 = ve.cell(1);   // top corner, shared by runs A and B
const VE2 = ve.cell(2);   // run A, next to VE1
const VE3 = ve.cell(3);   // run A, next to VE4
const VE4 = ve.cell(4);   // left corner, shared by runs A and C
const VE5 = ve.cell(5);   // run B, next to VE1
const VE6 = ve.cell(6);   // run B, next to VE7
const VE7 = ve.cell(7);   // right corner, shared by runs B and D
const VE8 = ve.cell(8);   // run C, next to VE4
const VE9 = ve.cell(9);   // run C, next to VE10
const VE10 = ve.cell(10); // bottom corner, shared by runs C and D
const VE11 = ve.cell(11); // run D, next to VE7
const VE12 = ve.cell(12); // run D, next to VE10

// The four diagonal runs, each ordered corner to corner.
const runs = [
  [VE1, VE2, 'R1C3', 'R2C2', 'R3C1', VE3, VE4],    // run A, through box0
  [VE1, VE5, 'R1C7', 'R2C8', 'R3C9', VE6, VE7],    // run B, through box2
  [VE4, VE8, 'R7C1', 'R8C2', 'R9C3', VE9, VE10],   // run C, through box6
  [VE7, VE11, 'R7C9', 'R8C8', 'R9C7', VE12, VE10], // run D, through box8
];
const runCells = [...new Set(runs.flat())];

return [
  new Shape('9x9'),
  ve,
  ...runCells.map(diagCandidates),
  ...runs.map(cells => new AllDifferent(...cells)),

  // Givens on the 9x9 core.
  new Given('R1C2', 1),
  new Given('R2C1', 2),
  new Given('R2C3', 4),
  new Given('R2C5', 8),
  new Given('R2C7', 1),
  new Given('R3C2', 3),
  new Given('R3C6', 9),
  new Given('R3C7', 5),
  new Given('R3C8', 7),
  new Given('R4C4', 5),
  new Given('R4C7', 2),
  new Given('R5C4', 7),
  new Given('R5C5', 3),
  new Given('R5C6', 6),
  new Given('R6C3', 3),
  new Given('R6C6', 1),
  new Given('R7C2', 2),
  new Given('R7C3', 7),
  new Given('R7C4', 8),
  new Given('R7C8', 4),
  new Given('R8C3', 1),
  new Given('R8C5', 9),
  new Given('R8C7', 3),
  new Given('R8C9', 5),
  new Given('R9C8', 2),

  // Givens on the diagonal extension cells.
  new Given(VE5, 6),
  new Given(VE3, 2),
  new Given(VE9, 1),
  new Given(VE11, 3),
];
