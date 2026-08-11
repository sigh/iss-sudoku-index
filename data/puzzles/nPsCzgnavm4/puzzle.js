// Title: X12 Cages
// Author: Quarterthru
// Video: https://www.youtube.com/watch?v=nPsCzgnavm4
// Source: https://app.crackingthecryptic.com/sudoku/Jjb694NBfP

// Standard Sudoku (9x9, standard 3x3 boxes) with no given digits. Digits
// cannot repeat on either main diagonal. Digits cannot repeat inside any of
// the 12 cages; 11 cages print a sum (killer-cage semantics), and one cage
// (F below) prints no total, so it carries all-different only.
const summedCages = [
  new Cage(35, 'R2C1', 'R3C1', 'R4C1', 'R4C2', 'R3C2'), // A
  new Cage(33, 'R8C1', 'R7C1', 'R6C1', 'R6C2', 'R7C2'), // B
  new Cage(18, 'R1C2', 'R1C3', 'R1C4', 'R2C3'), // C
  new Cage(27, 'R9C2', 'R9C3', 'R8C3', 'R8C4', 'R9C4'), // D
  new Cage(31, 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R4C3', 'R6C3'), // E
  new Cage(31, 'R6C5', 'R7C5', 'R7C4', 'R7C6', 'R8C5', 'R9C5'), // G
  new Cage(28, 'R5C6', 'R4C7', 'R5C7', 'R6C7', 'R5C8', 'R5C9'), // H
  new Cage(15, 'R1C6', 'R1C7', 'R1C8', 'R2C7'), // I
  new Cage(16, 'R2C9', 'R3C9', 'R3C8', 'R4C8', 'R4C9'), // J
  new Cage(17, 'R6C8', 'R6C9', 'R7C9', 'R8C9', 'R7C8'), // K
  new Cage(32, 'R8C6', 'R8C7', 'R9C6', 'R9C7', 'R9C8'), // L
];

// Cage F: no printed total (drawn cage with empty `value`), all-different only.
const noTotalCage = new AllDifferent(
  'R1C5', 'R2C5', 'R3C5', 'R2C4', 'R2C6', 'R4C5'
);

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Diagonal(1),
  ...summedCages,
  noTotalCage,
];
