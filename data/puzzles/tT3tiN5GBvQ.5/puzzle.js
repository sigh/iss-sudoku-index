// Title: Dec 3, 2021: Greater Than
// Author: clover!
// Video: https://www.youtube.com/watch?v=tT3tiN5GBvQ
// Source: https://tinyurl.com/4fdnh64f

// Normal sudoku rules (default rows/cols/boxes; no drawn region overlay).
// Inequality signs between orthogonally-adjacent cells show which digit is
// greater ("the alligator mouth eats the larger digit").
//
// Each source mark is a literal '<'/'>' glyph rendered at the shared edge of
// two adjacent cells (horizontal marks unrotated, vertical marks rotated to
// read top-to-bottom). The glyph is read in place, left-to-right for a
// horizontal mark and top-to-bottom for a vertical one: e.g. the mark
// between columns 6 and 7 of row 1 reads "R1C6 > R1C7".

// Given digits, transcribed from the payload's `grid` values.
const givens = [
  ['R1C1', 1], ['R1C2', 4], ['R1C3', 7],
  ['R3C7', 3], ['R3C8', 6], ['R3C9', 9],
  ['R4C1', 2], ['R4C6', 6],
  ['R5C2', 1], ['R5C5', 3], ['R5C8', 2],
  ['R6C4', 5], ['R6C9', 7],
  ['R7C1', 7], ['R7C2', 6], ['R7C3', 5],
  ['R9C7', 5], ['R9C8', 7], ['R9C9', 6],
];

// Inequality pairs [greater, lesser], transcribed from the 22 drawn marks
// per the reading convention noted above.
const inequalities = [
  ['R7C5', 'R8C5'], ['R9C5', 'R8C5'], ['R9C2', 'R8C2'], ['R8C1', 'R7C1'],
  ['R8C9', 'R9C9'], ['R7C8', 'R8C8'], ['R8C4', 'R8C5'], ['R8C6', 'R8C5'],
  ['R8C7', 'R8C8'], ['R8C9', 'R8C8'], ['R8C1', 'R8C2'], ['R8C3', 'R8C2'],
  ['R2C3', 'R2C2'], ['R1C6', 'R1C7'], ['R3C3', 'R3C4'], ['R3C2', 'R3C3'],
  ['R3C1', 'R3C2'], ['R1C7', 'R1C8'], ['R1C8', 'R1C9'], ['R2C4', 'R2C5'],
  ['R2C6', 'R2C5'], ['R2C1', 'R2C2'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...inequalities.map(([greater, lesser]) => new GreaterThan(greater, lesser)),
];
