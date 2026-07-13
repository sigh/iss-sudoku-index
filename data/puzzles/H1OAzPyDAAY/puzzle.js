// Title: Make No Mistakes
// Author: TY
// Video: https://www.youtube.com/watch?v=H1OAzPyDAAY
// Source: https://sudokupad.app/b5awriwt7k

// Normal sudoku rules apply. No given digits.
//
// Kropki dots: digits joined by a black dot are in a 1:2 ratio.
// Dutch Whispers: adjacent digits along a line differ by at least four. Each
//   line is drawn twice, in orange and in brown, tracing the identical cells;
//   the rules text names only the brown line, so this is one whisper rule per
//   path, not two.
// Inequality: the '>' sign points towards the smaller digit.
// Letters: each letter stands for a digit; the same letter is always the
//   same digit, different letters are always different digits.

const blackDots = [
  // Kropki dots (1:2 ratio).
  new BlackDot('R4C4', 'R5C4'),
  new BlackDot('R4C6', 'R5C6'),
  new BlackDot('R5C5', 'R6C5'),
];

const whispers = [
  // Dutch Whisper lines (adjacent cells differ by >= 4).
  new Whisper(4, 'R4C4', 'R4C3', 'R3C3', 'R3C2', 'R2C1'),
  new Whisper(4, 'R4C5', 'R3C6', 'R2C6', 'R1C7'),
  new Whisper(4, 'R4C6', 'R3C7', 'R2C8'),
  new Whisper(4, 'R5C9', 'R5C8', 'R5C7', 'R5C6', 'R4C7', 'R4C8', 'R4C9'),
  new Whisper(4, 'R4C8', 'R3C9'),
  new Whisper(4, 'R6C2', 'R5C3', 'R5C4', 'R6C3', 'R7C2'),
  new Whisper(4, 'R5C3', 'R5C2', 'R4C1'),
  new Whisper(4, 'R6C4', 'R7C3', 'R8C3', 'R9C2'),
  new Whisper(4, 'R7C6', 'R6C5', 'R7C4', 'R8C4', 'R9C4'),
  new Whisper(4, 'R6C6', 'R7C7', 'R8C8', 'R9C9'),
  new Whisper(4, 'R6C7', 'R7C8', 'R8C9'),
];

const letters = [
  // Letters: same letter -> same digit (one set per cell forces equality).
  new SameValues(2, 'R1C5', 'R5C2'), // C
  new SameValues(4, 'R3C7', 'R4C8', 'R6C3', 'R7C4'), // O
  new SameValues(2, 'R5C9', 'R8C5'), // D
  // Different letters -> different digits: one representative cell per
  // letter (L appears only once, so its own cell already represents it).
  new AllDifferent('R1C5', 'R2C6', 'R3C7', 'R5C9'), // C, L, O, D
];

return [
  new Shape('9x9'),
  ...blackDots,
  ...whispers,
  // Inequality: R1C1 > R1C2, sign points towards the smaller digit.
  new GreaterThan('R1C1', 'R1C2'),
  ...letters,
];
