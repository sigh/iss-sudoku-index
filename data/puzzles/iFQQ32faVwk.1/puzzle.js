// Title: August 5, 2023: Boustrophedon
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=iFQQ32faVwk
// Source: https://tinyurl.com/mr26dd3h

// Normal sudoku rules apply.
// Thermo: digits strictly increase from bulb (first cell of each list, the
// rounded end) to tip. Each thermometer below is transcribed straight from
// the payload's `thermometer[].lines` entries, one Thermo per entry, cells
// already in bulb-to-tip order.
const thermos = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R1C8', 'R1C9', 'R2C9', 'R2C8', 'R2C7', 'R2C6'],
  ['R2C5', 'R2C4', 'R2C3', 'R2C2', 'R2C1', 'R3C1'],
  ['R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R3C7', 'R3C8', 'R3C9'],
  ['R4C9', 'R4C8'],
  ['R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3'],
  ['R5C3', 'R5C4', 'R5C5'],
  ['R4C2', 'R4C1', 'R5C1', 'R5C2'],
  ['R5C6', 'R5C7'],
  ['R5C8', 'R5C9', 'R6C9'],
  ['R6C8', 'R6C7', 'R6C6', 'R6C5'],
  ['R6C4', 'R6C3', 'R6C2', 'R6C1'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4'],
  ['R7C5', 'R7C6', 'R7C7', 'R7C8'],
  ['R7C9', 'R8C9', 'R8C8'],
  ['R8C7', 'R8C6'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
];
