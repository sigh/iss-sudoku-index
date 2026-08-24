// Title: How Very Odd!
// Author: clover
// Video: https://www.youtube.com/watch?v=_q1bpmAGU5c
// Source: https://app.crackingthecryptic.com/sudoku/2786N2rgLR

// Normal sudoku rules apply (default 9x9 shape, default 3x3 boxes).
// A cell with a grey circle must contain an odd digit; a cell with a grey
// square must contain an even digit -- there is no dedicated Odd/Even class,
// so each is a multi-value Given restricting the cell's candidates.
// Along thermometers, digits must increase from the bulb end.

const oddCells = ['R2C3', 'R4C9', 'R9C4'];
const evenCells = [
  'R2C6', 'R4C4', 'R4C6', 'R4C8',
  'R6C2', 'R6C4', 'R6C6', 'R7C7', 'R8C4',
];

// Thermometers: bulb cell first (increasing from the bulb), from the
// deepskyblue thermometer lines. The matching deepskyblue circle underlays
// sit exactly on each thermometer's own bulb cell -- decorative rendering of
// the bulb, not a separate clue.
const thermos = [
  ['R2C5', 'R2C6', 'R2C7', 'R3C8', 'R4C8', 'R5C8'],
  ['R3C5', 'R4C4', 'R5C3'],
  ['R5C6', 'R6C7', 'R7C6', 'R6C5'],
  ['R6C8', 'R7C9', 'R8C9'],
  ['R8C5', 'R8C4', 'R8C3', 'R7C2', 'R6C2', 'R5C2'],
  ['R9C8', 'R9C7', 'R8C6'],
];

return [
  new Shape('9x9'),

  new Given('R1C9', 6),
  new Given('R5C5', 5),
  new Given('R9C1', 4),

  ...oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map((cell) => new Given(cell, 2, 4, 6, 8)),

  ...thermos.map((cells) => new Thermo(...cells)),
];
