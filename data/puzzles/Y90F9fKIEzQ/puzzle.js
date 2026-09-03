// Title: A Sudoku For A Beautiful Mind
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Y90F9fKIEzQ
// Source: https://cracking-the-cryptic.web.app/sudoku/PQ7L6gGrP7

// Encoded: normal sudoku (rows, columns and the nine ordinary 3x3 boxes each
// hold 1-9 once, from the default 9x9 Shape), the 19 printed givens, and the
// outside corner clue -- the digits on the main diagonal R1C1..R9C9 sum to 50,
// with repeats allowed on that diagonal.
//
// Omitted: whatever the two light-grey strokes require -- stroke 1 through
// R2C4, R2C3, R2C2, R3C2, R4C2, R4C3, R4C4, R5C4, R6C4, R6C3, R6C2, and
// stroke 2 the closed loop R4C6, R5C6, R6C6, R7C6, R8C6, R8C7, R8C8, R7C8,
// R6C8, R5C8, R4C8, R4C7. No rules text is published with this puzzle, and
// nothing drawn says what the strokes mean. The usual reading for a grey
// stroke, a palindrome, is impossible on both: stroke 1 would need R2C3 to
// equal R6C3, which share a column, and every mirror of the twelve-cell loop
// pairs two cells sharing a row, a column or a box. Thermometer and
// consecutive-set readings are impossible too at eleven and twelve cells.
// Several readings survive that arithmetic and nothing on the board chooses
// among them, so the strokes carry no constraint here.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Given digits, as printed in the grid.
  new Given('R1C6', 2),
  new Given('R1C7', 1),
  new Given('R1C8', 7),
  new Given('R1C9', 5),
  new Given('R2C6', 1),
  new Given('R2C7', 3),
  new Given('R2C8', 2),
  new Given('R2C9', 8),
  new Given('R4C5', 1),
  new Given('R5C5', 2),
  new Given('R6C5', 3),
  new Given('R8C1', 7),
  new Given('R8C2', 9),
  new Given('R8C3', 2),
  new Given('R8C4', 5),
  new Given('R9C1', 6),
  new Given('R9C2', 3),
  new Given('R9C3', 4),
  new Given('R9C4', 1),

  // The arrow is drawn outside the top-left corner and travels down-right, so
  // the clued diagonal is the full main diagonal R1C1..R9C9.
  LittleKiller.fromCells(50, graph.ray('R1C1', 1, 1), geometry),
];
