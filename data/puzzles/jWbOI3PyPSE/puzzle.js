// Title: Killer Sudoku
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=jWbOI3PyPSE
// Source: https://cracking-the-cryptic.web.app/sudoku/RDFfr7rf88

// Normal sudoku rules. Killer cages: digits sum to the printed total and
// never repeat within a cage. Four cages (N, R, S, T below) carry no printed
// total, so only the all-different part applies -- Cage(0, ...) below.
// No other rules text or overlay geometry is present in the payload.

// Cages: cells and totals from the payload's cages array.
const cages = [
  new Cage(20, 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C4'), // A
  new Cage(20, 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C8'), // B
  new Cage(20, 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R4C8'), // C
  new Cage(20, 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R8C8'), // D
  new Cage(20, 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R8C6'), // E
  new Cage(20, 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R8C2'), // F
  new Cage(20, 'R9C1', 'R8C1', 'R7C1', 'R6C1', 'R6C2'), // G
  new Cage(20, 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R2C2'), // H
  new Cage(21, 'R2C5', 'R2C6', 'R2C7'), // I
  new Cage(21, 'R5C8', 'R6C8', 'R7C8'), // J
  new Cage(22, 'R8C5', 'R8C4', 'R8C3'), // K
  new Cage(23, 'R5C2', 'R4C2', 'R3C2'), // L
  new Cage(17, 'R2C3', 'R3C3', 'R3C4'), // M
  new Cage(0, 'R3C5', 'R3C6', 'R4C6', 'R4C5'), // N, no printed total
  new Cage(20, 'R4C7', 'R3C7', 'R3C8'), // O
  new Cage(19, 'R7C6', 'R7C7', 'R8C7'), // P
  new Cage(19, 'R7C2', 'R7C3', 'R6C3'), // Q
  new Cage(0, 'R4C3', 'R5C3', 'R5C4', 'R4C4'), // R, no printed total
  new Cage(0, 'R6C4', 'R7C4', 'R7C5', 'R6C5'), // S, no printed total
  new Cage(0, 'R5C6', 'R6C6', 'R6C7', 'R5C7'), // T, no printed total
];

return [
  new Shape('9x9'),

  ...cages,
];
