// Title: Weird Arrow Man
// Author: Adem Jaziri
// Video: https://www.youtube.com/watch?v=AfpCGpEokX4
// Source: https://sudokupad.app/fosir7x3ud

// Normal Sudoku rules apply. Arrow digits sum to the attached circle digit;
// the rules permit repeats on arrows. White dots mark consecutive digits, and
// the statement that not all dots are given means there is no negative-dot rule.

// Arrow paths transcribed from the thirteen grey drawn arrows, circle first.
const arrows = [
  new Arrow('R9C1', 'R8C1', 'R7C1', 'R6C2', 'R5C2', 'R4C3'),
  new Arrow('R9C1', 'R9C2', 'R9C3', 'R8C4'),
  new Arrow('R1C9', 'R1C8', 'R1C7', 'R2C6', 'R2C5', 'R3C4'),
  new Arrow('R1C9', 'R2C9', 'R3C9', 'R4C8'),
  new Arrow('R3C3', 'R2C3', 'R2C2', 'R3C2'),
  new Arrow('R6C4', 'R7C4', 'R8C5'),
  new Arrow('R6C4', 'R6C5', 'R6C6'),
  new Arrow('R6C4', 'R5C3', 'R4C4'),
  new Arrow('R4C6', 'R4C7', 'R5C8'),
  new Arrow('R4C6', 'R5C6', 'R6C6'),
  new Arrow('R4C6', 'R3C5', 'R4C4'),
  new Arrow('R7C6', 'R8C7', 'R9C7'),
  new Arrow('R6C7', 'R7C8', 'R7C9'),
];

// White-dot positions transcribed from the three drawn edge marks.
const whiteDots = [
  new WhiteDot('R8C9', 'R9C9'),
  new WhiteDot('R2C7', 'R2C8'),
  new WhiteDot('R7C2', 'R8C2'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...whiteDots,
];
