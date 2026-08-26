// Title: Middle Distance
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=5mgX30msap8
// Source: https://tinyurl.com/middle-dist
//
// Normal sudoku rules apply. Every blue dot joins two orthogonally-adjacent
// cells; each dot's difference must equal the digit in the center cell of
// the box that dot lies in ("the gray central digit of their box").
// |a - b| = c is encoded as the disjunction a = b + c OR b = a + c.

// Blue dots (from the circle overlay), grouped by the box whose center
// cell supplies the target digit for that group.
const dotGroups = [
  { center: 'R2C2', dots: [['R1C3', 'R2C3'], ['R2C2', 'R2C3']] },
  { center: 'R2C5', dots: [['R2C6', 'R3C6'], ['R2C4', 'R3C4'], ['R1C4', 'R1C5'], ['R1C5', 'R1C6']] },
  { center: 'R2C8', dots: [['R1C7', 'R2C7'], ['R2C7', 'R2C8']] },
  { center: 'R5C2', dots: [['R4C1', 'R4C2'], ['R4C1', 'R5C1'], ['R6C2', 'R6C3'], ['R5C3', 'R6C3']] },
  { center: 'R5C8', dots: [['R5C7', 'R6C7'], ['R6C7', 'R6C8'], ['R4C8', 'R4C9'], ['R4C9', 'R5C9']] },
  { center: 'R8C2', dots: [['R7C3', 'R8C3']] },
  { center: 'R8C5', dots: [['R8C4', 'R8C5']] },
  { center: 'R8C8', dots: [['R7C7', 'R8C7']] },
  // Box 5 (center R5C5) has no blue dot, so its central digit is never
  // referenced.
];

const diffDots = dotGroups.flatMap(({ center, dots }) =>
  dots.map(([a, b]) => new Or([
    new EqualSum([a], [b, center]),
    new EqualSum([b], [a, center]),
  ]))
);

return [
  new Shape('9x9'),
  new Given('R4C5', 6),
  new Given('R9C1', 1),
  new Given('R9C9', 4),
  ...diffDots,
];
