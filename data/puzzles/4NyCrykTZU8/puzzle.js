// Title: Just a killer
// Author: Adem Jaziri
// Video: https://www.youtube.com/watch?v=4NyCrykTZU8
// Source: https://sudokupad.app/yya40q1u23

// Normal sudoku rules apply. Digits in a cage sum to the number in the
// top-left corner of the cage, and digits do not repeat within a cage.
return [
  new Cage(14, 'R1C1', 'R2C1'),
  new Cage(14, 'R1C6', 'R1C7'),
  new Cage(7, 'R1C9', 'R2C9'),
  new Cage(10, 'R2C3', 'R3C3'),
  new Cage(10, 'R2C4', 'R3C4'),
  new Cage(7, 'R2C5', 'R2C6'),
  new Cage(21, 'R4C1', 'R4C2', 'R4C3'),
  new Cage(7, 'R4C8', 'R5C8'),
  new Cage(10, 'R5C1', 'R6C1'),
  new Cage(10, 'R5C4', 'R5C5', 'R5C6'),
  new Cage(21, 'R6C7', 'R6C8', 'R6C9'),
  new Cage(12, 'R7C3', 'R7C4'),
  new Cage(14, 'R7C6', 'R7C7'),
  new Cage(7, 'R8C2', 'R9C2'),
  new Cage(14, 'R8C3', 'R9C3'),
  new Cage(14, 'R8C9', 'R9C9'),
  new Cage(7, 'R9C5', 'R9C6'),
];
