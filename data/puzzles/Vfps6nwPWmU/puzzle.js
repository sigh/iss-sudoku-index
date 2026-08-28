// Title: How Many Stars Out Of 5? Six!
// Author: Nylimb
// Video: https://www.youtube.com/watch?v=Vfps6nwPWmU
// Source: https://cracking-the-cryptic.web.app/sudoku/tQ6J39DD9t
//
// Normal sudoku rules apply.
//
// For each row and each column: let X be the digit in its first cell and Y
// the digit in its last cell. Group A is the first X cells; Group B is the
// last Y cells. The outside clue gives the sum of the digits where A and B
// overlap, or, if they don't overlap, the sum of the digits in the gap
// between them. Every row and every column carries exactly one such clue
// (18 total; row clues on the left, column clues on top).
//
// The rule is encoded as an explicit disjunction over every (X, Y) pair
// (1-9 each) for a given line: the branch pins the line's first cell to X
// and its last cell to Y, and constrains the resulting overlap/gap cell
// range -- computed here from X and Y, since it is fixed once X and Y are
// fixed -- to sum to the printed clue. A pair whose range is empty but whose
// clue is nonzero cannot hold under any assignment, so that branch is simply
// left out of the disjunction rather than encoded as an unsatisfiable one.

const graph = cellGraph('9x9');

// Clue values, keyed by row/column number 1-9, transcribed from the
// outside-clue text printed to the left of each row and above each column.
const ROW_CLUES = { 1: 2, 2: 2, 3: 0, 4: 1, 5: 2, 6: 1, 7: 1, 8: 1, 9: 8 };
const COL_CLUES = { 1: 9, 2: 0, 3: 0, 4: 7, 5: 0, 6: 0, 7: 8, 8: 7, 9: 0 };

// 1-based inclusive [lo, hi] range of positions along the line that the
// clue sums, given the first-cell value x and last-cell value y. endA is the
// last position of the first-x-cells group; startB is the first position of
// the last-y-cells group. If they overlap or touch (endA >= startB), the
// summed range is the overlap [startB, endA]; otherwise it is the gap
// strictly between them, [endA + 1, startB - 1] (possibly empty, when the
// groups are adjacent with no gap).
function overlapOrGapRange(x, y) {
  const endA = x;
  const startB = 10 - y;
  if (endA >= startB) return [startB, endA];
  return [endA + 1, startB - 1];
}

function lineConstraint(cells, clueValue) {
  const branches = [];
  for (let x = 1; x <= 9; x++) {
    for (let y = 1; y <= 9; y++) {
      const [lo, hi] = overlapOrGapRange(x, y);
      const rangeCells = [];
      for (let p = lo; p <= hi; p++) rangeCells.push(cells[p - 1]);

      if (rangeCells.length === 0) {
        // Empty range sums to 0. Only feasible when the clue is 0; otherwise
        // this (x, y) pairing cannot occur on this line, so omit the branch.
        if (clueValue !== 0) continue;
        branches.push(new And([
          new Given(cells[0], x),
          new Given(cells[8], y),
        ]));
      } else {
        branches.push(new And([
          new Given(cells[0], x),
          new Given(cells[8], y),
          new Sum(clueValue, ...rangeCells),
        ]));
      }
    }
  }
  return new Or(branches);
}

const rowConstraints = graph.rows().map(
  (cells, i) => lineConstraint(cells, ROW_CLUES[i + 1]));
const colConstraints = graph.columns().map(
  (cells, i) => lineConstraint(cells, COL_CLUES[i + 1]));

return [
  new Shape('9x9'),
  ...rowConstraints,
  ...colConstraints,
];
