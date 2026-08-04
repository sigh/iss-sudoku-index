// Title: Archers On The Quad
// Author: SSG
// Video: https://www.youtube.com/watch?v=uZEkEqoB-NU
// Source: https://app.crackingthecryptic.com/sudoku/MpmpMtdtjF

// Normal sudoku on the default 3x3 boxes (regions in the payload equal the
// default boxes, so no explicit Regions/NoBoxes are needed).
//
// Twelve black-bordered circles are drawn straddling the four cells at a
// grid corner ("quad"), each printed with one or more digits. Every circle:
// each printed digit must appear at least once among its four surrounding
// cells -> Quad.
//
// Four arrows are drawn as bent lines, each with an arrowhead at one end and
// a plain unlabelled grey ring (no printed digit, distinct from the black
// quad circles) over its other end cell -> Arrow, bulb cell first: digits
// along the arm sum to the digit the solver places in the ringed cell.
//
// A fifth drawn arrow carries no waypoints at all (no cells, no matching
// grey-ring mark) -- treated as decorative/empty source noise, not a fifth
// clue.

return [
  new Shape('9x9'),

  // Quads -- one per drawn corner circle.
  new Quad('R2C2', 1, 2, 3, 5),
  new Quad('R2C7', 2, 3, 4, 6),
  new Quad('R7C2', 1, 2, 4, 6),
  new Quad('R7C7', 1, 3, 4, 5),
  new Quad('R8C3', 8),
  new Quad('R3C1', 4),
  new Quad('R1C6', 2),
  new Quad('R6C8', 3),
  new Quad('R3C4', 6),
  new Quad('R5C3', 7),
  new Quad('R4C6', 9),
  new Quad('R6C5', 8),

  // Arrows -- ringed bulb cell first, then arm cells.
  new Arrow('R3C6', 'R3C5', 'R2C5'),
  new Arrow('R4C3', 'R5C3', 'R5C2'),
  new Arrow('R6C7', 'R5C7', 'R5C8'),
  new Arrow('R7C4', 'R7C5', 'R8C5'),
];
