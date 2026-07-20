// Title: Golden Arrow
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=Y23x1sGzWJo
// Source: https://sudokupad.app/sjk13nc1vf

// The first two cells are the left-to-right two-digit oval; the remaining
// cells are the arrow arm. The same full sequence is a difference-4 line.
const arrow = [
  'R4C4', 'R4C5', 'R4C6', 'R5C6',
  'R6C6', 'R6C5', 'R6C4', 'R5C4',
];

return [
  new Shape('9x9'),
  new Given('R1C6', 1),
  new AntiKnight(),
  new AntiKing(),
  new PillArrow(2, ...arrow),
  new Whisper(4, ...arrow),
];
