// Title: Electric Explosion
// Author: Scojo
// Video: https://www.youtube.com/watch?v=7yXvcsWVK2g
// Source: https://sudokupad.app/gFLGDRnLL7

// Normal Sudoku rules apply. Adjacent digits along each green line differ by at
// least 5. The listed paths are transcribed from the eight green drawn lines.
return [
  new Shape('9x9'),
  new Given('R1C6', 5),
  new Given('R1C8', 2),
  new Given('R2C1', 5),
  new Given('R4C1', 1),
  new Given('R6C9', 4),
  new Given('R8C9', 7),
  new Given('R9C2', 6),
  new Given('R9C4', 2),
  new Whisper(5, 'R1C7', 'R2C6', 'R2C7', 'R3C6', 'R4C7', 'R3C8', 'R4C8', 'R3C9'),
  new Whisper(5, 'R7C1', 'R6C2', 'R7C2', 'R6C3', 'R7C4', 'R8C3', 'R8C4', 'R9C3'),
  new Whisper(5, 'R1C3', 'R2C4', 'R2C3', 'R3C4', 'R4C3', 'R3C2', 'R4C2', 'R3C1'),
  new Whisper(5, 'R7C9', 'R6C8', 'R7C8', 'R6C7', 'R7C6', 'R8C7', 'R8C6', 'R9C7'),
  new Whisper(5, 'R8C2', 'R9C1'),
  new Whisper(5, 'R1C1', 'R2C2'),
  new Whisper(5, 'R1C9', 'R2C8'),
  new Whisper(5, 'R8C8', 'R9C9'),
];
