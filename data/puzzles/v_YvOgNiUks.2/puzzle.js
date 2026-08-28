// Title: September 16, 2021: O/E Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=v_YvOgNiUks
// Source: https://tinyurl.com/35u229rn

// Normal sudoku rules apply. Digits along a thermometer increase, starting at
// the round bulb (the first cell of each Thermo below). Grey circles contain
// odd digits (encoded as multi-value Givens, since ISS has no Odd/Even
// class). Grey squares contain even digits. Thermometer bulbs are NOT
// necessarily odd -- no extra parity constraint is placed on bulb cells.
//
// The payload also shades each thermometer's bulb cell pink (#FFD0D0); those
// 9 cells are exactly the 9 bulbs listed below, so that shading is
// decorative (drawing the round bulb shape) and adds no separate rule.

// Thermometer cell paths, bulb (increasing-run start) first; as drawn.
const thermos = [
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7'],
  ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R3C4', 'R2C4', 'R1C4'],
  ['R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R9C3', 'R8C3', 'R7C3', 'R6C3', 'R5C3'],
];

// Grey-circle (odd) cells, as drawn.
const oddCells = [
  'R1C1', 'R2C4', 'R2C7', 'R3C5', 'R3C8', 'R4C2', 'R5C3',
  'R5C5', 'R5C8', 'R6C1', 'R6C2', 'R7C5', 'R7C8', 'R8C2', 'R8C6', 'R8C9',
];

// Grey-square (even) cells, as drawn.
const evenCells = [
  'R2C1', 'R2C5', 'R3C1', 'R3C2', 'R4C5', 'R4C8', 'R4C9', 'R5C2',
  'R5C7', 'R6C3', 'R6C5', 'R6C8', 'R7C2', 'R7C9', 'R8C8', 'R9C9',
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
];
