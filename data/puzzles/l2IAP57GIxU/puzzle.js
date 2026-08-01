// Title: Tulpenblute
// Author: Myxo
// Video: https://www.youtube.com/watch?v=l2IAP57GIxU
// Source: https://sudokupad.app/ori9jgdrak

// Standard Sudoku with the three drawn givens. Each thick magenta path is a
// Renban line; each thin green segment is a German Whisper with difference 5.
const renbans = [
  new Renban('R4C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C4'),
  new Renban('R2C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C8'),
  new Renban('R6C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C4'),
  new Renban('R8C6', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C8'),
  new Renban('R3C3', 'R4C4', 'R5C4', 'R6C5', 'R5C6', 'R4C6', 'R3C7'),
];

const whispers = [
  new Whisper(5, 'R3C1', 'R4C2'), new Whisper(5, 'R1C3', 'R2C4'),
  new Whisper(5, 'R1C7', 'R2C6'), new Whisper(5, 'R3C9', 'R4C8'),
  new Whisper(5, 'R6C2', 'R7C1'), new Whisper(5, 'R8C4', 'R9C3'),
  new Whisper(5, 'R8C6', 'R9C7'), new Whisper(5, 'R6C8', 'R7C9'),
  new Whisper(5, 'R3C7', 'R4C6'), new Whisper(5, 'R4C4', 'R5C4'),
];

return [
  new Shape('9x9'),
  new Given('R1C5', 2), new Given('R5C1', 7), new Given('R5C9', 8),
  ...renbans,
  ...whispers,
];
