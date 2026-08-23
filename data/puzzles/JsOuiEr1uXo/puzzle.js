// Title: Losing My Precision
// Author: ymhsbmbesitwf
// Video: https://www.youtube.com/watch?v=JsOuiEr1uXo
// Source: https://app.crackingthecryptic.com/sudoku/8hJDqhbFRQ

// Normal sudoku rules: default 9x9 grid, default 3x3 boxes (the payload's
// regions match the default tiling). Every cage's digits are distinct
// ("Digits do not repeat in cages"). Each cage's printed value V is not its
// sum: let p be V's leading decimal digit; the true sum lies anywhere in
// [V-p, V+p] (the rules text's own worked example: printed 30 -> p=3 ->
// sum in [27,33]). Encoded below as AllDifferent plus an Or of one exact
// Sum per integer in that range -- there is no named class for a bounded
// (non-exact) cage sum.

// Cage cell lists and printed totals, transcribed from the payload's
// `cages` array (single-cell cages #6 and #9 are real, not decoration).
const cages = [
  { cells: ['R1C9', 'R1C8'], total: 10 },
  { cells: ['R2C9', 'R2C8'], total: 10 },
  { cells: ['R3C9', 'R3C7', 'R3C8'], total: 4 },
  { cells: ['R1C6', 'R2C6', 'R3C6', 'R3C5'], total: 10 },
  { cells: ['R2C2', 'R1C3', 'R2C3', 'R3C3'], total: 24 },
  { cells: ['R4C2', 'R4C1'], total: 5 },
  { cells: ['R4C4'], total: 3 },
  { cells: ['R4C5', 'R4C6', 'R5C6', 'R5C5'], total: 9 },
  { cells: ['R5C8', 'R6C8'], total: 14 },
  { cells: ['R6C7'], total: 2 },
  { cells: ['R9C8', 'R9C9'], total: 5 },
  { cells: ['R9C7', 'R8C7', 'R7C7', 'R7C8', 'R7C9', 'R8C9'], total: 27 },
  { cells: ['R8C4', 'R9C4', 'R9C3'], total: 24 },
  { cells: ['R7C3', 'R7C4', 'R7C5', 'R8C5', 'R8C6', 'R7C6'], total: 41 },
  { cells: ['R6C3', 'R6C2'], total: 10 },
  { cells: ['R6C1', 'R7C1', 'R8C1'], total: 21 },
];

const cageConstraints = cages.flatMap(({ cells, total }) => {
  const precision = +String(total)[0];
  const lo = total - precision;
  const hi = total + precision;
  const sums = [];
  for (let s = lo; s <= hi; s++) sums.push(new Sum(s, ...cells));
  return [new AllDifferent(...cells), new Or(sums)];
});

// Givens, transcribed from the payload.
return [
  new Shape('9x9'),
  new Given('R2C2', 4),
  new Given('R4C9', 7),
  new Given('R8C8', 6),
  ...cageConstraints,
];
