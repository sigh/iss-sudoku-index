// Title: hi ren
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=SrR2LBDLhJo
// Source: https://app.crackingthecryptic.com/sudoku/MgMbF23hm6

// Normal Sudoku rules apply. Arrows sum their arm digits to their shared circle.
// Green lines are whispers with adjacent digits differing by at least 5. R7C5 is odd.
// Each gold dot is a white Kropki dot, a black Kropki dot, or both.
const arrows = [
  new Arrow('R4C5', 'R5C5', 'R5C4', 'R6C4', 'R7C5'),
  new Arrow('R4C5', 'R5C5', 'R5C6', 'R6C7', 'R5C7'),
];

const whispers = [
  new Whisper(5, 'R7C7', 'R8C7', 'R9C7'),
  new Whisper(5, 'R7C3', 'R8C3', 'R9C3'),
  new Whisper(5, 'R6C6', 'R6C5', 'R7C4', 'R8C4', 'R8C5', 'R7C6'),
  new Whisper(5, 'R4C8', 'R5C7', 'R6C6', 'R7C5'),
  new Whisper(5, 'R7C6', 'R6C6'),
];

// Gold-dot edge pairs transcribed from the drawn dots.
const dots = [
  ['R1C7', 'R2C7'], ['R3C6', 'R4C6'], ['R1C7', 'R1C8'],
  ['R1C2', 'R1C3'], ['R3C8', 'R3C9'], ['R3C4', 'R4C4'],
  ['R3C1', 'R3C2'], ['R1C3', 'R2C3'], ['R2C5', 'R3C5'],
  ['R8C1', 'R8C2'], ['R8C2', 'R9C2'], ['R8C8', 'R8C9'],
  ['R7C9', 'R8C9'],
].map(([a, b]) => new Or([new WhiteDot(a, b), new BlackDot(a, b)]));

return [
  new Shape('9x9'),
  new Given('R7C5', 1, 3, 5, 7, 9),
  ...arrows,
  ...whispers,
  ...dots,
];
