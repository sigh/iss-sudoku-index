// Title: Extreme Lunchbox 2
// Author: Undar_Beyond
// Video: https://www.youtube.com/watch?v=gIxfQlyfZh4
// Source: https://app.crackingthecryptic.com/webapp/3RJ9dFJpM9

// Normal sudoku rules apply. Each cage forms a line with the small clue in
// the top-left showing the sum of the digits sandwiched between the smallest
// digit and the largest digit of the line. Digits cannot repeat within a
// cage. `Lunchbox(sum, ...cells)` is exactly this rule: it locates the cells
// holding the line's own smallest and largest values and sums whatever lies
// between them positionally, and separately forces the line's cells to be
// all-different.
//
// Cage cell order below follows each line's drawn path (source `lines`
// wayPoints), read off the puzzle payload; Lunchbox's positional sandwich
// is order-sensitive along the line.
return [
  new Shape('9x9'),

  new Lunchbox(19, 'R3C1', 'R2C1', 'R2C2', 'R1C2', 'R1C3'),
  new Lunchbox(14, 'R1C6', 'R1C7', 'R1C8', 'R1C9'),
  new Lunchbox(5, 'R2C4', 'R2C5', 'R2C6', 'R3C6', 'R3C7', 'R4C7'),
  new Lunchbox(16, 'R3C8', 'R4C8', 'R5C8', 'R5C7', 'R5C6'),
  new Lunchbox(13, 'R3C3', 'R4C3', 'R5C3', 'R5C2'),
  new Lunchbox(8, 'R3C4', 'R4C4', 'R4C5', 'R5C5'),
  new Lunchbox(6, 'R7C5', 'R6C5', 'R6C6', 'R6C7'),
  new Lunchbox(15, 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8'),
  new Lunchbox(11, 'R7C6', 'R7C7', 'R8C7', 'R9C7'),
  new Lunchbox(0, 'R8C4', 'R9C4', 'R9C5'),
  new Lunchbox(17, 'R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3'),
];
