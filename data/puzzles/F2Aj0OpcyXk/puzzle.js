// Title: Unique Bulb Thermo Sudoku
// Author: Justin Smart
// Video: https://www.youtube.com/watch?v=F2Aj0OpcyXk
// Source: https://cracking-the-cryptic.web.app/sudoku/9tqB8rLGb9

// Normal sudoku rules apply. Digits increase along thermometers from the
// bulb to the end. For some thermometers only the bulb is drawn; the nine
// bulb cells in the grid (six with drawn thermometers, three bulb-only)
// together contain the digits 1-9.

// Thermometer cell lists (bulb -> end), from the drawn grey lines. Two of
// the six lines are drawn tip-first in the source; their cells are listed
// here already reversed to bulb-first order.
const thermos = [
  ['R3C8', 'R4C7', 'R5C7', 'R6C8', 'R6C9'],
  ['R1C8', 'R1C7', 'R1C6'],
  ['R9C8', 'R8C7', 'R9C6', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5'],
  ['R1C5', 'R2C4', 'R3C3', 'R3C4', 'R4C4'],
  ['R7C3', 'R6C2', 'R5C1'],
  ['R9C1', 'R9C2', 'R9C3'],
];

// The nine bulb cells: the six thermometer bulbs above, plus three
// bulb-only thermometers with no drawn body (R2C2, R4C1, R7C2).
const bulbs = [
  'R3C8', 'R1C8', 'R9C8', 'R1C5', 'R7C3', 'R9C1',
  'R2C2', 'R4C1', 'R7C2',
];

return [
  new Shape('9x9'),

  new Given('R1C6', 8),
  new Given('R3C9', 9),
  new Given('R5C9', 6),
  new Given('R6C6', 4),
  new Given('R8C6', 6),
  new Given('R9C5', 7),
  new Given('R9C7', 9),

  ...thermos.map((cells) => new Thermo(...cells)),

  // "the nine bulbs in the grid contain the digits 1-9": exactly 9 cells
  // over a 1-9 domain, so all-different forces each digit to appear once.
  new AllDifferent(...bulbs),
];
