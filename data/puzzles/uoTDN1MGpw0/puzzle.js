// Title: Birthday Cages & Whispers
// Author: Ben & Harry
// Video: https://www.youtube.com/watch?v=uoTDN1MGpw0
// Source: https://sudokupad.app/pg14qgdqfp

// Standard sudoku, killer cages (sum to the given total, no repeats), and
// German whisper lines (adjacent cells on a line differ by >= 5).
const whispers = [
  new Whisper(5, 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R3C2', 'R2C3'),
  new Whisper(5, 'R7C4', 'R7C5', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1', 'R7C1', 'R6C1', 'R5C1'),
  new Whisper(5, 'R5C6', 'R4C6', 'R5C7', 'R6C8', 'R7C9', 'R8C8', 'R9C7'),
  new Whisper(5, 'R2C7', 'R1C7', 'R1C6'),
  // Closed loop (drawn wayPoints return to their start cell R4C4): repeat the
  // first cell at the end so the wrap-around edge R5C4-R4C4 is also bound.
  new Whisper(5, 'R4C4', 'R5C5', 'R6C4', 'R5C4', 'R4C4'),
];

const cages = [
  new Cage(16, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(18, 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R7C3'),
  new Cage(14, 'R9C2', 'R9C3', 'R9C4'),
  new Cage(7, 'R5C9', 'R6C9'),
  new Cage(11, 'R6C4', 'R6C5', 'R6C6'),
  new Cage(9, 'R3C8', 'R3C9'),
  new Cage(20, 'R8C9', 'R9C7', 'R9C8', 'R9C9'),
  new Cage(26, 'R3C5', 'R3C6', 'R4C6', 'R4C7'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
];
