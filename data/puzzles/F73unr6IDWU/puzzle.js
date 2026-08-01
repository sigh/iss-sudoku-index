// Title: Quarters
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=F73unr6IDWU
// Source: https://app.crackingthecryptic.com/james-sinclair/quarters

// Normal Sudoku. Orange lines are Dutch whispers (difference at least 4);
// purple lines are renbans; the 2x2 circles list their required digits.
return [
  new Shape('9x9'),

  // Orange line paths from the drawn Dutch whisper lines.
  new Whisper(4, 'R9C3', 'R8C4', 'R7C3'),
  new Whisper(4, 'R7C6', 'R6C7', 'R5C6'),
  new Whisper(4, 'R5C3', 'R4C2', 'R3C3'),
  new Whisper(4, 'R2C5', 'R2C6', 'R1C6'),

  // Purple line paths from the drawn renban lines.
  new Renban('R9C1', 'R8C1', 'R8C2'),
  new Renban('R7C4', 'R7C5', 'R6C5'),
  new Renban('R3C6', 'R3C7', 'R2C7'),

  // Quadruple-circle digits, anchored at each surrounding 2x2's top-left cell.
  new Quad('R1C1', 1, 2, 3, 4),
  new Quad('R8C8', 1, 2, 3, 4),
  new Quad('R7C2', 6, 7, 8, 9),
  new Quad('R7C5', 2, 3, 4, 7),
  new Quad('R5C5', 1, 3, 7, 8),
  new Quad('R4C8', 1, 2, 3, 7),
  new Quad('R3C6', 1, 2, 4, 6),
  new Quad('R1C7', 2, 3, 4, 9),
];
