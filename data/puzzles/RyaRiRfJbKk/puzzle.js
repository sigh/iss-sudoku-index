// Title: Cornered in the 9's
// Author: Panthera
// Video: https://www.youtube.com/watch?v=RyaRiRfJbKk
// Source: https://sudokupad.app/akgkajm6cv

// Normal sudoku rules apply. Digits in a killer cage cannot repeat and sum to
// the indicated total. Standard 3x3 box regions; no given digits.

return [
  new Cage(9, 'R1C2', 'R2C1', 'R2C2'),
  new Cage(9, 'R1C8', 'R2C8', 'R2C9'),
  new Cage(9, 'R8C8', 'R8C9', 'R9C8'),
  new Cage(9, 'R8C1', 'R8C2', 'R9C2'),
  new Cage(9, 'R4C2', 'R5C2', 'R5C3'),
  new Cage(9, 'R4C8', 'R5C7', 'R5C8'),
  new Cage(9, 'R7C5', 'R8C5', 'R8C6'),
  new Cage(9, 'R2C5', 'R2C6', 'R3C5'),
  new Cage(9, 'R5C4', 'R5C5', 'R6C5'),
  new Cage(15, 'R6C3', 'R6C4', 'R7C3'),
  new Cage(15, 'R3C4', 'R4C3', 'R4C4'),
  new Cage(15, 'R3C7', 'R4C6', 'R4C7'),
  new Cage(14, 'R6C6', 'R6C7', 'R7C6'),
];
