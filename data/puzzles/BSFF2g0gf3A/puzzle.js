// Title: Double the fun
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=BSFF2g0gf3A
// Source: https://sudokupad.app/wbwn6dl8xz

// Normal sudoku rules apply. Every south-west to north-east diagonal is also
// all-different. A black circle's digit equals the count of its neighbours in
// a 1:2 ratio with it, and all such circles are shown. Phistomefel's ring has
// prime sum.
const shape = new Shape('9x9');
const graph = cellGraph(shape);

const diagonalStarts = [
  ...graph.column(1),
  ...graph.row(9).slice(1),
];
const positiveDiagonals = diagonalStarts
  .map(start => graph.ray(start, -1, 1))
  .filter(cells => cells.length >= 2)
  .map(cells => new AllDifferent(...cells));

const circledCells = new Set([
  'R2C4',
  'R3C2', 'R3C7',
  'R4C4', 'R4C8',
  'R5C9',
  'R6C3',
  'R7C1', 'R7C3', 'R7C7',
  'R8C5', 'R8C8',
  'R9C6', 'R9C7', 'R9C9',
]);

const ratioCountSpec = (mustEqual) => NFA.encodeSpec({
  startState: { target: 0, count: 0 },
  transition: ({ target, count }, value) => {
    // The first cell is the circle/control cell. Remaining cells are its
    // neighbours, in an arbitrary fixed order.
    if (target === 0) return { target: value, count: 0 };
    const isRatio = value === 2 * target || target === 2 * value;
    return { target, count: count + (isRatio ? 1 : 0) };
  },
  accept: ({ target, count }) => mustEqual
    ? count === target
    : count !== target,
  // One control cell plus at most eight neighbours.
  maxDepth: 9,
}, shape);

const circledRatioCount = ratioCountSpec(true);
const uncircledRatioCount = ratioCountSpec(false);
const countingConstraints = graph.cells().map(cell => {
  const { row, col } = parseCellId(cell);
  const neighbours = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const [r, c] = [row + dr, col + dc];
      if (r >= 1 && r <= 9 && c >= 1 && c <= 9) {
        neighbours.push(makeCellId(r, c));
      }
    }
  }
  const isCircled = circledCells.has(cell);
  return new NFA(
    isCircled ? circledRatioCount : uncircledRatioCount,
    isCircled ? 'circled ratio count' : 'uncircled ratio count',
    [cell, ...neighbours],
  );
});

const ring = [
  'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R4C3', 'R4C7',
  'R5C3', 'R5C7',
  'R6C3', 'R6C7',
  'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7',
];
// The minimum and maximum possible sums are 16 and 144. An Or of exact Sum
// constraints expresses primality without assigning a non-existent cage total.
const primeRingSums = [
  17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
  71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127,
  131, 137, 139,
];

return [
  shape,
  ...positiveDiagonals,
  ...countingConstraints,
  new Or(primeRingSums.map(total => new Sum(total, ...ring))),
];
