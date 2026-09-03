// Title: Valentine's Day Sudoku
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Lykt7NyMC4c
// Source: https://cracking-the-cryptic.web.app/sudoku/323th6tLDF
//
// Rules encoded: normal sudoku (rows, columns and the nine standard 3x3 boxes
// each hold 1-9 once), the ten printed givens, and the one dashed cage
// (R6C4-R6C6), which carries no printed total and so is read under the usual
// convention as all-different only.
//
// Rule omitted: the board also carries 36 shaded cells in two colours, drawing
// two nested heart-shaped closed rings (20 light grey, 16 purple). The source
// states no rule for them and prints no legend, so no shading rule is encoded.
// Ten givens cannot pin a 9x9 sudoku on their own, so this encoding is
// deliberately incomplete.

return [
  new Shape('9x9'),

  // The ten printed digits, in reading order.
  new Given('R2C1', 1),
  new Given('R5C4', 6),
  new Given('R5C6', 4),
  new Given('R7C2', 9),
  new Given('R8C7', 4),
  new Given('R8C9', 7),
  new Given('R9C3', 3),
  new Given('R9C4', 9),
  new Given('R9C6', 8),
  new Given('R9C7', 6),

  // Sum 0 is Cage's "no total" form: it emits the all-different only. These
  // three cells share row 6, so the group is already implied by the row.
  new Cage(0, 'R6C4', 'R6C5', 'R6C6'),
];
