// Title: Medium Killer
// Author: Philipp Huber
// Video: https://www.youtube.com/watch?v=1zb6zxUNpcg
// Source: https://cracking-the-cryptic.web.app/sudoku/FHHM6DdbJB

// Normal sudoku, standard 3x3 boxes. Killer cages: distinct digits, sum
// given. One given digit. A "<" mark between R1C4 and R2C4 shows R2C4 is the
// smaller of the two. Four outside clues each give a two-cell corner
// diagonal's sum as an expression in one unknown X shared by all four
// clues: "<X" (top-left diagonal, sum < X), "X" (top-right diagonal, sum ==
// X), "X" (bottom-right diagonal, sum == X), "X+1" (bottom-left diagonal,
// sum == X+1). X itself is not printed; it is solved for.
//
// X is modelled as an off-grid Var (cell 'VX'). Its value range comes from
// widening the Shape to 16 (the solver's per-cell value cap), so the main
// grid cells must be pinned back down to 1-9 explicitly: one Replicate
// stamping a 1-9 template over every grid cell. 16 is enough despite
// two-cell sums reaching 17: X = bottom-left diagonal sum - 1, and that
// diagonal's own cells cap its sum at 17, so a satisfying X is always <=16.
// The "sum < X" clue is turned into an equality with a slack Var 'VS':
// topLeftSum + VS == VX, and VS's own domain floor of 1 (same widened
// Shape) forces the slack to be at least 1, i.e. topLeftSum < VX.

const graph = cellGraph('9x9');
const gridDomain = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

return [
  new Shape('9x9', 16),
  gridDomain,

  new Given('R7C3', 8),

  // Killer cages (distinct + sum). Cell lists transcribed from the payload's
  // `cages` geometry; one cage-array entry with no cells/total is a metadata
  // stub and carries nothing to encode.
  new Cage(27, 'R1C3', 'R2C3', 'R3C3', 'R3C4'),
  new Cage(21, 'R3C1', 'R3C2', 'R4C2', 'R5C2'),
  new Cage(22, 'R6C1', 'R7C1', 'R7C2'),
  new Cage(21, 'R8C1', 'R8C2', 'R9C2', 'R9C1'),
  new Cage(20, 'R4C3', 'R4C4', 'R5C3', 'R6C3'),
  new Cage(19, 'R1C5', 'R2C4', 'R2C5'),
  new Cage(10, 'R4C5', 'R5C5'),
  new Cage(8, 'R8C5', 'R8C6'),
  new Cage(8, 'R9C5', 'R9C6'),
  new Cage(10, 'R4C7', 'R5C7', 'R6C6', 'R6C7'),
  new Cage(18, 'R1C6', 'R1C7', 'R2C7', 'R3C7'),
  new Cage(7, 'R3C8', 'R3C9'),
  new Cage(20, 'R6C9', 'R7C7', 'R7C8', 'R7C9'),
  new Cage(22, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),

  // R1C4 > R2C4: chevron point (the drawn smaller-value end) is in R2C4.
  new GreaterThan('R1C4', 'R2C4'),

  // Shared unknown X for the four corner diagonals.
  new Var('X', 'shared value referenced by the four outside diagonal clues', 1),
  // Slack for the top-left "< X" clue: forces topLeftSum + VS = VX with
  // VS >= 1 (its domain floor on the widened Shape), i.e. topLeftSum < VX.
  new Var('S', 'top-left diagonal slack (topLeftSum + VS = VX)', 1),

  // Top-left diagonal (R1C2, R2C1): sum < X.
  new EqualSum(['R1C2', 'R2C1', 'VS'], ['VX']),
  // Top-right diagonal (R1C8, R2C9): sum == X.
  new EqualSum(['R1C8', 'R2C9'], ['VX']),
  // Bottom-right diagonal (R9C8, R8C9): sum == X.
  new EqualSum(['R9C8', 'R8C9'], ['VX']),
  // Bottom-left diagonal (R9C2, R8C1): sum == X + 1.
  new Sum(1, 'R9C2', 'R8C1', ['VX', -1]),
];
