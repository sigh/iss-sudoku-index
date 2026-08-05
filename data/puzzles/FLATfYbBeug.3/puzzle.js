// Title: 11/6/22: Spending Daylight
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=FLATfYbBeug
// Source: https://tinyurl.com/yksw2zke

// Normal Sudoku rules apply. Each green line is a German whisper line.
// Green-line paths transcribed from the source puzzle.
const whispers = [
  new Whisper(5, 'R2C4', 'R2C3', 'R2C2', 'R3C2', 'R4C2', 'R4C3', 'R4C4', 'R3C4'),
  new Whisper(5, 'R3C4', 'R2C4'),
  new Whisper(5, 'R6C6', 'R7C6', 'R8C6', 'R8C7', 'R8C8', 'R7C8', 'R6C8', 'R6C7'),
  new Whisper(5, 'R6C7', 'R6C6'),
  new Whisper(5, 'R8C2', 'R9C2', 'R9C3'),
  new Whisper(5, 'R8C2', 'R8C3', 'R9C3'),
  new Whisper(5, 'R1C7', 'R2C7', 'R2C8'),
  new Whisper(5, 'R1C7', 'R1C8', 'R2C8'),
  new Whisper(5, 'R6C3', 'R7C3', 'R7C4'),
  new Whisper(5, 'R6C3', 'R6C4', 'R7C4'),
  new Whisper(5, 'R3C6', 'R4C6', 'R4C7'),
  new Whisper(5, 'R3C6', 'R3C7', 'R4C7'),
  new Whisper(5, 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R5C2', 'R5C3'),
  new Whisper(5, 'R5C7', 'R5C8', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8'),
];

return [
  new Shape('9x9'),
  new Given('R3C3', 6),
  new Given('R4C9', 4),
  new Given('R5C5', 5),
  new Given('R6C1', 6),
  new Given('R7C7', 4),
  ...whispers,
];
