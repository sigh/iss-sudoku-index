// Title: Calibration
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=8oxiuJ2Jtnk
// Source: https://sudokupad.app/james-sinclair/calibration

// Standard Sudoku, plus arrows (arm sums to the circle digit), renban lines
// (non-repeating consecutive set, any order), an X clue (sum to 10, per this
// puzzle's rules text), and even (shaded) cells.
//
// Four circles each carry more than one drawn arm. The payload lists each arm
// as its own cell path sharing the circle, so each arm is encoded as its own
// Arrow constraint against that circle -- one Arrow per drawn segment, per
// the branch-encoding convention for multi-stroke lines.
const arrows = [
  new Arrow('R6C2', 'R7C1', 'R8C1'),
  new Arrow('R6C2', 'R7C3', 'R8C3'),
  new Arrow('R2C6', 'R1C7', 'R1C8'),
  new Arrow('R2C6', 'R3C7', 'R3C8'),
  new Arrow('R9C9', 'R8C8', 'R8C7', 'R7C7'),
  new Arrow('R4C4', 'R3C3', 'R2C3', 'R1C2'),
  new Arrow('R4C4', 'R5C5', 'R5C6'),
  new Arrow('R4C4', 'R5C4', 'R6C4'),
];

const renbans = [
  new Renban('R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9'),
  new Renban('R2C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C2', 'R8C2'),
];

// Even (shaded square) cells are a candidate restriction, not a distinct class.
const evens = ['R2C8', 'R1C9', 'R4C5', 'R8C5'].map(
  cell => new Given(cell, 2, 4, 6, 8));

return [
  new Shape('9x9'),
  ...arrows,
  ...renbans,
  new X('R2C9', 'R3C9'),
  ...evens,
];
