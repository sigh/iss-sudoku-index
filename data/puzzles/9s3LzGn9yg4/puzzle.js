// Title: Bullseye
// Author: Lucy Audrin
// Video: https://www.youtube.com/watch?v=9s3LzGn9yg4
// Source: https://cracking-the-cryptic.web.app/sudoku/9QH4FQfDTb
//
// Normal sudoku on the standard 3x3 boxes. Digits cannot repeat within a
// cage, and cages show their totals -- except one, the "Bullseye" cage
// (the ring of 8 cells around the centre of the middle box), whose printed
// clue is not a total but the bound ">41": its digits must sum to more
// than 41 rather than to an exact value.

const givens = [
  ['R1C2', 1], ['R1C7', 2],
  ['R3C1', 6], ['R3C4', 4], ['R3C6', 5], ['R3C9', 8],
  ['R5C4', 6], ['R5C6', 7],
  ['R7C1', 8], ['R7C4', 5], ['R7C6', 4], ['R7C9', 6],
  ['R9C8', 1],
];

// Ordinary killer cages: cells + printed total (cages[], excluding the
// title/author/rules stubs and the ">41" cage handled separately below).
const cages = [
  [20, 'R1C4', 'R2C4', 'R2C3'],
  [9, 'R2C7', 'R2C8'],
  [8, 'R4C7', 'R4C8'],
  [12, 'R4C1', 'R5C1'],
  [7, 'R6C2', 'R6C3'],
  [12, 'R8C2', 'R8C3', 'R9C3'],
  [15, 'R9C6', 'R9C7'],
  [11, 'R5C9', 'R6C9'],
];

// Bullseye cage: the 8 cells of the middle box (box 5) surrounding its
// centre cell R5C5.
const bullseyeCells = [
  'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4',
];

// The bullseye cage's clue is an inequality ("> 41"), not a fixed total, so
// it cannot use the `Cage` class (which requires an integer sum). Encode it
// as an equality by introducing a slack Var for the shortfall above 41:
// sum(cells) - slack = 41, with slack restricted to {1, 2, 3}. Since the 8
// cells hold 8 distinct digits from 1-9 (the box's all-different forces
// this; the ninth digit, at the centre R5C5, is excluded), their sum ranges
// 45 - 9 = 36 .. 45 - 1 = 44, so a sum > 41 means slack in [1, 3] exactly.
// AllDifferent is added explicitly for the cage's own no-repeat rule, even
// though the box's all-different already implies it for cells confined to
// one box.
const bullseyeSlack = new Var('S', 'bullseye cage shortfall above 41', 1);

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),

  new AllDifferent(...bullseyeCells),
  bullseyeSlack,
  new Given(bullseyeSlack.cell(1), 1, 2, 3),
  new Sum(41, ...bullseyeCells, [bullseyeSlack.cell(1), -1]),
];
