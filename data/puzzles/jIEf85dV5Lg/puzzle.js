// Title: Gears
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=jIEf85dV5Lg
// Source: https://sudokupad.app/xmluoxvukw

// Normal sudoku (default row/column/box all-different from Shape/regions).
// 14 killer cages: digits in a cage do not repeat and sum to the given total
// (Cage(sum, ...cells) enforces both). The payload also shades the caged
// cells with three background colours that group the cages into three
// closed rings around the grid centre (a "gears" motif); the rules text
// gives that colouring no arithmetic meaning, so it is not encoded.

return [
  new Shape('9x9'),

  new Cage(20, 'R2C3', 'R2C4', 'R2C5'),
  new Cage(25, 'R2C6', 'R2C7', 'R2C8', 'R3C8'),
  new Cage(12, 'R4C8', 'R5C8'),
  new Cage(14, 'R6C8', 'R7C8'),
  new Cage(5, 'R8C6', 'R8C7'),
  new Cage(11, 'R8C4', 'R8C5'),
  new Cage(13, 'R6C2', 'R7C2', 'R8C2', 'R8C3'),
  new Cage(10, 'R3C2', 'R4C2', 'R5C2'),
  new Cage(19, 'R3C3', 'R3C4', 'R4C3', 'R5C3', 'R6C3'),
  new Cage(13, 'R3C5', 'R3C6'),
  new Cage(32, 'R4C7', 'R5C7', 'R6C7', 'R7C6', 'R7C7'),
  new Cage(10, 'R7C4', 'R7C5'),
  new Cage(14, 'R4C5', 'R4C6', 'R5C6'),
  new Cage(21, 'R5C4', 'R6C4', 'R6C5'),
];
