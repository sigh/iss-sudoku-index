// Title: Thermo Between
// Author: clover!
// Video: https://www.youtube.com/watch?v=HaK08DW5pJE
// Source: https://tinyurl.com/2mbczamt

// Normal sudoku rules (default 9x9 with default 3x3 boxes).
// Thermo(...cells): values strictly increase from the first cell (round
// bulb) to the last cell (tip), not necessarily consecutively.
// Between(...cells): interior cells must lie strictly between the values in
// the first and last cells (the circled endpoints).
// The rules note that the leftmost thermometer's bulb (R4C1) sits behind a
// between line's circle drawn at the same cell -- that is a visual overlap,
// not an extra clue: R4C1 already carries both roles from the two clue
// arrays below.

const givens = [
  ['R1C1', 5], ['R1C7', 2],
  ['R2C8', 3],
  ['R3C3', 3],
  ['R5C4', 9], ['R5C6', 4],
  ['R7C7', 8],
  ['R8C2', 5],
  ['R9C3', 7], ['R9C9', 2],
];

// Thermometers: R#C# path from raw payload's `thermometer` entries, bulb
// first.
const thermos = [
  ['R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'],
  ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'],
];

// Between lines: R#C# path from raw payload's `betweenline` entries, in
// drawn order (first/last cell = circle endpoint).
const betweenLines = [
  ['R3C6', 'R3C5', 'R3C4', 'R3C3'],
  ['R7C4', 'R7C5', 'R7C6', 'R7C7'],
  ['R5C8', 'R4C8', 'R3C8', 'R2C8'],
  ['R5C2', 'R6C2', 'R7C2', 'R8C2'],
  ['R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7'],
  ['R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R4C1', 'R3C1', 'R2C1', 'R1C1'],
];

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...betweenLines.map(cells => new Between(...cells)),
];
