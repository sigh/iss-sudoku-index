// Title: Dominoku
// Author: Sander Moolenbeek
// Video: https://www.youtube.com/watch?v=j_sTVmVadEU
// Source: https://app.crackingthecryptic.com/sudoku/Qnr7tP8n9T

// Rules: "Normal sudoku rules apply. Each cage contains a unique pair of
// digits." The grid carries 36 two-cell cages (drawn as domino outlines,
// no totals), transcribed below by cell coordinates. Every cage's two cells
// are orthogonally adjacent and share a row or a column, so within-cage
// distinctness is already forced by the grid's own row/column all-different
// -- no separate AllDifferent is added per cage.
// "Unique pair" is read as: no two cages hold the same unordered pair of
// digits. With exactly 36 cages and exactly C(9,2) = 36 possible unordered
// pairs of distinct 1-9 digits, this also forces every cage to a different
// pair from every other, i.e. the 36 cages realize the full domino set
// {1,2},{1,3},...,{8,9} exactly once -- but only pairwise inequality is
// encoded; the full-coverage fact is a consequence, not a separate clause.
// The three underlay colours (gold/yellowgreen/red) group the cages but are
// not named by the rules text, so they are left as decoration.

const cages = [
  ['R1C1', 'R1C2'], ['R2C1', 'R2C2'], ['R3C1', 'R4C1'], ['R3C2', 'R4C2'],
  ['R1C3', 'R2C3'], ['R3C3', 'R3C4'], ['R4C3', 'R5C3'], ['R5C2', 'R5C1'],
  ['R6C1', 'R7C1'], ['R6C2', 'R7C2'], ['R8C1', 'R9C1'], ['R8C2', 'R9C2'],
  ['R7C3', 'R7C4'], ['R8C3', 'R9C3'], ['R9C4', 'R9C5'], ['R7C5', 'R8C5'],
  ['R5C5', 'R6C5'], ['R5C4', 'R6C4'], ['R4C4', 'R4C5'], ['R2C4', 'R1C4'],
  ['R2C5', 'R1C5'], ['R2C6', 'R3C6'], ['R4C6', 'R5C6'], ['R6C6', 'R6C7'],
  ['R8C6', 'R8C7'], ['R1C6', 'R1C7'], ['R1C8', 'R1C9'], ['R2C8', 'R2C9'],
  ['R3C7', 'R3C8'], ['R3C9', 'R4C9'], ['R4C7', 'R4C8'], ['R5C8', 'R6C8'],
  ['R5C9', 'R6C9'], ['R7C8', 'R7C9'], ['R8C8', 'R9C8'], ['R8C9', 'R9C9'],
];

// Givens, transcribed from the drawn cell values.
const givens = [
  new Given('R1C2', 1), new Given('R1C6', 2),
  new Given('R2C6', 9), new Given('R2C8', 7),
  new Given('R3C3', 9), new Given('R3C6', 7), new Given('R3C7', 1),
  new Given('R3C8', 2), new Given('R3C9', 4),
  new Given('R4C5', 7),
  new Given('R5C2', 4), new Given('R5C4', 2),
  new Given('R6C2', 9), new Given('R6C3', 8), new Given('R6C6', 3),
  new Given('R6C7', 4), new Given('R6C8', 5),
  new Given('R7C1', 3), new Given('R7C2', 5), new Given('R7C8', 9),
  new Given('R9C2', 6), new Given('R9C3', 4), new Given('R9C4', 5),
  new Given('R9C9', 3),
];

// Cross-cage uniqueness. There is no dedicated ISS class for "these grouped
// cell-pairs are pairwise distinct as unordered pairs": encoding it as one
// value per cage and calling AllDifferent would need 36 distinct states in a
// single Var, over Shape's MAX_SIZE = 16 cap, so it is expanded directly over
// grid cells instead. For cages (a,b) and (c,d), the pairs collide iff
// (a=c AND b=d) OR (a=d AND b=c); the encoding is the negation of that,
// applied to every one of the C(36,2) = 630 cage pairs.
const neq = (x, y) => new AllDifferent(x, y);

const crossCageUniqueness = [];
for (let i = 0; i < cages.length; i++) {
  const [a, b] = cages[i];
  for (let j = i + 1; j < cages.length; j++) {
    const [c, d] = cages[j];
    crossCageUniqueness.push(new And([
      new Or([neq(a, c), neq(b, d)]),
      new Or([neq(a, d), neq(b, c)]),
    ]));
  }
}

return [
  new Shape('9x9'),
  ...givens,
  ...crossCageUniqueness,
];
