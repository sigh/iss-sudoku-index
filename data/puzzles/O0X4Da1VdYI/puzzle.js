// Title: Cascade
// Author: Scojo
// Video: https://www.youtube.com/watch?v=O0X4Da1VdYI
// Source: https://sudokupad.app/2p785kmt7f

// Normal Sudoku rules apply. Each listed path is a thermometer ordered from bulb to tip.
// Thermometer paths are transcribed from the source's six thermometer shapes.
return [
  new Shape('9x9'),
  new Thermo('R1C8', 'R2C8', 'R3C8', 'R4C7', 'R5C7', 'R6C7', 'R7C6', 'R8C6'),
  new Thermo('R1C5', 'R2C5', 'R3C5', 'R4C4', 'R5C4', 'R6C4', 'R7C3'),
  new Thermo('R1C2', 'R2C2', 'R3C2', 'R4C1', 'R5C1', 'R6C1'),
  new Thermo('R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2'),
  new Thermo('R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new Thermo('R7C8', 'R8C8', 'R9C8'),
];
