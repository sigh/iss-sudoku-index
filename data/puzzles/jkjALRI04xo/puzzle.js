// Title: A Tight Spot
// Author: Tundra Lava
// Video: https://www.youtube.com/watch?v=jkjALRI04xo
// Source: https://app.crackingthecryptic.com/cewxiqqtgm

// Normal Sudoku applies. Grey lines have circled endpoints; their intervening digits lie strictly between the endpoints. X and V markers give adjacent-cell sums of 10 and 5.
// The paths and marker pairs below are transcribed from the drawn grey lines, Xs, and V.
const betweenLines = [
  ['R4C2', 'R3C2', 'R2C1', 'R1C2', 'R2C2', 'R3C3', 'R2C3', 'R1C3', 'R2C4'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C8', 'R5C8', 'R6C9', 'R7C8', 'R7C7', 'R8C7', 'R9C6', 'R8C5', 'R8C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R8C9', 'R8C8', 'R9C8'],
  ['R6C3', 'R5C2', 'R5C3', 'R4C4', 'R3C5', 'R2C5', 'R3C6'],
  ['R6C7', 'R6C6', 'R7C6'],
];
const xs = [
  ['R2C9', 'R3C9'], ['R1C5', 'R2C5'], ['R2C4', 'R3C4'],
  ['R3C2', 'R3C3'], ['R2C2', 'R2C3'], ['R1C2', 'R1C3'],
  ['R8C3', 'R9C3'], ['R5C3', 'R5C4'], ['R5C5', 'R5C6'],
  ['R8C7', 'R9C7'], ['R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  new Given('R4C5', 2), new Given('R4C9', 8),
  new Given('R9C4', 6), new Given('R9C8', 7),
  ...betweenLines.map(cells => new Between(...cells)),
  ...xs.map(cells => new X(...cells)),
  new V('R2C6', 'R2C7'),
];
