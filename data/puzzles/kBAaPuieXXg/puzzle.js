// Title: Whispers in the Night
// Author: G
// Video: https://www.youtube.com/watch?v=kBAaPuieXXg
// Source: https://app.crackingthecryptic.com/sudoku/3rndTLBfqr

// Normal sudoku rules (default row/column/box all-different). Identical
// digits cannot be a knight's move apart, globally. Digits cannot repeat
// within a cage, whose printed sum they must total. Any two cells joined
// by a line must differ by at least 5 (a single rule applying to all six
// drawn lines, which share one colour/style).

// Cages: cells and sums transcribed from the source's drawn cage geometry.
const cages = [
  ['R1C9', 'R2C9'],
  ['R2C7', 'R3C7', 'R3C8'],
  ['R5C8', 'R5C9', 'R6C9'],
  ['R6C7', 'R7C7', 'R7C6'],
];
const cageSums = [8, 14, 14, 24];

// Whisper lines: waypoints transcribed from the source's drawn line geometry.
const whisperLines = [
  ['R1C8', 'R2C8', 'R3C9', 'R4C9'],
  ['R1C7', 'R2C6', 'R3C6', 'R4C5'],
  ['R2C5', 'R3C5', 'R4C4', 'R5C4'],
  ['R5C2', 'R5C3', 'R6C4', 'R6C5'],
  ['R5C7', 'R6C8', 'R7C8', 'R8C9'],
  ['R5C5', 'R5C6', 'R4C7', 'R4C8'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages.map((cells, i) => new Cage(cageSums[i], ...cells)),
  ...whisperLines.map((cells) => new Whisper(5, ...cells)),
];
