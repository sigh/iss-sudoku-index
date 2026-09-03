// Title: Diamond Sudoku
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=wJuThQw-3R0
// Source: https://cracking-the-cryptic.web.app/sudoku/rm6btddMTD

// Encoded: normal sudoku -- rows, columns and the nine ordinary 3x3 boxes each
// hold 1-9 once, from the default 9x9 Shape -- and the 20 printed givens.
//
// Omitted: whatever the drawn light-grey diamond requires. It is a closed path
// through R2C5, R3C4, R4C3, R5C2, R6C3, R7C4, R8C5, R7C6, R6C7, R5C8, R4C7,
// R3C6 and back to R2C5. No rules text is published with this puzzle, and
// nothing drawn says what the path means: it carries no bulb, circle,
// arrowhead, dot or label, and no given lies on it. Readings that need a
// marked end (thermometer, between line, arrow) are ruled out because the path
// is closed and unmarked; readings that need twelve distinct digits (renban,
// no repeats along the line) are ruled out by the cell count. A palindrome
// needs a mirror axis, and both axes of the diamond's own symmetry pair cells
// sharing a row or a column -- R3C4 with R3C6, R4C3 with R4C7 and R5C2 with
// R5C8 about one, R2C5 with R8C5, R3C4 with R7C4 and R4C3 with R6C3 about the
// other -- so equal digits are impossible there. Several further readings
// survive that arithmetic (whisper, parity/modular/entropic, equal box-segment
// sums, a solver-found line total, consecutive neighbours) and nothing on the
// board chooses among them, so the diamond carries no constraint here.

return [
  new Shape('9x9'),

  // Given digits, as printed in the grid.
  new Given('R1C2', 9),
  new Given('R1C5', 6),
  new Given('R1C7', 7),
  new Given('R2C2', 7),
  new Given('R2C8', 3),
  new Given('R2C9', 4),
  new Given('R3C1', 1),
  new Given('R4C5', 4),
  new Given('R5C1', 4),
  new Given('R5C3', 6),
  new Given('R5C7', 8),
  new Given('R5C9', 2),
  new Given('R6C5', 8),
  new Given('R7C9', 3),
  new Given('R8C1', 2),
  new Given('R8C2', 1),
  new Given('R8C8', 5),
  new Given('R9C3', 5),
  new Given('R9C5', 2),
  new Given('R9C8', 9),
];
