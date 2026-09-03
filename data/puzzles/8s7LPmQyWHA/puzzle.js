// Title: Hidden Clone
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=8s7LPmQyWHA
// Source: https://cracking-the-cryptic.web.app/sudoku/3Btgb7QLLp

// Normal sudoku rules apply: each row, column and 3x3 box contains 1-9 once
// each. The nine boxes are the ordinary ones, listed explicitly by the source.
//
// Omitted rule: the source carries no rules text of any kind (no metadata
// object, no rules field), and the only feature besides the givens is eight
// uniform light-grey (#CFCFCF) shaded cells forming two congruent four-cell
// diagonal runs, R3C4/R4C5/R5C6/R6C7 and R4C3/R5C4/R6C5/R7C6. The video
// description names the puzzle "Hidden Clone", which points at a clone
// mechanic, but nothing drawn says whether the two runs clone each other under
// the translation that maps one onto the other, under the 180-degree rotation
// that also maps one onto the other (the two pair the cells up differently), or
// whether the hidden clone is an undrawn copy to be found elsewhere in the
// grid. With no legend, second colour or rules sentence to choose between
// those, the shading is left unencoded.

// Transcribed from the source's filled cells; the 14 givens form two
// staircases, R1C6-R4C9 and R6C1-R9C4.
const givens = [
  new Given('R1C6', 1),
  new Given('R1C7', 2),
  new Given('R2C7', 3),
  new Given('R2C8', 4),
  new Given('R3C8', 5),
  new Given('R3C9', 6),
  new Given('R4C9', 7),
  new Given('R6C1', 1),
  new Given('R7C1', 7),
  new Given('R7C2', 2),
  new Given('R8C2', 4),
  new Given('R8C3', 8),
  new Given('R9C3', 6),
  new Given('R9C4', 3),
];

return [
  new Shape('9x9'),
  ...givens,
];
