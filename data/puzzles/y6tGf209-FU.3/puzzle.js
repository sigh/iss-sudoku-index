// Title: Nov. 21, 2022: Carnot Engine
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=y6tGf209-FU
// Source: https://tinyurl.com/j9rrabm5

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Digits along thermometers must strictly increase from bulb to tip;
// Thermo(...) takes the cells in that bulb-to-tip order, per the payload's
// drawn thermometer arrays.

return [
  new Shape('9x9'),
  new Given('R2C6', 3),
  new Given('R3C7', 4),
  new Given('R4C7', 2),
  new Given('R6C3', 3),
  new Given('R7C3', 5),
  new Given('R8C4', 4),
  new Thermo('R2C4', 'R1C3', 'R1C2', 'R2C1', 'R3C1', 'R4C2', 'R4C3'),
  new Thermo('R8C6', 'R9C7', 'R9C8', 'R8C9', 'R7C9', 'R6C8', 'R6C7'),
  new Thermo('R6C9', 'R5C8', 'R5C7', 'R6C6', 'R7C6', 'R8C7', 'R8C8'),
  new Thermo('R4C1', 'R5C2', 'R5C3', 'R4C4', 'R3C4', 'R2C3', 'R2C2'),
];
