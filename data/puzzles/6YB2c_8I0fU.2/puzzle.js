// Title: Quadruples
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=6YB2c_8I0fU
// Source: https://app.crackingthecryptic.com/sudoku/M6drp6dh8g

// Normal sudoku on the default 3x3 boxes (regions in the payload equal the
// default boxes, so no explicit Regions/NoBoxes are needed).
//
// Twelve black-bordered white circles are drawn straddling the four cells at
// a grid corner ("quad"), each printed with digits (split across two small
// text marks above and below the corner point in the payload, which combine
// into one digit list per circle). Every circle: each printed digit must
// appear at least once among its four surrounding cells -> Quad.

return [
  new Shape('9x9'),

  // Quads -- one per drawn corner circle.
  new Quad('R1C5', 2, 3, 4, 5),
  new Quad('R2C7', 2, 3, 7, 8),
  new Quad('R5C8', 1, 2, 3, 4),
  new Quad('R7C7', 4, 5, 6, 7),
  new Quad('R8C4', 2, 3, 6, 7),
  new Quad('R7C2', 2, 3, 7, 9),
  new Quad('R4C1', 2, 4, 6, 9),
  new Quad('R2C2', 2, 3, 4, 5),
  new Quad('R4C4', 1, 2, 4, 5),
  new Quad('R4C5', 2, 3, 5, 6),
  new Quad('R5C4', 4, 5, 7, 8),
  new Quad('R5C5', 5, 6, 8, 9),
];
