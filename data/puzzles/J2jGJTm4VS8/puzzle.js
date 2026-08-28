// Title: Knight Sudoku
// Author: Ben Normoyle
// Video: https://www.youtube.com/watch?v=J2jGJTm4VS8
// Source: https://cracking-the-cryptic.web.app/sudoku/J6Ln72n7JP

// The source payload carries no rules text at all -- only givens and the
// default box regions. The ruleset is taken from the video title
// ("Techniques for Knight Sudoku") and description ("This puzzle by Ben
// Normoyle is good for practising Knight Sudoku techniques for our Chess
// Sudoku app"), naming the one puzzle at this video's link: normal sudoku
// rules, plus cells a chess knight's move apart cannot share a digit.

const givens = [
  new Given('R2C7', 7),
  new Given('R2C9', 2),
  new Given('R3C3', 3),
  new Given('R3C7', 6),
  new Given('R4C4', 5),
  new Given('R5C3', 1),
  new Given('R5C4', 6),
  new Given('R5C7', 3),
  new Given('R6C2', 5),
  new Given('R6C3', 6),
  new Given('R6C4', 4),
  new Given('R7C5', 1),
  new Given('R7C8', 9),
  new Given('R8C5', 2),
  new Given('R8C8', 7),
  new Given('R9C5', 3),
  new Given('R9C9', 4),
];

return [
  new Shape('9x9'),
  ...givens,
  new AntiKnight(),
];
