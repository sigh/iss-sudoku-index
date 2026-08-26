// Title: Delimited Kropki
// Author: clover!
// Video: https://www.youtube.com/watch?v=bYOwPT0KfTk
// Source: https://tinyurl.com/4ney6tck

// Standard 9x9 sudoku (rows/columns/3x3 boxes). White dots are Kropki
// consecutive edges; black dots are Kropki 1:2 ratio edges (WhiteDot,
// BlackDot below). "Along gray lines, all possible dots are given": every
// adjacent pair on a gray line without a drawn dot must fail both the
// consecutive and the ratio test. All drawn dots below sit on one of the
// four gray-line runs, so every other adjacent pair along those runs gets
// the negated-Kropki Pair edge. The runs are grouped into maximal
// dot-free chains so a single Pair covers each chain's internal edges,
// which is equivalent to one Pair per edge (Pair applies its relation to
// every adjacent pair within the cell list it is given).

// Drawn white dots (Kropki consecutive), each an independent edge.
const whiteDots = [
  ['R4C2', 'R3C2'],
  ['R3C2', 'R2C2'],
  ['R2C4', 'R2C3'],
  ['R2C3', 'R2C2'],
  ['R9C2', 'R9C3'],
  ['R1C7', 'R1C8'],
  ['R6C7', 'R7C7'],
  ['R7C7', 'R7C6'],
  ['R7C1', 'R8C1'],
  ['R8C1', 'R9C1'],
];

// Drawn black dots (Kropki 1:2 ratio), each an independent edge.
const blackDots = [
  ['R8C4', 'R8C5'],
  ['R8C4', 'R8C3'],
  ['R5C8', 'R4C8'],
  ['R3C8', 'R4C8'],
];

// Negated-Kropki predicate: neither consecutive nor a 1:2 ratio.
const notDot = Pair.fnToKey(
  (a, b) => Math.abs(a - b) !== 1 && a !== 2 * b && b !== 2 * a, 9);

// Dot-free chains along the gray lines (contiguous runs between drawn
// dots; Pair applies the relation to every adjacent pair within a chain).
const noDotChains = [
  // Loop, first dot-free arc: R2C4..R3C8.
  ['R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C8'],
  // Loop, second dot-free arc: R5C8..R8C5.
  ['R5C8', 'R6C8', 'R7C8', 'R8C8', 'R8C7', 'R8C6', 'R8C5'],
  // Loop, third dot-free arc: R8C3..R4C2.
  ['R8C3', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2'],
  // Top-right line, dot-free arc: R1C8..R3C9.
  ['R1C8', 'R1C9', 'R2C9', 'R3C9'],
  // Bottom-left line, single dot-free edge: R9C1-R9C2.
  ['R9C1', 'R9C2'],
];

return [
  new Shape('9x9'),

  new Given('R1C4', 9),
  new Given('R1C6', 7),
  new Given('R2C5', 2),
  new Given('R3C4', 6),
  new Given('R3C6', 3),
  new Given('R4C1', 5),
  new Given('R4C3', 3),
  new Given('R5C2', 4),
  new Given('R6C1', 1),
  new Given('R6C3', 7),
  new Given('R7C7', 4),
  new Given('R7C9', 2),
  new Given('R8C8', 6),
  new Given('R9C7', 1),
  new Given('R9C9', 5),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),

  ...noDotChains.map(
    (cells) => new Pair(notDot, 'no dot', ...cells)),
];
