// Title: 8/13/2022: Meanie, Miny, Moe
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=EWHoAiQgvYM
// Source: https://tinyurl.com/yscpfaut

// Normal sudoku rules apply. Each border marker sits between two orthogonally
// adjacent cells and constrains the mean of that pair: a green square means
// mean = 5 (sum = 10), a blue circle means mean < 5 (sum < 10), and a pink
// non-square rectangle means mean > 5 (sum > 10). Encoded as Pair relations on
// sum, which is equivalent to a relation on the mean for a fixed pair size.

const meanEquals5 = [
  ['R6C1', 'R5C1'], ['R7C3', 'R8C3'], ['R5C9', 'R4C9'], ['R3C7', 'R2C7'],
];

const meanLessThan5 = [
  ['R6C7', 'R7C7'], ['R8C8', 'R8C7'], ['R6C6', 'R6C5'], ['R5C4', 'R4C4'],
  ['R3C3', 'R3C4'], ['R2C2', 'R3C2'], ['R5C4', 'R5C5'], ['R6C5', 'R5C5'],
  ['R4C4', 'R3C4'], ['R3C2', 'R3C3'],
];

const meanGreaterThan5 = [
  ['R4C4', 'R4C5'], ['R5C6', 'R5C5'], ['R7C7', 'R7C6'], ['R7C8', 'R7C7'],
  ['R2C2', 'R2C3'], ['R4C3', 'R3C3'], ['R4C5', 'R5C5'], ['R6C6', 'R5C6'],
  ['R6C6', 'R7C6'], ['R7C8', 'R8C8'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 9), new Given('R1C4', 8),
  new Given('R2C2', 8), new Given('R2C5', 7),
  new Given('R3C3', 7), new Given('R3C6', 6),
  new Given('R4C1', 7), new Given('R4C4', 6), new Given('R4C7', 5),
  new Given('R5C2', 6), new Given('R5C5', 5), new Given('R5C8', 4),
  new Given('R6C3', 5), new Given('R6C6', 4), new Given('R6C9', 3),
  new Given('R7C4', 4), new Given('R7C7', 3),
  new Given('R8C5', 3), new Given('R8C8', 2),
  new Given('R9C6', 2), new Given('R9C9', 1),

  // Mean = 5 (sum = 10) is exactly the native X constraint.
  ...meanEquals5.map(cells => new X(...cells)),
  ...meanLessThan5.map(cells => new Pair(
    Pair.fnToKey((a, b) => a + b < 10, 9), 'Mean < 5', ...cells)),
  ...meanGreaterThan5.map(cells => new Pair(
    Pair.fnToKey((a, b) => a + b > 10, 9), 'Mean > 5', ...cells)),
];
