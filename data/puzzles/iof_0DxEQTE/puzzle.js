// Title: Club 27
// Author: Blashyrkh
// Video: https://www.youtube.com/watch?v=iof_0DxEQTE
// Source: https://sudokupad.app/dowo5gsiqj

// Normal Sudoku rules apply. Each grey thermometer increases strictly from its
// circular bulb to its tip; the listed paths are transcribed from the drawing.
return [
  new Shape('9x9'),
  new Thermo('R1C2', 'R1C3', 'R2C4', 'R3C4'),
  new Thermo('R1C8', 'R1C7', 'R2C6', 'R3C6'),
  new Thermo('R4C3', 'R4C2', 'R3C1', 'R2C1'),
  new Thermo('R6C3', 'R6C2', 'R7C1', 'R8C1'),
  new Thermo('R7C5', 'R6C5', 'R5C6', 'R5C7'),
  new Thermo('R8C7', 'R7C8', 'R6C9', 'R5C9'),
  new Thermo('R9C5', 'R8C4', 'R7C3'),
];
