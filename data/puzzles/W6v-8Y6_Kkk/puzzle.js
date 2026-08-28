// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=W6v-8Y6_Kkk
// Source: https://tinyurl.com/y95cepq5

// Poker Fillomino, 10x10. There is no Sudoku layer, so the grid is Raw: rows,
// columns and boxes carry no rule and values repeat freely.
//
// Rules encoded:
//  * Standard Fillomino. Divide the grid into polyominoes; a cell's value is
//    the area of the polyomino it belongs to; no two polyominoes of equal area
//    share an edge. Those clauses together say exactly one thing about the
//    filled grid: the orthogonally connected run of equal values containing a
//    cell has that many cells.
//  * The 16 given numbers.
//  * The values in the six drawn 5-cell cages form, in some order, four of a
//    kind, a straight, a full house, three of a kind, one pair and one pair,
//    reading 1 as ace and 11/12/13 as jack/queen/king.
//
// Omitted: polyominoes of area 17 or more. A value has to name an area, and the
// value alphabet stops at 16, so such a region cannot be written down. Areas
// 1..16 are encoded exactly.

const MAX_AREA = 16;   // the whole value alphabet; also the largest area encoded
const RANKS = 13;      // ace..king, the values a cage cell may take
const SIDE = 10;

const shape = new Shape('10x10', '1-' + MAX_AREA, 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// Each region is modelled as a rooted tree over its own cells. Five overlays
// carry it, all of them bookkeeping rather than puzzle content:
//   parent  - ROOT, or the direction of the cell one step nearer the root;
//   subtree - how many cells hang below this one, itself included;
//   rootRow
//   rootCol - which cell is the root of this cell's region;
//   depth   - steps from the root, counting the root as 1.
// Four facts then say "the connected run of equal values has that many cells":
// a root's subtree is its whole region and equals the value written there; a
// non-root hangs off a neighbour holding the same value; two neighbours holding
// the same value must name the same root, so two equal-area regions cannot end
// up sharing an edge; and subtree counts strictly grow towards a root, so the
// pointers cannot cycle and every cell reaches its root.
const ROOT = 1;
const DIRS = [
  // `back` is the pointer value a neighbour in this direction uses to point
  // back at the cell we started from.
  { code: 2, back: 3, dRow: -1, dCol: 0 },
  { code: 3, back: 2, dRow: 1, dCol: 0 },
  { code: 4, back: 5, dRow: 0, dCol: -1 },
  { code: 5, back: 4, dRow: 0, dCol: 1 },
];
const parent = graph.makeOverlay('VP');
const subtree = graph.makeOverlay('VS');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const depth = graph.makeOverlay('VD');

const neighboursOf = cell => DIRS
  .map(dir => ({ dir, other: graph.step(cell, dir.dRow, dir.dCol) }))
  .filter(entry => entry.other);

// Reads [subtree(cell), then parent(n), subtree(n) for each neighbour n in a
// fixed order]. `expected[i]` is the pointer value that makes neighbour i a
// child of this cell. The state carries only how much of the cell's own subtree
// count is still unaccounted for, so it never climbs past MAX_AREA - 1.
const subtreeSpecs = new Map();
const subtreeSpec = expected => {
  const key = expected.join('_');
  if (!subtreeSpecs.has(key)) {
    subtreeSpecs.set(key, NFA.encodeSpec({
      startState: { i: -1, rem: null, child: null },
      transition: (state, value) => {
        if (state.i === -1) return { i: 0, rem: value - 1, child: null };
        if (state.i >= expected.length) return undefined;
        if (state.child === null) {
          return { i: state.i, rem: state.rem, child: value === expected[state.i] };
        }
        const rem = state.child ? state.rem - value : state.rem;
        return rem < 0 ? undefined : { i: state.i + 1, rem, child: null };
      },
      accept: state => state.i === expected.length && state.rem === 0,
    }, shape));
  }
  return subtreeSpecs.get(key);
};

const subtreeSums = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  return new NFA(
    subtreeSpec(neighbours.map(entry => entry.dir.back)),
    'subtree size',
    subtree.at(cell),
    ...neighbours.flatMap(
      ({ other }) => [parent.at(other), subtree.at(other)]));
});

// Reads [value(a), value(b), label(a), label(b)] for one orthogonal edge:
// neighbours holding the same value are in the same region and so must name
// the same root. Used once for the root's row and once for its column.
const rootEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, label: value };
    if (state.phase === 3) {
      return (!state.same || value === state.label) ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

// Reads [value(a), value(b), depth(a), depth(b)]: within a region no step may
// change the distance to the root by more than one, which is what makes `depth`
// the true distance rather than any descending chain.
const depthEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, depth: value };
    if (state.phase === 3) {
      return (!state.same || Math.abs(value - state.depth) <= 1)
        ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

const edges = cells.flatMap(cell => DIRS
  .filter(dir => dir.dRow > 0 || dir.dCol > 0)   // each edge once
  .flatMap(dir => {
    const other = graph.step(cell, dir.dRow, dir.dCol);
    return other ? [{ cell, other }] : [];
  }));

const regionEdges = edges.flatMap(({ cell, other }) => [
  new NFA(rootEdgeSpec, 'same region root row',
    cell, other, rootRow.at(cell), rootRow.at(other)),
  new NFA(rootEdgeSpec, 'same region root column',
    cell, other, rootCol.at(cell), rootCol.at(other)),
  new NFA(depthEdgeSpec, 'depth changes by one',
    cell, other, depth.at(cell), depth.at(other)),
]);

// Reads [value(cell), value(other), depth(cell), depth(other)] and rejects the
// case where `other` could have served as the parent. Placed on the earlier
// directions of each branch, it makes the parent the first eligible neighbour
// in DIRS order, so the tree is fixed by the region rather than chosen.
const notParentSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, depth: value };
    if (state.phase === 3) {
      return (state.same && value === state.depth - 1) ? undefined : { phase: 4 };
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

const depthStep = Pair.fnToKey((mine, other) => other === mine - 1, shape);

const parentChoice = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const neighbours = neighboursOf(cell);
  return new Or([
    new And([
      new Given(parent.at(cell), ROOT),
      new Given(depth.at(cell), 1),
      new Given(rootRow.at(cell), row),
      new Given(rootCol.at(cell), col),
      new SameValues(2, subtree.at(cell), cell),
    ]),
    ...neighbours.map(({ dir, other }, k) => new And([
      new Given(parent.at(cell), dir.code),
      new SameValues(2, cell, other),
      new SameValues(2, rootRow.at(cell), rootRow.at(other)),
      new SameValues(2, rootCol.at(cell), rootCol.at(other)),
      new Pair(depthStep, 'one step nearer the root',
        depth.at(cell), depth.at(other)),
      ...neighbours.slice(0, k).map(earlier => new NFA(
        notParentSpec, 'earlier neighbour is not a parent',
        cell, earlier.other, depth.at(cell), depth.at(earlier.other))),
    ])),
  ]);
});

// Which cell of a region carries the root is this model's choice, not the
// puzzle's, so it is pinned to the region's first cell in reading order: a
// cell's root never comes after the cell itself.
const rootOrderKeys = new Map();
const rootOrderKey = (row, col) => {
  const key = row + '_' + col;
  if (!rootOrderKeys.has(key)) {
    rootOrderKeys.set(key, Pair.fnToKey(
      (r, c) => r < row || (r === row && c <= col), shape));
  }
  return rootOrderKeys.get(key);
};

// A root's row and column name a cell on the board, so they stop at 10 even
// though the alphabet runs to 16.
const onBoard = Array.from({ length: SIDE }, (_, i) => i + 1);
const rootDomains = [
  rootRow.makeReplicate(new Given(rootRow.cells()[0], ...onBoard)),
  rootCol.makeReplicate(new Given(rootCol.cells()[0], ...onBoard)),
  ...cells.map(cell => {
    const { row, col } = parseCellId(cell);
    return new Pair(rootOrderKey(row, col), 'root comes first in reading order',
      rootRow.at(cell), rootCol.at(cell));
  }),
];

// The six drawn cages, each a straight run of five cells:
// [startRow, startCol, rowStep, colStep].
const CAGE_RUNS = [
  [1, 8, 1, 0],
  [2, 1, 0, 1],
  [4, 1, 0, 1],
  [6, 3, 1, 0],
  [7, 6, 0, 1],
  [9, 6, 0, 1],
];
const CAGE_SIZE = 5;
const CAGES = CAGE_RUNS.map(([row, col, rowStep, colStep]) => Array.from(
  { length: CAGE_SIZE },
  (_, i) => makeCellId(row + i * rowStep, col + i * colStep)));

// A cage cell holds a card, and the conversion the rules give names 1..13 only.
const cardValues = Array.from({ length: RANKS }, (_, i) => i + 1);
const cardRanges = CAGES.flat().map(cell => new Given(cell, ...cardValues));

const FOUR_OF_A_KIND = 1;
const STRAIGHT = 2;
const FULL_HOUSE = 3;
const THREE_OF_A_KIND = 4;
const ONE_PAIR = 5;
// Each named hand as the multiset of "how many cards of the hand share my
// rank", one entry per card. These are the exclusive poker categories: a full
// house is not a three of a kind, and two pair is not one pair.
const HAND_SHAPES = new Map([
  [FOUR_OF_A_KIND, [4, 4, 4, 4, 1]],
  [STRAIGHT, [1, 1, 1, 1, 1]],
  [FULL_HOUSE, [3, 3, 3, 2, 2]],
  [THREE_OF_A_KIND, [3, 3, 3, 1, 1]],
  [ONE_PAIR, [2, 2, 1, 1, 1]],
]);

const hands = new Var('H', 'hand named by each cage', CAGES.length);
const mults = new Var('M', 'rank multiplicity of each card',
  CAGES.length * CAGE_SIZE);
const lows = new Var('L', 'low card of the straight', CAGES.length);
const handCell = i => 'VH' + (i + 1);
const multCell = (i, j) => 'VM' + (i * CAGE_SIZE + j + 1);
const lowCell = i => 'VL' + (i + 1);

// Reads [card, its multiplicity, then the whole cage]. The multiplicity is how
// many of the cage's five cards share that card's rank.
const multSpec = NFA.encodeSpec({
  startState: { phase: 'card' },
  transition: (state, value) => {
    if (state.phase === 'card') {
      return value <= RANKS ? { phase: 'mult', card: value } : undefined;
    }
    if (state.phase === 'mult') {
      return value <= CAGE_SIZE
        ? { card: state.card, mult: value, count: 0 } : undefined;
    }
    const count = state.count + (value === state.card ? 1 : 0);
    return count <= state.mult
      ? { card: state.card, mult: state.mult, count } : undefined;
  },
  accept: state => state.count === state.mult,
}, shape);

const multiplicities = CAGES.flatMap((cage, i) => cage.map(
  (cell, j) => new NFA(
    multSpec, 'rank multiplicity', cell, multCell(i, j), ...cage)));

// Reads [the cage's hand, then its five multiplicities]. The multiplicities are
// exactly the shape of the named hand, in any order.
const handSpec = NFA.encodeSpec({
  startState: { need: null },
  transition: (state, value) => {
    if (state.need === null) {
      const wanted = HAND_SHAPES.get(value);
      return wanted ? { need: wanted } : undefined;
    }
    const at = state.need.indexOf(value);
    if (at < 0) return undefined;
    const need = state.need.slice();
    need.splice(at, 1);
    return { need };
  },
  accept: state => state.need !== null && state.need.length === 0,
}, shape);

const handShapes = CAGES.map((cage, i) => new NFA(
  handSpec, 'hand shape', handCell(i),
  ...cage.map((cell, j) => multCell(i, j))));

// Reads [the cage's hand, its low card, then the whole cage]. When the cage is
// the straight its five cards run five consecutive ranks up from the low card,
// one of them being the low card itself. The rules name the ranks as cards, so
// the ace closes the run at either end and the run wraps king to ace: lows 1..9
// are the plain runs and low 10 is ten-jack-queen-king-ace. No other wrap is a
// straight, which is why the low card stops at 10. A cage that is not the
// straight pins the unused low card to 1.
const straightSpec = NFA.encodeSpec({
  startState: { phase: 'hand' },
  transition: (state, value) => {
    if (state.phase === 'hand') {
      return { phase: 'low', straight: value === STRAIGHT };
    }
    if (state.phase === 'low') {
      if (!state.straight) return value === 1 ? { phase: 'idle' } : undefined;
      return value >= 1 && value <= RANKS - (CAGE_SIZE - 2)
        ? { phase: 'run', low: value, sawLow: false } : undefined;
    }
    if (state.phase === 'idle') return state;
    if (value > RANKS) return undefined;
    const offset = (value - state.low + RANKS) % RANKS;
    return offset < CAGE_SIZE
      ? { phase: 'run', low: state.low, sawLow: state.sawLow || offset === 0 }
      : undefined;
  },
  accept: state =>
    state.phase === 'idle' || (state.phase === 'run' && state.sawLow),
}, shape);

const straights = CAGES.map((cage, i) => new NFA(
  straightSpec, 'straight run', handCell(i), lowCell(i), ...cage));

// Transcribed from the 16 numbers printed in the grid: [row, col, value].
const GIVENS = [
  [1, 4, 13], [1, 10, 11], [2, 9, 7], [3, 2, 11], [3, 4, 13], [4, 9, 6],
  [5, 4, 2], [5, 6, 1], [6, 5, 4], [6, 7, 2], [7, 2, 10], [8, 7, 8],
  [8, 9, 7], [9, 2, 9], [10, 1, 6], [10, 7, 12],
];

return [
  shape,
  parent.toVar('parent pointer'),
  subtree.toVar('subtree size'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  depth.toVar('depth from root'),
  hands,
  mults,
  lows,
  ...GIVENS.map(([row, col, value]) => new Given(makeCellId(row, col), value)),
  ...rootDomains,
  ...parentChoice,
  ...subtreeSums,
  ...regionEdges,
  ...cardRanges,
  ...multiplicities,
  ...handShapes,
  ...straights,
  // The six cages hold each named hand once, and one pair twice.
  new ContainExact([
    FOUR_OF_A_KIND, STRAIGHT, FULL_HOUSE, THREE_OF_A_KIND, ONE_PAIR, ONE_PAIR,
  ].join('_'), ...CAGES.map((cage, i) => handCell(i))),
];
