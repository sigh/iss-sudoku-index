// Title: FEEDING FRIENDSy: Lettuce Experiment!
// Author: Ratfinkz
// Video: https://www.youtube.com/watch?v=X5fGvcke9r4
// Source: https://sudokupad.app/vdnlyzrag0

// Normal sudoku on the default 3x3 boxes, no givens.
//
// TEST TUBES: a drawn test tube on an edge means that pair is in a 1:2 ratio
// (one double the other) -- BlackDot, one per tube.
//
// ONE-WAY DOORS: a purple arrow drawn on an edge always points at the smaller
// of its two adjacent digits -- GreaterThan(largerCell, smallerCell), one per
// arrow. Each arrow is a 3-point glyph; its shared middle point is the tip
// (the smaller-digit cell) and its two outer points sit together in the
// larger-digit cell -- read directly off the source's own waypoints, cell by
// cell, not off any rendered arrowhead direction.
//
// Omitted: the maze path itself (#FRIENDSHIPGOALS) -- a self-avoiding route
// from the scientist's desk to the lettuce through the walled lab, stepping
// orthogonally or diagonally except through a 2x2 gap blocked by a rounded
// wall corner; the one-way doors' direction restriction on that path (the
// digit relation above is kept, only which way the path may cross is
// dropped); and TRIALS AND TRAILS, which requires every path segment inside
// a box to sum its position-matched digits to that box's clipboard number.
// The clipboard numbers are not decodable from the source: every clipboard's
// "paper" area carries the same stack of identical, evenly spaced ruled
// lines regardless of box, a texture rather than a rendered digit. Without a
// target number TRIALS AND TRAILS cannot be stated, and with it dropped the
// maze path and the doors' direction add no further fact about the finished
// grid's digits beyond the two clue families below (the path touches no
// given cell and pins no digit by itself).

const testTubes = [
  ['R3C6', 'R3C7'],
  ['R4C9', 'R5C9'],
  ['R6C1', 'R7C1'],
  ['R8C9', 'R9C9'],
  ['R1C8', 'R2C8'],
  ['R4C7', 'R4C8'],
];

// [largerDigitCell, smallerDigitCell] per arrow.
const oneWayDoors = [
  ['R4C4', 'R5C4'],
  ['R3C1', 'R3C2'],
  ['R3C5', 'R3C4'],
  ['R5C1', 'R5C2'],
  ['R1C3', 'R2C3'],
  ['R4C1', 'R4C2'],
  ['R3C4', 'R2C4'],
];

return [
  new Shape('9x9'),
  ...testTubes.map(cells => new BlackDot(...cells)),
  ...oneWayDoors.map(([hi, lo]) => new GreaterThan(hi, lo)),
];
