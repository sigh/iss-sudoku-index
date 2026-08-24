// Title: SKZ Sudoku
// Author: Hunar Doulani
// Video: https://www.youtube.com/watch?v=UiglwueqlDk
// Source: https://app.crackingthecryptic.com/sudoku/dL4q7GtPGJ

// Normal sudoku rules apply. Digits must increase along thermometers, from
// the bulb. Regions are the standard 3x3 boxes. Each drawn line is a
// circle-tipped thermometer; the circle overlay marks the bulb (start) cell.
// Thermometers below are listed bulb-first, matching Thermo's semantics
// (increasing from its first argument).

const givens = [
  new Given('R1C6', 1),
  new Given('R2C7', 8),
  new Given('R2C9', 3),
  new Given('R3C6', 3),
  new Given('R5C7', 9),
  new Given('R5C9', 6),
  new Given('R7C2', 3),
  new Given('R7C4', 6),
  new Given('R8C6', 9),
  new Given('R9C2', 8),
  new Given('R9C4', 2),
];

const thermometers = [
  new Thermo('R7C7', 'R7C8', 'R7C9', 'R8C8', 'R9C7', 'R9C8', 'R9C9'),
  new Thermo('R8C3', 'R8C2', 'R8C1'),
  new Thermo('R4C6', 'R5C5', 'R6C6'),
  new Thermo('R6C4', 'R5C4', 'R4C4'),
  new Thermo('R2C3', 'R1C2', 'R2C1', 'R3C2', 'R4C3', 'R5C2', 'R4C1'),
  new Thermo('R1C8', 'R2C8', 'R3C8'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermometers,
];
