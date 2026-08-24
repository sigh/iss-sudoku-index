// Title: Clone Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=6YB2c_8I0fU
// Source: https://app.crackingthecryptic.com/sudoku/jjmjLT7GqH

// Normal sudoku rules (default 9x9, rows/cols/boxes all-different). All
// regions of the same colour must hold the same digits in the same order.
//
// The payload's coloured underlays form three groups of separate 2-cell
// dominoes (not one connected region per colour): 6 red, 4 yellow, 3 blue.
// Every domino within a colour shares the same orientation (red/blue
// horizontal, yellow vertical), so each is a pure translate of the others --
// no rotation or reflection is drawn between them -- and the "same order"
// correspondence follows that shared visual direction, cell for cell:
// left-to-right for the horizontal colours, top-to-bottom for yellow.

const redDominoes = [
  ['R1C1', 'R1C2'],
  ['R2C8', 'R2C9'],
  ['R3C4', 'R3C5'],
  ['R7C2', 'R7C3'],
  ['R8C7', 'R8C8'],
  ['R9C5', 'R9C6'],
];
const yellowDominoes = [
  ['R2C1', 'R3C1'],
  ['R1C6', 'R2C6'],
  ['R8C3', 'R9C3'],
  ['R4C9', 'R5C9'],
];
const blueDominoes = [
  ['R1C4', 'R1C5'],
  ['R3C8', 'R3C9'],
  ['R6C7', 'R6C8'],
];

// SameValues with singleton sets forces exact equality across the whole
// list: one call per within-domino position (0 = first-drawn-direction cell,
// 1 = second), across every domino of that colour.
const cloneConstraints = [redDominoes, yellowDominoes, blueDominoes].flatMap(
  (dominoes) => [0, 1].map((pos) => {
    const posCells = dominoes.map((d) => d[pos]);
    return new SameValues(posCells.length, ...posCells);
  })
);

return [
  new Shape('9x9'),

  new Given('R2C3', 1),
  new Given('R2C5', 2),
  new Given('R2C7', 3),
  new Given('R5C2', 3),
  new Given('R5C3', 4),
  new Given('R5C5', 5),
  new Given('R5C7', 6),
  new Given('R5C8', 7),
  new Given('R8C1', 7),
  new Given('R8C5', 8),
  new Given('R8C9', 9),

  ...cloneConstraints,
];
