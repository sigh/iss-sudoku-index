// Title: February 22, 2023: Boa
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=ZJvrVG4XJn4
// Source: https://tinyurl.com/bdcwj8py

// Normal sudoku rules apply.
// Killer: 15 two-cell cages, each Cage(total, ...cells) enforcing distinct
// digits summing to the printed total. Cage cells and totals transcribed
// from the drawn killer cages.
return [
  new Shape('9x9'),

  new Given('R3C2', 5),
  new Given('R3C3', 2),
  new Given('R3C4', 9),
  new Given('R4C4', 6),
  new Given('R4C5', 2),
  new Given('R5C5', 7),
  new Given('R5C6', 3),
  new Given('R6C6', 5),
  new Given('R6C7', 7),
  new Given('R7C7', 9),
  new Given('R8C7', 6),
  new Given('R8C8', 3),

  new Cage(17, 'R2C1', 'R2C2'),
  new Cage(3, 'R2C3', 'R2C4'),
  new Cage(4, 'R2C5', 'R3C5'),
  new Cage(16, 'R3C1', 'R4C1'),
  new Cage(5, 'R3C6', 'R4C6'),
  new Cage(15, 'R4C2', 'R4C3'),
  new Cage(6, 'R4C7', 'R5C7'),
  new Cage(14, 'R5C3', 'R5C4'),
  new Cage(7, 'R5C8', 'R6C8'),
  new Cage(13, 'R6C4', 'R6C5'),
  new Cage(12, 'R7C5', 'R7C6'),
  new Cage(8, 'R7C8', 'R7C9'),
  new Cage(11, 'R8C6', 'R9C6'),
  new Cage(9, 'R8C9', 'R9C9'),
  new Cage(10, 'R9C7', 'R9C8'),
];
