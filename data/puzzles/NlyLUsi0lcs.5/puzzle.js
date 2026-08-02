// Title: Sept. 10, 2023: Fahrenheit 129
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=NlyLUsi0lcs
// Source: https://tinyurl.com/yxcd9b9x

// Standard Sudoku with the diagonal givens and ten strictly increasing thermometers.
return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R2C2', 2), new Given('R3C3', 3),
  new Given('R4C4', 4), new Given('R5C5', 5), new Given('R6C6', 6),
  new Given('R7C7', 7), new Given('R8C8', 8), new Given('R9C9', 9),
  // Thermometer paths transcribed from the source drawing, bulb first.
  new Thermo('R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'),
  new Thermo('R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new Thermo('R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'),
  new Thermo('R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6'),
  new Thermo('R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'),
  new Thermo('R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'),
  new Thermo('R6C4', 'R6C5', 'R6C6', 'R6C7'),
  new Thermo('R4C3', 'R4C4', 'R4C5', 'R4C6'),
  new Thermo('R5C6', 'R5C7', 'R5C8', 'R5C9'),
  new Thermo('R5C1', 'R5C2', 'R5C3', 'R5C4'),
];
