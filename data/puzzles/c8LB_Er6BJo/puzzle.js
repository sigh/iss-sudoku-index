// Title: Thermometers
// Author: Mitchell Lee
// Video: https://www.youtube.com/watch?v=c8LB_Er6BJo
// Source: https://cracking-the-cryptic.web.app/sudoku/bfTRn4bqRJ

// Normal sudoku rules apply. Along thermometers, the digits must increase
// starting from the bulb. Nine 4-cell thermometers are arranged in a
// pinwheel, one per box except the centre box.

// Thermometers: bulb cell listed first (Thermo enforces strictly increasing
// from its first argument).
const thermos = [
  ['R1C2', 'R2C3', 'R3C2', 'R2C1'],
  ['R2C6', 'R1C5', 'R2C4', 'R3C5'],
  ['R2C9', 'R3C8', 'R2C7', 'R1C8'],
  ['R5C1', 'R4C2', 'R5C3', 'R6C2'],
  ['R5C4', 'R6C5', 'R5C6', 'R4C5'],
  ['R5C7', 'R4C8', 'R5C9', 'R6C8'],
  ['R7C8', 'R8C9', 'R9C8', 'R8C7'],
  ['R8C6', 'R7C5', 'R8C4', 'R9C5'],
  ['R8C3', 'R9C2', 'R8C1', 'R7C2'],
];

return [
  new Shape('9x9'),
  new Given('R1C6', 8),
  new Given('R4C9', 2),
  new Given('R5C5', 4),
  new Given('R8C2', 5),
  new Given('R9C6', 6),
  ...thermos.map((cells) => new Thermo(...cells)),
];
