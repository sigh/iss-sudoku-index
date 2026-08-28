// Title: March 25, 2022: Star Product
// Author: clover!
// Video: https://www.youtube.com/watch?v=rZ-4REgffY8
// Source: https://tinyurl.com/y2nvjdj2

// Normal sudoku rules apply. A value printed outside the grid, beside a row
// or above a column, gives the product of the digits in the shaded (pink)
// cells that lie in that row or column. Rows/columns without an outside
// value have no product rule for that direction; a shaded cell can feed its
// row's clue, its column's clue, both, or (if neither exists) neither -- the
// rule is stated per outside clue, not as a partition of the shaded cells.
//
// A 2-cell product clue is encoded as a Pair with a custom key: the two
// digits accepted iff their product equals the target. A clue with more
// cells (row 5 and column 5, each 3 cells) is encoded as a running-product
// NFA: state = product so far, rejected once it exceeds the target,
// accepted when state equals the target; order does not matter since
// multiplication commutes.

// Shaded (pink, #FFD0D0) cells, as drawn.
const highlighted = [
  'R1C1', 'R1C3',
  'R2C2', 'R2C8',
  'R3C1', 'R3C5',
  'R5C3', 'R5C5', 'R5C7',
  'R7C5', 'R7C9',
  'R8C2', 'R8C8',
  'R9C7', 'R9C9',
];

// Outside clue values, as drawn (a row's clue sits at its left margin, a
// column's clue sits above it).
const rowClues = { 1: 2, 2: 8, 5: 24, 8: 6, 9: 6 };
const colClues = { 1: 3, 2: 4, 5: 24, 8: 12, 9: 12 };

function productNFA(cells, target) {
  const spec = NFA.encodeSpec({
    startState: 1,
    transition: (state, value) => {
      const next = state * value;
      if (next > target) return;
      return next;
    },
    accept: (state) => state === target,
  }, 9);
  return new NFA(spec, `product ${target}`, ...cells);
}

function productConstraint(cells, target) {
  if (cells.length === 2) {
    const key = Pair.fnToKey((a, b) => a * b === target, 9);
    return new Pair(key, `product ${target}`, ...cells);
  }
  return productNFA(cells, target);
}

const rowProducts = Object.entries(rowClues).map(([row, target]) => {
  const cells = highlighted.filter((id) => parseCellId(id).row === Number(row));
  return productConstraint(cells, target);
});

const colProducts = Object.entries(colClues).map(([col, target]) => {
  const cells = highlighted.filter((id) => parseCellId(id).col === Number(col));
  return productConstraint(cells, target);
});

return [
  new Shape('9x9'),

  // Givens, as drawn.
  new Given('R2C4', 7), new Given('R2C6', 8),
  new Given('R3C3', 5), new Given('R3C7', 8),
  new Given('R4C2', 6), new Given('R4C6', 3), new Given('R4C8', 7),
  new Given('R6C2', 9), new Given('R6C4', 5), new Given('R6C8', 8),
  new Given('R7C3', 9), new Given('R7C7', 5),
  new Given('R8C4', 2), new Given('R8C6', 5),

  ...rowProducts,
  ...colProducts,
];
