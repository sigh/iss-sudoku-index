// Title: Bubbles
// Author: JoWovrin
// Video: https://www.youtube.com/watch?v=vqxMBVTt9vk
// Source: https://app.crackingthecryptic.com/sudoku/q7g3F93T6h

// Normal sudoku rules apply. Along each thermometer, digits strictly increase
// from the bulb end (marked by a filled grey circle in the source geometry).
return [
  new Shape('9x9'),

  new Thermo('R2C2', 'R1C2', 'R1C3', 'R1C4', 'R1C5'),
  new Thermo('R2C5', 'R1C6', 'R1C7', 'R1C8', 'R2C9', 'R3C9'),
  new Thermo('R4C9', 'R5C8', 'R5C7', 'R5C6', 'R4C5'),
  new Thermo('R6C1', 'R5C2', 'R5C3', 'R5C4', 'R6C5'),
  new Thermo('R8C9', 'R9C8', 'R9C7', 'R9C6'),
  new Thermo('R8C5', 'R9C4', 'R9C3', 'R9C2', 'R8C1'),
];
