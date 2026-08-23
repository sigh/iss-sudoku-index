// Title: Tomb Of Whispers
// Author: Nityant Agarwal, Gliperal, Botaku & Tob Snibbob
// Video: https://www.youtube.com/watch?v=ZorNxTzwEBc
// Source: https://app.crackingthecryptic.com/sudoku/2Lp4R6L272

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; default Shape).
// Killer cages: digits in a cage are distinct and sum to the printed total.
// Orange whisper lines: adjacent digits on a line differ by at least 5.

const cages = [
  new Cage(21, 'R2C2', 'R2C3', 'R2C4', 'R3C2', 'R4C2'),
  new Cage(19, 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8'),
  new Cage(21, 'R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4'),
  new Cage(20, 'R6C8', 'R7C8', 'R8C8', 'R8C6', 'R8C7'),
];

const whispers = [
  new Whisper(5, 'R2C1', 'R3C1', 'R4C1'),
  new Whisper(5, 'R2C9', 'R3C9', 'R4C9'),
  new Whisper(5, 'R6C4', 'R5C3', 'R4C4', 'R3C5', 'R4C6', 'R5C7', 'R6C6'),
  new Whisper(5, 'R6C2', 'R7C2', 'R8C2', 'R8C3'),
  new Whisper(5, 'R7C8', 'R8C8', 'R8C7', 'R8C6'),
  new Whisper(5, 'R3C2', 'R2C2', 'R2C3', 'R2C4'),
  new Whisper(5, 'R2C7', 'R2C8', 'R3C8', 'R4C8'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
];
