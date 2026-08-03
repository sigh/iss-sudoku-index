// Title: In the Proximity
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=FCn0OrvbDBg
// Source: https://app.crackingthecryptic.com/sudoku/RGLfL4BgJ2

// Normal sudoku rules apply (standard 3x3 boxes; default Shape).
// Purple lines: digits form a consecutive set, in any order -> Renban.
// Arrows: shaft digits sum to exactly one more or one less than the
// circle digit -- never equal. No dedicated class expresses this "off by
// one" sum, so each arrow is the disjunction of the two linear equations
// shaft_sum - circle = 1 and shaft_sum - circle = -1, via Or/Sum with
// coefficients (circle cell at coefficient -1).

const renbans = [
  ['R1C5', 'R2C5', 'R3C5'],
  ['R2C7', 'R3C7'],
  ['R2C8', 'R2C9'],
  ['R4C2', 'R4C1', 'R5C1'],
  ['R4C4', 'R5C4'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R4C8', 'R5C9'],
  ['R8C3', 'R9C2'],
  ['R7C4', 'R7C5', 'R8C5'],
].map(cells => new Renban(...cells));

// [circle, ...shaft] per arrow; the circle is each arrow's bulb (first) cell.
const arrows = [
  ['R1C1', 'R2C2', 'R3C1'],
  ['R2C3', 'R3C4', 'R4C3'],
  ['R2C4', 'R2C5', 'R2C6', 'R1C5'],
  ['R2C9', 'R3C9', 'R3C8'],
  ['R6C3', 'R6C2', 'R6C1'],
  ['R6C4', 'R5C4', 'R4C4'],
  ['R6C5', 'R5C5', 'R4C5'],
  ['R6C6', 'R5C6', 'R4C6'],
  ['R6C7', 'R7C7', 'R7C6', 'R8C6'],
  ['R6C8', 'R7C8', 'R7C9', 'R6C9'],
  ['R7C1', 'R8C2', 'R7C3'],
  ['R8C5', 'R9C4', 'R9C3'],
  ['R9C8', 'R9C7', 'R8C7'],
].map(([circle, ...shaft]) => new Or([
  new Sum(1, ...shaft, [circle, -1]),
  new Sum(-1, ...shaft, [circle, -1]),
]));

return [
  new Shape('9x9'),
  ...renbans,
  ...arrows,
];
