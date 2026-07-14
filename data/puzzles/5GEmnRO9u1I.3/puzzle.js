// Title: Variant Lesson: Killer Cages
// Author: Deckatron
// Video: https://www.youtube.com/watch?v=5GEmnRO9u1I
// Source: https://sudokupad.app/1eq5e5qt5a

// The grid plays over the full 1-9 digit range, but each row/column/box is
// only 6 cells, so the default all-different groups already force each
// house to hold exactly 6 distinct digits. Pinning the *whole grid* to
// exactly 6 distinct digits (via CountDistinct on an off-grid control Var)
// then forces every house's 6-digit set to be that same global set --
// which is exactly "each digit appears 6 times; which 6 to use must be
// determined" without ever naming the 6 digits by hand.
const shape = new Shape('6x6', 9);
const graph = cellGraph(shape);
const digitCount = new Var('N', 'Digit count', 1);

// Killer Cages: distinct digits summing to the shown total.
const cages = [
  new Cage(6, 'R3C5', 'R4C5'),
  new Cage(24, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(3, 'R2C1', 'R2C2'),
  new Cage(16, 'R1C5', 'R1C6', 'R2C6'),
  new Cage(24, 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6'),
  new Cage(12, 'R4C2', 'R4C3', 'R4C4'),
];

return [
  shape,
  // Positive Diagonal: digits do not repeat along the '/' diagonal. The
  // payload also draws an invisible, no-total cage over the same cells
  // (R6C1..R1C6); it adds no rule beyond this one, so it is not separately
  // encoded.
  new Diagonal(1),
  ...cages,
  digitCount,
  new Given(digitCount.cell(1), 6),
  new CountDistinct(digitCount.cell(1), ...graph.cells()),
];
