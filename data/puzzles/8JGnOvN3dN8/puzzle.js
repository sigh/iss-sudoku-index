// Title: Unity
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=8JGnOvN3dN8
// Source: https://app.crackingthecryptic.com/sudoku/TgFnFH8Jt8

// Normal sudoku rules apply (standard 3x3 box regions, no givens). Digits
// along an arrow sum to the digit in that arrow's circle: Arrow(bulb, ...arm)
// encodes that directly. Digits along a purple line form a non-repeating
// consecutive set in any order: Renban(...cells) is exactly that rule.
//
// Two circles (R5C1, R5C9) each anchor two independent arrows -- one circle,
// two arms, each arm summing to that circle's digit -- confirmed by the
// payload drawing two separate arrow paths from the same bulb cell.
// The purple lines through R5C1 and R5C9 pass through those same circle
// cells; a purple line has no bulb/direction concept, so the circle sitting
// on the path is ordinary line membership, not a split point.

const arrows = [
  new Arrow('R2C3', 'R3C4', 'R4C4'),
  new Arrow('R2C5', 'R3C5', 'R4C5', 'R5C4'),
  new Arrow('R2C7', 'R3C6', 'R4C6'),
  new Arrow('R5C9', 'R4C8', 'R3C9'),
  new Arrow('R5C9', 'R6C8', 'R7C9'),
  new Arrow('R9C8', 'R8C8', 'R8C9'),
  new Arrow('R8C7', 'R7C6', 'R6C6'),
  new Arrow('R8C5', 'R7C5', 'R6C5', 'R5C6'),
  new Arrow('R8C3', 'R7C4', 'R6C4'),
  new Arrow('R5C1', 'R6C2', 'R7C1'),
  new Arrow('R5C1', 'R4C2', 'R3C1'),
];

const renbans = [
  new Renban('R6C1', 'R5C1', 'R4C1'),
  new Renban('R2C1', 'R1C1', 'R1C2'),
  new Renban('R7C1', 'R8C1', 'R9C1'),
  new Renban('R4C9', 'R5C9', 'R6C9'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...renbans,
];
