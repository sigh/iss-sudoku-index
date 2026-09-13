// Title: Pancho and Lefty
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=DoGgYpZkaAg
// Source: https://sudokupad.app/james-sinclair/pancho-and-lefty

// Normal sudoku rules apply (9x9, standard rows/cols/boxes, no givens).
// Arrows: digits along an arrow's arm sum to the digit in its circle
// (repeats allowed on the arm). Two arrows can share one circle.
// Entropic lines (drawn orange): every 3 consecutive cells on the line
// hold one low (1-3), one mid (4-6) and one high (7-9) digit.
// Cells with a shaded square are even.

return [
  new Shape('9x9'),

  // Arrows: bulb cell first, then arm cells. Bulb coordinates come from
  // the overlay circles; arm cells from the drawn arrow shafts. Several
  // bulbs anchor two separate arrows.
  new Arrow('R7C1', 'R7C2', 'R7C3'),
  new Arrow('R7C1', 'R6C1', 'R5C2'),
  new Arrow('R9C1', 'R9C2', 'R9C3'),
  new Arrow('R3C1', 'R3C2', 'R3C3'),
  new Arrow('R3C1', 'R4C1', 'R5C1'),
  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R5C3', 'R4C4', 'R3C5'),
  new Arrow('R5C3', 'R6C4', 'R7C5'),
  new Arrow('R6C7', 'R5C6', 'R5C5'),
  new Arrow('R6C7', 'R7C8'),
  new Arrow('R1C8', 'R1C9', 'R2C9'),
  new Arrow('R7C9', 'R8C9', 'R9C8'),

  // Entropic lines, cell lists from the drawn orange strokes.
  new Entropic('R8C1', 'R8C2', 'R8C3', 'R7C4'),
  new Entropic('R2C1', 'R2C2', 'R2C3', 'R3C4'),
  new Entropic('R3C1', 'R4C2', 'R5C3', 'R6C2', 'R7C1'),
  new Entropic('R6C9', 'R5C9', 'R5C8', 'R4C8', 'R3C8', 'R3C7', 'R2C6'),
  new Entropic('R9C5', 'R9C6', 'R9C7'),

  // Shaded squares: digit is even. No named Odd/Even class, so encode as
  // a candidate restriction.
  new Given('R2C2', 2, 4, 6, 8),
  new Given('R8C8', 2, 4, 6, 8),
];
