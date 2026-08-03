// Title: Rising Circles
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=7Ds5FaOW1XA
// Source: https://app.crackingthecryptic.com/sudoku/7p8BFPqG4M

// Normal sudoku rules apply (standard rows, columns, and 3x3 boxes).
// A digit in a circle indicates exactly how many circles contain that
// digit: for value v, the number of circle cells across the whole grid
// holding v must equal v. All 45 circle cells form a single such set
// (there is only one drawn group, so CountingCircles's per-group
// independence has nothing else to interact with).
// Grouped by column (col 1..9) purely for readability; CountingCircles treats
// the argument list as an unordered set.
const circles = [
  'R1C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1',
  'R4C2', 'R7C2', 'R8C2', 'R9C2',
  'R7C3',
  'R1C4', 'R2C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4',
  'R4C5', 'R5C5', 'R7C5', 'R8C5', 'R9C5',
  'R7C6', 'R8C6',
  'R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7',
  'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8',
  'R7C9', 'R8C9', 'R9C9',
];

return [
  new Shape('9x9'),
  new CountingCircles(...circles),
];
