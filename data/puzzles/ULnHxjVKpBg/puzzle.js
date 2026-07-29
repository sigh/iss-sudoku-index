// Title: Va-Et-Vient
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=ULnHxjVKpBg
// Source: https://app.crackingthecryptic.com/2l8u234v2c

// Standard Sudoku, two purple Renban lines, one green German Whisper line, and
// eight outlined killer cages from the puzzle artwork.
const givens = [
  new Given('R3C9', 1),
  new Given('R7C1', 6),
];

const renbanLines = [
  new Renban('R9C7', 'R8C6', 'R7C5', 'R6C6', 'R5C7', 'R4C6', 'R3C5', 'R2C6', 'R1C7'),
  new Renban('R9C5', 'R8C4', 'R7C3', 'R6C4', 'R5C5', 'R4C4', 'R3C3', 'R2C4', 'R1C5'),
];

const whispers = [
  new Whisper(5, 'R1C6', 'R2C5', 'R3C4', 'R4C5', 'R5C6', 'R6C5', 'R7C4', 'R8C5', 'R9C6'),
];

// Cage totals and cells are transcribed from the outlined regions.
const cages = [
  new Cage(24, 'R3C7', 'R4C6', 'R4C7', 'R5C6'),
  new Cage(26, 'R7C7', 'R8C6', 'R8C7', 'R9C6'),
  new Cage(17, 'R5C7', 'R6C6', 'R6C7', 'R7C6'),
  new Cage(19, 'R1C7', 'R2C6', 'R2C7', 'R3C6'),
  new Cage(20, 'R1C3', 'R2C3', 'R2C4', 'R3C4'),
  new Cage(19, 'R3C3', 'R4C3', 'R4C4', 'R5C4'),
  new Cage(22, 'R7C3', 'R8C3', 'R8C4', 'R9C4'),
  new Cage(21, 'R5C3', 'R6C3', 'R6C4', 'R7C4'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...renbanLines,
  ...whispers,
  ...cages,
];
