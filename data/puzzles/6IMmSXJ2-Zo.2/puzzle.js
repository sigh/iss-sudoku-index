// Title: That's 3 in the Top Right
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=6IMmSXJ2-Zo
// Source: https://tinyurl.com/3ceakdz7

// Normal sudoku with R1C9=3. Each arrow circle equals the sum of the remaining
// cells on its shaft. White and black dots have the stated difference and ratio.

// Arrow paths and dot pairs transcribed from the source payload, in its listed order.
const arrows = [
  ['R2C2', 'R2C3', 'R2C4', 'R2C5'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C8'],
  ['R8C8', 'R8C7', 'R8C6', 'R8C5'],
  ['R8C2', 'R7C2', 'R6C2', 'R5C2'],
  ['R7C3', 'R6C3', 'R5C3'],
  ['R3C3', 'R3C4', 'R3C5'],
  ['R3C7', 'R4C7', 'R5C7'],
  ['R7C7', 'R7C6', 'R7C5'],
  ['R3C6', 'R4C6', 'R5C6'],
  ['R7C4', 'R6C4', 'R5C4'],
];
const whiteDots = [['R3C8', 'R4C8'], ['R8C6', 'R8C7'], ['R7C4', 'R8C4']];
const differenceTwoDots = [['R7C2', 'R6C2'], ['R2C4', 'R2C3']];
const blackDots = [['R7C2', 'R8C2'], ['R8C8', 'R8C7'], ['R7C5', 'R7C6'], ['R7C6', 'R6C6']];
const ratioThreeDots = [['R2C8', 'R3C8'], ['R2C2', 'R2C3'], ['R2C6', 'R3C6']];

return [
  new Shape('9x9'),
  new Given('R1C9', 3),
  ...arrows.map(cells => new Arrow(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...differenceTwoDots.map(cells => new Pair(
    Pair.fnToKey((a, b) => Math.abs(a - b) === 2, 9),
    'difference 2',
    ...cells,
  )),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...ratioThreeDots.map(cells => new Pair(
    Pair.fnToKey((a, b) => a === 3 * b || b === 3 * a, 9),
    'ratio 3:1',
    ...cells,
  )),
];
