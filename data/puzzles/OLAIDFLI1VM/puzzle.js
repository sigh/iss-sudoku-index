// Title: Four Corners 3
// Author: tallcat
// Video: https://www.youtube.com/watch?v=OLAIDFLI1VM
// Source: https://app.crackingthecryptic.com/sudoku/qjQqPpPPQ7

// Normal sudoku rules apply. Each of the two main diagonals has no repeated
// digit (Diagonal). Digits along each arrow sum to the digit in that arrow's
// circle (Arrow, bulb cell first). Adjacent digits on each green line differ
// by at least 5 (Whisper, default difference 5).
//
// The white circle underlays drawn at the four corner cells (R1C1, R1C9,
// R9C9, R9C1) coincide with the four arrow bulbs and are decorative framing
// for the "Four Corners" title, not a separate clue -- they add no
// constraint beyond the arrows already encoded there.

const diagonals = [
  new Diagonal(-1), // R1C1-R9C9
  new Diagonal(1),  // R1C9-R9C1
];

const arrows = [
  new Arrow('R1C1', 'R1C2', 'R1C3', 'R2C3'),
  new Arrow('R1C9', 'R2C9', 'R3C9', 'R3C8'),
  new Arrow('R9C9', 'R9C8', 'R9C7', 'R8C7'),
  new Arrow('R9C1', 'R8C1', 'R7C1', 'R7C2'),
];

const whispers = [
  new Whisper('R4C5', 'R5C5', 'R6C5'),
  new Whisper('R5C4', 'R5C5', 'R5C6'),
  new Whisper('R2C2', 'R3C3', 'R4C4'),
  new Whisper('R4C6', 'R3C7', 'R2C6'),
  new Whisper('R6C6', 'R7C7', 'R6C8'),
  new Whisper('R8C6', 'R9C6'),
  new Whisper('R5C1', 'R6C2'),
];

return [
  new Shape('9x9'),
  ...diagonals,
  ...arrows,
  ...whispers,
];
