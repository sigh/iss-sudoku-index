// Title: The Lonely Six
// Author: gdc
// Video: https://www.youtube.com/watch?v=H_GK62oVf4Y
// Source: https://sudokupad.app/k7v9mczft0

// Irregular 6x6 Sudoku: digits 1-6 occur once per row, column, and drawn region.
// Each arrow's circle is its first cell; its arm cells sum to that circle.
// The fog rule controls clue reveal only and has no completed-grid constraint.
return [
  new Shape('6x6'),
  new NoBoxes(),
  new Given('R6C2', 6),
  new Given('R6C4', 1),

  // Drawn six-cell irregular regions.
  new Jigsaw('6x6', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R6C2'),
  new Jigsaw('6x6', 'R1C1', 'R1C2', 'R2C2', 'R3C2', 'R3C3', 'R4C2'),
  new Jigsaw('6x6', 'R1C3', 'R1C4', 'R2C3', 'R2C4', 'R2C5', 'R3C4'),
  new Jigsaw('6x6', 'R4C3', 'R5C2', 'R5C3', 'R6C3', 'R6C4', 'R6C5'),
  new Jigsaw('6x6', 'R1C5', 'R1C6', 'R2C6', 'R3C5', 'R3C6', 'R4C5'),
  new Jigsaw('6x6', 'R4C4', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C6'),

  // Arrow paths transcribed from the circle-and-arrow drawing, bulb first.
  new Arrow('R1C2', 'R1C3', 'R1C4'),
  new Arrow('R2C2', 'R2C3', 'R3C3'),
  new Arrow('R2C1', 'R3C1', 'R3C2'),
  new Arrow('R2C5', 'R2C6', 'R1C6'),
  new Arrow('R4C3', 'R4C4', 'R3C4'),
];
