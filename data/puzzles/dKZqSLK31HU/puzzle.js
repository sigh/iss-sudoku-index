// Title: Four Scissors
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=dKZqSLK31HU
// Source: https://sudokupad.app/696hn2ntnb

// Normal Sudoku rules apply. Each arrow circle equals the sum of the digits on
// its straight diagonal arm. The arrow paths are transcribed from the eight
// drawn circle-and-shaft clues.
return [
  new Shape('9x9'),
  new Given('R1C4', 6),
  new Given('R1C5', 2),
  new Given('R1C8', 3),
  new Given('R2C3', 2),
  new Given('R6C6', 1),
  new Given('R7C2', 5),
  new Arrow('R2C2', 'R3C3', 'R4C4'),
  new Arrow('R2C5', 'R3C4', 'R4C3'),
  new Arrow('R2C8', 'R3C7', 'R4C6'),
  new Arrow('R5C8', 'R4C7', 'R3C6'),
  new Arrow('R5C2', 'R6C3', 'R7C4'),
  new Arrow('R8C2', 'R7C3', 'R6C4'),
  new Arrow('R8C5', 'R7C6', 'R6C7'),
  new Arrow('R8C8', 'R7C7', 'R6C6'),
];
