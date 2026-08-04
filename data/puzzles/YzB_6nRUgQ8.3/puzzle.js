// Title: 2/19: Good Title
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=YzB_6nRUgQ8
// Source: https://tinyurl.com/bdf5ftsj

// Normal sudoku rules apply. Thermo(...) already encodes strictly-increasing
// bulb-to-tip. AntiConsecutive is the global "no orthogonally adjacent cells
// may differ by 1" rule, stated to apply to the whole grid (not just the
// thermometers).

// Thermometer cells, bulb first, transcribed from the raw payload's
// `thermometer[].lines[0]` arrays.
const thermos = [
  ['R4C2', 'R4C3', 'R4C4', 'R4C5'],
  ['R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R2C4', 'R2C5', 'R2C6', 'R2C7'],
  ['R8C3', 'R8C4', 'R8C5', 'R8C6'],
  ['R7C4', 'R7C5', 'R7C6', 'R7C7'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'],
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'],
  ['R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...thermos.map(cells => new Thermo(...cells)),
];
