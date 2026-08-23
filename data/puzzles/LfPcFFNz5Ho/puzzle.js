// Title: Xtreme Roping
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=LfPcFFNz5Ho
// Source: https://app.crackingthecryptic.com/sudoku/RLfGDg3QpQ
//
// Normal sudoku rules apply. Each cage sums to its printed total; cages are
// read as standard killer cages (also no repeated digit), since the rules
// give only the sum and cage totals conventionally imply distinctness. Each
// grey line is a 6-cell palindrome (digit string reads the same forwards and
// backwards).

const cages = [
  new Cage(10, 'R1C9', 'R2C9'),
  new Cage(14, 'R7C9', 'R8C9'),
  new Cage(13, 'R5C8', 'R5C9'),
  new Cage(10, 'R2C5', 'R2C6'),
  new Cage(11, 'R3C5', 'R3C6'),
  new Cage(11, 'R1C1', 'R2C1'),
  new Cage(9, 'R5C1', 'R5C2'),
  new Cage(11, 'R7C5', 'R8C5'),
  new Cage(14, 'R7C1', 'R8C1'),
];

const palindromes = [
  new Palindrome('R1C3', 'R2C3', 'R3C3', 'R4C4', 'R5C4', 'R6C4'),
  new Palindrome('R1C4', 'R2C4', 'R3C4', 'R4C5', 'R5C5', 'R6C5'),
  new Palindrome('R6C6', 'R5C6', 'R4C6', 'R3C7', 'R2C7', 'R1C7'),
  new Palindrome('R4C7', 'R5C7', 'R6C7', 'R7C6', 'R8C6', 'R9C6'),
  new Palindrome('R4C8', 'R5C8', 'R6C8', 'R7C7', 'R8C7', 'R9C7'),
  new Palindrome('R9C4', 'R8C4', 'R7C4', 'R6C3', 'R5C3', 'R4C3'),
  new Palindrome('R4C2', 'R5C2', 'R6C2', 'R7C3', 'R8C3', 'R9C3'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...palindromes,
];
