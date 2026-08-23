// Title: Even Arrow Sudoku
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=YCM__83IYnQ
// Source: https://app.crackingthecryptic.com/sudoku/2g7LQNtf2j

// Standard 9x9 sudoku with default 3x3 boxes, no givens. Digits along an
// arrow sum to the digit in that arrow's circled bulb. Cells marked with a
// grey square must hold an even digit.
//
// Arrow(bulb, ...path): the bulb cell is the first argument. Bulb and path
// cells are transcribed from the payload's arrow waypoints and circle
// underlays.
//
// There is no dedicated even/odd class, so each even cell is encoded as a
// multi-value Given restricting it to {2,4,6,8}.

const arrows = [
  new Arrow('R1C2', 'R2C3', 'R2C4'),
  new Arrow('R1C6', 'R1C5', 'R1C4'),
  new Arrow('R1C8', 'R2C7', 'R2C6'),
  new Arrow('R3C9', 'R4C9', 'R4C8', 'R5C7', 'R6C6'),
  new Arrow('R5C9', 'R6C8', 'R7C8'),
  new Arrow('R9C8', 'R9C7', 'R9C6'),
  new Arrow('R7C5', 'R8C6', 'R8C7'),
  new Arrow('R7C5', 'R8C4', 'R8C3'),
  new Arrow('R9C2', 'R9C1', 'R8C1', 'R7C1'),
  new Arrow('R5C1', 'R6C2', 'R7C2'),
  new Arrow('R3C1', 'R4C1', 'R4C2'),
  new Arrow('R4C4', 'R5C4', 'R6C3'),
  new Arrow('R4C5', 'R3C6', 'R3C7'),
  new Arrow('R4C5', 'R3C4', 'R3C3'),
];

const evenCells = [
  'R2C2', 'R2C5', 'R2C8', 'R5C2', 'R5C5', 'R5C8', 'R8C2', 'R8C5', 'R8C8',
];
const evenGivens = evenCells.map((cell) => new Given(cell, 2, 4, 6, 8));

return [
  new Shape('9x9'),
  ...arrows,
  ...evenGivens,
];
