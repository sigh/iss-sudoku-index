// Title: DSM Qualitraining 2021: German Whispers
// Author: Philipp Blume
// Video: https://www.youtube.com/watch?v=nH3vat8z9uM
// Source: https://app.crackingthecryptic.com/sudoku/QM8RdBLBb9

// Standard sudoku (3x3 boxes) plus four German Whisper lines: any two cells
// directly connected by a line must differ by at least 5. Two overlay entries
// sit outside the 9x9 grid with empty text and are decorative, not encoded.
const whispers = [
  new Whisper(5, 'R4C5', 'R4C6', 'R3C7'),
  new Whisper(5, 'R5C8', 'R6C9', 'R7C8', 'R7C7', 'R8C7', 'R9C6'),
  new Whisper(5, 'R8C1', 'R7C1', 'R7C2', 'R8C3', 'R9C3', 'R9C2'),
  new Whisper(5, 'R7C4', 'R8C5', 'R7C6', 'R6C6', 'R5C6', 'R4C7', 'R3C8',
    'R2C8', 'R1C7', 'R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C3'),
];

return [
  new Shape('9x9'),
  new Given('R1C5', 1),
  new Given('R2C2', 5),
  new Given('R5C1', 6),
  new Given('R5C9', 9),
  new Given('R7C3', 3),
  new Given('R8C8', 3),
  new Given('R9C5', 3),
  ...whispers,
];
