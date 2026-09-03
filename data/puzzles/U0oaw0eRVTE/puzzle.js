// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=U0oaw0eRVTE
// Source: https://sudokupad.app/BqLb9nf9q2

// Normal sudoku rules apply. Digits in a cage may not repeat and must sum to
// the total given. There are no given digits; the 23 drawn cages are the only
// clues, and they tile all 81 cells.

// Cells and totals transcribed from the drawn cages, in the order the source
// lists them. These are 22 of the 23 cages; the 23rd is below.
const cages = [
  new Cage(21, 'R1C1', 'R1C2', 'R1C3', 'R2C3'),
  new Cage(24, 'R2C1', 'R2C2', 'R3C1', 'R3C2', 'R3C3'),
  new Cage(10, 'R1C4', 'R1C5', 'R2C4', 'R2C5'),
  new Cage(8, 'R1C6', 'R1C7'),
  new Cage(20, 'R1C8', 'R1C9', 'R2C8'),
  new Cage(15, 'R2C9', 'R3C9'),
  new Cage(10, 'R2C6', 'R2C7', 'R3C7'),
  new Cage(30, 'R3C8', 'R4C8', 'R4C9', 'R5C8', 'R5C9', 'R6C8', 'R6C9'),
  new Cage(18, 'R3C6', 'R4C6', 'R4C7'),
  new Cage(17, 'R3C4', 'R3C5'),
  new Cage(12, 'R4C3', 'R4C4', 'R4C5'),
  new Cage(38, 'R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R7C2'),
  new Cage(29, 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'),
  new Cage(12, 'R6C3', 'R6C4', 'R7C4'),
  new Cage(12, 'R6C5', 'R6C6', 'R6C7'),
  new Cage(11, 'R7C1', 'R8C1'),
  new Cage(11, 'R8C2', 'R9C1', 'R9C2'),
  new Cage(18, 'R7C3', 'R8C3', 'R8C4'),
  new Cage(17, 'R9C3', 'R9C4'),
  new Cage(16, 'R7C5', 'R7C6'),
  new Cage(11, 'R8C5', 'R8C6', 'R9C5', 'R9C6'),
  new Cage(23, 'R8C7', 'R9C7', 'R9C8', 'R9C9'),
];

// The 23rd drawn cage. Its printed total is 220, which five cells holding
// distinct digits from 1-9 cannot reach (the largest such total is 35), so no
// total can be read off this cage. Only its no-repeat half is stated. Nothing
// is lost by that: the 23 cages tile the grid, so in any completed sudoku the
// 23 cage sums add to 9 x 45 = 405, and the 22 printed totals above add to
// 383 -- these five cells sum to 22 in every grid the constraints above allow,
// with or without a constraint saying so.
const cageWithUnreadableTotal =
  new AllDifferent('R7C7', 'R7C8', 'R7C9', 'R8C8', 'R8C9');

return [
  new Shape('9x9'),

  ...cages,
  cageWithUnreadableTotal,
];
