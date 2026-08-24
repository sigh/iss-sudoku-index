// Title: Shuffled Arrows
// Author: Elias Kar
// Video: https://www.youtube.com/watch?v=Hx34yZsagOQ
// Source: https://app.crackingthecryptic.com/sudoku/TNhbGfbMtF

// Normal sudoku on the default 9x9 grid (rows/columns/3x3 boxes), plus a
// global AntiConsecutive (orthogonally adjacent cells cannot hold consecutive
// digits) and 12 Arrows: digits along each arrow sum to the digit in its
// circle. No digits are given.
//
// Arrow bulbs: the payload's arrow waypoints record a fractional/off-centre
// start point for each arrow, and one of them (arrow to R1C1) lands exactly
// on the boundary between two cells, so the bulb cell was taken from the
// payload's own circle overlay nearest that start point rather than from
// naive waypoint rounding (14 circle overlays are drawn; 12 sit on-grid at
// one arrow start apiece and were each matched to exactly one arrow, and 2
// sit off-grid at R10C10/R0C0 with an all-white fill/border and draw
// nothing). Arm cells were then interpolated along each straight/diagonal
// waypoint segment from that confirmed bulb.

const arrows = [
  new Arrow('R1C1', 'R2C1', 'R3C1', 'R2C2'),
  new Arrow('R2C3', 'R1C4'),
  new Arrow('R3C6', 'R3C5', 'R3C4'),
  new Arrow('R3C8', 'R3C7', 'R4C8'),
  new Arrow('R5C8', 'R5C7', 'R4C8'),
  new Arrow('R4C5', 'R5C5', 'R6C5', 'R7C5'),
  new Arrow('R5C6', 'R4C7'),
  new Arrow('R5C2', 'R4C2', 'R4C3'),
  new Arrow('R6C2', 'R5C3', 'R4C4'),
  new Arrow('R6C4', 'R7C4', 'R7C3'),
  new Arrow('R8C3', 'R7C2', 'R7C3'),
  new Arrow('R9C2', 'R9C3', 'R8C2'),
];

return [
  new Shape('9x9'),
  ...arrows,
  new AntiConsecutive(),
];
