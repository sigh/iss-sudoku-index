// Title: Oct. 7, 2023: Football Weather
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=SuzBgBqaztw
// Source: https://tinyurl.com/mskt8j47

// Normal Sudoku rules apply. The givens and the four bulb-to-tip thermometer
// paths below are transcribed from the puzzle.
return [
  new Shape('9x9'),
  new Given('R1C9', 9),
  new Given('R3C7', 8),
  new Given('R4C5', 6),
  new Given('R6C5', 7),
  new Given('R7C3', 5),
  new Given('R9C1', 4),
  new Thermo('R6C4', 'R5C3', 'R5C2', 'R6C1', 'R7C1', 'R8C2', 'R8C3', 'R7C4'),
  new Thermo('R3C9', 'R2C8', 'R2C7', 'R3C6', 'R4C6', 'R5C7', 'R5C8', 'R4C9'),
  new Thermo('R2C5', 'R1C4', 'R1C3', 'R2C2', 'R3C2', 'R4C3'),
  new Thermo('R8C5', 'R9C6', 'R9C7', 'R8C8', 'R7C8', 'R6C7'),
];
