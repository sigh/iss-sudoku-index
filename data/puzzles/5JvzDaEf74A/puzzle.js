// Title: CtC University Graduation
// Author: Spelldaddy
// Video: https://www.youtube.com/watch?v=5JvzDaEf74A
// Source: https://tinyurl.com/CtCUgrad
//
// Normal sudoku rules; digits on each thermometer strictly increase from the
// bulb; along each entropy line (both drawn colours obey the same rule, the
// colour is only to tell separate lines apart) every sequential group of
// three cells contains one low (1-3), one medium (4-6) and one high (7-9)
// digit. Default 9 standard 3x3 boxes (none drawn).

return [
  new Shape('9x9'),

  new Given('R2C7', 8),
  new Given('R6C4', 5),
  new Given('R9C1', 8),

  // Thermometers: all five share their bulb at R5C5 (list order = path
  // order, bulb first). Cells transcribed from the puzzle's drawn
  // thermometer paths.
  new Thermo('R5C5', 'R6C6', 'R7C7', 'R8C7', 'R9C7'),
  new Thermo('R5C5', 'R6C6', 'R7C7', 'R7C8', 'R7C9'),
  new Thermo('R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'),
  new Thermo('R5C5', 'R4C4', 'R3C3', 'R3C2', 'R3C1'),
  new Thermo('R5C5', 'R4C4', 'R3C3', 'R2C3'),

  // Entropy lines: cells transcribed from the puzzle's drawn line paths, in
  // drawn order. Colour (blue #79A0B5 / brown #B58F74) is purely cosmetic
  // per the rules text, so both use the same Entropic constraint.
  new Entropic(
    'R9C7', 'R8C7', 'R7C7', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8',
    'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2', 'R3C2', 'R4C2', 'R5C2',
    'R6C2', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6'),
  new Entropic('R4C7', 'R4C6', 'R5C6', 'R5C7'),
  new Entropic('R4C4', 'R4C3', 'R5C3', 'R5C4'),
  new Entropic('R5C5', 'R4C5', 'R3C5'),
  new Entropic('R3C4', 'R3C5', 'R3C6'),
];
