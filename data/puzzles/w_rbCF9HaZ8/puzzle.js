// Title: Gridlocked
// Author: Marushia Dark
// Video: https://www.youtube.com/watch?v=w_rbCF9HaZ8
// Source: https://app.crackingthecryptic.com/sudoku/PMJMhpmR8r
//
// Normal sudoku (standard 3x3 boxes). Digits along an arrow sum to the digit
// in its attached circle; digits may repeat along an arrow, which is already
// Arrow's default behaviour (no cell-distinctness along the tail), so that
// clause needs no extra encoding.
//
// Three circles each have two separate arrow arms (one circle, two tails);
// each arm is its own Arrow(circle, ...tail) sharing the same circle cell.
// Circle/arm cells were read from the arrow wayPoints and matching circle
// overlays -- every arrow's first path cell is its circle.

const GIVENS = [
  ['R1C1', 1],
  ['R1C6', 6],
  ['R3C6', 7],
];

// circle -> array of arms; each arm is the tail cells (circle excluded),
// ordered from the circle outward.
const ARROWS = [
  { circle: 'R1C8', arms: [['R1C7', 'R2C7']] },
  { circle: 'R1C9', arms: [['R2C9', 'R2C8', 'R3C8']] },
  { circle: 'R3C9', arms: [['R4C9', 'R5C9']] },
  { circle: 'R6C9', arms: [['R6C8', 'R5C8']] },
  { circle: 'R6C7', arms: [['R5C7', 'R4C7']] },
  { circle: 'R4C8', arms: [['R4C7', 'R4C6'], ['R3C7']] },
  { circle: 'R4C5', arms: [['R5C6', 'R4C6']] },
  { circle: 'R2C6', arms: [['R1C5', 'R1C4']] },
  { circle: 'R2C5', arms: [['R3C5', 'R2C4', 'R1C3']] },
  { circle: 'R2C3', arms: [['R1C2', 'R2C1']] },
  { circle: 'R2C2', arms: [['R3C1', 'R4C1']] },
  { circle: 'R5C1', arms: [['R4C2', 'R5C2']] },
  { circle: 'R3C3', arms: [['R4C4', 'R3C4']] },
  { circle: 'R3C2', arms: [['R4C3', 'R5C3']] },
  { circle: 'R6C2', arms: [['R6C1', 'R7C2'], ['R7C1']] },
  { circle: 'R8C1', arms: [['R7C2', 'R7C3']] },
  { circle: 'R9C1', arms: [['R9C2', 'R8C2']] },
  { circle: 'R9C9', arms: [['R8C9', 'R7C9']] },
  { circle: 'R9C8', arms: [['R8C8', 'R7C8']] },
  { circle: 'R7C7', arms: [['R6C6', 'R5C5']] },
  { circle: 'R8C6', arms: [['R8C7', 'R9C7']] },
  { circle: 'R8C5', arms: [['R7C6', 'R6C5']] },
  { circle: 'R9C4', arms: [['R9C5', 'R9C6']] },
  { circle: 'R8C3', arms: [['R8C4', 'R9C3']] },
  { circle: 'R7C4', arms: [['R6C3', 'R5C4'], ['R7C5', 'R6C4', 'R5C4']] },
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...ARROWS.flatMap(
    ({ circle, arms }) => arms.map(arm => new Arrow(circle, ...arm))),
];
