// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=d2GE4rEe7uE
// Source: https://cracking-the-cryptic.web.app/sudoku/rj3BMM3mB8

// Normal sudoku rules apply. Every 2-cell cage sums to 10, with distinct
// digits (standard killer-cage convention). Along each thermometer, digits
// strictly increase from the bulb (listed first). Cells a knight's move
// apart cannot repeat a digit.
//
// The first four cages below occupy the same two cells as the first four
// thermometers -- both clues are drawn there and both apply.

return [
  new Shape('9x9'),

  // Cages: payload `cages` array, 0-indexed cells converted to R#C#.
  new Cage(10, 'R1C1', 'R2C1'),
  new Cage(10, 'R1C2', 'R2C2'),
  new Cage(10, 'R4C1', 'R4C2'),
  new Cage(10, 'R5C1', 'R5C2'),
  new Cage(10, 'R8C3', 'R9C3'),
  new Cage(10, 'R8C4', 'R8C5'),
  new Cage(10, 'R6C5', 'R6C6'),
  new Cage(10, 'R4C6', 'R5C6'),
  new Cage(10, 'R4C8', 'R5C8'),
  new Cage(10, 'R4C9', 'R5C9'),
  new Cage(10, 'R7C9', 'R8C9'),

  // Thermometers: payload `lines` array, bulb cell first. The fifth line
  // (R2C5 -> R1C6 -> R2C7 -> R2C8) is drawn with diagonal turns between
  // straight segments; Thermo binds consecutive pairs by list order, so the
  // bend needs no special handling.
  new Thermo('R1C1', 'R2C1'),
  new Thermo('R1C2', 'R2C2'),
  new Thermo('R4C1', 'R4C2'),
  new Thermo('R5C1', 'R5C2'),
  new Thermo('R2C5', 'R1C6', 'R2C7', 'R2C8'),

  new AntiKnight(),
];
