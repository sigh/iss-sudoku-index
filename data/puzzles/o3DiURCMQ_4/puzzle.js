// Title: Tic Tac Toe, Three In A Row
// Author: Tingo
// Video: https://www.youtube.com/watch?v=o3DiURCMQ_4
// Source: https://app.crackingthecryptic.com/sudoku/GhF7nmRB8J

// Normal sudoku rules apply (default 9x9, standard boxes). Thermometers
// increase from the bulb. Green lines: adjacent cells differ by >= 5
// (Whisper). Purple lines: the whole line is a consecutive run in any order
// (Renban). X marks: the pair sums to 10. White dots: the pair is
// consecutive. The marked diagonal has no repeated digit. The between line's
// middle cells lie strictly between the two circled cells.
//
// Each drawn line is encoded as its own constraint, matching the payload's
// separate line entries -- none are merged across boxes.

return [
  new Shape('9x9'),

  // Marked diagonal (R1C1..R9C9): no repeats. Diagonal(-1) is the '\'
  // (top-left to bottom-right) diagonal, matching this line's cells.
  new Diagonal(-1),

  // Thermometer, box R7-9/C1-3: bulb at R9C1 (underlay circle), increasing
  // around the box's 8 border cells (centre R8C2 is not on the thermometer).
  new Thermo('R9C1', 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R7C2', 'R7C1', 'R8C1'),

  // Green (Whisper, difference >= 5) lines: one anti-diagonal per box for
  // R1-3/C1-3, R4-6/C4-6, R7-9/C7-9; two diagonals crossing at the centre
  // cell for box R4-6/C1-3; and one open ring (8 border cells, centre R2C8
  // excluded) for box R1-3/C7-9. The ring's drawn stroke stops at R3C8 and is
  // not joined back to R3C7, so no wrap-around edge is added.
  new Whisper(5, 'R1C3', 'R2C2', 'R3C1'),
  new Whisper(5, 'R4C6', 'R5C5', 'R6C4'),
  new Whisper(5, 'R7C9', 'R8C8', 'R9C7'),
  new Whisper(5, 'R4C3', 'R5C2', 'R6C1'),
  new Whisper(5, 'R6C3', 'R5C2', 'R4C1'),
  new Whisper(5, 'R3C7', 'R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8'),

  // Purple (Renban, consecutive set in any order) rings: 8 border cells of
  // box R1-3/C4-6 (centre R2C5 excluded) and box R4-6/C7-9 (centre R5C8
  // excluded). Renban is set-based, so ring order/closure doesn't matter.
  new Renban('R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6', 'R3C5', 'R3C4', 'R2C4'),
  new Renban('R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R6C8', 'R6C7', 'R5C7'),

  // Between line, box R7-9/C4-6: circles at R8C6 and R9C6 (first/last
  // argument), the 6 connecting cells (centre R8C5 excluded) must lie
  // strictly between them.
  new Between('R8C6', 'R7C6', 'R7C5', 'R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C6'),

  // X marks (sum to 10), each its own drawn pair.
  new X('R8C6', 'R9C6'),
  new X('R5C3', 'R6C3'),
  new X('R6C5', 'R6C6'),
  new X('R7C5', 'R7C6'),
  new X('R1C8', 'R1C9'),

  // White dots (consecutive), each its own drawn pair.
  new WhiteDot('R6C2', 'R7C2'),
  new WhiteDot('R3C5', 'R4C5'),
  new WhiteDot('R8C7', 'R9C7'),
  new WhiteDot('R3C7', 'R4C7'),
];
