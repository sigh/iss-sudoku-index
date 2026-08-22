// Title: Let It Snow
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=c__XBsPos-s
// Source: https://app.crackingthecryptic.com/sudoku/D6gtMgFQbT

// Normal sudoku rules apply. Adjacent digits along blue lines must differ by
// at least 5 (Whisper(5)). Purple lines contain a consecutive series of
// digits, in any order (Renban). Blue and purple lines that touch or cross at
// a shared cell are still separate clues, each encoded on its own colour's
// cells.

return [
  new Shape('9x9'),

  new Given('R1C3', 9),
  new Given('R1C8', 5),
  new Given('R2C1', 3),
  new Given('R3C9', 1),
  new Given('R7C1', 1),
  new Given('R9C2', 9),
  new Given('R9C7', 6),

  // Blue whisper lines (difference >= 5).
  new Whisper(5, 'R5C1', 'R5C2', 'R5C3', 'R5C4'),
  new Whisper(5, 'R8C2', 'R7C3', 'R6C4'),
  new Whisper(5, 'R2C2', 'R3C3', 'R4C4'),
  new Whisper(5, 'R1C5', 'R2C5', 'R3C5', 'R4C5'),
  new Whisper(5, 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new Whisper(5, 'R6C6', 'R7C7', 'R8C8'),
  new Whisper(5, 'R5C6', 'R5C7', 'R5C8'),
  new Whisper(5, 'R4C6', 'R3C7', 'R2C8'),

  // Purple renban lines (consecutive set of digits, any order).
  new Renban('R5C4', 'R6C4'),
  new Renban('R4C4', 'R4C5'),
  new Renban('R4C6', 'R5C6'),
  new Renban('R6C5', 'R6C6'),
  new Renban('R2C6', 'R3C6'),
  new Renban('R2C4', 'R3C4'),
  new Renban('R1C4', 'R2C5', 'R1C6'),
  new Renban('R2C7', 'R3C7', 'R3C8'),
  new Renban('R4C9', 'R5C8', 'R6C9'),
  new Renban('R4C7', 'R4C8'),
  new Renban('R6C7', 'R6C8'),
  new Renban('R4C1', 'R5C2', 'R6C1'),
  new Renban('R4C2', 'R4C3'),
  new Renban('R6C2', 'R6C3'),
  new Renban('R3C2', 'R3C3', 'R2C3'),
  new Renban('R8C7', 'R7C7', 'R7C8'),
  new Renban('R7C4', 'R8C4'),
  new Renban('R7C6', 'R8C6'),
  new Renban('R9C4', 'R8C5', 'R9C6'),
  new Renban('R7C2', 'R7C3', 'R8C3'),
];
