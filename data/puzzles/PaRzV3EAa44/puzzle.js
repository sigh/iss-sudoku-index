// Title: Spoilers In Title
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=PaRzV3EAa44
// Source: https://app.crackingthecryptic.com/sudoku/Gg6jnn86GB

// Standard sudoku (rows, columns, boxes all-different -- ISS default) plus
// killer cages. No cage total is printed anywhere in the source; totals must
// be deduced. Each cage is therefore all-different only. Cage cells are
// transcribed from the payload's `cages` array (its tenth entry has no
// `cells` and is a metadata stub, not a real cage).
//
// The rules add one extra global fact: "the sum of all the cells in all the
// cages is 165." This sums the 45 cells that belong to any cage (36 cells
// belong to no cage and are excluded), not a per-cage total.

const cageA = ['R1C6', 'R1C7', 'R1C8', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R3C9', 'R4C8'];
const cageB = ['R1C2', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'];
const cageC = ['R1C3', 'R1C4', 'R1C5'];
const cageD = ['R3C4', 'R4C2', 'R4C3', 'R4C4'];
const cageE = ['R5C2', 'R6C2', 'R7C2', 'R8C1', 'R8C2', 'R9C1', 'R9C2'];
const cageF = ['R5C5']; // single-cell, no-total cage: no local constraint, but its digit still counts toward the 165 total below
const cageG = ['R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7'];
const cageH = ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8'];
const cageI = ['R8C4', 'R8C5'];

const allCages = [cageA, cageB, cageC, cageD, cageE, cageF, cageG, cageH, cageI];

return [
  new Shape('9x9'),

  // Killer cage all-different (no printed totals; a single-cell cage adds
  // nothing here since one cell can't repeat with itself).
  ...allCages.filter(c => c.length > 1).map(c => new AllDifferent(...c)),

  // The 45 cells covered by any cage sum to 165, across cage boundaries.
  new Sum(165, ...allCages.flat()),
];
