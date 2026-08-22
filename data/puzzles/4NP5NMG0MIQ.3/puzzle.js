// Title: Dec 31, 2021: Thermo Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=4NP5NMG0MIQ
// Source: https://tinyurl.com/2nvp5jpj

// Normal sudoku rules apply. Each thermometer's digits strictly increase from
// the round bulb to the tip, encoded with Thermo(bulb, ..., tip) in cell
// order along the drawn path. Thermometers 4 and 5 share the same two bulb
// cells (R8C8, R8C7) before branching into separate tips -- each branch is
// its own Thermo instance covering the shared cells plus its own tip cells,
// matching the two separately drawn lines.

const givens = [
  ['R1C4', 5], ['R1C8', 4], ['R2C1', 4], ['R4C9', 1],
  ['R6C1', 3], ['R8C9', 4], ['R9C2', 2], ['R9C6', 3],
].map(([cell, digit]) => new Given(cell, digit));

const thermos = [
  ['R4C4', 'R4C3', 'R3C2', 'R3C3', 'R3C4', 'R2C3', 'R2C2'],
  ['R5C6', 'R4C5', 'R3C5', 'R3C6', 'R4C7', 'R5C7'],
  ['R7C5', 'R7C4', 'R6C3', 'R6C4', 'R6C5', 'R5C4', 'R5C3'],
  ['R8C8', 'R8C7', 'R7C7', 'R6C7', 'R7C6'],
  ['R8C8', 'R8C7', 'R8C6'],
].map(cells => new Thermo(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
];
