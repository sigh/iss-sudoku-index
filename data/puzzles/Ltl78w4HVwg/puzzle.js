// Title: Grodus
// Author: Jakhob and wooferzfg
// Video: https://www.youtube.com/watch?v=Ltl78w4HVwg
// Source: https://tinyurl.com/2kbpt78s

// Normal sudoku rules apply. The lines and circles are "double arrows": the
// sum of the digits on the line equals the sum of the digits in its two end
// circles. Digits may repeat if allowed by other rules, so no extra
// distinctness is added along any line or between a line and its circles.
// DoubleArrow(circleA, ...path, circleB) encodes exactly this:
// sum(path) == digit(circleA) + digit(circleB).
//
// Several circle cells anchor more than one double arrow (e.g. R2C7 is an
// endpoint of three arrows below); each occurrence below refers to the same
// grid cell, so its single value participates in every sum it anchors.
//
// Each line below is transcribed from the payload's `line`/`circle`
// geometry: every line's two endpoints are drawn circles, and its interior
// cells are its path.
const doubleArrows = [
  new DoubleArrow('R2C3', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7'),
  new DoubleArrow('R2C7', 'R1C8', 'R2C8', 'R3C8'),
  new DoubleArrow('R2C7', 'R2C6', 'R3C6'),
  new DoubleArrow('R3C5', 'R3C4', 'R2C3'),
  new DoubleArrow('R3C5', 'R4C5', 'R5C6', 'R6C7'),
  new DoubleArrow('R3C8', 'R4C7', 'R5C7', 'R6C7'),
  new DoubleArrow('R3C8', 'R4C9', 'R5C9', 'R6C9'),
  new DoubleArrow('R6C7', 'R7C6', 'R7C7', 'R8C7', 'R9C7'),
  new DoubleArrow('R4C1', 'R5C2', 'R4C3'),
  new DoubleArrow('R7C2', 'R8C2', 'R9C2'),
  new DoubleArrow('R9C2', 'R9C3', 'R9C4'),
  new DoubleArrow('R6C3', 'R7C4', 'R8C5', 'R8C6'),
];

// Givens, transcribed from the payload's grid.
const givens = [
  new Given('R1C1', 2),
  new Given('R9C9', 4),
];

return [new Shape('9x9'), ...doubleArrows, ...givens];
