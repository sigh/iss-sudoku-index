// Title: X Marks the Spot
// Author: Orphen89
// Video: https://www.youtube.com/watch?v=lsc4kMmbYRo
// Source: https://app.crackingthecryptic.com/sudoku/ghGLRhdjHP

// Rules: normal sudoku; the two marked corner-to-corner diagonals have no
// repeated digit; each cage is a killer cage (distinct digits, sum to the
// printed total); each inequality chevron points at the lower of the two
// digits it joins.

return [
  // Marked diagonals, both drawn light grey corner-to-corner (payload lines
  // #0, #1, wayPoints [0,0]-[9,9] and [0,9]-[9,0]); direction values per
  // Diagonal's own convention.
  new Diagonal(-1), // R1C1-R9C9 ("\")
  new Diagonal(1),  // R9C1-R1C9 ("/")

  // Cages (payload `cages`, cell coordinates [row,col] 0-indexed).
  new Cage(16, 'R1C2', 'R1C3', 'R2C3'),
  new Cage(15, 'R2C1', 'R3C1', 'R3C2'),
  new Cage(16, 'R7C8', 'R7C9', 'R8C9'),
  new Cage(14, 'R8C7', 'R9C7', 'R9C8'),
  new Cage(24, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(24, 'R7C1', 'R7C2', 'R8C1'),
  new Cage(15, 'R8C3', 'R9C2', 'R9C3'),
  new Cage(10, 'R7C6', 'R7C7'),
  new Cage(14, 'R3C7', 'R4C7'),
  new Cage(11, 'R1C7', 'R1C8', 'R2C7'),
  new Cage(18, 'R2C9', 'R3C8', 'R3C9'),
  new Cage(17, 'R5C1', 'R5C2', 'R5C3'),
  new Cage(7, 'R5C7', 'R5C8', 'R5C9'),
  new Cage(18, 'R1C5', 'R2C5', 'R3C5'),
  new Cage(9, 'R6C2', 'R6C3'),

  // Inequality chevrons (payload lines #2, #3; small 3-point wedge polylines,
  // not cell paths -- read from the drawn tip's row/col span). GreaterThan's
  // first cell is the larger one.
  // Line #2 wayPoints [[1.2,4.3],[0.8,4.5],[1.2,4.7]] (row,col): tip at
  // row 0.8 (R1) between R1C5/R2C5 (col ~4.5 -> C5) -> R1C5 < R2C5.
  new GreaterThan('R2C5', 'R1C5'),
  // Line #3 wayPoints [[3.3,8.2],[3.5,7.8],[3.7,8.2]] (row,col): tip at
  // col 7.8 (C8) between R4C8/R4C9 (row ~3.5 -> R4) -> R4C8 < R4C9.
  new GreaterThan('R4C9', 'R4C8'),
];
