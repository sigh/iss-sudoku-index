// Title: cento mani e cento occhi
// Author: aqjhs
// Video: https://www.youtube.com/watch?v=tn9ZcK8j8_w
// Source: https://sudokupad.app/llm83vvquh

// Rules encoded below:
//   Normal sudoku rules apply.
//   The "slow thermometer line" is drawn as ten strokes that share endpoints
//   and together form one connected, branching network (a tree, not a simple
//   path): digits must increase or stay the same moving away from the single
//   true bulb end, along every branch of the tree. The bulb is one of the
//   tree's 21 leaf cells (its degree-1 endpoints), each marked with a circle;
//   which leaf is the bulb is undetermined and is expressed as a disjunction
//   over all 21, not resolved out of band.

const shape = new Shape('9x9');

// Tree edges, transcribed from the ten connected polylines that draw the
// slow thermometer (cell centres along each polyline, interpolated).
const EDGES = [
  ['R2C2', 'R3C3'], ['R3C3', 'R4C4'], ['R4C4', 'R5C5'], ['R5C5', 'R6C6'],
  ['R6C6', 'R7C7'], ['R7C7', 'R8C8'], ['R8C8', 'R8C7'],
  ['R5C3', 'R4C4'], ['R4C4', 'R3C4'],
  ['R7C8', 'R7C7'], ['R7C7', 'R6C7'],
  ['R5C1', 'R4C2'], ['R4C2', 'R3C3'], ['R3C3', 'R2C3'],
  ['R4C2', 'R3C1'],
  ['R6C8', 'R5C7'], ['R5C7', 'R5C6'], ['R5C6', 'R6C6'], ['R6C6', 'R7C6'],
  ['R7C6', 'R7C5'], ['R7C5', 'R8C5'], ['R8C5', 'R9C5'],
  ['R8C2', 'R7C3'], ['R7C3', 'R8C3'],
  ['R4C8', 'R4C7'], ['R4C7', 'R4C6'], ['R4C6', 'R5C5'], ['R5C5', 'R6C4'],
  ['R6C4', 'R7C3'], ['R7C3', 'R7C2'],
  ['R3C8', 'R3C7'], ['R3C7', 'R4C6'], ['R4C6', 'R3C6'],
  ['R2C8', 'R3C7'], ['R3C7', 'R2C7'],
  ['R8C4', 'R7C4'], ['R7C4', 'R6C5'], ['R6C5', 'R6C4'], ['R6C4', 'R6C3'],
];

// Circle-marked candidate bulb cells, transcribed from the puzzle's overlays.
const BULB_CANDIDATES = [
  'R2C2', 'R2C3', 'R2C7', 'R2C8', 'R3C1', 'R3C4', 'R3C6', 'R3C8', 'R4C8',
  'R5C1', 'R5C3', 'R6C3', 'R6C7', 'R6C8', 'R7C2', 'R7C8', 'R8C2', 'R8C3',
  'R8C4', 'R8C7', 'R9C5',
];

// Adjacency list, derived from the drawn edges above.
const adjacency = new Map();
for (const [a, b] of EDGES) {
  if (!adjacency.has(a)) adjacency.set(a, []);
  if (!adjacency.has(b)) adjacency.set(b, []);
  adjacency.get(a).push(b);
  adjacency.get(b).push(a);
}

// Confirm the candidate list is exactly the tree's leaves (degree-1 cells):
// a geometry transcription slip throws here instead of silently under- or
// over-constraining which cells can be the bulb.
const leaves = [...adjacency.keys()].filter(c => adjacency.get(c).length === 1);
const leafSet = new Set(leaves);
const candidateSet = new Set(BULB_CANDIDATES);
if (leafSet.size !== candidateSet.size ||
  ![...leafSet].every(c => candidateSet.has(c))) {
  throw new Error('bulb candidates do not match the tree leaves');
}

// a <= b: values increase or stay the same moving away from the bulb.
const slowKey = Pair.fnToKey((a, b) => a <= b, shape);

// For one candidate bulb, orient every edge away from it (BFS parent
// pointers), then decompose the tree into root-to-leaf paths -- one per other
// leaf -- and apply the slow-thermometer relation along each path in
// root-to-leaf order. Every tree edge lies on at least one such path, so this
// covers the whole tree; a path may repeat an edge nearer the root, which is
// redundant but harmless.
const branchFor = (root) => {
  const parent = new Map([[root, null]]);
  const queue = [root];
  while (queue.length) {
    const cur = queue.shift();
    for (const next of adjacency.get(cur)) {
      if (!parent.has(next)) {
        parent.set(next, cur);
        queue.push(next);
      }
    }
  }
  const pathTo = (leaf) => {
    const path = [];
    for (let c = leaf; c !== null; c = parent.get(c)) path.push(c);
    return path.reverse();
  };
  const otherLeaves = BULB_CANDIDATES.filter(c => c !== root);
  return new And(otherLeaves.map(
    leaf => new Pair(slowKey, 'slow thermometer', ...pathTo(leaf))));
};

// Exactly one of the 21 leaves is the true bulb; the solver must discover
// which.
const bulbChoice = new Or(BULB_CANDIDATES.map(branchFor));

return [
  shape,
  bulbChoice,
];
