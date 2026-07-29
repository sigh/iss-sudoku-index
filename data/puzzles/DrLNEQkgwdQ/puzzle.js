// Title: Diving Competition
// Author: Will Power
// Video: https://www.youtube.com/watch?v=DrLNEQkgwdQ
// Source: https://sudokupad.app/n6HgP4g2rF

// Normal Sudoku rules apply. Grey bulb-ended lines are thermometers; outlined
// cages have their printed sums; adjacent cells on orange lines differ by at
// least 4. The blue water is decorative and has no constraint.

// Cage cells and totals transcribed from the outlined cage labels.
const cages = [
  new Cage(22, 'R9C7', 'R9C8', 'R9C9'),
  new Cage(12, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(15, 'R1C8', 'R2C8', 'R3C8'),
  new Cage(16, 'R1C9', 'R2C9', 'R3C9'),
  new Cage(13, 'R1C1', 'R2C1', 'R3C1'),
  new Cage(17, 'R6C5', 'R7C5', 'R8C5'),
  new Cage(11, 'R6C6', 'R7C6', 'R8C6'),
  new Cage(16, 'R6C7', 'R7C7', 'R8C7'),
  new Cage(15, 'R3C5', 'R3C6', 'R3C7'),
  new Cage(10, 'R1C4', 'R2C4', 'R2C5', 'R3C4'),
  new Cage(10, 'R4C4', 'R5C4'),
];

// Paths are transcribed bulb-first from the grey thermometer strokes.
const thermos = [
  new Thermo('R3C2', 'R4C2', 'R5C2', 'R6C2', 'R5C3', 'R6C3'),
  new Thermo('R3C2', 'R4C2', 'R3C3', 'R2C3'),
  new Thermo('R8C8', 'R9C8'),
  new Thermo('R4C6', 'R3C7', 'R3C6', 'R3C5'),
  new Thermo('R4C6', 'R3C7', 'R2C7', 'R2C6', 'R3C5', 'R4C4'),
  new Thermo('R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2'),
  new Thermo('R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8'),
];

// Orange line paths transcribed from the drawn lines.
const whispers = [
  new Whisper(4, 'R8C1', 'R8C2', 'R8C3', 'R8C4'),
  new Whisper(4, 'R1C9', 'R2C9', 'R3C9'),
  new Whisper(4, 'R1C8', 'R2C8', 'R3C8'),
  new Whisper(4, 'R6C6', 'R7C6', 'R8C6'),
  new Whisper(4, 'R6C7', 'R7C7', 'R8C7'),
  new Whisper(4, 'R6C5', 'R7C5', 'R8C5'),
  new Whisper(4, 'R1C1', 'R2C1', 'R3C1'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...thermos,
  ...whispers,
];
