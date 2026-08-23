// Title: A Walk in the Black Forest
// Author: BremSter
// Video: https://www.youtube.com/watch?v=scRHbCs0daQ
// Source: https://app.crackingthecryptic.com/sudoku/NBM4qTT4bB

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes). Digits do not repeat along either main diagonal. Digits next to
// each other along a green line must differ by at least 5 -- a German
// whisper line, `Whisper` defaults to difference 5.
//
// Six green lines are drawn (source: geometry lines #2-#7, colour #A3E048).
// Two of them are partly drawn on top of a grey diagonal; that overlap is
// preserved below as two separate constraints per the payload's own line
// entries, not merged into the diagonal.

return [
  new Shape('9x9'),

  new Given('R1C2', 4),
  new Given('R2C9', 3),
  new Given('R8C1', 7),
  new Given('R9C8', 7),

  new Diagonal(-1), // R1C1-R9C9
  new Diagonal(1),  // R1C9-R9C1

  new Whisper('R1C9', 'R2C8', 'R3C7', 'R3C8'),
  new Whisper('R1C1', 'R2C2', 'R3C3', 'R4C4', 'R3C4', 'R3C5'),
  new Whisper('R9C9', 'R8C8', 'R7C7', 'R6C6', 'R7C6', 'R7C5'),
  new Whisper('R9C1', 'R8C2', 'R7C3', 'R7C2'),
  new Whisper('R5C2', 'R6C3', 'R6C4', 'R7C4', 'R8C5'),
  new Whisper('R5C8', 'R4C7', 'R4C6', 'R3C6', 'R2C5'),
];
