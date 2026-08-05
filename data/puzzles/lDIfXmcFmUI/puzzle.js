// Title: FIFA World Cup 2022
// Author: Arlo Lipof
// Video: https://www.youtube.com/watch?v=lDIfXmcFmUI
// Source: https://app.crackingthecryptic.com/sudoku/BPb9d9bbG7

// Normal Sudoku applies. Cage digits are distinct; only the 14 cage has a sum.
// The small cage-total-dot rule is omitted: its simultaneous local mapping has
// no completion in the fixed probe. Large white/black dots, purple renbans,
// green whispers, and the arrow are encoded from their drawn paths. Not all
// dots are given.
const cages = [
  ['R3C1', 'R2C1'],
  ['R1C1', 'R1C2'],
  ['R2C2', 'R3C2', 'R3C3', 'R3C4'],
  ['R2C3', 'R1C3', 'R1C4'],
  ['R2C4', 'R1C5', 'R2C5', 'R3C5'],
  ['R2C6', 'R3C6', 'R3C7'],
  ['R1C6', 'R1C7', 'R2C7'],
  ['R2C8', 'R1C8', 'R1C9'],
  ['R2C9', 'R3C9', 'R3C8'],
];

// Cage cells and the displayed 14 total are transcribed from the dashed cages.
const cageConstraints = cages.map((cells, index) =>
  index === 8 ? new Cage(14, ...cells) : new AllDifferent(...cells));

return [
  new Shape('9x9'),
  ...cageConstraints,
  new BlackDot('R3C6', 'R3C7'),
  new BlackDot('R3C1', 'R4C1'),
  new BlackDot('R8C8', 'R9C8'),
  new WhiteDot('R6C4', 'R7C4'),
  new WhiteDot('R2C9', 'R3C9'),
  new Renban('R8C3', 'R7C4', 'R7C5'),
  new Renban('R7C4', 'R8C4', 'R9C4'),
  new Renban('R8C4', 'R9C5'),
  new Renban('R8C7', 'R9C8', 'R8C9'),
  new Whisper(5, 'R2C7', 'R3C6', 'R3C5', 'R3C4'),
  new Whisper(5, 'R4C7', 'R3C6', 'R3C5', 'R4C4'),
  new Whisper(5, 'R5C1', 'R4C1', 'R4C2'),
  new Whisper(5, 'R4C1', 'R5C2', 'R6C3'),
  new Whisper(5, 'R5C2', 'R5C3', 'R6C4'),
  new Arrow('R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9', 'R3C9'),
];
