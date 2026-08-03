// Title: Arrow-Ace Sudoku
// Author: Jack Lance
// Video: https://www.youtube.com/watch?v=y4z3XPJI1NY
// Source: https://app.crackingthecryptic.com/sudoku/22BGJMtRm4

// Normal sudoku rules (default 3x3 boxes).
//
// Arrows: digits on an arrow sum to the value in the attached circle. Every
// circle here is the arrow's own first cell (a grid cell, not a separate
// pill), so Arrow(circleCell, ...armCells) is exactly "circle = sum of arm".
//
// Ace rule: each 3x3 box must satisfy at least one of two rules over its own
// orthogonally-adjacent cell pairs: no pair differs by 1, OR no pair sums to
// 11. The choice is independent per box, so each box is `Or(And(all pairs
// obey diff-1 rule), And(all pairs obey sum-11 rule))`. Pairs are encoded
// individually (not as one multi-cell Pair path) because a 3x3 box's
// orthogonal-adjacency graph is not a single Hamiltonian path.

const diffKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const sumKey = Pair.fnToKey((a, b) => a + b !== 11, 9);

// All orthogonally-adjacent cell pairs within one box's cell list, each pair
// reported once.
const graph = cellGraph();
const boxOrthogonalPairs = (box) => {
  const inBox = new Set(box);
  const pairs = [];
  for (const cell of box) {
    for (const neighbour of graph.neighbours(cell)) {
      if (inBox.has(neighbour) && cell < neighbour) pairs.push([cell, neighbour]);
    }
  }
  return pairs;
};

const aceConstraints = graph.boxes().map((box) => {
  const pairs = boxOrthogonalPairs(box);
  const diffRule = new And(
    pairs.map(([a, b]) => new Pair(diffKey, 'AceDiff', a, b)));
  const sumRule = new And(
    pairs.map(([a, b]) => new Pair(sumKey, 'AceSum', a, b)));
  return new Or([diffRule, sumRule]);
});

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R9C9', 1),

  // Arrows: circle cell first, then the rest of the arm, in drawn order.
  new Arrow('R2C6', 'R1C5', 'R2C4', 'R3C3', 'R4C2'),
  new Arrow('R5C1', 'R6C1', 'R7C2'),
  new Arrow('R8C4', 'R7C4', 'R6C4', 'R7C3'),
  new Arrow('R7C7', 'R7C8', 'R6C9', 'R5C9', 'R4C8', 'R3C7'),
  new Arrow('R9C7', 'R8C6', 'R7C6', 'R6C6'),
  new Arrow('R9C3', 'R9C4', 'R9C5', 'R9C6'),

  // Ace rule, one Or(diff-rule, sum-rule) per box.
  ...aceConstraints,
];
