// Title: What Are the Odds?
// Author: Melvyn Mainini
// Video: https://www.youtube.com/watch?v=edGr3cRHGH8
// Source: https://app.crackingthecryptic.com/sudoku/QFbrngbFb7
//
// Normal sudoku rules (rows/columns/3x3 boxes all-different) apply.
// Treat the grid as a torus: row 9 is adjacent to row 1, column 9 is
// adjacent to column 1. Under this wraparound every cell has exactly 4
// orthogonal neighbours (up/down/left/right). For every cell: if its digit
// is 2, exactly 2 of its 4 neighbours are even; if its digit is 3, exactly 3
// of its 4 neighbours are even; any other digit carries no such restriction.
//
// Encoded as one NFA per cell, scanning [center, up, down, left, right].
// The NFA reads the center digit first to pick a target (2, 3, or "free" =
// unconstrained), then counts even digits among the following four
// neighbours, clamped at target+1 so the state stays bounded; it accepts
// when the count equals the chosen target (or always, for "free").

const givens = [
  // givens transcribed from the puzzle grid
  ['R1C5', 6], ['R2C1', 9], ['R2C6', 2], ['R2C7', 3], ['R2C8', 6], ['R2C9', 7],
  ['R3C2', 3], ['R3C8', 1],
  ['R5C2', 2], ['R5C5', 3],
  ['R6C3', 3], ['R6C5', 9], ['R6C8', 2],
  ['R7C2', 5], ['R7C4', 8], ['R7C7', 4], ['R7C8', 3],
  ['R8C1', 4], ['R8C5', 7],
  ['R9C5', 2], ['R9C9', 9],
];

const spec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) {
      // First symbol is the center cell's own digit; it selects the target
      // neighbour-even-count (2 or 3), or "free" for every other digit.
      if (value === 2) return { target: 2, count: 0 };
      if (value === 3) return { target: 3, count: 0 };
      return { target: 'free', count: 0 };
    }
    if (target === 'free') return { target: 'free', count: 0 };
    const hit = (value % 2 === 0) ? 1 : 0;
    // Clamp at target + 1: once count exceeds target it can only stay wrong.
    return { target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) => target === 'free' || count === target,
}, 9);

// Torus-wrapped orthogonal neighbour cell id, 1-indexed rows/cols.
const wrap = n => ((n - 1 + 9) % 9) + 1;
const neighbourNFAs = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    const center = makeCellId(row, col);
    const up = makeCellId(wrap(row - 1), col);
    const down = makeCellId(wrap(row + 1), col);
    const left = makeCellId(row, wrap(col - 1));
    const right = makeCellId(row, wrap(col + 1));
    neighbourNFAs.push(
      new NFA(spec, 'evenNeighbourCount', center, up, down, left, right)
    );
  }
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...neighbourNFAs,
];
