// Title: Douro
// Author: Xenonetix
// Video: https://www.youtube.com/watch?v=eZi4pISOrBQ
// Source: https://sudokupad.app/kbrkvktac9

// Partial encoding. Normal sudoku rules apply. The puzzle also has an
// unknown one-cell-wide "river" path of orthogonally-connected cells
// snaking from R9C9 to R1C2, without branching or touching itself
// orthogonally (it may touch diagonally). Digits along the river differ
// by at least 5, and every other cell is "land".
//
// Six drawn "bridges" cross the river at fixed grid positions and join
// two land cells on opposite sides of the crossed cell; the bridge value
// is the sum of the two land digits. Those six crossed cells are
// necessarily river cells (a bridge only crosses a river cell), so their
// sum relations are encoded directly as Arrow constraints (river cell =
// circle, the two land cells = shaft), independent of the rest of the
// unknown path:
//   - horizontal bridge over R5C4, joining R5C3 and R5C5
//   - horizontal bridge over R5C2, joining R5C1 and R5C3
//   - vertical bridge over R6C5, joining R5C5 and R7C5
//   - vertical bridge over R6C6, joining R5C6 and R7C6
//   - diagonal bridge over the corner cell R3C8, joining R2C9 and R4C7
//   - diagonal bridge over the corner cell R8C7, joining R7C6 and R9C8
//
// R6C5 and R6C6 are both forced river cells (each crossed by a bridge)
// and are orthogonally adjacent, so the no-self-touching rule forces
// them to be consecutive river cells; their digits must therefore
// differ by at least 5.
//
// The rest of the river's shape (which other cells are river vs land),
// the no-branching / no-self-touching topology, and the river-digit
// difference rule for any other river cells are omitted: they depend on
// a solver-discovered single path with global connectivity, which ISS
// has no general primitive for.

const riverDiffKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9);

const constraints = [
  new Shape('9x9'),

  // Bridges: river-cell value = sum of the two land cells at its ends.
  new Arrow('R5C4', 'R5C3', 'R5C5'),
  new Arrow('R5C2', 'R5C1', 'R5C3'),
  new Arrow('R6C5', 'R5C5', 'R7C5'),
  new Arrow('R6C6', 'R5C6', 'R7C6'),
  new Arrow('R3C8', 'R2C9', 'R4C7'),
  new Arrow('R8C7', 'R7C6', 'R9C8'),

  // R6C5-R6C6: both forced river and orthogonally adjacent, so they must
  // be consecutive river cells; digits differ by at least 5.
  new Pair(riverDiffKey, 'river-diff', 'R6C5', 'R6C6'),
];

return constraints;
