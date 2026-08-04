// Title: Diagonal Outside Sudoku 12
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=Sx0rwDycjpQ
// Source: https://app.crackingthecryptic.com/sudoku/7BQgM4QnpJ

// Normal sudoku rules apply. Each outside label sits beside an arrow drawn at
// 45 degrees; its digit(s) must occur somewhere among the three cells the
// arrow's diagonal passes through, starting at the cell it enters. Digit sets
// are encoded as underscore-separated ContainAtLeast values -- a single digit
// still requires just that one digit among the three cells.
return [
  new Shape('9x9'),

  // Top edge, entering row 1, heading down-right.
  new ContainAtLeast('1_2', 'R1C1', 'R2C2', 'R3C3'),
  new ContainAtLeast('2_3', 'R1C2', 'R2C3', 'R3C4'),
  new ContainAtLeast('3_4', 'R1C3', 'R2C4', 'R3C5'),
  new ContainAtLeast('4_5', 'R1C4', 'R2C5', 'R3C6'),
  new ContainAtLeast('5_6', 'R1C5', 'R2C6', 'R3C7'),
  new ContainAtLeast('6_7', 'R1C6', 'R2C7', 'R3C8'),
  new ContainAtLeast('7_8', 'R1C7', 'R2C8', 'R3C9'),

  // Left edge, entering column 1, heading down-right.
  new ContainAtLeast('3_5', 'R2C1', 'R3C2', 'R4C3'),
  new ContainAtLeast('1_7', 'R3C1', 'R4C2', 'R5C3'),
  new ContainAtLeast('7_9', 'R4C1', 'R5C2', 'R6C3'),
  new ContainAtLeast('2_4', 'R5C1', 'R6C2', 'R7C3'),
  new ContainAtLeast('2_6', 'R6C1', 'R7C2', 'R8C3'),

  // Right edge, entering column 9.
  new ContainAtLeast('8', 'R4C9', 'R5C8', 'R6C7'),
  new ContainAtLeast('2', 'R6C9', 'R5C8', 'R4C7'),

  // Bottom edge, entering row 9, heading up-right.
  new ContainAtLeast('2_3', 'R9C1', 'R8C2', 'R7C3'),
  new ContainAtLeast('3_4', 'R9C2', 'R8C3', 'R7C4'),
  new ContainAtLeast('4_5', 'R9C3', 'R8C4', 'R7C5'),
  new ContainAtLeast('5_6', 'R9C4', 'R8C5', 'R7C6'),
  new ContainAtLeast('6_7', 'R9C5', 'R8C6', 'R7C7'),
  new ContainAtLeast('7_8', 'R9C6', 'R8C7', 'R7C8'),
  new ContainAtLeast('8_9', 'R9C7', 'R8C8', 'R7C9'),
];
