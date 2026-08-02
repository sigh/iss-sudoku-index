// Title: Corner Prison
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=jgEW_ECvpWI
// Source: https://sudokupad.app/jB7njtNrM6

// Standard Sudoku, eight distinct-sum cages, and the ten drawn white dots are encoded.
// Fog is progressive UI presentation and adds no final-grid rule.
// Cage cells and totals are transcribed from the drawn cage outlines and corner totals.
const cages = [
  new Cage(45, 'R1C3', 'R2C1', 'R2C3', 'R3C1', 'R3C3', 'R3C4', 'R4C1', 'R4C2', 'R4C3'),
  new Cage(30, 'R1C1', 'R1C2', 'R2C2', 'R3C2'),
  new Cage(43, 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'),
  new Cage(45, 'R6C7', 'R7C2', 'R7C7', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'),
  new Cage(18, 'R5C5', 'R5C6', 'R6C6', 'R7C6'),
  new Cage(28, 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'),
  new Cage(41, 'R1C6', 'R1C8', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C8'),
  new Cage(21, 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R6C3', 'R6C4'),
];

// White-dot edges are transcribed from the ten rounded white marks in the grid.
const whiteDots = [
  new WhiteDot('R1C1', 'R2C1'), new WhiteDot('R5C2', 'R5C3'),
  new WhiteDot('R5C3', 'R6C3'), new WhiteDot('R9C2', 'R9C3'),
  new WhiteDot('R9C5', 'R9C6'), new WhiteDot('R5C5', 'R5C6'),
  new WhiteDot('R4C5', 'R4C6'), new WhiteDot('R2C8', 'R2C9'),
  new WhiteDot('R3C7', 'R4C7'), new WhiteDot('R3C7', 'R3C8'),
];

return [new Shape('9x9'), ...cages, ...whiteDots];
