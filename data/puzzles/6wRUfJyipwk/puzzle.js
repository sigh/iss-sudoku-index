// Title: Untitled
// Author: Undar Beyond
// Video: https://www.youtube.com/watch?v=6wRUfJyipwk
// Source: https://cracking-the-cryptic.web.app/sudoku/Db6BhrBg83

// Normal sudoku (rows, columns, boxes) plus fourteen cages. Each cage is a
// one-cell-wide connected line and its digits must not repeat -- encoded as
// an explicit AllDifferent per cage, since Sum (below) permits repeats by
// design. The rules state each cage is either a killer cage (printed number
// = sum of all digits) or a "lunch box" (printed number = sum of the digits
// between the cage's own smallest and largest digit, along the cage's path)
// -- nothing in the payload or rules says which cages are which, so each
// cage is encoded as Or(Sum, Lunchbox): the solver must find a type
// assignment consistent with a valid grid. Sum rather than Cage for the
// killer branch: Cage(0, ...cells) is sudoku_builder.js's sentinel for "no
// printed total" (skips the sum check entirely, keeping only distinctness)
// -- two cages here have a real printed total of 0 (a lunch box whose local
// min/max sit path-adjacent), and Cage would silently treat that branch as
// unconstrained-sum instead of sum-must-equal-zero.

// Cage cell lists are transcribed in path order from the drawn cages.
// Path order matters for Lunchbox: "sandwiched" is read along this
// sequence. Each cage's consecutive cells are orthogonally adjacent,
// matching "each cage forms a line with a one-cell width".
const cages = [
  { value: 3, cells: ['R1C1', 'R2C1', 'R2C2', 'R3C2', 'R4C2', 'R4C3'] },
  { value: 8, cells: ['R1C3', 'R1C4', 'R2C4'] },
  { value: 16, cells: ['R4C4', 'R3C4', 'R3C5', 'R3C6', 'R4C6'] },
  { value: 7, cells: ['R4C1', 'R5C1', 'R6C1'] },
  { value: 15, cells: ['R7C1', 'R8C1', 'R9C1', 'R9C2'] },
  { value: 8, cells: ['R7C2', 'R7C3', 'R8C3'] },
  { value: 6, cells: ['R5C2', 'R5C3', 'R6C3'] },
  { value: 0, cells: ['R9C4', 'R8C4', 'R7C4', 'R7C5', 'R6C5'] },
  { value: 10, cells: ['R6C4', 'R5C4', 'R5C5', 'R5C6'] },
  { value: 7, cells: ['R4C7', 'R5C7', 'R6C7'] },
  { value: 13, cells: ['R8C5', 'R8C6', 'R7C6', 'R7C7'] },
  { value: 0, cells: ['R9C7', 'R9C8', 'R9C9'] },
  { value: 6, cells: ['R4C8', 'R5C8', 'R5C9'] },
  { value: 11, cells: ['R1C5', 'R1C6', 'R1C7', 'R1C8'] },
];

const cageConstraints = cages.flatMap(
  ({ value, cells }) => [
    new AllDifferent(...cells),
    new Or([
      new Sum(value, ...cells),
      new Lunchbox(value, ...cells),
    ]),
  ]);

return [
  new Shape('9x9'),
  ...cageConstraints,
];
