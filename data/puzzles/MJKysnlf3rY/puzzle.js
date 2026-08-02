// Title: Network
// Author: Jobo
// Video: https://www.youtube.com/watch?v=MJKysnlf3rY
// Source: https://sudokupad.app/vn44db0fft

// Normal Sudoku rules apply. Arrow shafts sum to their circle digits. Each
// circle-to-circle segment has shaft sum equal to its two endpoint circles.
// Arrow and double-arrow paths are transcribed from the drawn network.
const arrows = [
  new Arrow('R1C3', 'R1C2', 'R1C1'),
  new Arrow('R1C3', 'R2C3', 'R3C3'),
  new Arrow('R1C7', 'R1C8', 'R1C9'),
  new Arrow('R1C7', 'R2C8', 'R3C9'),
  new Arrow('R3C5', 'R4C6', 'R5C7'),
  new Arrow('R5C3', 'R4C2', 'R3C1'),
  new Arrow('R5C3', 'R5C4', 'R5C5'),
  new Arrow('R6C9', 'R5C9', 'R4C9'),
  new Arrow('R9C3', 'R9C2', 'R9C1'),
  new Arrow('R9C3', 'R8C2', 'R7C1'),
  new Arrow('R9C3', 'R8C4', 'R7C5'),
  new Arrow('R9C7', 'R9C8', 'R9C9'),
];

const doubleArrows = [
  new DoubleArrow('R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3'),
  new DoubleArrow('R1C3', 'R2C4', 'R3C5'),
  new DoubleArrow('R3C5', 'R4C4', 'R5C3'),
  new DoubleArrow('R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3'),
  new DoubleArrow('R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'),
  new DoubleArrow('R9C7', 'R8C7', 'R7C7', 'R6C7'),
  new DoubleArrow('R6C7', 'R6C8', 'R6C9'),
];

return [new Shape('9x9'), ...arrows, ...doubleArrows];
