// Title: August 3: XV / Kropki Pairs
// Author: clover!
// Video: https://www.youtube.com/watch?v=iFQQ32faVwk
// Source: https://tinyurl.com/5b4wmakb

// Normal sudoku. Between the listed adjacent pairs: a white dot means the
// digits are consecutive, a black dot means one is double the other, X means
// the digits sum to 10, and V means they sum to 5. The ruleset states marks
// are not necessarily exhaustive, so unmarked pairs carry no constraint
// (encoded simply by omission).

const whiteDots = [
  ['R1C3', 'R1C4'],
  ['R9C6', 'R9C7'],
  ['R3C7', 'R4C7'],
  ['R6C3', 'R7C3'],
];

const blackDots = [
  ['R1C2', 'R1C3'],
  ['R2C2', 'R2C3'],
  ['R3C2', 'R3C3'],
  ['R7C7', 'R7C8'],
  ['R8C7', 'R8C8'],
  ['R9C7', 'R9C8'],
];

const xPairs = [
  ['R7C1', 'R8C1'],
  ['R7C2', 'R8C2'],
  ['R7C3', 'R8C3'],
  ['R2C7', 'R3C7'],
  ['R2C8', 'R3C8'],
  ['R2C9', 'R3C9'],
  ['R6C3', 'R6C4'],
  ['R4C6', 'R4C7'],
  ['R4C6', 'R5C6'],
  ['R5C4', 'R6C4'],
];

const vPairs = [
  ['R3C9', 'R4C9'],
  ['R6C1', 'R7C1'],
];

return [
  new Given('R1C1', 9),
  new Given('R1C8', 2),
  new Given('R1C9', 8),
  new Given('R2C1', 5),
  new Given('R8C9', 5),
  new Given('R9C1', 4),
  new Given('R9C2', 6),
  new Given('R9C9', 7),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...xPairs.map(cells => new X(...cells)),
  ...vPairs.map(cells => new V(...cells)),
];
