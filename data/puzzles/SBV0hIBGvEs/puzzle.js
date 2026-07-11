// Title: Tangled Vines
// Author: Eric Bader
// Video: https://www.youtube.com/watch?v=SBV0hIBGvEs
// Source: https://sudokupad.app/fgjbhx3iyr

// Normal sudoku rules apply. Marked diagonals: no repeats. Green lines
// (German Whisper): adjacent digits differ by at least 5 - some lines loop
// back through a shared cell, so the looping edge is added as a separate
// two-cell Whisper alongside the main run. Pink lines (Renban): each closed
// 2x2 loop holds a non-repeating consecutive run. White dots: the two
// digits are consecutive (not all valid dot pairs are marked, so absence of
// a dot implies nothing). Dynamic fog is a solving aid, not a rule, and is
// not encoded.

return [
  new Shape('9x9'),

  new Given('R3C7', 5),
  new Given('R5C5', 9),

  new Diagonal(1),
  new Diagonal(-1),

  // Green whisper lines (difference >= 5)
  new Whisper('R3C4', 'R3C3', 'R4C3', 'R4C2'),
  new Whisper('R3C3', 'R2C2', 'R1C1', 'R1C2'),
  new Whisper('R1C1', 'R2C1'),
  new Whisper('R7C6', 'R7C7', 'R8C8'),
  new Whisper('R5C6', 'R5C5', 'R6C5', 'R6C4', 'R7C4', 'R7C3', 'R6C3'),
  new Whisper('R6C3', 'R6C4'),
  new Whisper('R5C4', 'R5C5', 'R4C5'),
  new Whisper('R3C6', 'R4C6', 'R4C7'),
  new Whisper('R9C3', 'R8C2', 'R9C2', 'R9C1', 'R8C1'),
  new Whisper('R8C1', 'R8C2'),
  new Whisper('R6C9', 'R5C8', 'R5C9'),

  // Pink renban lines (closed 2x2 loops)
  new Renban('R8C8', 'R9C8', 'R9C9', 'R8C9'),
  new Renban('R1C8', 'R2C8', 'R2C9', 'R1C9'),

  // White dots (consecutive pairs)
  new WhiteDot('R8C8', 'R8C9'),
  new WhiteDot('R2C2', 'R3C2'),
  new WhiteDot('R7C8', 'R8C8'),
  new WhiteDot('R8C2', 'R8C3'),
];
