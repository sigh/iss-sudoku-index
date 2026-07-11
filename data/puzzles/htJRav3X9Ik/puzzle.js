// Title: Epitome
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=htJRav3X9Ik
// Source: https://sudokupad.app/fg1xzkeibv

// Normal sudoku rules apply. Killer cage digits sum to the clue and cannot repeat.
// Standard 3x3 box regions. No given digits; the grid is fully deduced from
// the cage sums.

return [
  new Cage(20, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(14, 'R1C4', 'R2C4'),
  new Cage(15, 'R1C5', 'R1C6', 'R2C6'),
  new Cage(11, 'R2C9', 'R3C8', 'R3C9'),
  new Cage(36, 'R3C3', 'R3C4', 'R4C3', 'R4C4', 'R4C5', 'R5C4'),
  new Cage(14, 'R4C1', 'R4C2'),
  new Cage(18, 'R4C8', 'R4C9', 'R5C9'),
  new Cage(9, 'R5C1', 'R6C1', 'R6C2'),
  new Cage(36, 'R5C7', 'R6C6', 'R6C7', 'R7C5', 'R7C6', 'R7C7'),
  new Cage(14, 'R6C8', 'R6C9'),
  new Cage(10, 'R7C8', 'R8C7', 'R8C8'),
  new Cage(10, 'R8C3', 'R9C2', 'R9C3'),
  new Cage(18, 'R8C4', 'R9C4', 'R9C5'),
  new Cage(14, 'R8C6', 'R9C6'),
];
