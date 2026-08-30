// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=DsrTuqlaj7s
// Source: https://cracking-the-cryptic.web.app/sudoku/GDBjhTJ9Tn

// Normal Sudoku rules apply (rows, columns and boxes). The raw payload
// carries no rules text at all (no metadata object). The only other drawn
// feature -- three thick light-grey lines, whose combined shape gives the
// video its title "Can You Spot The Elephant?" -- has no rules sentence or
// colour convention in the payload to say what sudoku rule the lines
// enforce, so they are not encoded here.
const givens = [
  new Given('R1C3', 7),
  new Given('R1C4', 3),
  new Given('R1C5', 9),
  new Given('R2C2', 4),
  new Given('R2C6', 8),
  new Given('R3C1', 8),
  new Given('R3C9', 7),
  new Given('R6C3', 1),
  new Given('R9C1', 4),
  new Given('R9C2', 8),
  new Given('R9C3', 2),
  new Given('R9C4', 6),
  new Given('R9C5', 1),
  new Given('R9C6', 7),
  new Given('R9C7', 9),
  new Given('R9C8', 5),
  new Given('R9C9', 3),
];

return [
  new Shape('9x9'),
  ...givens,
];
