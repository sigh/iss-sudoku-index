// Title: This Is Spinal Tap: The Sudoku!
// Author: Shinya
// Video: https://www.youtube.com/watch?v=cN4ykBUba-k
// Source: https://cracking-the-cryptic.web.app/sudoku/mpm8MNFTRP

// Normal sudoku. Every cage (drawn with no printed total) holds distinct
// digits summing to at most 11. Cage cell lists below are transcribed from
// the puzzle's drawn cage outlines.
//
// "Sum <= 11" has no exact total, so it is not a `Cage`. It is encoded as
// `AllDifferent` (distinctness) plus an equality `Sum` against a slack cell:
// cageSum + slack == 12, with slack left at its default 1-9 domain. Since a
// cage has at most 4 cells, its minimum distinct-digit sum is 10, so slack
// only ever needs 1-9 -- no Shape widening required. Because slack is fully
// determined by the cage's own digits (slack = 12 - cageSum), it is forced
// out of range whenever cageSum would exceed 11, which is exactly the rule,
// and it adds no free search state.

const cages = [
  ['R1C2', 'R1C3', 'R2C2'],
  ['R3C1', 'R4C1'],
  ['R5C2', 'R6C2', 'R7C2', 'R8C2'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R8C3', 'R8C4', 'R8C5'],
  ['R6C3', 'R7C3'],
  ['R4C3', 'R5C3'],
  ['R6C4', 'R7C4'],
  ['R6C5', 'R7C5'],
  ['R1C5', 'R1C6', 'R2C6'],
  ['R4C5', 'R5C5', 'R5C6'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R9C5', 'R9C6', 'R9C7'],
  ['R8C8', 'R9C8'],
  ['R6C7', 'R6C8', 'R7C7', 'R8C7'],
  ['R1C8', 'R1C9', 'R2C8'],
  ['R2C9', 'R3C8', 'R3C9'],
];

const slack = new Var('K', 'cage slack for the sum<=11 rule', cages.length);

return [
  new Shape('9x9'),
  slack,
  ...cages.flatMap((cells, i) => [
    new AllDifferent(...cells),
    new Sum(12, ...cells, slack.cell(i + 1)),
  ]),
];
