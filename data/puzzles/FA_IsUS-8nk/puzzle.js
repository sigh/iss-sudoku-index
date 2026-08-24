// Title: Guess the Age
// Author: Henrik Jacobsen
// Video: https://www.youtube.com/watch?v=FA_IsUS-8nk
// Source: https://app.crackingthecryptic.com/sudoku/LQBjgh6LH4

// Normal sudoku rules (default row/column/box AllDifferent). Identical digits
// cannot be a knight's move apart. Digits increase along each thermometer
// from its bulb. Each cage's digits are distinct and sum to the printed
// total. The digits along the arrow sum to the digit in the circle.
//
// Cage cells: transcribed from the drawn cage outlines (7 real cages; 3
// other payload entries are title/author/rules metadata stubs, omitted).
// Thermo cells: transcribed from the drawn thermometer strokes, interpolated
// along each waypoint segment; bulb-first order matches the drawn circle on
// each line's first cell.
// Arrow cells: transcribed from the drawn arrow stroke, interpolated along
// its waypoint segment; the circle sits on the bulb cell R9C8, so that cell
// is the Arrow's control/sum cell.

return [
  new Shape('9x9'),

  new Given('R3C5', 3),
  new Given('R3C6', 2),

  new AntiKnight(),

  new Cage(32, 'R1C1', 'R2C1', 'R3C1', 'R2C2', 'R1C3', 'R2C3', 'R3C3'),
  new Cage(32, 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R8C2'),
  new Cage(32, 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R6C3', 'R7C3', 'R7C2'),
  new Cage(32, 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R8C5'),
  new Cage(32, 'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R5C5'),
  new Cage(32, 'R1C9', 'R2C9', 'R3C9', 'R3C8', 'R3C7', 'R2C7'),
  new Cage(32, 'R5C8', 'R5C9', 'R6C9', 'R6C8', 'R6C7'),

  new Thermo('R8C7', 'R9C6'),
  new Thermo('R6C6', 'R6C5', 'R5C4', 'R6C3', 'R7C3', 'R8C4', 'R9C5'),
  new Thermo('R5C7', 'R6C8', 'R7C8'),
  new Thermo('R3C3', 'R2C3', 'R1C3', 'R2C2', 'R1C1', 'R2C1', 'R3C1'),
  new Thermo('R1C8', 'R1C9', 'R2C8', 'R3C7', 'R3C8', 'R3C9'),

  new Arrow('R9C8', 'R8C7', 'R7C6'),
];
