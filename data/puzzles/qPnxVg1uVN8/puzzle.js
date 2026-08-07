// Title: Dots & Arrows
// Author: Ella Torch
// Video: https://www.youtube.com/watch?v=qPnxVg1uVN8
// Source: https://app.crackingthecryptic.com/sudoku/7fhJrR24JR

// Normal sudoku rules apply (default 3x3 boxes, matching the drawn regions).
// No given digits.
//
// Arrows: digits along the arm sum to the total held in the attached bulb --
// a single-cell circle (Arrow) or a two-cell pill (PillArrow, read in the
// pill's own left-to-right / top-to-bottom order per the rules text).
//
// Dots: a white dot joins two consecutive digits (WhiteDot), a black dot
// joins two digits in a 1:2 ratio (BlackDot). The rules state dots are not
// exhaustively marked, so an undotted adjacent pair carries no information --
// plain WhiteDot/BlackDot (not StrictKropki) is the faithful reading.

const arrows = [
  new Arrow('R3C7', 'R2C7', 'R2C8', 'R2C9'),
  new PillArrow(2, 'R3C5', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R5C5', 'R4C5'),
  new Arrow('R3C1', 'R3C2', 'R2C2'),
  new PillArrow(2, 'R4C3', 'R4C4', 'R5C3', 'R5C2', 'R5C1', 'R6C1'),
  new PillArrow(2, 'R7C5', 'R8C5', 'R9C5', 'R9C4'),
  new Arrow('R8C6', 'R8C7', 'R7C7'),
  new PillArrow(2, 'R5C8', 'R6C8', 'R5C9', 'R4C9'),
];

const whiteDots = [
  ['R1C6', 'R1C7'],
  ['R1C5', 'R2C5'],
  ['R2C4', 'R2C5'],
  ['R3C6', 'R3C7'],
  ['R3C1', 'R4C1'],
  ['R6C1', 'R7C1'],
  ['R9C6', 'R9C7'],
].map(cells => new WhiteDot(...cells));

const blackDots = [
  ['R8C7', 'R9C7'],
  ['R6C7', 'R7C7'],
  ['R7C3', 'R8C3'],
  ['R2C1', 'R2C2'],
  ['R4C6', 'R5C6'],
  ['R5C6', 'R6C6'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...arrows,
  ...whiteDots,
  ...blackDots,
];
