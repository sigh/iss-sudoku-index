// Title: A Little Off the Top
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=aIx7OlfnoYY
// Source: https://app.crackingthecryptic.com/sudoku/QBq6nnqHr6

// Normal sudoku rules apply (standard row/column/box all-different, provided
// by default). Purple lines are Renban (consecutive non-repeating digits, any
// order). Green lines are Whisper lines with the default difference of 5
// ("neighbouring digits on a green line have a difference of at least 5").

// Purple (Renban) lines, transcribed from the drawn purple line geometry.
const renbans = [
  new Renban('R1C4', 'R1C5', 'R1C6'),
  new Renban('R2C4', 'R2C5', 'R2C6'),
  new Renban('R1C7', 'R2C7'),
  new Renban('R4C6', 'R5C6', 'R6C6', 'R7C6'),
  new Renban('R8C5', 'R8C6'),
  new Renban('R9C5', 'R9C6'),
  new Renban('R5C1', 'R6C1'),
  new Renban('R2C1', 'R3C1', 'R4C1'),
];

// Green (Whisper) lines, transcribed from the drawn green line geometry.
// The R8C1/R8C2/R9C1/R9C2 group is drawn as a closed loop covering all four
// edges of that 2x2 block; the first cell is repeated at the end so the
// wrap-around edge is enforced too.
const whispers = [
  new Whisper('R6C6', 'R6C7'),
  new Whisper('R6C8', 'R6C9', 'R5C9'),
  new Whisper('R3C4', 'R3C5', 'R3C6'),
  new Whisper('R9C7', 'R9C8'),
  new Whisper('R8C1', 'R8C2', 'R9C2', 'R9C1', 'R8C1'),
  new Whisper('R8C4', 'R9C4'),
];

return [
  new Shape('9x9'),
  new Given('R1C9', 9),
  new Given('R2C8', 2),
  new Given('R4C7', 5),
  ...renbans,
  ...whispers,
];
