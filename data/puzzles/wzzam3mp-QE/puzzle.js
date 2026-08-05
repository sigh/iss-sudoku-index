// Title: Abstract Nonsense
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=wzzam3mp-QE
// Source: https://app.crackingthecryptic.com/sudoku/NgpdF7d6h7

// Normal Sudoku rules apply. Cage digits are distinct; numbered cages have the shown sum.
// Cells a chess knight's move apart differ.
// Cage cell lists are transcribed from the drawn cage outlines.
return [
  new Shape('9x9'),
  new AntiKnight(),
  new Cage(7, 'R2C1', 'R3C1', 'R4C1'),
  new Cage(9, 'R9C1', 'R9C2', 'R9C3'),
  new Cage(21, 'R9C6', 'R9C7', 'R9C8'),
  new Cage(21, 'R1C3', 'R1C4', 'R1C5'),
  new AllDifferent('R1C2', 'R2C2', 'R3C2', 'R4C2', 'R4C3', 'R5C3', 'R6C3', 'R4C4', 'R5C2'),
  new AllDifferent('R5C1', 'R6C1', 'R7C1', 'R6C2', 'R7C2', 'R7C3', 'R7C4', 'R6C4', 'R7C5'),
  new AllDifferent('R3C3', 'R2C3', 'R2C4', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R6C6'),
  new AllDifferent('R5C8', 'R6C8', 'R7C8', 'R7C7', 'R8C7', 'R8C6', 'R8C5', 'R9C5', 'R9C4'),
  new AllDifferent('R4C8', 'R8C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9'),
  new AllDifferent('R3C8', 'R2C8', 'R1C7', 'R2C7', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R5C7'),
];
