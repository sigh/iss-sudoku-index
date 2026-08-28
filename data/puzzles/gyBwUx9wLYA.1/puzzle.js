// Title: Slow Thermo Sudoku
// Author: Tom Fry
// Video: https://www.youtube.com/watch?v=gyBwUx9wLYA
// Source: https://cracking-the-cryptic.web.app/sudoku/JT7h7pJ4bh

// Standard 9x9 sudoku (rows, columns, boxes all-different -- default grid).
//
// No rules text is present in the payload; the puzzle is identified as a
// "Slow Thermo Sudoku" by the video title/description.
// A slow thermometer's digits are non-decreasing from the bulb outward
// (equal neighbours allowed), unlike a standard Thermo's strict increase --
// this is also the only satisfiable reading, since thermometer #1 below
// spans 13 cells and strict increase over 13 cells is impossible with 9
// distinct digits.
//
// Nine drawn lines. Eight are ordinary bulb-to-tip slow thermometers. The
// ninth (payload line index 6) has no bulb of its own and shares its final
// cell (R6C6) with the bulbed line (payload index 0); the geometry helper
// flags this as a branch. Read as one branching thermometer: a single bulb
// at R4C5 running to the shared cell R6C6, then splitting into two arms
// that each continue non-decreasing independently away from R6C6.
//
// A small decorative dot on the R6C4 thermometer (at R5C4, its second cell)
// is a bend-smoothing render mark, not a second clue type.

const slowLe = Pair.fnToKey((a, b) => a <= b, 9);

const slowThermo = (name, ...cells) => new Pair(slowLe, name, ...cells);

return [
  new Shape('9x9'),

  // Branching thermometer: stem R4C5-R5C5-R6C6, then two independent arms
  // from the shared cell R6C6.
  slowThermo('Slow Thermo 1 stem', 'R4C5', 'R5C5', 'R6C6'),
  slowThermo(
    'Slow Thermo 1 arm A',
    'R6C6', 'R5C6', 'R4C6', 'R3C7', 'R2C7', 'R1C6', 'R1C5', 'R1C4', 'R2C3',
    'R3C3', 'R4C4'),
  slowThermo(
    'Slow Thermo 1 arm B', 'R6C6', 'R5C7', 'R4C7', 'R3C8', 'R2C8'),

  slowThermo('Slow Thermo 2', 'R6C4', 'R5C4', 'R4C3', 'R3C2'),
  slowThermo('Slow Thermo 3', 'R2C2', 'R2C1', 'R1C1', 'R1C2'),
  slowThermo('Slow Thermo 4', 'R5C3', 'R4C2', 'R4C1', 'R5C2', 'R5C1', 'R6C1'),
  slowThermo(
    'Slow Thermo 5',
    'R8C4', 'R9C3', 'R8C2', 'R8C3', 'R7C4', 'R6C3', 'R7C3', 'R7C2'),
  slowThermo(
    'Slow Thermo 6',
    'R7C6', 'R7C7', 'R7C8', 'R7C9', 'R8C8', 'R9C8', 'R9C7', 'R8C6', 'R7C5'),
  slowThermo('Slow Thermo 7', 'R6C8', 'R6C9', 'R5C9', 'R4C9'),
  // Drawn tip-first in the payload (bulb is the last drawn cell, R1C7).
  slowThermo(
    'Slow Thermo 8', 'R1C7', 'R1C8', 'R2C9', 'R3C9', 'R4C8', 'R5C8'),
];
