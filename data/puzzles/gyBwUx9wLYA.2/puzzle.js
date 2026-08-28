// Title: Slow Thermo Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=gyBwUx9wLYA
// Source: https://cracking-the-cryptic.web.app/sudoku/9Pfpt4273n
//
// Standard sudoku (rows, columns, boxes all-different) plus one given and
// thirteen grey lines with round bulb markers, the standard thermometer
// bulb+line convention. The source carries no rules text at all, so the
// only ground for how a bulb+line reads is the drawn shapes themselves.
// The longest line has 10 cells (R4C2..R9C1 below): a strictly-increasing
// reading is unsatisfiable on a 1-9 grid (10 cells cannot hold 10 distinct
// strictly-ordered digits from a 9-digit range), which is decisive by
// itself, independent of any title text. Every line is drawn in the same
// style, so all thirteen are read the same way: non-decreasing from the
// bulb (`a <= b` along consecutive cells), the standard "Slow Thermometer"
// pairwise reading.
const slowThermoKey = Pair.fnToKey((a, b) => a <= b, 9);
function SlowThermo(...cells) {
  return new Pair(slowThermoKey, 'Slow Thermo', ...cells);
}

// Several payload line entries share an endpoint cell at an exact grid-cell
// centre with another entry -- that is how this source draws a bulb
// feeding two arms, since one polyline cannot fork. Each such pair is
// encoded as two SlowThermo constraints from the shared bulb, or into the
// shared tip.
//
// One payload entry (R6C8-R7C7-R7C6-R7C5-R7C4-R6C3) touches the R6C7/R6C9
// arms' shared tip R6C8 at one end, but carries no bulb marker of its own
// at either end -- which end is the low end is not settled by the art or
// any rules text. Per the "which end of a line is which" convergence rule,
// this is encoded as a disjunction over both directions rather than
// guessed or omitted.

return [
  new Shape('9x9'),
  new Given('R9C6', 1),

  // R4C2(bulb)-R5C1-R5C2-R6C1-R6C2-R7C1-R7C2-R8C1-R8C2-R9C1
  SlowThermo('R4C2', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R7C1', 'R7C2', 'R8C1', 'R8C2', 'R9C1'),

  // R7C3(bulb)-R8C3-R9C3
  SlowThermo('R7C3', 'R8C3', 'R9C3'),

  // Two arms sharing tip R6C8.
  SlowThermo('R6C7', 'R6C8'),
  SlowThermo('R6C9', 'R6C8'),

  // Undetermined direction -- see header comment.
  new Or([
    SlowThermo('R6C8', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R6C3'),
    SlowThermo('R6C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C8'),
  ]),

  // Two arms sharing bulb R8C8.
  SlowThermo('R8C8', 'R7C7'),
  SlowThermo('R8C8', 'R8C7', 'R9C8', 'R9C7'),

  // Two arms sharing bulb R9C6 (also the given cell).
  SlowThermo('R9C6', 'R8C5'),
  SlowThermo('R9C6', 'R8C6'),

  // R9C5(bulb)-R8C4-R9C4
  SlowThermo('R9C5', 'R8C4', 'R9C4'),

  // Two arms sharing tip R6C5.
  SlowThermo('R5C4', 'R6C5'),
  SlowThermo('R6C4', 'R6C5', 'R6C6'),

  // R4C7(bulb)-R3C7-R4C8-R5C9 (drawn tip-first; bulb is the last drawn cell)
  SlowThermo('R4C7', 'R3C7', 'R4C8', 'R5C9'),

  // R4C6(bulb)-R3C6-R2C5
  SlowThermo('R4C6', 'R3C6', 'R2C5'),

  // R2C4(bulb)-R1C4-R1C3-R2C3-R3C3-R3C4-R4C5 (drawn tip-first)
  SlowThermo('R2C4', 'R1C4', 'R1C3', 'R2C3', 'R3C3', 'R3C4', 'R4C5'),

  // R2C7(bulb)-R1C7-R1C6-R2C6 (drawn tip-first)
  SlowThermo('R2C7', 'R1C7', 'R1C6', 'R2C6'),
];
