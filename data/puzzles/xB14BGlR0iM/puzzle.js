// Title: Dustpan
// Author: Qodec
// Video: https://www.youtube.com/watch?v=xB14BGlR0iM
// Source: https://app.crackingthecryptic.com/sudoku/H2qm8BLDHh

// Rules:
// - Normal sudoku rules apply.
// - Digits cannot appear in the same relative position within different
//   3x3 box regions (DisjointSets).
// - A circled cell's digit equals the count of cells sharing its own
//   parity, within the 3x3 (king-move) neighbourhood centred on it and
//   clipped to the grid, including the circled cell itself. The rules'
//   worked example (an odd digit in a corner forces the other 3 cells of
//   its 4-cell neighbourhood all even) confirms clipping rather than
//   wrapping or padding at the grid edge.

// Clipped king-move neighbourhood of a cell, origin cell first so the NFA
// below reads it before any neighbour.
const graph = cellGraph('9x9');
function neighbourhood(cellId) {
  return [cellId, ...graph.kingNeighbours(cellId)];
}

// Circle centres, from the puzzle's overlay geometry: the top-left cell of
// each of the 9 boxes, plus two extra circles at R2C2 and R5C5.
const CIRCLES = [
  ...graph.boxes().map(box => box[0]),
  'R2C2', 'R5C5',
];

// Reads the origin cell first to fix the target digit/parity, then counts
// same-parity neighbours -- starting the count at 1 so the origin counts
// itself, per the rule. Accepts when the running count equals the origin's
// own digit, the self-referential quantity the circle shows.
const sameParitySpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 1 };
    const sameParity = (value % 2) === (target % 2);
    // Clamp at target+1: a sink meaning "already too many".
    return { target, count: Math.min(count + (sameParity ? 1 : 0), target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 9,
}, 9);

const parityCounts = CIRCLES.map(
  cell => new NFA(sameParitySpec, 'ParityCount', ...neighbourhood(cell))
);

return [
  new Shape('9x9'),
  new Given('R1C7', 6),
  new Given('R5C1', 7),
  new DisjointSets(),
  ...parityCounts,
];
