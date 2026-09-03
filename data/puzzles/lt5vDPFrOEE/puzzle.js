// Title: Unique Sums Sudoku
// Author: Jakub Hrazdira
// Video: https://www.youtube.com/watch?v=lt5vDPFrOEE
// Source: https://cracking-the-cryptic.web.app/sudoku/RMrtrJm7qp

// Rules encoded here:
//  - Normal sudoku: 1-9 once each in every row, column and 3x3 box.
//  - Digits do not repeat within a cage. None of the 21 cages is drawn with a
//    total.
//  - No two cages have the same total.

// The 21 drawn cages, in source order.
const CAGES = [
  ['R1C1'],
  ['R2C2'],
  ['R3C3'],
  ['R4C4'],
  ['R5C5'],
  ['R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R1C3', 'R1C4'],
  ['R2C3', 'R2C4'],
  ['R1C5', 'R1C6', 'R1C7'],
  ['R2C7', 'R3C7', 'R4C7'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R5C9', 'R6C9'],
  ['R7C9', 'R8C9'],
  ['R9C8', 'R9C7', 'R9C6'],
  ['R8C5', 'R9C5'],
  ['R7C5', 'R7C4'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R7C2', 'R6C2'],
  ['R8C1', 'R7C1', 'R6C1'],
  ['R4C1', 'R3C1', 'R2C1'],
  ['R5C2', 'R5C3'],
];

// A cage total runs from 1 to 30 (the four-cell cage's 9+8+7+6), but a Var cell
// holds only the grid's nine values, so each total is carried across two Var
// layers as its base-9 digits:
//   total = 9 * (high - 1) + low,  high in 1-4, low in 1-9.
const high = new Var('H', 'cage total, high base-9 digit', CAGES.length);
const low = new Var('L', 'cage total, low base-9 digit', CAGES.length);

// Range of a cage of n cells holding distinct digits: 1+2+..+n up to 9+8+..
const minTotal = (n) => (n * (n + 1)) / 2;
const maxTotal = (n) => n * 9 - (n * (n - 1)) / 2;

// A one-cell cage's total is its own digit, so those five cages are separated
// by a plain all-different and are left out of the pairwise work below.
const singles = CAGES.filter((cells) => cells.length === 1).map((cells) => cells[0]);

// The remaining cage pairs whose totals could coincide on cage size alone; the
// rest (a one-cell cage against the four-cell cage) need no constraint.
const pairs = CAGES.flatMap((cells, i) => CAGES.slice(i + 1).flatMap(
  (other, k) =>
    (cells.length > 1 || other.length > 1) &&
      minTotal(cells.length) <= maxTotal(other.length) &&
      minTotal(other.length) <= maxTotal(cells.length)
      ? [[i, i + 1 + k]] : []));

return [
  new Shape('9x9'),

  new Given('R1C9', 4),
  new Given('R4C5', 1),
  new Given('R5C4', 8),
  new Given('R5C5', 9),
  new Given('R5C6', 4),
  new Given('R6C5', 6),
  new Given('R9C1', 1),

  // Total 0 is "no total drawn": the cage contributes only its all-different.
  ...CAGES.map((cells) => new Cage(0, ...cells)),

  new AllDifferent(...singles),

  high,
  low,
  ...CAGES.map((cells, i) => new Sum(
    9, [high.cell(i + 1), 9], [low.cell(i + 1), 1],
    ...cells.map((cell) => [cell, -1]))),

  // Two totals are equal exactly when both base-9 digits agree, so each pair of
  // cages is separated by a disjunction over the two layers.
  ...pairs.map(([i, j]) => new Or([
    new AllDifferent(high.cell(i + 1), high.cell(j + 1)),
    new AllDifferent(low.cell(i + 1), low.cell(j + 1)),
  ])),
];
