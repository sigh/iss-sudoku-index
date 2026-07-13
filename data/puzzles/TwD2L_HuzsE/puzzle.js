// Title: Echo of an Arrow
// Author: Leo
// Video: https://www.youtube.com/watch?v=TwD2L_HuzsE
// Source: https://sudokupad.app/4tj204cbiy

// Normal sudoku rules apply.
//
// An arrow cell containing the digit n sends an echo n cells away in the
// direction of the arrow: that cell also contains n. Smaller digits are
// silent along these arrows - no digit m, which is less than n, appears
// exactly m cells away in that direction.
//
// Each small arrow glyph lives in one cell and points along one of the four
// diagonals. Encode it as a family of pairwise constraints along the ray:
// for the cell k steps from the arrow cell in its direction, the arrow
// cell's value a and the ray cell's value b must satisfy:
//   a < k             -> no constraint (rule not "activated" yet)
//   a == k            -> b == k (the echo)
//   a > k             -> b != k (the smaller digit m=k stays silent)
// Applying one such Pair per (arrow cell, ray cell) at every in-range k
// reproduces both clauses of the rule exactly, including that an echo/silence
// check only applies while the ray cell is still on the board.
//
// "Sends an echo n cells away" presupposes that cell exists: an arrow cell
// cannot hold a digit whose echo would fall off the grid, so each arrow
// cell's own domain is capped at its distance to the board edge along its
// direction (restricted below via a candidate-limiting Given).

const arrows = [
  // [row, col, deltaRow, deltaCol]
  [4, 1, 1, 1],
  [6, 1, -1, 1],
  [4, 9, 1, -1],
  [6, 9, -1, -1],
  [6, 8, 1, -1],
  [2, 8, 1, -1],
  [1, 2, 1, 1],
  [3, 5, 1, -1],
  [2, 4, 1, 1],
  [8, 1, -1, 1],
  [9, 1, -1, 1],
  [9, 2, -1, 1],
  [8, 4, -1, 1],
  [8, 6, -1, -1],
];

function echoRelation(k) {
  return (a, b) => {
    if (a < k) return true;
    if (a === k) return b === k;
    return b !== k;
  };
}

function inRange(v) {
  return v >= 1 && v <= 9;
}

function arrowConstraints([row, col, dr, dc]) {
  const arrowCell = makeCellId(row, col);
  let maxK = 0;
  const pairs = [];
  for (let k = 1; k <= 9; k++) {
    const r = row + k * dr;
    const c = col + k * dc;
    if (!inRange(r) || !inRange(c)) break;
    maxK = k;
    const rayCell = makeCellId(r, c);
    pairs.push(new Pair(
      Pair.fnToKey(echoRelation(k), 9),
      `Echo${k}`,
      arrowCell, rayCell,
    ));
  }
  // The arrow cell's own echo must land on the grid.
  const domainConstraints = maxK < 9 ? [new Given(arrowCell, ...Array.from({ length: maxK }, (_, i) => i + 1))] : [];
  return [...pairs, ...domainConstraints];
}

return [
  new Shape('9x9'),
  new Given('R4C5', 7),
  ...arrows.flatMap(arrowConstraints),
];
