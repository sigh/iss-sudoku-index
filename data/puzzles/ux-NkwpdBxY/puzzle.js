// Title: Thermometer Sudoku
// Author: Ashish Kumar
// Video: https://www.youtube.com/watch?v=ux-NkwpdBxY
// Source: https://cracking-the-cryptic.web.app/sudoku/GB7766tQj9
//
// Standard sudoku (rows, columns, boxes all-different), no givens, plus
// eleven grey lines with round bulb markers -- the standard thermometer
// bulb+line convention (digits strictly increase away from the bulb). The
// source carries no rules text at all, so the drawn bulb+line shapes are
// the only ground for the reading. Every drawn line is short enough (at
// most 7 cells) for a strict increasing reading to be satisfiable on a 1-9
// grid, so the default strict Thermo reading applies throughout.
//
// Two of the eleven drawn entries are a single polyline whose bulb circle
// sits at an interior bend rather than at either end -- the drawn ink
// turns back on itself at that cell, which is how this source renders one
// bulb feeding two arms (a single polyline cannot fork). Each is encoded
// as two Thermo constraints sharing the bulb cell.

return [
  new Shape('9x9'),

  // R3C1(bulb)-R3C2
  new Thermo('R3C1', 'R3C2'),

  // R1C5(bulb)-R1C4
  new Thermo('R1C5', 'R1C4'),

  // Two arms sharing bulb R2C7 (interior bend of one drawn polyline).
  new Thermo('R2C7', 'R1C7', 'R1C8', 'R1C9'),
  new Thermo('R2C7', 'R3C7', 'R3C8', 'R3C9'),

  // R5C5(bulb)-R5C6-R4C6-R4C5-R4C4-R5C4-R6C4 (drawn tip-first)
  new Thermo('R5C5', 'R5C6', 'R4C6', 'R4C5', 'R4C4', 'R5C4', 'R6C4'),

  // R9C5(bulb)-R9C6
  new Thermo('R9C5', 'R9C6'),

  // R5C8(bulb)-R6C8-R6C7-R7C7-R7C6-R8C6-R8C5 (drawn tip-first)
  new Thermo('R5C8', 'R6C8', 'R6C7', 'R7C7', 'R7C6', 'R8C6', 'R8C5'),

  // R5C1(bulb)-R4C1
  new Thermo('R5C1', 'R4C1'),

  // R5C2(bulb)-R4C2-R4C3-R3C3-R3C4-R2C4-R2C5
  new Thermo('R5C2', 'R4C2', 'R4C3', 'R3C3', 'R3C4', 'R2C4', 'R2C5'),

  // R5C9(bulb)-R6C9
  new Thermo('R5C9', 'R6C9'),

  // R7C9(bulb)-R7C8
  new Thermo('R7C9', 'R7C8'),

  // Two arms sharing bulb R9C1 (interior bend of one drawn polyline; the
  // second leg jumps via a bend point near R8C2 rather than a cell centre).
  new Thermo('R9C1', 'R8C1', 'R7C1'),
  new Thermo('R9C1', 'R8C2', 'R9C3', 'R8C3', 'R7C3'),
];
