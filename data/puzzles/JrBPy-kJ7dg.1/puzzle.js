// Title: Count Different (Arrows) Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=JrBPy-kJ7dg
// Source: https://tinyurl.com/bdcj6h4n

// Normal sudoku rules apply (standard 3x3 boxes -- the drawn regions are the
// default boxes). Each bulb's digit counts the number of distinct digits
// among its arrow's 6 line cells; the bulb cell itself is not part of that
// count. CountDistinct's control cell is the bulb; the counted cells are the
// arrow's line cells (excluding the bulb).

// Givens transcribed from the puzzle grid. The four bulb givens are listed
// with their arrow below rather than here.
const givens = [
  ['R2C3', 1], ['R2C4', 7],
  ['R3C6', 5],
  ['R4C2', 3], ['R4C4', 4],
  ['R6C6', 3], ['R6C8', 4],
  ['R7C4', 6],
  ['R8C6', 8], ['R8C7', 9],
];

// Each entry: bulb cell (also a given, drawn as a circle), its given digit,
// and its arrow's 6 line cells, in drawn order. Transcribed from the arrow
// waypoints.
const arrows = [
  ['R1C3', 2, ['R2C2', 'R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C3']],
  ['R9C7', 2, ['R8C8', 'R7C9', 'R6C8', 'R5C7', 'R4C6', 'R3C7']],
  ['R4C9', 2, ['R3C8', 'R2C7', 'R3C6', 'R4C5', 'R5C6', 'R6C7']],
  ['R6C1', 2, ['R7C2', 'R8C3', 'R7C4', 'R6C5', 'R5C4', 'R4C3']],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(([bulb, value]) => new Given(bulb, value)),
  ...arrows.map(([bulb, , cells]) => new CountDistinct(bulb, ...cells)),
];
