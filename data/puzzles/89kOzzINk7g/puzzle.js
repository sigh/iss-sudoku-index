// Title: Pressure Pointer
// Author: CheeseOrSteve
// Video: https://www.youtube.com/watch?v=89kOzzINk7g
// Source: https://sudokupad.app/vu54azttv0

// Purple lines contain consecutive digits in any order.
const renbans = [
  new Renban('R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'),
  new Renban('R1C4', 'R1C5', 'R1C6'),
  new Renban('R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3'),
  new Renban('R5C9', 'R6C9', 'R7C9'),
  new Renban('R8C4', 'R8C5', 'R8C6'),
  new Renban('R4C3', 'R5C2'),
];

// Adjacent digits on green lines differ by at least 5.
const whispers = [
  new Whisper(5, 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9'),
  new Whisper(5, 'R2C3', 'R3C2'),
  new Whisper(5, 'R9C6', 'R9C5', 'R9C4'),
  new Whisper(5, 'R8C3', 'R9C3', 'R9C2'),
  new Whisper(5, 'R9C8', 'R9C7', 'R8C7'),
  new Whisper(5, 'R4C2', 'R5C3'),
  new Whisper(5, 'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R4C4'),
  new Whisper(5, 'R4C6', 'R5C5'),
];

return [
  new Shape('9x9'),
  ...renbans,
  ...whispers,
  new Thermo('R2C8', 'R1C8', 'R1C9', 'R2C9'),
];
