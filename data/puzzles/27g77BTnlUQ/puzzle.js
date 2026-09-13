// Title: Diamondback
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=27g77BTnlUQ
// Source: https://sudokupad.app/tnsd7b86gv

// Rules:
// - Normal sudoku rules apply (rows/cols/boxes all-different, from the
//   default 9x9 Shape).
// - A digit in a large diamond equals the number of cells it can see, along
//   its own row and column, that are larger than itself: a smaller digit in
//   the way blocks vision beyond it in that direction, a larger digit does
//   not block.
// - A small diamond straddling an edge means the two digits it joins differ
//   by a multiple of three.

// Large-diamond cells: the drawn diamond decoration sits on one cell each,
// with no printed value -- the mark is purely positional.
const largeDiamondCells = [
  'R3C3', 'R5C3', 'R5C4', 'R6C1', 'R6C8', 'R7C3', 'R7C4', 'R1C8', 'R9C3',
];

// Small-diamond edges: the drawn diamond decoration straddles a shared edge
// between two orthogonally adjacent cells, again with no printed value.
const smallDiamondEdges = [
  ['R3C5', 'R3C6'], ['R1C4', 'R2C4'], ['R5C5', 'R6C5'], ['R6C5', 'R7C5'],
  ['R1C6', 'R2C6'], ['R8C5', 'R9C5'], ['R4C6', 'R4C7'], ['R6C6', 'R6C7'],
  ['R8C2', 'R8C3'], ['R2C3', 'R2C4'],
];

// One multi-segment NFA per large-diamond cell: the origin segment's value
// sets `target`; each of the four rays (near-to-far) is then its own
// segment. `blocked` resets at every SEGMENT_BREAK (a new ray starting),
// while `count` carries across rays since the rule sums all four
// directions. A cell smaller than `target` sets `blocked`; once blocked,
// later cells on that ray are consumed but ignored. A cell larger than
// `target` increments `count` (clamped at target+1, a permanent-fail sink).
// value === target cannot occur (the cell shares a row or column with the
// origin, so sudoku forbids equal digits); that case is folded into the
// blocking branch since it is unreachable in any valid grid.
const sightlineSpec = NFA.encodeSpec({
  startState: { target: null, count: 0, blocked: false },
  transition: ({ target, count, blocked }, value) => {
    // Break first: falls between every pair of segments, including around
    // an empty ray, so no consuming branch below may see it.
    if (value === SEGMENT_BREAK) {
      if (target === null) return undefined; // origin not read yet
      return { target, count, blocked: false };
    }
    if (target === null) return { target: value, count: 0, blocked: false };
    if (blocked) return { target, count, blocked: true };
    if (value > target) {
      return { target, count: Math.min(count + 1, target + 1), blocked: false };
    }
    return { target, count, blocked: true };
  },
  accept: ({ target, count }) => target !== null && count === target,
  // Every instance below consumes exactly 1 (origin) + 8 (up+down cover the
  // rest of the column) + 8 (left+right cover the rest of the row) + 4
  // (segment breaks) = 21 symbols, regardless of the origin's position.
  maxDepth: 21,
}, 9, { multiSegment: true });

// Cells strictly between the origin and the grid edge, ordered near-to-far.
function ray(row, col, dRow, dCol) {
  const cells = [];
  for (
    let r = row + dRow, c = col + dCol;
    r >= 1 && r <= 9 && c >= 1 && c <= 9;
    r += dRow, c += dCol
  ) {
    cells.push(makeCellId(r, c));
  }
  return cells;
}

const sightlines = largeDiamondCells.map(id => {
  const { row, col } = parseCellId(id);
  return new NFA(
    sightlineSpec, 'diamondSight',
    [id],
    ray(row, col, -1, 0), // up
    ray(row, col, 1, 0),  // down
    ray(row, col, 0, -1), // left
    ray(row, col, 0, 1),  // right
  );
});

// Small diamonds: the two joined digits differ by a multiple of three (3 or
// 6 in practice -- the cells share a row or column, so sudoku already rules
// out a difference of 0).
const diffByThreeKey = Pair.fnToKey((a, b) => Math.abs(a - b) % 3 === 0, 9);
const smallDiamonds = smallDiamondEdges.map(
  ([a, b]) => new Pair(diffByThreeKey, 'small diamond', a, b)
);

return [
  new Shape('9x9'),
  ...sightlines,
  ...smallDiamonds,
];
