// Title: Thermobans
// Author: Krydax
// Video: https://www.youtube.com/watch?v=qJ7QC7AUDWM
// Source: https://tinyurl.com/yp3ya7sc
//
// Normal sudoku rules. Each thermometer strictly increases from its bulb
// (first listed cell). Each purple line holds a set of consecutive digits
// in any order (Renban): thermometer paths are ordered (Thermo), purple
// lines are unordered sets (Renban), per the rules text distinguishing the
// two clue types.

return [
  new Shape('9x9'),

  new Given('R1C5', 8),
  new Given('R9C5', 1),

  // Thermometers, bulb-first cell order taken from the drawn wayPoints.
  new Thermo('R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3'),
  new Thermo('R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'),
  new Thermo('R2C9', 'R3C9', 'R4C9', 'R5C9'),
  new Thermo('R5C1', 'R6C1', 'R7C1', 'R8C1'),
  new Thermo('R9C2', 'R8C3', 'R8C4'),
  new Thermo('R1C8', 'R2C7', 'R2C6'),

  // Purple lines: Renban (consecutive digit set, order-free).
  new Renban('R3C7', 'R4C6', 'R4C5', 'R4C4', 'R3C3'),
  new Renban('R7C3', 'R6C4', 'R6C5', 'R6C6', 'R7C7'),
  new Renban('R1C8', 'R1C7', 'R2C7'),
  new Renban('R9C2', 'R9C3', 'R8C3'),
  new Renban('R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Renban('R4C1', 'R3C1', 'R2C1', 'R1C1'),
  new Renban('R8C5', 'R9C4'),
  new Renban('R1C6', 'R2C5'),
];
