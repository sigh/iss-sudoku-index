// Title: Cycles of Time and Tide
// Author: zetamath
// Video: https://www.youtube.com/watch?v=g2PUwXrKogU
// Source: https://sudokupad.app/z417emg43r

const regionSumLines = [
  ['R1C5', 'R1C4', 'R1C3', 'R1C2', 'R2C1', 'R3C2', 'R3C3', 'R4C4', 'R4C5'],
  ['R8C3', 'R7C3', 'R6C3', 'R5C3', 'R5C2', 'R6C2', 'R7C2', 'R8C2'],
  ['R5C8', 'R5C7', 'R5C6', 'R4C6', 'R3C6', 'R2C6', 'R3C7', 'R3C8'],
];

const entropicLines = [
  // These two source strokes meet at R4C9 and form one continuous line.
  ['R4C7', 'R4C8', 'R4C9', 'R5C9'],
  ['R7C5', 'R8C5', 'R9C5', 'R9C6', 'R9C7'],
  ['R8C9', 'R8C8', 'R8C7', 'R7C7'],
  ['R2C5', 'R2C4', 'R3C4', 'R3C5'],
  ['R9C3', 'R9C4', 'R8C4'],
];

const blackDots = [
  ['R7C2', 'R7C3'],
  ['R6C8', 'R7C8'],
];

return [
  new Shape('9x9'),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  new Palindrome('R8C6', 'R7C6', 'R6C6', 'R6C5', 'R6C4'),
  ...entropicLines.map(cells => new Entropic(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
