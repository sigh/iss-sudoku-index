// Title: Liar Zones Sudoku
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=8KIw0_t1eig
// Source: https://app.crackingthecryptic.com/sudoku/44d8Lf6btR

// Standard 9x9 sudoku (rows/columns/3x3 boxes) plus 8 "liar zone" cages.
// Each cage is printed with three digits; exactly two of the three appear
// somewhere in the cage's three cells and the third appears nowhere in it
// (digits may repeat within a cage). Cage cells and printed digits are
// transcribed from the payload's `cages` array (value = the three shown
// digits, not a sum).

// One entry per cage: its three cells, then its three printed digits.
const liarCages = [
  [['R1C1', 'R1C2', 'R2C1'], [2, 5, 6]],
  [['R1C8', 'R1C9', 'R2C9'], [4, 5, 8]],
  [['R8C9', 'R9C8', 'R9C9'], [1, 4, 5]],
  [['R8C1', 'R9C1', 'R9C2'], [2, 6, 9]],
  [['R4C3', 'R4C4', 'R5C3'], [2, 6, 8]],
  [['R3C5', 'R3C6', 'R4C6'], [6, 7, 8]],
  [['R5C7', 'R6C6', 'R6C7'], [3, 5, 8]],
  [['R6C4', 'R7C4', 'R7C5'], [1, 5, 9]],
];

const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// For each cage, disjoin over which of the three printed digits is the liar:
// the other two must each appear at least once (ContainAtLeast), and the
// liar itself must appear in none of the cage's cells (each cell's candidate
// list excludes it via Given).
function liarZone(cells, digits) {
  const branches = digits.map((liar, i) => {
    const present = digits.filter((_, j) => j !== i);
    const allowed = ALL_DIGITS.filter((v) => v !== liar);
    return new And([
      new ContainAtLeast(present.join('_'), ...cells),
      ...cells.map((cell) => new Given(cell, ...allowed)),
    ]);
  });
  return new Or(branches);
}

return [
  new Shape('9x9'),

  new Given('R1C4', 4), new Given('R1C6', 5),
  new Given('R2C3', 3), new Given('R2C7', 6),
  new Given('R3C2', 2), new Given('R3C8', 7),
  new Given('R4C1', 1), new Given('R4C9', 8),
  new Given('R5C5', 1),
  new Given('R6C1', 3), new Given('R6C9', 1),
  new Given('R7C2', 4), new Given('R7C8', 9),
  new Given('R8C3', 5), new Given('R8C7', 8),
  new Given('R9C4', 6), new Given('R9C6', 7),

  ...liarCages.map(([cells, digits]) => liarZone(cells, digits)),
];
