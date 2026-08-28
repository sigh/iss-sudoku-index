// Title: March 1, 2022: Killer Between
// Author: clover!
// Video: https://www.youtube.com/watch?v=Y631pjavM3Y
// Source: https://tinyurl.com/yjvkddzp

// Normal sudoku rules (Shape('9x9') defaults: rows, columns, and 3x3 boxes
// each all-different).
//
// Killer cages: digits do not repeat and sum to the printed total ->
// Cage(sum, ...cells).
//
// Between lines: digits on the line are strictly between the values in the
// two circles at its ends -> Between(...cells). Between's endpoints are
// symmetric (no low/high side implied), which matches the rule text: nothing
// on the line says which circle is which, so the drawn cell order does not
// need to be resolved to a direction.

const givens = [
  new Given('R2C2', 2),
  new Given('R2C5', 5),
  new Given('R2C8', 8),
  new Given('R4C5', 1),
  new Given('R5C2', 5),
  new Given('R5C4', 3),
  new Given('R5C6', 8),
  new Given('R5C8', 4),
  new Given('R6C5', 7),
  new Given('R8C2', 9),
  new Given('R8C5', 6),
  new Given('R8C8', 1),
];

// Killer cages, as drawn (four cages, all size four).
const cages = [
  new Cage(10, 'R2C3', 'R2C4', 'R3C3', 'R3C4'),
  new Cage(30, 'R3C7', 'R3C8', 'R4C7', 'R4C8'),
  new Cage(29, 'R6C2', 'R6C3', 'R7C2', 'R7C3'),
  new Cage(11, 'R7C6', 'R7C7', 'R8C6', 'R8C7'),
];

// Between lines, as drawn (twelve lines, eight of length four and four of
// length three).
const betweens = [
  new Between('R2C2', 'R2C3', 'R2C4', 'R2C5'),
  new Between('R2C8', 'R2C7', 'R2C6', 'R2C5'),
  new Between('R5C8', 'R4C8', 'R3C8', 'R2C8'),
  new Between('R5C2', 'R4C2', 'R3C2', 'R2C2'),
  new Between('R8C8', 'R7C8', 'R6C8', 'R5C8'),
  new Between('R8C8', 'R8C7', 'R8C6', 'R8C5'),
  new Between('R8C5', 'R8C4', 'R8C3', 'R8C2'),
  new Between('R8C2', 'R7C2', 'R6C2', 'R5C2'),
  new Between('R3C4', 'R4C3', 'R5C2'),
  new Between('R4C7', 'R3C6', 'R2C5'),
  new Between('R7C6', 'R6C7', 'R5C8'),
  new Between('R6C3', 'R7C4', 'R8C5'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...betweens,
];
