// Title: Golden Arrows
// Author: Razor
// Video: https://www.youtube.com/watch?v=x7mZpCjcccs
// Source: https://app.crackingthecryptic.com/Hj6T8LmbB9

// Normal Sudoku rules apply. Each gold Nabner line has no repeated or
// consecutive pair of digits. Arrow arms sum to their circled digit. Shown
// V, X, and white-dot dominoes mean sums of 5, sums of 10, and consecutive
// digits respectively; only shown white dots are constrained.
const nabnerKey = PairX.fnToKey((a, b) => a !== b && Math.abs(a - b) !== 1, 9);
const nabnerLines = [
  ['R2C5', 'R2C6'],
  ['R2C7', 'R2C8', 'R2C9'],
  ['R3C1', 'R3C2', 'R3C3', 'R2C2', 'R1C3'],
  ['R4C4', 'R5C5', 'R5C6', 'R5C7'],
  ['R6C1', 'R5C1', 'R5C2'],
  ['R5C3', 'R6C3', 'R7C2'],
  ['R7C3', 'R7C4', 'R7C5'],
  ['R8C4', 'R8C5'],
  ['R7C6', 'R7C7', 'R6C7', 'R5C8'],
  ['R8C8', 'R8C9', 'R9C9'],
  ['R3C5', 'R3C6'],
];

// Gold line paths transcribed from the drawn gold strokes.
const nabners = nabnerLines.map(cells => new PairX(nabnerKey, 'Nabner', ...cells));

return [
  new Shape('9x9'),
  ...nabners,
  new Arrow('R6C3', 'R5C3', 'R4C3', 'R3C3', 'R3C4'),
  new Arrow('R4C7', 'R3C6', 'R3C5'),
  new Arrow('R7C3', 'R7C4', 'R7C5'),
  new Arrow('R9C2', 'R9C3', 'R8C3'),
  new Arrow('R5C7', 'R6C7', 'R7C7', 'R7C6'),
  new Arrow('R5C7', 'R5C6', 'R5C5', 'R4C4'),
  new V('R3C3', 'R4C3'),
  new V('R9C5', 'R9C6'),
  new X('R8C7', 'R9C7'),
  new WhiteDot('R8C3', 'R9C3'),
];
