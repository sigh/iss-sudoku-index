// Title: Half and Half
// Author: Joren
// Video: https://www.youtube.com/watch?v=gdEp4SYcfTI
// Source: https://sudokupad.app/refep5bgom

// Standard 9x9 sudoku (row/column/box), no given digits.
// Global negative: orthogonally adjacent cells cannot be consecutive.
// Two "between" grey lines: interior digits must be strictly between the
// two circled end-cell digits.
// Three 9-cell cages that only forbid repeats (no sum clue) -> AllDifferent.
// Eleven black dots: 1:2 ratio between the two dotted cells (positive-only,
// not all possible dots are given, so no negative/exhaustive Kropki rule).

return [
  new Shape('9x9'),

  new AntiConsecutive(),

  // Cage A: plus/cross shape, no-repeat only.
  new AllDifferent(
    'R3C5', 'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5'),

  // Cage B: top half-frame, no-repeat only.
  new AllDifferent(
    'R1C4', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C6', 'R4C4', 'R4C6'),

  // Cage C: bottom half-frame (mirror of B), no-repeat only.
  new AllDifferent(
    'R6C4', 'R6C6', 'R7C4', 'R7C6', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C6'),

  // Grey between-lines.
  new Between('R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3'),
  new Between('R5C7', 'R6C7', 'R7C7', 'R7C6', 'R7C5'),

  // Black ratio dots.
  new BlackDot('R9C1', 'R9C2'),
  new BlackDot('R6C7', 'R7C7'),
  new BlackDot('R3C3', 'R4C3'),
  new BlackDot('R1C8', 'R1C9'),
  new BlackDot('R6C5', 'R7C5'),
  new BlackDot('R6C5', 'R6C6'),
  new BlackDot('R6C6', 'R7C6'),
  new BlackDot('R7C5', 'R7C6'),
  new BlackDot('R3C4', 'R3C5'),
  new BlackDot('R4C1', 'R4C2'),
  new BlackDot('R5C8', 'R5C9'),
];
