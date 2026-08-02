// Title: 9/20/23: Outside Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=LCH-XiK3Kko
// Source: https://tinyurl.com/yc3pssnd

// Normal Sudoku rules apply. Each outside clue gives the digits that occur in
// the first three cells from that side; a one-digit label requires that digit.
return [
  new Shape('9x9'),

  // Left-side labels, read across rows from column 1.
  new ContainAtLeast('1_2_3', 'R1C1', 'R1C2', 'R1C3'),
  new ContainAtLeast('4_5_6', 'R2C1', 'R2C2', 'R2C3'),
  new ContainAtLeast('2_3_4', 'R4C1', 'R4C2', 'R4C3'),
  new ContainAtLeast('5_6_7', 'R5C1', 'R5C2', 'R5C3'),
  new ContainAtLeast('3_4_5', 'R7C1', 'R7C2', 'R7C3'),
  new ContainAtLeast('6_7_8', 'R8C1', 'R8C2', 'R8C3'),

  // Top and bottom labels, read down/up columns respectively.
  new ContainAtLeast('1', 'R1C3', 'R2C3', 'R3C3'),
  new ContainAtLeast('3', 'R1C4', 'R2C4', 'R3C4'),
  new ContainAtLeast('5', 'R1C7', 'R2C7', 'R3C7'),
  new ContainAtLeast('2', 'R9C2', 'R8C2', 'R7C2'),
  new ContainAtLeast('7', 'R9C6', 'R8C6', 'R7C6'),
  new ContainAtLeast('6', 'R9C8', 'R8C8', 'R7C8'),

  // Right-side labels, read left from column 9.
  new ContainAtLeast('1_8_9', 'R2C9', 'R2C8', 'R2C7'),
  new ContainAtLeast('2_3_4', 'R3C9', 'R3C8', 'R3C7'),
  new ContainAtLeast('1_2_9', 'R5C9', 'R5C8', 'R5C7'),
  new ContainAtLeast('3_4_5', 'R6C9', 'R6C8', 'R6C7'),
  new ContainAtLeast('1_2_3', 'R8C9', 'R8C8', 'R8C7'),
  new ContainAtLeast('4_5_6', 'R9C9', 'R9C8', 'R9C7'),
];
