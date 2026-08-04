// Title: 40 or 40?
// Author: Dumediat
// Video: https://www.youtube.com/watch?v=gGLRGRxyXoo
// Source: https://app.crackingthecryptic.com/sudoku/p7BFgm34QT
//
// Normal sudoku on the standard 3x3 boxes. White dots (WhiteDot) are drawn
// consecutive pairs; black dots (BlackDot) are drawn 1:2-ratio pairs. Not
// all such dots are given, so undrawn adjacent pairs carry no constraint
// (no StrictKropki negative).
//
// Every outside clue reads "40". Per the rules, each one independently is
// either (a) the sum of the digits from the 1 to the 9 inclusive of both
// ends in that row/column, or (b) an X-Sum: the sum of the first X cells
// from that side, where X is the first digit seen. Which reading applies to
// which clue is left for the solver to determine, so each clue is encoded
// as Or(inclusive-sandwich(40), XSum(40)).
//
// ISS's built-in Sandwich sums only the digits strictly BETWEEN the 1 and
// the 9 (excluding both). An inclusive sum of 40 (endpoints 1 and 9 counted
// in) is arithmetically the same constraint as an exclusive Sandwich sum of
// 40 - 1 - 9 = 30, so Sandwich(30) is used for the inclusive reading.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Outside clues: [value, ray start cell, direction], one per drawn "40"
// badge (source overlays: left-of-row and top-of-column circles).
const outsideClues = [
  [40, 'R1C1', [0, 1]],  // left of R1
  [40, 'R3C1', [0, 1]],  // left of R3
  [40, 'R7C1', [0, 1]],  // left of R7
  [40, 'R9C1', [0, 1]],  // left of R9
  [40, 'R1C3', [1, 0]],  // top of C3
  [40, 'R1C6', [1, 0]],  // top of C6
  [40, 'R1C9', [1, 0]],  // top of C9
];

const outsideOrs = outsideClues.map(([value, start, [dRow, dCol]]) => {
  const cells = graph.ray(start, dRow, dCol);
  return new Or([
    Sandwich.fromCells(value - 10, cells, geometry),
    XSum.fromCells(value, cells, geometry),
  ]);
});

return [
  new Shape('9x9'),

  // White dots: consecutive pair. (source overlays: edge marks, white fill)
  new WhiteDot('R1C5', 'R2C5'),
  new WhiteDot('R1C9', 'R2C9'),
  new WhiteDot('R4C7', 'R4C8'),
  new WhiteDot('R7C4', 'R7C5'),
  new WhiteDot('R5C5', 'R6C5'),
  new WhiteDot('R5C3', 'R6C3'),
  new WhiteDot('R4C3', 'R5C3'),
  new WhiteDot('R2C1', 'R3C1'),

  // Black dots: 1:2 ratio pair. (source overlays: edge marks, black fill)
  new BlackDot('R7C1', 'R8C1'),
  new BlackDot('R9C7', 'R9C8'),
  new BlackDot('R4C7', 'R5C7'),
  new BlackDot('R2C5', 'R3C5'),
  new BlackDot('R1C1', 'R1C2'),

  ...outsideOrs,
];
