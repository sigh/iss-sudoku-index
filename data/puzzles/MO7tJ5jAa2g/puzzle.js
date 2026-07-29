// Title: Gegentakt
// Author: Myxo
// Video: https://www.youtube.com/watch?v=MO7tJ5jAa2g
// Source: https://sudokupad.app/c8waymdam4

// Standard 9x9 Sudoku. The two givens come from the grid; each white-circled
// arrow bulb equals the sum of its shaft, and each hot-pink line is a renban.
const arrows = [
  new Arrow('R9C2', 'R8C3', 'R8C4'),
  new Arrow('R9C5', 'R8C6', 'R8C7'),
  new Arrow('R6C8', 'R5C7', 'R5C6'),
  new Arrow('R6C5', 'R5C4', 'R5C3'),
  new Arrow('R3C2', 'R2C3', 'R2C4'),
  new Arrow('R3C5', 'R2C6', 'R2C7'),
];

const renbans = [
  new Renban('R9C8', 'R8C9', 'R7C8'),
  new Renban('R1C8', 'R2C9', 'R3C8'),
  new Renban('R6C2', 'R5C1', 'R4C2'),
  new Renban('R1C2', 'R2C1'),
];

return [
  new Shape('9x9'),
  // Givens transcribed from the grid.
  new Given('R5C9', 5),
  new Given('R8C1', 7),
  ...arrows,
  ...renbans,
];
