// Title: Thermo Sudoku
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=4ohugs2C09A
// Source: https://cracking-the-cryptic.web.app/sudoku/Jr3JPpr6P2
//
// Standard sudoku (rows, columns, boxes all-different). Five grey
// thermometers: digits strictly increase along each from the bulb end.
//
// Thermometer 4 (bulb R2C7) is encoded only through R4C9, its last
// unambiguous cell. Past R4C9 the archived line waypoints move up into
// R3C9 and then back down through R4C9 into R5C9 -- a literal revisit of
// R4C9 that a strictly-increasing reading cannot satisfy (it would require
// R4C9 < R4C9). Which of R3C9/R5C9 the thermometer actually continues
// through, and in what order, is not recoverable from the archived
// coordinates, so that continuation is omitted.

return [
  new Shape('9x9'),

  new Given('R2C5', 3),
  new Given('R5C2', 1),
  new Given('R5C8', 9),
  new Given('R8C5', 1),

  new Thermo('R1C1', 'R2C1', 'R3C1', 'R2C2', 'R3C3', 'R2C3', 'R1C3'),
  new Thermo('R4C6', 'R4C5', 'R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C6', 'R6C5', 'R6C4'),
  new Thermo('R7C9', 'R7C8', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9'),
  new Thermo('R2C7', 'R3C7', 'R4C7', 'R4C8', 'R4C9'),
  new Thermo('R9C3', 'R8C3', 'R7C3', 'R6C3', 'R7C2'),
];
