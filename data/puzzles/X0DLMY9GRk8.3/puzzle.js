// Title: 4 Forts and a Dream
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=X0DLMY9GRk8
// Source: https://sudokupad.app/823yw6zm1l

// 6x6 irregular sudoku with custom regions, no given digits.
//
// Forts (R2C5, R3C1, R4C4, R6C5): each is greater than every cell orthogonally
// adjacent to it, decomposed into one GreaterThan pair per existing neighbour
// (edge forts have 3 neighbours, interior forts have 4).
//
// Less Than V: a single V mark on the vertical border between R3C2 and R3C3
// means the V points to the smaller digit; the known solution has R3C2 < R3C3,
// so R3C3 is the larger cell.
return [
  new Shape('6x6'),
  // Irregular regions replace the default 2x3 boxes.
  new NoBoxes(),
  new Jigsaw('6x6', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C1'),
  new Jigsaw('6x6', 'R2C2', 'R2C3', 'R2C4', 'R3C2', 'R4C2', 'R4C3'),
  new Jigsaw('6x6', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3'),
  new Jigsaw('6x6', 'R1C6', 'R2C5', 'R2C6', 'R3C3', 'R3C4', 'R3C5'),
  new Jigsaw('6x6', 'R4C4', 'R5C2', 'R5C3', 'R5C4', 'R6C4', 'R6C5'),
  new Jigsaw('6x6', 'R3C6', 'R4C5', 'R4C6', 'R5C5', 'R5C6', 'R6C6'),

  // Fort R2C5 (row1,col4 0-idx): interior cell, 4 neighbours.
  new GreaterThan('R2C5', 'R1C5'),
  new GreaterThan('R2C5', 'R3C5'),
  new GreaterThan('R2C5', 'R2C4'),
  new GreaterThan('R2C5', 'R2C6'),

  // Fort R3C1 (row2,col0 0-idx): first column, 3 neighbours.
  new GreaterThan('R3C1', 'R2C1'),
  new GreaterThan('R3C1', 'R4C1'),
  new GreaterThan('R3C1', 'R3C2'),

  // Fort R4C4 (row3,col3 0-idx): interior cell, 4 neighbours.
  new GreaterThan('R4C4', 'R3C4'),
  new GreaterThan('R4C4', 'R5C4'),
  new GreaterThan('R4C4', 'R4C3'),
  new GreaterThan('R4C4', 'R4C5'),

  // Fort R6C5 (row5,col4 0-idx): last row, 3 neighbours.
  new GreaterThan('R6C5', 'R5C5'),
  new GreaterThan('R6C5', 'R6C4'),
  new GreaterThan('R6C5', 'R6C6'),

  // Less Than V between R3C2 and R3C3: V points to the smaller digit (R3C2).
  new GreaterThan('R3C3', 'R3C2'),
];
