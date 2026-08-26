// Title: Double Thermos
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=BzWeEtdUb70
// Source: https://sudokupad.app/pwvd13opgn

// Normal sudoku rules apply. Along a thermometer, digits must increase from
// the bulb end. 8 grey circle underlays at R5C1..R5C8 mark the bulb cells;
// each drawn line's bulb end is identified by which end touches its circle
// (7 bulbs anchor two independently-increasing arms -- a shared-bulb
// "double thermometer" -- the R5C1 bulb anchors a single arm). Each
// Thermo below is one arm, bulb cell first.

const thermos = [
  new Thermo('R5C1', 'R4C2'),

  new Thermo('R5C2', 'R6C1'),
  new Thermo('R5C2', 'R4C3', 'R3C4', 'R2C5'),

  new Thermo('R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7'),
  new Thermo('R5C3', 'R6C2', 'R7C1'),

  new Thermo('R5C4', 'R6C3', 'R7C2', 'R8C1'),
  new Thermo('R5C4', 'R4C5', 'R3C6', 'R2C7'),

  new Thermo('R5C5', 'R4C6'),
  new Thermo('R5C5', 'R6C4'),

  new Thermo('R5C6', 'R4C7', 'R3C8', 'R2C9'),
  new Thermo('R5C6', 'R6C5', 'R7C4', 'R8C3'),

  new Thermo('R5C7', 'R6C6', 'R7C5', 'R8C4'),
  new Thermo('R5C7', 'R4C8', 'R3C9'),

  new Thermo('R5C8', 'R4C9'),
  new Thermo('R5C8', 'R6C7', 'R7C6'),
];

return [
  new Shape('9x9'),
  ...thermos,
];
