// Title: Crossroads
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=e1LFxFNP4Cc
// Source: https://app.crackingthecryptic.com/sudoku/Ng7p8qtbLQ
//
// Normal sudoku rules apply (rows, columns, boxes). Grey lines are
// palindromes. Clues outside the grid give the sum of digits along the
// indicated diagonal, with repeats allowed on the diagonal. No two cells in
// the same position relative to their box may hold the same digit
// (DisjointSets) -- this is the rules' own example (R1C1 / R4C4).
//
// Each grey line is only 2 cells long, so Palindrome just forces its two
// cells equal.
//
// Little-killer cell lists (edge cell first, walking inward) are transcribed
// from the payload's arrow paths; LittleKiller.fromCells locates the
// matching diagonal and accepts either direction, so listing them
// edge-to-inward (as drawn) is sufficient.

const geometry = cellGeometry(9);

const palindromes = [
  ['R1C3', 'R2C4'],
  ['R1C7', 'R2C6'],
  ['R3C9', 'R4C8'],
  ['R3C1', 'R4C2'],
  ['R7C1', 'R6C2'],
  ['R9C3', 'R8C4'],
  ['R8C6', 'R9C7'],
  ['R6C8', 'R7C9'],
].map(cells => new Palindrome(...cells));

const littleKillers = [
  [13, ['R1C3', 'R2C2', 'R3C1']],
  [26, ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1']],
  [35, ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1']],
  [14, ['R3C9', 'R2C8', 'R1C7']],
  [27, ['R5C9', 'R4C8', 'R3C7', 'R2C6', 'R1C5']],
  [35, ['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1']],
  [14, ['R9C7', 'R8C8', 'R7C9']],
  [24, ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9']],
  [15, ['R7C1', 'R8C2', 'R9C3']],
  [27, ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5']],
].map(([sum, cells]) => LittleKiller.fromCells(sum, cells, geometry));

return [
  new Shape('9x9'),
  new DisjointSets(),
  ...palindromes,
  ...littleKillers,
];
