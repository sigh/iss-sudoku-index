// Title: Beyond the Veil
// Author: Xeonrisq
// Video: https://www.youtube.com/watch?v=B_vWnWInu5c
// Source: https://app.crackingthecryptic.com/sudoku/G8q3Dbj2rt

// Rows and columns hold 1-9 (default). The 9 default boxes are replaced by
// the 9 drawn irregular jigsaw regions below (NoBoxes + Jigsaw), which also
// hold 1-9. The two drawn corner-to-corner diagonals are the rules' "marked
// diagonals" and also hold 1-9 (Diagonal). Grey-circle cells are odd,
// grey-square cells are even (no dedicated class; encoded as multi-value
// Given). Each arrow's circled cell equals the sum of its shaft cells
// (Arrow, bulb/control cell first). White dots are consecutive pairs, black
// dots are 1:2 ratio pairs (WhiteDot/BlackDot); "not all dots are given"
// means unmarked pairs carry no constraint, so no negative/strict variant
// is added.

const jigsawRegions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C1', 'R3C1', 'R3C2'],
  ['R3C4', 'R4C2', 'R4C3', 'R4C4', 'R5C2', 'R6C2', 'R7C2', 'R7C3', 'R8C2'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
  ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C3', 'R3C6', 'R4C6', 'R4C7'],
  ['R3C5', 'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5'],
  ['R6C3', 'R6C4', 'R7C4', 'R7C7', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9'],
  ['R2C8', 'R3C7', 'R3C8', 'R4C8', 'R5C8', 'R6C6', 'R6C7', 'R6C8', 'R7C6'],
  ['R7C8', 'R7C9', 'R8C9', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
];

// Arrow circle (bulb/control cell) + shaft cells, from the drawn arrow paths
// and the matching grey-bordered circle overlay on each bulb cell.
const arrows = [
  ['R2C2', 'R2C1', 'R1C1', 'R1C2'],
  ['R2C8', 'R1C8', 'R1C9', 'R2C9'],
  ['R8C8', 'R8C9', 'R9C9', 'R9C8'],
  ['R8C2', 'R9C2', 'R9C1', 'R8C1'],
];

const oddCells = ['R3C6', 'R4C7', 'R6C3', 'R7C4'];
const evenCells = ['R3C4', 'R4C3', 'R6C7', 'R7C6'];

const whiteDots = [
  ['R3C1', 'R4C1'],
  ['R6C1', 'R6C2'],
  ['R1C4', 'R2C4'],
  ['R1C6', 'R1C7'],
];

const blackDots = [
  ['R5C8', 'R5C9'],
  ['R8C5', 'R9C5'],
];

return [
  new Shape('9x9'),

  new NoBoxes(),
  ...jigsawRegions.map(cells => new Jigsaw('9x9', ...cells)),

  // '\' diagonal R1C1..R9C9 is direction -1; '/' diagonal R1C9..R9C1 is +1.
  new Diagonal(-1),
  new Diagonal(1),

  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),

  ...arrows.map(cells => new Arrow(...cells)),

  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
