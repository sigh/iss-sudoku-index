// Title: Cloud Atlas
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=zAQJfjWLZEA
// Source: https://sudokupad.app/csdq2h21cv

// Standard Sudoku with orthogonal anti-consecutive, German whispers, and an arrow.
const whispers = [
  new Whisper(5, 'R3C4', 'R4C5', 'R5C6'),
  new Whisper(5, 'R4C4', 'R5C5', 'R6C6'),
  new Whisper(5, 'R7C7', 'R8C8'),
  new Whisper(5, 'R2C2', 'R3C3'),
  new Whisper(5, 'R3C2', 'R4C3', 'R5C4'),
];

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...whispers,
  new Arrow('R3C5', 'R4C5', 'R5C5', 'R6C5'),
];
