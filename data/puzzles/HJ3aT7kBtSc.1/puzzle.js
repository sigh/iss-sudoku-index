// Title: Round Off Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=HJ3aT7kBtSc
// Source: https://tinyurl.com/sppdc2ap

// Normal sudoku rules apply. Each two-cell cage shows the two-digit number
// formed by its two cells (left cell = tens digit, right cell = units
// digit -- every cage here is horizontal) rounded to the nearest multiple
// of 10, with ties (a number ending in 5) rounding up.

const givens = [
  ['R2C2', 8], ['R2C8', 4],
  ['R5C2', 2], ['R5C4', 4], ['R5C6', 7], ['R5C8', 6],
  ['R8C2', 9], ['R8C8', 1],
];

// cells: [left, right] read left-to-right; target: the rounded label shown.
const cages = [
  [['R1C1', 'R1C2'], 10], [['R1C4', 'R1C5'], 20], [['R1C7', 'R1C8'], 70],
  [['R3C2', 'R3C3'], 30], [['R3C5', 'R3C6'], 50], [['R3C8', 'R3C9'], 60],
  [['R4C2', 'R4C3'], 50], [['R4C5', 'R4C6'], 60], [['R4C8', 'R4C9'], 70],
  [['R6C1', 'R6C2'], 80], [['R6C4', 'R6C5'], 90], [['R6C7', 'R6C8'], 80],
  [['R7C1', 'R7C2'], 70], [['R7C4', 'R7C5'], 60], [['R7C7', 'R7C8'], 50],
  [['R9C2', 'R9C3'], 20], [['R9C5', 'R9C6'], 30], [['R9C8', 'R9C9'], 40],
];

// One Pair key per distinct rounded target. Math.round rounds .5 upward for
// positive inputs, matching the rules' explicit "ends in 5 rounds up".
const targets = [...new Set(cages.map(([, t]) => t))];
const roundKeys = new Map(targets.map(t => [
  t,
  Pair.fnToKey((a, b) => Math.round((10 * a + b) / 10) * 10 === t, 9),
]));

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...cages.map(([[left, right], t]) =>
    new Pair(roundKeys.get(t), `round${t}`, left, right)),
];
