// Title: Hooked On Sudoku
// Author: Blashyrkh
// Video: https://www.youtube.com/watch?v=OYdeuFQ4Ovs
// Source: https://sudokupad.app/txsylemoy3

// Standard 9x9 Sudoku. Digits strictly increase from each grey thermometer bulb.
return [
  new Shape('9x9'),
  // Paths transcribed from the four grey thermometer strokes, bulb first.
  new Thermo('R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new Thermo('R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9'),
  new Thermo('R4C4', 'R5C4', 'R6C5', 'R7C5', 'R8C4', 'R8C3', 'R7C2'),
  new Thermo('R2C8', 'R3C7', 'R2C6', 'R3C5', 'R4C5', 'R5C6', 'R5C7'),
];
