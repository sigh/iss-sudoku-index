// Title: Sept. 28, 2023: 129 Classish
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=IWEB54lMi0U
// Source: https://tinyurl.com/nrjnhr8

// Normal Sudoku with the nine diagonal givens and two bulb-to-tip thermometers.
return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R2C2', 2),
  new Given('R3C3', 3),
  new Given('R4C4', 4),
  new Given('R5C5', 5),
  new Given('R6C6', 6),
  new Given('R7C7', 7),
  new Given('R8C8', 8),
  new Given('R9C9', 9),
  new Thermo('R2C8', 'R1C7', 'R2C6', 'R3C6', 'R4C7', 'R5C7', 'R5C8', 'R4C9', 'R3C8'),
  new Thermo('R7C2', 'R6C1', 'R5C2', 'R5C3', 'R6C3', 'R7C4', 'R8C4', 'R9C3', 'R8C2'),
];
