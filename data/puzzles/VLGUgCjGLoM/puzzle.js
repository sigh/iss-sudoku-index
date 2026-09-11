// Title: Knights & Archers Hold The Line
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=VLGUgCjGLoM
// Source: https://app.crackingthecryptic.com/sudoku/b4MTDfLJ8L

// Rules encoded, in full:
//   - Normal sudoku rules apply. (9x9, no givens.)
//   - Digits along each arrow must sum to the digit in that arrow's circle.
//   - Cells separated by a knight's move (in chess) cannot contain the same digit.
//   - On the diagonal (marked in blue) digits cannot repeat.
// Nothing is omitted.

// Drawn arrows, transcribed from the grid art: bulb cell first, then the arm
// cells in stroke order. Five circles carry arrows (R3C1, R5C5, R4C6, R6C4 and
// R7C9); R4C6, R6C4 and R7C9 each sprout more than one arm, and each arm is its
// own clue summing to the same circled digit.
const arrows = [
  ['R3C1', 'R4C2', 'R5C1'],
  ['R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C2'],
  ['R4C6', 'R3C5', 'R2C5'],
  ['R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R6C4', 'R7C3', 'R8C2', 'R8C1'],
  ['R6C4', 'R7C5', 'R8C6'],
  ['R7C9', 'R6C9', 'R5C9', 'R5C8'],
  ['R7C9', 'R7C8', 'R7C7', 'R7C6'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8'],
];

return [
  new Shape('9x9'),

  // The blue stroke runs corner to corner from R1C9 to R9C1: the anti-diagonal,
  // which ISS's Diagonal writes as direction 1 (the '/' diagonal).
  new Diagonal(1),

  new AntiKnight(),

  ...arrows.map(cells => new Arrow(...cells)),
];
