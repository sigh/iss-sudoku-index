// Title: Knight Trot
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=FjPuAndAup8
// Source: https://app.crackingthecryptic.com/sudoku/N3gpdTdqTP

// Normal sudoku rules apply (standard 3x3 boxes). Cells a knight's move apart
// cannot repeat a digit. Digits strictly increase along each thermometer from
// its bulb. Four 5-cell thermometers (drawn grey/gold/red/blue) all share
// their high (non-bulb) end at the centre cell R5C5.
return [
  new Shape('9x9'),

  new Given('R1C1', 3),
  new Given('R5C3', 9),
  new Given('R5C7', 3),
  new Given('R9C9', 8),

  new AntiKnight(),

  // Grey line (#cfcfcf), bulb R2C1.
  new Thermo('R2C1', 'R3C2', 'R4C3', 'R5C4', 'R5C5'),
  // Gold line (#f7d038), bulb R1C8.
  new Thermo('R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C5'),
  // Red line (#e6261f), bulb R8C9.
  new Thermo('R8C9', 'R7C8', 'R6C7', 'R5C6', 'R5C5'),
  // Blue line (#34bbe6), bulb R9C2.
  new Thermo('R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C5'),
];
