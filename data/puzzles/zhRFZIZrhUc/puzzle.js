// Title: Royal Self Defense
// Author: Just Kirb
// Video: https://www.youtube.com/watch?v=zhRFZIZrhUc
// Source: https://app.crackingthecryptic.com/sudoku/rNqtfFJFhB

// Normal sudoku rules apply (default row/column/box all-different). Digits
// on an arrow sum to the value in its attached circle. Identical digits
// cannot be separated by a king's move in chess (global AntiKing).
//
// Arrow cells below are bulb-first, then arm cells in order along the drawn
// line, per the source's arrow waypoints and matching circle overlays.

const arrows = [
  ['R7C1', 'R8C2', 'R9C1'],
  ['R7C3', 'R6C3', 'R6C4', 'R7C4', 'R8C4', 'R8C3'],
  ['R7C7', 'R6C6', 'R7C6', 'R8C6'],
  ['R7C8', 'R7C9', 'R8C9', 'R9C9'],
  ['R5C5', 'R6C5', 'R7C5'],
  ['R4C6', 'R3C7', 'R2C8'],
  ['R4C4', 'R3C3', 'R3C2'],
  ['R3C5', 'R2C5', 'R1C5', 'R2C6', 'R2C7'],
  ['R5C3', 'R4C2', 'R3C1'],
];

return [
  new Shape('9x9'),
  new AntiKing(),
  ...arrows.map(cells => new Arrow(...cells)),
];
