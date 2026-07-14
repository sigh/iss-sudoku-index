// Title: Consecutive Constraint
// Author: Daniel Buckeldee
// Video: https://www.youtube.com/watch?v=pfa7GnpOtFo
// Source: https://sudokupad.app/vi9ub1bnlu

// Normal sudoku rules apply. A cage sums to the total shown. Each digit is
// orthogonally adjacent to at least one consecutive digit within its own
// cage.
//
// The five cages tile the whole grid and none is marked all-different; two
// of them are larger than 9 cells (25 and 14), so a cage cannot be a killer
// cage (distinct digits summing to the total) -- it is a plain sum, repeats
// allowed. Cage() would silently over-constrain a >9-cell group, so these
// use Sum().
const CAGES = [
  { total: 91, cells: ['R2C5', 'R3C4', 'R3C5', 'R3C6', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7',
      'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C3', 'R6C4', 'R6C5', 'R6C6',
      'R6C7', 'R7C4', 'R7C5', 'R7C6', 'R8C5'] },
  { total: 86, cells: ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C6', 'R2C7', 'R2C8', 'R2C9',
      'R3C7', 'R3C8', 'R3C9', 'R4C8', 'R4C9'] },
  { total: 68, cells: ['R5C9', 'R6C8', 'R6C9', 'R7C7', 'R7C8', 'R7C9', 'R8C6', 'R8C7', 'R8C8',
      'R8C9', 'R9C6', 'R9C7', 'R9C8', 'R9C9'] },
  { total: 86, cells: ['R6C1', 'R6C2', 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R8C4',
      'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'] },
  { total: 74, cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C1',
      'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R5C1'] },
];

const graph = cellGraph('9x9');

// Every cell belongs to exactly one cage; the five cages above partition the
// grid (25 + 14*4 = 81 cells).
const cageOf = new Map();
for (const cage of CAGES) {
  for (const cell of cage.cells) cageOf.set(cell, cage);
}

// Each cell must have at least one same-cage orthogonal neighbour holding a
// consecutive digit. WhiteDot is the native adjacent-consecutive relation;
// it isn't a drawn dot here, only reused for its exact pairwise semantics.
const adjacentConsecutiveInCage = graph.cells().map(cell => {
  const partners = graph.neighbours(cell)
    .filter(n => cageOf.get(n) === cageOf.get(cell));
  const options = partners.map(n => new WhiteDot(cell, n));
  return options.length === 1 ? options[0] : new Or(options);
});

return [
  new Shape('9x9'),

  new Given('R2C2', 1),
  new Given('R3C9', 8),
  new Given('R6C6', 7),
  new Given('R7C8', 3),
  new Given('R8C5', 6),

  ...CAGES.map(cage => new Sum(cage.total, ...cage.cells)),

  ...adjacentConsecutiveInCage,
];
