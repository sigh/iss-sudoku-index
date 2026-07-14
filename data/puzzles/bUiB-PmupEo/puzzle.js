// Title: Shh-nooker (K)Nights
// Author: olima
// Video: https://www.youtube.com/watch?v=bUiB-PmupEo
// Source: https://sudokupad.app/wr8s0idhmw

// Normal Sudoku, anti-knight, green whispers, two positive Kropki dots, and
// four 1/4/7 quads. Unmarked dots are explicitly allowed by the rules.
const greenWhispers = [
  new Whisper(5, 'R9C2', 'R8C3', 'R7C4', 'R6C5'),
  new Whisper(5, 'R3C7', 'R2C7', 'R2C6', 'R2C5'),
  new Whisper(5, 'R4C2', 'R3C2', 'R2C2'),
  new Whisper(5, 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3'),
  new Whisper(5, 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9'),
  new Whisper(5, 'R2C1', 'R3C1', 'R4C1', 'R5C1'),
];

const dots = [
  new BlackDot('R3C5', 'R4C5'),
  new WhiteDot('R5C5', 'R6C5'),
];

const quads = [
  new Quad('R2C2', 1, 4, 7),
  new Quad('R2C6', 1, 4, 7),
  new Quad('R7C2', 1, 4, 7),
  new Quad('R7C6', 1, 4, 7),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...greenWhispers,
  ...dots,
  ...quads,
];
