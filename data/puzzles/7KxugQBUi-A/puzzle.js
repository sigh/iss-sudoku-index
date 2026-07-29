// Title: Foggy on the Details
// Author: Karl the Fog!
// Video: https://www.youtube.com/watch?v=7KxugQBUi-A
// Source: https://sudokupad.app/e3dz5lytps

// Normal 6x6 Sudoku rules use 2x3 boxes. Blue lines are Modular(3), the red
// line is a region-sum line, and the three displayed cage totals allow repeats.
// Foglight/reveal mechanics are UI only.
return [
  new Shape('6x6'),

  // Cage totals transcribed from the three numbered drawn cages; cage digits may repeat.
  new Sum(20, 'R1C1', 'R2C1', 'R3C1', 'R3C2', 'R4C1'),
  new Sum(15, 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R3C5'),
  new Sum(28, 'R4C6', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R6C5'),

  // Blue modular-line paths, including their diagonal segments and shared R1C3.
  new Modular(3, 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new Modular(3, 'R3C3', 'R2C3', 'R1C3'),
  new Modular(3, 'R2C5', 'R3C5', 'R3C6'),
  new Modular(3, 'R4C6', 'R4C5', 'R4C4', 'R3C4'),

  // The drawn red path is split into consecutive box segments by RegionSumLine.
  new RegionSumLine('R5C1', 'R6C1', 'R5C2', 'R6C3', 'R6C4', 'R6C5', 'R5C5', 'R5C6'),
];
