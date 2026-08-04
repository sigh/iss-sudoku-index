// Title: Nine Bent Arrows, One Straight
// Author: Rodrigo Mahu
// Video: https://www.youtube.com/watch?v=jz5kTO6LHkk
// Source: https://app.crackingthecryptic.com/sudoku/h2jhgN93q8

// Normal sudoku rules apply (default rows/cols/3x3 boxes). Digits along an
// arrow sum to the digit in that arrow's circle: each Arrow's first cell is
// the circle, the rest are the shaft. Two circles (R8C6 and R8C4) each anchor
// two independent arrows, giving ten Arrow constraints from eight circles.
const arrows = [
  ['R8C6', 'R7C7', 'R7C8'],
  ['R8C6', 'R9C7', 'R9C8'],
  ['R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R3C6', 'R2C7', 'R1C8', 'R1C9'],
  ['R8C4', 'R9C3', 'R9C2'],
  ['R8C4', 'R7C3', 'R7C2'],
  ['R3C4', 'R2C3', 'R2C2', 'R1C1'],
  ['R5C9', 'R6C8', 'R7C9'],
  ['R3C1', 'R4C2', 'R5C3', 'R4C4'],
  ['R3C8', 'R4C8', 'R5C7'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
