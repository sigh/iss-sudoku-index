// Title: Knight's Court
// Author: 12tone
// Video: https://www.youtube.com/watch?v=Hl20PNtwCm4
// Source: https://cracking-the-cryptic.web.app/sudoku/jmBGMQJFbm

// Normal sudoku rules (default rows/cols/boxes). The central box (R4C4-R6C6,
// the payload's green-filled cells) is "full of knights": each of its 9
// cells must see exactly one other cell holding the same digit by a chess
// knight's move, anywhere on the grid. All cells outside the central box are
// not knights: a knight's-move pair with BOTH ends outside the box may never
// match (plain anti-knight, scoped to those pairs); a pair with one end in
// the central box is governed by that cell's own "exactly one" rule instead,
// so it is not forbidden outright.

const givens = [
  ['R2C3', 1], ['R2C4', 2], ['R2C5', 9], ['R2C6', 8], ['R2C7', 6],
  ['R3C2', 3], ['R3C8', 7],
  ['R4C2', 8], ['R4C8', 2],
  ['R5C2', 1], ['R5C8', 6],
  ['R6C2', 7], ['R6C8', 4],
  ['R7C2', 9], ['R7C8', 8],
  ['R8C3', 5], ['R8C4', 4], ['R8C5', 8], ['R8C6', 2], ['R8C7', 3],
];

const graph = cellGraph('9x9');

// Central box, from the payload's underlay fill (R4C4-R6C6).
const centerBox = graph.box(5);
const centerBoxSet = new Set(centerBox);

const KNIGHT_DELTAS = [
  [1, 2], [1, -2], [-1, 2], [-1, -2],
  [2, 1], [2, -1], [-2, 1], [-2, -1],
];

function knightNeighbors(cell) {
  return KNIGHT_DELTAS
    .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
    .filter(c => c !== null);
}

// Every knight's-move edge on the grid, deduplicated to one entry per
// unordered pair.
const seenEdges = new Set();
const edges = [];
for (const a of graph.cells()) {
  for (const b of knightNeighbors(a)) {
    const key = [a, b].sort().join('-');
    if (seenEdges.has(key)) continue;
    seenEdges.add(key);
    edges.push([a, b]);
  }
}

// Knight edges with neither end in the central box: ordinary anti-knight,
// scoped to just these pairs (outside cells "do not see" a knight-move match
// at all). A 2-cell not-equal pair is a 2-cell AllDifferent.
const outsideOutsideEdges = edges.filter(
  ([a, b]) => !centerBoxSet.has(a) && !centerBoxSet.has(b));

// "Exactly one knight-move match" NFA: first symbol is the origin (a central
// cell), the rest are its knight neighbours; accept iff exactly one neighbour
// equals the origin's value. Counting only needs to reach 2 (an early second
// match already fails), so the count field is clamped there.
const exactlyOneKnightMatchSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const hit = value === target ? 1 : 0;
    return { target, count: Math.min(count + hit, 2) };
  },
  accept: ({ target, count }) => count === 1,
}, 9);

const centralKnightRules = centerBox.map(
  origin => new NFA(
    exactlyOneKnightMatchSpec, `knight-${origin}`,
    origin, ...knightNeighbors(origin)));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...outsideOutsideEdges.map(([a, b]) => new AllDifferent(a, b)),
  ...centralKnightRules,
];
