// Title: It's April, Phil
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=R6i558mDoNQ
// Source: https://tinyurl.com/4yat8h6w

const givens = [
  ['R1C1', 1],
  ['R1C2', 4],
  ['R3C7', 1],
  ['R3C8', 4],
  ['R5C4', 1],
  ['R5C6', 4],
  ['R7C2', 1],
  ['R7C3', 4],
  ['R9C8', 1],
  ['R9C9', 4],
];

const whiteDots = [
  ['R3C4', 'R2C4'],
  ['R8C6', 'R7C6'],
  ['R5C2', 'R4C2'],
  ['R5C2', 'R5C1'],
  ['R5C8', 'R5C9'],
  ['R9C2', 'R9C1'],
  ['R7C4', 'R6C4'],
  ['R3C6', 'R4C6'],
  ['R2C8', 'R1C8'],
  ['R1C8', 'R1C9'],
  ['R3C3', 'R2C3'],
  ['R8C7', 'R7C7'],
  ['R6C9', 'R6C8'],
];
const blackDots = [
  ['R2C5', 'R2C4'],
  ['R8C6', 'R8C5'],
  ['R7C7', 'R7C6'],
  ['R3C3', 'R3C4'],
  ['R5C1', 'R6C1'],
  ['R4C9', 'R5C9'],
  ['R5C8', 'R6C8'],
  ['R8C2', 'R9C2'],
  ['R4C1', 'R4C2'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whiteDots.map(edge => new WhiteDot(...edge)),
  ...blackDots.map(edge => new BlackDot(...edge)),
];
