// Title: Dancing among the Stars
// Author: JC
// Video: https://www.youtube.com/watch?v=NUYcQ0hok48
// Source: https://app.crackingthecryptic.com/sudoku/rnTpr4Qp7p

// Normal sudoku rules apply -> default Shape('9x9'), standard boxes, no givens.
// Cages sum to their total -> Cage(sum, ...cells). Arrows sum to their circled
// cell -> Arrow(circle, ...arm). Between-line cells lie strictly between the
// two circled ends -> Between(...cells). White circles mark digits one apart
// -> WhiteDot(a, b). Quad circles require each listed value in one of the
// four surrounding cells -> Quad(topLeftCell, ...values).

// Cages: the four drawn 2x2 corner blocks.
const cages = [
  [25, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [30, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [30, 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [26, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
];

// Quad circles, drawn at a shared corner of four cells.
const quads = [
  ['R1C2', 8],
  ['R1C3', 5],
  ['R2C7', 2],
];

// White circles, one digit apart, drawn on adjacent cell edges.
const whiteDots = [
  ['R1C8', 'R2C8'],
  ['R9C4', 'R9C5'],
  ['R6C5', 'R6C6'],
  ['R2C2', 'R3C2'],
];

// Between line: a grey loop runs around the central 5x5 block's perimeter
// (16 cells), circled at its four corners (R3C3, R3C7, R7C7, R7C3). It is
// drawn as four straight sides meeting at those corners, so each side is its
// own between segment between the two corner circles it joins.
const betweenLines = [
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'],
  ['R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3'],
  ['R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3'],
];

// Arrows: circle cell first, then arm cells. R4C3, R4C7, R7C3, and R7C7 each
// anchor two arrows sharing one circled cell; R4C3 and R4C7 additionally
// carry their own drawn circle (distinct from the between line's corner
// circles) to show the shared bulb.
const arrows = [
  ['R4C3', 'R4C2', 'R3C1'],
  ['R4C3', 'R5C4', 'R4C5'],
  ['R4C7', 'R4C8', 'R5C8'],
  ['R4C7', 'R3C6', 'R2C6'],
  ['R7C7', 'R7C8', 'R8C9'],
  ['R7C7', 'R7C6', 'R8C5', 'R9C5'],
  ['R7C3', 'R8C4', 'R8C5'],
  ['R7C3', 'R6C2', 'R7C1'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...quads.map(([cell, ...values]) => new Quad(cell, ...values)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...betweenLines.map(cells => new Between(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
