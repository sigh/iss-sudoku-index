// Title: July 22, 2021: Badge
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Ccic3LUfnZs
// Source: https://tinyurl.com/8zznmdcs

// Normal sudoku rules apply. Digits in cages cannot repeat, and sum to the
// total given. No given digits. Cage cells and totals below are transcribed
// from the payload's killercage array.

return [
  new Shape('9x9'),
  new Cage(9, 'R2C2', 'R3C2', 'R4C2'),
  new Cage(3, 'R2C6', 'R2C7'),
  new Cage(4, 'R3C7', 'R3C8'),
  new Cage(5, 'R4C6', 'R4C7'),
  new Cage(23, 'R6C3', 'R6C4', 'R7C4'),
  new Cage(16, 'R6C9', 'R7C9'),
  new Cage(17, 'R7C3', 'R8C3'),
  new Cage(6, 'R9C6', 'R9C7'),
];
