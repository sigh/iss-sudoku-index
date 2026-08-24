// Title: Killer Sudoku - Sums or Products
// Author: Akash Jain
// Video: https://www.youtube.com/watch?v=8_Kb6PVJQBo
// Source: https://app.crackingthecryptic.com/sudoku/4M7bd7NrpL

// Normal sudoku rules apply (default 3x3 boxes: the payload's own `regions`
// array is the nine ordinary boxes). Each cage's printed total is either the
// SUM or the PRODUCT of its digits, and cage digits never repeat under
// either reading. Which reading applies to a given cage is not marked and is
// part of the puzzle, so each cage is Or(sum-reading, product-reading):
//   - sum reading:     Cage(total, ...cells) (sum + all-different)
//   - product reading: AllDifferent(...cells) And a partial-product NFA
//     accepting when the running product equals total.
//
// The payload's second `lines` entry has no waypoints (styling only, not a
// clue). The first, at wayPoints [[4.3,3.8],[4.5,4.2],[4.7,3.8]] ([row,col],
// 0-indexed), is a 2-segment chevron sitting exactly on the shared edge
// between R5C4 and R5C5: both flanking points (rows 4.3 and 4.7, i.e. near
// the top and bottom of the row-5 band) sit inside R5C4 (col 3.8, left of
// the col-4/col-5 border at 4.0), while the bend point sits inside R5C5
// (row 4.5, the row's centre; col 4.2, just past the border). That is the
// standard drawn shape of a ">" inequality mark on a shared cell edge, with
// its vertex -- by the usual convention that the point faces the smaller
// value -- naming R5C5 as smaller: GreaterThan(R5C4, R5C5).

// cages: [total, ...cells], transcribed from the payload's drawn cages
// (0-indexed [row,col] converted to 1-indexed R#C#).
const cages = [
  [12, 'R1C2', 'R1C1', 'R2C1'],
  [24, 'R1C3', 'R2C3', 'R3C3'],
  [10, 'R1C4', 'R1C5'],
  [6, 'R1C7', 'R1C8'],
  [16, 'R1C9', 'R2C9'],
  [16, 'R3C5', 'R4C5', 'R4C6'],
  [6, 'R4C7', 'R5C7'],
  [12, 'R5C4', 'R5C5'],
  [8, 'R5C2', 'R6C2'],
  [11, 'R6C3', 'R6C4'],
  [16, 'R6C6', 'R6C7', 'R6C8'],
  [21, 'R6C9', 'R7C9', 'R7C8'],
  [11, 'R7C5', 'R7C6'],
  [6, 'R7C1', 'R8C1'],
  [16, 'R7C2', 'R7C3'],
  [24, 'R8C3', 'R9C3', 'R9C2'],
  [12, 'R8C4', 'R8C5'],
  [6, 'R9C6', 'R9C7'],
  [14, 'R8C8', 'R9C8'],
];

// Partial-product NFA (3+ cell cages): the state is the running product of
// digits consumed so far, capped by rejecting once it exceeds the target (so
// the state space stays bounded by the target, not by digit count); accept
// only when the final product equals the target exactly. Multiplication is
// commutative, so this is order-independent over the cage's cells.
function productNFA(target) {
  return NFA.encodeSpec({
    startState: 1,
    transition: (state, value) => {
      if (state > target) return;
      return state * value;
    },
    accept: state => state === target,
  }, 9);
}

// A 2-cell product is a plain binary relation, so it uses Pair rather than
// a single-transition NFA.
function productConstraint(total, cells) {
  if (cells.length === 2) {
    return new Pair(
      Pair.fnToKey((a, b) => a * b === total, 9),
      `product=${total}`,
      ...cells
    );
  }
  return new NFA(productNFA(total), `product=${total}`, ...cells);
}

const cageConstraints = cages.map(([total, ...cells]) => new Or([
  new Cage(total, ...cells),
  new And([new AllDifferent(...cells), productConstraint(total, cells)]),
]));

return [
  new Shape('9x9'),
  ...cageConstraints,
  new GreaterThan('R5C4', 'R5C5'),
];
