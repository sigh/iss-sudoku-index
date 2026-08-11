// Title: Windmill
// Author: Lerroyy
// Video: https://www.youtube.com/watch?v=URwOIv2leWU
// Source: https://app.crackingthecryptic.com/sudoku/LjR6P6LqN7

// Normal sudoku rules apply (default row/column/box all-different from Shape).
// No digits are given directly.
// Digits cannot repeat on the main diagonal (marked in blue): Diagonal(-1) is
// the top-left-to-bottom-right diagonal, matching the drawn R1C1-R9C9 line.
// Thermometers increase from the bulb (first cell); cage totals sit in the
// top-left cell and cages forbid repeats; arrow circles (first cell) equal
// the sum of the remaining line cells.

return [
  new Shape('9x9'),
  new Diagonal(-1),

  // Cages, cell order transcribed from the drawn cage outlines.
  new Cage(21, 'R1C2', 'R1C3', 'R2C3'),
  new Cage(21, 'R8C7', 'R9C7', 'R9C8'),
  new Cage(17, 'R3C9', 'R4C9', 'R5C9', 'R5C8'),
  new Cage(18, 'R5C1', 'R6C1', 'R7C1', 'R5C2'),

  // Thermometers, bulb cell first, from the two thick grey `lines` entries;
  // each bulb matches a grey-filled circle underlay at the line's first point.
  new Thermo('R3C8', 'R2C8', 'R2C9'),
  new Thermo('R5C3', 'R4C2', 'R3C1'),

  // Arrows, circle cell first, from the `arrows` entries; each circle matches
  // a white circle underlay at the arrow's first waypoint.
  new Arrow('R4C5', 'R3C4', 'R2C4', 'R1C4'),
  new Arrow('R6C5', 'R7C6', 'R8C6', 'R9C6'),
  new Arrow('R7C9', 'R6C8', 'R5C7'),
];
