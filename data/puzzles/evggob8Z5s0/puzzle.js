// Title: Carnivorous Pansy
// Author: Peter Veenis; Garford
// Video: https://www.youtube.com/watch?v=evggob8Z5s0
// Source: https://app.crackingthecryptic.com/sudoku/MNN7LtLL3G

// Normal sudoku rules apply.
//
// Grey thermos: three 2-cell thermos -- (R2C8,R1C9), (R1C8,R1C9), (R2C9,R1C9)
// -- each drawn from a circled bulb to the shared tip R1C9.
//
// Green thermos: the five yellowgreen polylines meet at shared cells and form
// one connected tree of 34 cells and 33 edges. Reading every adjacent cell
// pair along the tree as its own overlapping two-digit number is impossible
// by arithmetic alone: consecutive path cells are row- or column-adjacent so
// sudoku forces them distinct, which caps a strictly increasing overlapping
// chain at 10 cells, and the tree's longest root-to-leaf run is 13. A tree
// has at most one perfect matching; this one has exactly one, found below by
// peeling leaves, giving the 17 non-overlapping "double-digit numbers".
// The drawn shading agrees with that matching cell for cell: all 16 brown
// cells land in a ones place and all 15 yellowgreen cells in a tens place,
// the three remaining slots falling on R4C1, R5C5 (tens) and R5C4 (ones),
// which are shaded for the arrow system they also belong to.
// The red rounded-rect on R9C4-R9C5 marks "the plant's root" and is exactly
// one domino of that matching. Rooting the domino tree there orders the rest,
// and "the tens digit appearing first" is read as first along the outward
// walk from the root -- which is what puts every yellowgreen cell in the tens
// place.
// R5C4/R5C5 sit under the central pill but are on the green line rather than
// merely beneath it: line 6's waypoints are the exact cell centres [4.5,3.5]
// and [4.5,4.5], whereas every arrow shaft starts off-centre inside the pill
// (e.g. [4.2,3.2]).
//
// Arrows: five 4-cell arms leaving the shared 3-cell pill (R5C4 hundreds,
// R5C5 tens, R5C6 ones, left to right). Each arm shades purple, blue, purple,
// blue from the pill outward, pairing its cells into two consecutive
// double-digit numbers with the purple cell as tens.
// The rules sentence "double-digit numbers on arrows similarly must sum to
// the 3-digit number in the central pill" does not say whether the ten
// numbers sum to the pill collectively or each arm's own two sum to it
// separately, and the pill is one undivided shape with no per-arrow divider,
// text or marking. Both readings are encoded as a disjunction rather than one
// being chosen.

const shape = new Shape('9x9');

const greyThermos = [
  ['R2C8', 'R1C9'],
  ['R1C8', 'R1C9'],
  ['R2C9', 'R1C9'],
].map(cells => new Thermo(...cells));

// Cell-adjacency edges of the five green lines (raw payload lines[2..6]),
// transcribed from their drawn waypoints.
const greenEdges = [
  ['R3C1', 'R4C1'], ['R4C1', 'R4C2'], ['R4C2', 'R5C2'], ['R5C2', 'R6C3'],
  ['R6C3', 'R7C2'], ['R7C2', 'R7C1'], ['R7C1', 'R6C2'], ['R6C2', 'R6C1'],
  ['R6C3', 'R7C3'], ['R7C3', 'R6C4'], ['R6C4', 'R7C4'], ['R7C4', 'R8C4'],
  ['R8C4', 'R9C3'], ['R9C3', 'R8C2'],
  ['R8C4', 'R7C5'], ['R7C5', 'R7C6'], ['R7C6', 'R8C6'], ['R8C6', 'R9C5'],
  ['R9C4', 'R9C5'], ['R9C5', 'R9C6'], ['R9C6', 'R8C7'], ['R8C7', 'R7C8'],
  ['R7C8', 'R6C7'], ['R6C7', 'R6C8'], ['R6C8', 'R6C9'],
  ['R5C4', 'R5C5'], ['R5C5', 'R6C6'], ['R6C6', 'R7C7'], ['R7C7', 'R8C7'],
  ['R8C7', 'R8C8'], ['R8C8', 'R7C9'], ['R7C9', 'R8C9'], ['R8C9', 'R9C8'],
];

// The overlay-marked root pair (see header comment).
const rootPair = ['R9C4', 'R9C5'];

// Find the tree's unique perfect matching by repeatedly pairing off leaves.
function buildAdjacency(edges) {
  const adj = new Map();
  for (const [a, b] of edges) {
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a).add(b);
    adj.get(b).add(a);
  }
  return adj;
}

function findPerfectMatching(edges) {
  const adj = buildAdjacency(edges);
  const remaining = new Set(adj.keys());
  const pairs = [];
  while (remaining.size) {
    const leaf = [...remaining].find(
      n => [...adj.get(n)].filter(m => remaining.has(m)).length === 1);
    if (!leaf) throw new Error('No perfect matching found (not a tree?).');
    const partner = [...adj.get(leaf)].find(m => remaining.has(m));
    pairs.push([leaf, partner]);
    remaining.delete(leaf);
    remaining.delete(partner);
  }
  return pairs;
}

const dominoes = findPerfectMatching(greenEdges);

// Root the domino tree at the marked root pair, and orient every other
// domino so its tens digit is the cell nearer the root (reached first
// walking outward) and its ones digit is the cell farther from the root.
function orientDominoes(dominoPairs, edges, root) {
  const dominoOf = new Map();
  dominoPairs.forEach(([a, b], i) => { dominoOf.set(a, i); dominoOf.set(b, i); });

  const key = (a, b) => JSON.stringify([a, b].sort());
  const dominoKeys = new Set(dominoPairs.map(([a, b]) => key(a, b)));
  const interEdges = edges.filter(([a, b]) => !dominoKeys.has(key(a, b)));

  const dAdj = new Map();
  const edgeCell = new Map(); // "i,j" -> [cellInI, cellInJ]
  for (const [a, b] of interEdges) {
    const i = dominoOf.get(a), j = dominoOf.get(b);
    if (!dAdj.has(i)) dAdj.set(i, new Set());
    if (!dAdj.has(j)) dAdj.set(j, new Set());
    dAdj.get(i).add(j);
    dAdj.get(j).add(i);
    edgeCell.set(`${i},${j}`, [a, b]);
    edgeCell.set(`${j},${i}`, [b, a]);
  }

  const rootIdx = dominoOf.get(root[0]);
  const oriented = new Array(dominoPairs.length);
  oriented[rootIdx] = { tens: root[0], ones: root[1], parent: null };

  const seen = new Set([rootIdx]);
  const queue = [rootIdx];
  while (queue.length) {
    const cur = queue.shift();
    for (const nb of dAdj.get(cur) || []) {
      if (seen.has(nb)) continue;
      seen.add(nb);
      const [, entryCell] = edgeCell.get(`${cur},${nb}`);
      const [a, b] = dominoPairs[nb];
      const far = entryCell === a ? b : a;
      oriented[nb] = { tens: entryCell, ones: far, parent: cur };
      queue.push(nb);
    }
  }
  return oriented;
}

const oriented = orientDominoes(dominoes, greenEdges, rootPair);

const gtKey = Pair.fnToKey((a, b) => a > b, shape);
const eqKey = Pair.fnToKey((a, b) => a === b, shape);

// value(tens, ones) = 10*tens + ones; child value > parent value, compared
// lexicographically on (tens, ones) since the tens digit dominates.
function numberGreater(name, childTens, childOnes, parentTens, parentOnes) {
  return new Or([
    new Pair(gtKey, name, childTens, parentTens),
    new And([
      new Pair(eqKey, name, childTens, parentTens),
      new Pair(gtKey, name, childOnes, parentOnes),
    ]),
  ]);
}

const greenIncreasing = oriented
  .filter(d => d.parent !== null)
  .map(d => numberGreater(
    'green thermo', d.tens, d.ones,
    oriented[d.parent].tens, oriented[d.parent].ones));

// Arrow arms (raw payload arrows[0..4]), transcribed pill-end first,
// arrowhead last, with the shared pill cells (R5C4,R5C5,R5C6) already
// excluded per the arrow-bulb convention.
const arrowArms = [
  ['R4C3', 'R3C2', 'R4C1', 'R5C1'],
  ['R4C4', 'R3C3', 'R2C4', 'R1C5'],
  ['R4C5', 'R3C5', 'R3C4', 'R2C3'],
  ['R4C6', 'R3C6', 'R2C7', 'R1C7'],
  ['R4C7', 'R5C8', 'R5C7', 'R6C6'],
];

// Reading A: each arrow's own two numbers sum independently to the pill
// (five separate equations, all equal to the same target).
const perArrowSums = arrowArms.map(([a, b, c, d]) => new Sum(
  0,
  [a, 10], [b, 1], [c, 10], [d, 1],
  ['R5C4', -100], ['R5C5', -10], ['R5C6', -1]));
const readingPerArrow = new And(perArrowSums);

// Reading B: all ten numbers (2 per arrow x 5 arrows) sum together to the
// one pill value (one aggregate equation).
const aggregateTerms = [];
for (const [a, b, c, d] of arrowArms) {
  aggregateTerms.push([a, 10], [b, 1], [c, 10], [d, 1]);
}
aggregateTerms.push(['R5C4', -100], ['R5C5', -10], ['R5C6', -1]);
const readingAggregate = new Sum(0, ...aggregateTerms);

// Undistinguished by the source (see header comment): encode the faithful
// disjunction rather than choosing one.
const arrowPillRule = new Or([readingPerArrow, readingAggregate]);

return [
  shape,
  ...greyThermos,
  ...greenIncreasing,
  arrowPillRule,
];
