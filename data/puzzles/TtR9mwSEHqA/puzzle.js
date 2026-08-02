// Title: 50 Years of FKG
// Author: olima
// Video: https://www.youtube.com/watch?v=TtR9mwSEHqA
// Source: https://app.crackingthecryptic.com/sudoku/jnp62DbhBf

// Normal Sudoku rules apply. Digits strictly increase from the grey circular
// bulb through each grey thermometer; the circles at shared starts mark each
// separate stroke's bulb.
const thermometers = [
  new Thermo('R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'),
  new Thermo('R4C1', 'R3C1', 'R2C1', 'R2C2'),
  new Thermo('R1C4', 'R2C4', 'R3C4', 'R4C4'),
  new Thermo('R1C4', 'R2C4', 'R3C4', 'R2C5', 'R1C6'),
  new Thermo('R1C4', 'R2C4', 'R3C4', 'R3C5', 'R4C6'),
  new Thermo('R3C8', 'R3C9', 'R4C8', 'R3C7', 'R2C7', 'R1C8', 'R1C9'),
  new Thermo('R7C2', 'R6C2', 'R5C2', 'R5C3', 'R5C4'),
  new Thermo('R7C5', 'R6C5', 'R5C6', 'R6C7'),
  new Thermo('R7C5', 'R8C5', 'R9C6', 'R8C7', 'R7C7'),
  new Thermo('R7C2', 'R7C3', 'R8C4', 'R9C3', 'R9C2', 'R8C1'),
];

return [
  new Shape('9x9'),
  ...thermometers,
];
