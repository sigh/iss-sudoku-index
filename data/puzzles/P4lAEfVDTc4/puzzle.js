// Title: Permanent Center of Gravity
// Author: The Autistic Kantian
// Video: https://www.youtube.com/watch?v=P4lAEfVDTc4
// Source: https://sudokupad.app/ct3ci25l66

// Standard 9x9 sudoku (rows, columns, boxes all-different). Both main
// diagonals (corner to corner each way) contain 1-9 exactly once. Arrows:
// digits along the shaft sum to the digit in the bulb, repeats allowed on
// the shaft. Kropki dots: black is a 1:2 ratio, white is consecutive; not
// all possible dots are drawn, so only the drawn pairs are constrained.
// Shaded cells (R8C2, R8C8) hold even digits.

const diagonals = [
  new Diagonal(1),
  new Diagonal(-1),
];

// Arrows: bulb cell first, then shaft cells (payload arrow #0-#6).
const arrows = [
  new Arrow('R4C1', 'R5C2', 'R5C3'),
  new Arrow('R6C9', 'R5C8', 'R5C7'),
  new Arrow('R8C1', 'R8C2', 'R7C3'),
  new Arrow('R8C9', 'R8C8', 'R7C7'),
  new Arrow('R2C1', 'R2C2', 'R3C3'),
  new Arrow('R2C9', 'R2C8', 'R3C7'),
  new Arrow('R6C5', 'R7C5', 'R8C5'),
];

// Kropki dots (payload overlays #7-#9): black-filled = ratio, white-filled
// with black border = consecutive.
const dots = [
  new BlackDot('R7C6', 'R7C7'),
  new WhiteDot('R7C5', 'R8C5'),
  new WhiteDot('R7C3', 'R7C4'),
];

// Shaded squares (payload underlays), restricted to even digits.
const shading = [
  new Given('R8C2', 2, 4, 6, 8),
  new Given('R8C8', 2, 4, 6, 8),
];

return [
  new Shape('9x9'),
  ...diagonals,
  ...arrows,
  ...dots,
  ...shading,
];
