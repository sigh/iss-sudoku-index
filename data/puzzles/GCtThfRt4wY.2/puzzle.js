// Title: 4 4s
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=GCtThfRt4wY
// Source: https://tinyurl.com/2p922x9w

// Standard sudoku rules apply: default 9x9 grid with row, column, and 3x3 box
// all-different (no jigsaw regions in the payload).
// German whispers: adjacent digits along each green line differ by at least 5
// (Whisper, default difference 5).
// Renban: digits on each purple line form a non-repeating consecutive set, in
// any order (Renban).
// Several lines below share an endpoint cell with another line (e.g. R6C6 is
// an endpoint of three separate whisper lines); each is a distinct drawn line
// in the payload, so the shared cell is independently subject to each line's
// own adjacent-pair rule.

return [
  new Shape('9x9'),

  // Givens -- four given 4s (title "4 4s").
  new Given('R1C8', 4),
  new Given('R3C4', 4),
  new Given('R7C6', 4),
  new Given('R9C2', 4),

  // Renban (purple) lines.
  new Renban('R4C4', 'R5C3', 'R6C2', 'R5C2', 'R4C3', 'R3C3'),
  new Renban('R1C7', 'R1C8', 'R2C9', 'R3C9'),
  new Renban('R9C3', 'R9C2', 'R8C1', 'R7C1'),

  // German whisper (green) lines.
  new Whisper('R6C6', 'R7C5', 'R8C4', 'R7C3', 'R6C4', 'R5C5'),
  new Whisper('R6C4', 'R7C5'),
  new Whisper('R6C6', 'R5C6', 'R4C7', 'R4C8', 'R5C8', 'R6C7'),
  new Whisper('R5C5', 'R4C6', 'R3C7', 'R3C6', 'R2C6', 'R3C5', 'R4C4'),
  new Whisper('R3C3', 'R2C4', 'R1C5'),
  new Whisper('R1C2', 'R2C2', 'R2C3', 'R1C3'),
  new Whisper('R2C2', 'R3C2', 'R4C2', 'R5C1'),
  new Whisper('R4C1', 'R4C2', 'R3C3'),
  new Whisper('R7C7', 'R8C6', 'R9C5', 'R9C6'),
  new Whisper('R8C8', 'R9C7'),
  new Whisper('R7C7', 'R6C8', 'R5C9', 'R6C9', 'R7C9', 'R8C8'),
  new Whisper('R6C7', 'R6C6'),
];
