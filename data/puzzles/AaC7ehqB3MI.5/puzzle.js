// Title: 6/2/23: Duplication Glitch
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=AaC7ehqB3MI
// Source: https://tinyurl.com/462m4zf9

// Normal sudoku rules apply.
// Clone: the 25 shaded cells split into five disjoint plus-pentominoes
// (a centre cell plus its four orthogonal neighbours), each a pure
// translate of the others -- same shape, same orientation, no rotation
// or reflection. The rule text ("same digits in the same relative
// positions") is encoded as one SameValues(5, ...) call per relative
// slot (centre, up, down, left, right), each binding the corresponding
// cell across all five pentominoes.
const pentominoes = {
  a: { center: 'R2C2', up: 'R1C2', down: 'R3C2', left: 'R2C1', right: 'R2C3' },
  b: { center: 'R3C8', up: 'R2C8', down: 'R4C8', left: 'R3C7', right: 'R3C9' },
  c: { center: 'R4C4', up: 'R3C4', down: 'R5C4', left: 'R4C3', right: 'R4C5' },
  d: { center: 'R7C7', up: 'R6C7', down: 'R8C7', left: 'R7C6', right: 'R7C8' },
  e: { center: 'R8C3', up: 'R7C3', down: 'R9C3', left: 'R8C2', right: 'R8C4' },
};
const keys = Object.keys(pentominoes);
const slots = ['center', 'up', 'down', 'left', 'right'];
const cloneConstraints = slots.map(
  slot => new SameValues(keys.length, ...keys.map(k => pentominoes[k][slot])));

return [
  new Shape('9x9'),

  new Given('R1C4', 1), new Given('R1C6', 7),
  new Given('R2C5', 3), new Given('R2C7', 5),
  new Given('R3C6', 5),
  new Given('R4C1', 2),
  new Given('R5C2', 4), new Given('R5C7', 7),
  new Given('R6C1', 8), new Given('R6C3', 6), new Given('R6C8', 3),
  new Given('R7C2', 6), new Given('R7C5', 8), new Given('R7C9', 5),
  new Given('R8C6', 2),
  new Given('R9C7', 4),

  ...cloneConstraints,
];
