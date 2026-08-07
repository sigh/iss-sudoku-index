// Title: September 20th, 2022: Killer
// Author: Sam Tyrgleman-Lynes
// Video: https://www.youtube.com/watch?v=vZ-qiES6VVY
// Source: https://tinyurl.com/yj44w9d5

// Normal sudoku rules apply. Each killer cage's digits are distinct and sum
// to its printed total (Cage enforces both). Cells not listed in any cage
// carry no local constraint beyond normal sudoku.
return [
  new Shape('9x9'),

  new Cage(7, 'R1C3', 'R1C4', 'R2C4'),
  new Cage(4, 'R1C6', 'R1C7'),
  new Cage(23, 'R8C6', 'R9C6', 'R9C7'),
  new Cage(16, 'R9C3', 'R9C4'),
  new Cage(3, 'R3C9', 'R4C9'),
  new Cage(17, 'R6C1', 'R7C1'),
  new Cage(24, 'R6C8', 'R6C9', 'R7C9'),
  new Cage(6, 'R3C1', 'R4C1', 'R4C2'),
  new Cage(5, 'R4C3', 'R5C3'),
  new Cage(5, 'R5C7', 'R6C7'),
  new Cage(10, 'R6C3', 'R7C3', 'R7C4'),
  new Cage(24, 'R3C6', 'R3C7', 'R4C7'),
  new Cage(10, 'R2C2', 'R3C2'),
  new Cage(3, 'R7C8', 'R8C8'),
  new Cage(3, 'R5C6', 'R6C6'),
  new Cage(14, 'R4C4', 'R5C4'),
  new Cage(7, 'R6C4', 'R6C5'),
  new Cage(12, 'R4C5', 'R4C6'),
];
