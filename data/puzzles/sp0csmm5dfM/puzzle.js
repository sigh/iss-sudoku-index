// Title: Friendly robots
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=sp0csmm5dfM
// Source: https://sudokupad.app/ydam0gzn8q

// Normal sudoku rules apply. Arrows sum to their circled cell (circled cell
// first, then the arm cells). Each of the four circles has a fourth arrow
// that loops out around the nearby grid corner and back (drawn bent, its
// shaft rendered as a separate line with the arrowhead glyph at the far
// end): that loop revisits the first arm cell, so it counts twice, per the
// rules text. White dots mark consecutive digits on the four cell edges
// that each corner arrow's shaft straddles.
const arrows = [
  ['R2C2', 'R2C3', 'R2C4'],
  ['R2C2', 'R3C2', 'R4C2'],
  ['R2C2', 'R3C3', 'R4C4'],
  ['R2C2', 'R2C1', 'R2C1', 'R1C1', 'R1C2'],
  ['R2C8', 'R2C7', 'R2C6'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R2C8', 'R3C7', 'R4C6'],
  ['R2C8', 'R1C8', 'R1C8', 'R1C9', 'R2C9'],
  ['R8C2', 'R7C3', 'R6C4'],
  ['R8C2', 'R8C3', 'R7C4', 'R6C5'],
  ['R8C2', 'R9C2', 'R9C2', 'R9C1', 'R8C1'],
  ['R8C8', 'R7C7', 'R6C6'],
  ['R8C8', 'R7C8', 'R6C7'],
  ['R8C8', 'R8C9', 'R8C9', 'R9C9', 'R9C8'],
];

const whiteDots = [
  ['R1C1', 'R2C1'],
  ['R1C9', 'R2C9'],
  ['R8C9', 'R9C9'],
  ['R8C1', 'R9C1'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
