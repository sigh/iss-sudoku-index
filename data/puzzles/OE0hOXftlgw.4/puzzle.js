// Title: Uzumaki
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=OE0hOXftlgw
// Source: https://tinyurl.com/dfy458as

// Normal sudoku rules apply. Adjacent digits along the eight green lines
// must differ by at least 5 (German whisper lines, default Whisper
// difference).

return [
  new Shape('9x9'),

  new Given('R1C9', 4),
  new Given('R2C1', 4),
  new Given('R2C7', 8),
  new Given('R3C8', 3),
  new Given('R4C5', 4),
  new Given('R5C1', 2),
  new Given('R5C9', 8),
  new Given('R6C5', 6),
  new Given('R7C2', 7),
  new Given('R8C3', 2),
  new Given('R8C9', 6),
  new Given('R9C1', 6),

  // Green whisper lines, transcribed from the payload's `whispers`/`line`
  // arrays (outlineC #67F067).
  new Whisper(5, 'R9C6', 'R8C6', 'R7C6', 'R6C6'),
  new Whisper(5, 'R8C9', 'R8C8', 'R8C7', 'R8C6'),
  new Whisper(5, 'R6C5', 'R6C6', 'R6C7', 'R6C8'),
  new Whisper(5, 'R5C8', 'R6C8', 'R7C8', 'R8C8'),
  new Whisper(5, 'R1C4', 'R2C4', 'R3C4', 'R4C4'),
  new Whisper(5, 'R2C2', 'R3C2', 'R4C2', 'R5C2'),
  new Whisper(5, 'R4C5', 'R4C4', 'R4C3', 'R4C2'),
  new Whisper(5, 'R2C1', 'R2C2', 'R2C3', 'R2C4'),
];
