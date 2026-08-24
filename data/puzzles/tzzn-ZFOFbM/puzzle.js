// Title: Make it So-doku
// Author: Haley Prochilo
// Video: https://www.youtube.com/watch?v=tzzn-ZFOFbM
// Source: https://app.crackingthecryptic.com/sudoku/Rpq6pTRDfd
//
// Normal sudoku rules (standard 3x3 boxes; givens below).
// Thermometers (grey, or red-bulb/blue-tube): digits strictly increase from
// the bulb. Both colourings are the same rule per the rules text
// ("grey or red/blue thermometers"); the bulb/blue-tube pair at R3C4/R3C6
// is rendered with a red bulb marker and a blue tube, no different in kind
// from the grey ones.
// Yellow circles: the marked cell holds an odd digit.
// Orange lines: the two joined cells hold consecutive digits (a set of two
// consecutive integers, order unconstrained) -- each orange line here joins
// a diagonally-adjacent cell pair, so it is encoded with Renban (binds by
// list order, not grid adjacency) rather than a dot-marker class.

const yThermBulb = 'R8C5';

return [
  new Shape('9x9'),

  new Given('R2C1', 1),
  new Given('R2C8', 6),
  new Given('R4C9', 2),
  new Given('R5C6', 6),
  new Given('R6C1', 3),
  new Given('R8C1', 7),
  new Given('R8C8', 5),

  // Grey Y-thermometer: two arms sharing bulb R8C5. Each arm is its own
  // Thermo starting at the shared bulb cell (drawn as two separate strokes
  // from one bulb in the source geometry).
  new Thermo(yThermBulb, 'R8C6', 'R7C7', 'R6C7', 'R5C7', 'R4C6'),
  new Thermo(yThermBulb, 'R8C4', 'R7C3', 'R6C3', 'R5C3', 'R4C4'),

  // Grey thermometer, bulb R6C5.
  new Thermo('R6C5', 'R6C4', 'R7C4', 'R7C5', 'R7C6', 'R6C6'),

  // Grey thermometer, bulb R4C5.
  new Thermo('R4C5', 'R3C5', 'R2C5'),

  // Red-bulb / blue-tube thermometers.
  new Thermo('R3C4', 'R2C4', 'R1C4'),
  new Thermo('R3C6', 'R2C6', 'R1C6'),

  // Yellow circles: odd digits.
  new Given('R1C5', 1, 3, 5, 7, 9),
  new Given('R1C9', 1, 3, 5, 7, 9),
  new Given('R4C1', 1, 3, 5, 7, 9),
  new Given('R7C1', 1, 3, 5, 7, 9),
  new Given('R7C9', 1, 3, 5, 7, 9),
  new Given('R9C2', 1, 3, 5, 7, 9),

  // Orange lines: joined cells hold consecutive digits.
  new Renban('R9C2', 'R8C3'),
  new Renban('R9C8', 'R8C7'),
];
