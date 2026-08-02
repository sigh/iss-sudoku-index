// Title: Wedding Invitation
// Author: Thunderkey
// Video: https://www.youtube.com/watch?v=pFscdkE58nQ
// Source: https://app.crackingthecryptic.com/hpRmM3gHgP

// Normal Sudoku rules apply. Digits strictly increase from each grey thermometer bulb.
// Thermometer paths are transcribed from the grey lines; each list starts at its circular bulb.
return [
  new Shape('9x9'),
  new Thermo('R8C2', 'R8C1', 'R7C1', 'R7C2', 'R7C3'),
  new Thermo('R9C1', 'R9C2', 'R9C3', 'R8C3'),
  new Thermo('R8C4', 'R8C5', 'R8C6'),
  new Thermo('R9C4', 'R9C5', 'R9C6'),
  new Thermo('R9C7', 'R8C7', 'R7C7', 'R8C8', 'R9C9', 'R8C9', 'R7C9'),
  new Thermo('R1C1', 'R1C2'),
  new Thermo('R6C4', 'R5C3', 'R4C2', 'R3C1', 'R2C2', 'R1C3', 'R2C4'),
  new Thermo('R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9', 'R2C8', 'R1C7', 'R2C6', 'R3C5'),
];
