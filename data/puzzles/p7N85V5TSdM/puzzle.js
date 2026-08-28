// Title: E is for Entropy
// Author: Alaric Taqi A. / Crusader175
// Video: https://www.youtube.com/watch?v=p7N85V5TSdM
// Source: https://tinyurl.com/yc3fd7vx

// Normal sudoku rules apply.
// Additional rule: every 2x2 box of four orthogonally-adjacent cells (not
// just the nine 3x3 boxes) must contain at least one low digit (1-3), one
// middle digit (4-6), and one high digit (7-9). This is exactly ISS's
// built-in GlobalEntropy constraint.

// Givens transcribed from the payload's grid array (value/given:true cells).
const givens = [
  new Given('R2C4', 4), new Given('R2C9', 3),
  new Given('R3C4', 2),
  new Given('R4C2', 6), new Given('R4C3', 3), new Given('R4C6', 4),
  new Given('R6C4', 6), new Given('R6C7', 7), new Given('R6C8', 4),
  new Given('R7C6', 8),
  new Given('R8C1', 7), new Given('R8C6', 6),
];

return [
  new Shape('9x9'),
  ...givens,
  new GlobalEntropy(),
];
