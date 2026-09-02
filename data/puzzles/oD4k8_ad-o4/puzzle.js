// Title: Killomino
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=oD4k8_ad-o4
// Source: https://app.crackingthecryptic.com/sudoku/f4F3rNQBBr

// Normal sudoku rules apply. Divide the grid into different areas such that
// orthogonally adjacent areas contain different numbers of cells. Every cell is
// part of exactly one area. Digits may not repeat within an area. Numbers in
// the top left corner of cells are clues. An area can contain no clue, one clue
// or more than one clue. All clues in an area must be identical and indicate
// the sum of the digits in that area.
//
// The grid has no given digits, and no area borders are drawn: the division
// into areas is found by the solver. "Orthogonally adjacent areas" compares
// areas across a shared edge, so an area is a set of cells joined edge to edge.
//
// Nothing is omitted. Two consequences of the stated rules are used to bound
// the model: an area holds each digit at most once, so it has at most nine
// cells, and no cell of an area is more than nine steps from any other.
//
// The model: each cell carries the size of its area, the coordinates of that
// area's root cell, a pointer to its parent in a tree spanning the area, its
// distance from the root, and two digit-set bitmasks -- one for the cells at or
// below it in the tree, one for the whole area. Areas are then the classes of
// cells naming a common root. Which spanning tree an area gets is not something
// the rules speak about, so it is pinned to one representative rather than left
// as a free choice: the root is the area's first cell in reading order, the
// distances are the true distances from it, and each cell's parent is the first
// neighbour, in a fixed direction order, that is one step nearer the root.

const NUM_VALUES = 16;     // widened alphabet: a bitmask m is stored as m + 1
const NUM_DIGITS = 9;
const BITS_PER_LAYER = 4;  // a 9-digit set needs three masks of this width
const NUM_LAYERS = Math.ceil(NUM_DIGITS / BITS_PER_LAYER);

// Read off the twenty numbers printed in cell corners, in reading order.
const CLUES = {
  R1C1: 44, R1C4: 43, R1C7: 10, R2C8: 5, R3C9: 14,
  R4C1: 43, R4C4: 42, R4C5: 15, R4C6: 3, R4C7: 3,
  R5C3: 10, R5C4: 7, R5C6: 6, R6C5: 10, R7C6: 8,
  R7C8: 7, R8C2: 6, R8C7: 45, R9C4: 9, R9C8: 8,
};

const shape = new Shape('9x9', NUM_VALUES);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Parent-pointer codes, in the priority order used to pick a cell's parent.
const ROOT = 1;
const DIRS = [
  { code: 2, opp: 4, dr: -1, dc: 0 },   // parent is the cell above
  { code: 5, opp: 3, dr: 0, dc: -1 },   // parent is the cell to the left
  { code: 3, opp: 5, dr: 0, dc: 1 },    // parent is the cell to the right
  { code: 4, opp: 2, dr: 1, dc: 0 },    // parent is the cell below
];
const PRIORITY = DIRS.map(d => d.code);

const parent = graph.makeOverlay('VP');    // ROOT, or a direction code
const rootRow = graph.makeOverlay('VX');   // row of this area's root cell
const rootCol = graph.makeOverlay('VY');   // column of this area's root cell
const areaSize = graph.makeOverlay('VZ');  // number of cells in this area
const depth = graph.makeOverlay('VW');     // steps from the root, root = 1
// Digit sets as bitmasks split into four-bit layers: layer i holds digits
// 4i+1 .. 4i+4. `sub` is the set of digits at or below a cell in its area's
// tree, `full` the set of digits of its whole area.
const sub = ['VA', 'VB', 'VC'].map(p => graph.makeOverlay(p));
const full = ['VD', 'VE', 'VF'].map(p => graph.makeOverlay(p));

const digits = Array.from({ length: NUM_DIGITS }, (_, i) => i + 1);
const layerOf = d => Math.floor((d - 1) / BITS_PER_LAYER);
const bitOf = d => 1 << ((d - 1) % BITS_PER_LAYER);
const layerDigits = i => digits.filter(d => layerOf(d) === i);
const maskValues = i =>
  Array.from({ length: 1 << layerDigits(i).length }, (_, m) => m + 1);
const maskSum = (i, mask) =>
  layerDigits(i).reduce((t, d) => t + ((mask & bitOf(d)) ? d : 0), 0);
const maskCount = (i, mask) =>
  layerDigits(i).reduce((t, d) => t + ((mask & bitOf(d)) ? 1 : 0), 0);

const neighboursOf = cell => DIRS
  .map(dir => ({ dir, cell: graph.step(cell, dir.dr, dir.dc) }))
  .filter(n => n.cell !== null);
const memo = fn => {
  const m = new Map();
  return k => (m.has(k) ? m : m.set(k, fn(k))).get(k);
};

// --- state machines -------------------------------------------------------

// Reads a gate cell followed by (mine, theirs) pairs: while the gate cell
// holds `trigger` every pair must be equal, otherwise the pairs are free.
// 'skip' is the gate-not-taken sink; 'held' carries the first value of a pair
// until its partner arrives.
const condEqual = memo(trigger => NFA.encodeSpec({
  startState: { stage: 'gate' },
  transition: (state, value) => {
    if (state.stage === 'gate') {
      return value === trigger ? { stage: 'cmp', held: null } : { stage: 'skip' };
    }
    if (state.stage === 'skip') return { stage: 'skip' };
    if (state.held === null) return { stage: 'cmp', held: value };
    return value === state.held ? { stage: 'cmp', held: null } : undefined;
  },
  accept: state => state.stage === 'skip'
    || (state.stage === 'cmp' && state.held === null),
}, shape));

// Reads [pointer, size and depth of this cell, size and depth of the neighbour
// in direction `code`]. The neighbour is a candidate parent when it is in the
// same area and one step nearer the root; 'must' means the pointer names it and
// so it has to be a candidate, 'not' means the pointer passed it over and so it
// must not be one, 'free' means a higher-priority neighbour was named.
// Neighbours in the same area share a size because areas that share a border
// may not share a size, so the size doubles as the same-area test.
const canonicalParent = memo(code => NFA.encodeSpec({
  startState: { stage: 'pointer' },
  transition: (state, value) => {
    switch (state.stage) {
      case 'pointer': {
        const mode = value === code ? 'must'
          : (value === ROOT || PRIORITY.indexOf(value) > PRIORITY.indexOf(code))
            ? 'not' : 'free';
        return { stage: 'sizeC', mode };
      }
      case 'sizeC': return { stage: 'sizeN', mode: state.mode, sizeC: value };
      case 'sizeN': {
        const sameArea = value === state.sizeC;
        if (state.mode === 'must' && !sameArea) return undefined;
        if (state.mode === 'free' || !sameArea) return { stage: 'skipC' };
        return { stage: 'depthC', mode: state.mode };
      }
      case 'skipC': return { stage: 'skipN' };
      case 'skipN': return { stage: 'done' };
      case 'depthC': return { stage: 'depthN', mode: state.mode, depthC: value };
      case 'depthN': {
        const candidate = value === state.depthC - 1;
        return candidate === (state.mode === 'must') ? { stage: 'done' } : undefined;
      }
      default: return undefined;
    }
  },
  accept: state => state.stage === 'done',
}, shape));

// Reads [size, size, depth, depth] over two orthogonally adjacent cells: a step
// within an area may change the distance to the root by at most one, which
// makes the depths the true distances and so fixes them from the area alone.
const depthStep = NFA.encodeSpec({
  startState: { stage: 'sizeA' },
  transition: (state, value) => {
    switch (state.stage) {
      case 'sizeA': return { stage: 'sizeB', sizeA: value };
      case 'sizeB': return value === state.sizeA ? { stage: 'depthA' } : { stage: 'skipA' };
      case 'skipA': return { stage: 'skipB' };
      case 'skipB': return { stage: 'done' };
      case 'depthA': return { stage: 'depthB', depthA: value };
      case 'depthB': return Math.abs(value - state.depthA) <= 1
        ? { stage: 'done' } : undefined;
      default: return undefined;
    }
  },
  accept: state => state.stage === 'done',
}, shape);

// Reads [digit, (pointer, subtree set) per neighbour, subtree set of this
// cell] for one mask layer: a cell's subtree set is its own digit together
// with the subtree set of every neighbour pointing back at it. `expected[k]`
// is the pointer value that makes neighbour k a child, so the machine depends
// on which neighbours the cell has. The union is required to be disjoint,
// which is where "digits may not repeat within an area" is enforced; it also
// makes each pointer step strictly grow the set, so the pointers cannot cycle
// and every chain ends at a root.
const subtreeUnion = (layer, expected) => NFA.encodeSpec({
  startState: { stage: 'digit' },
  transition: (state, value) => {
    if (state.stage === 'digit') {
      if (value > NUM_DIGITS) return undefined;
      return { stage: 'nb', slot: 0, acc: layerOf(value) === layer ? bitOf(value) : 0 };
    }
    if (state.stage === 'nb') {
      if (state.slot === expected.length) {
        return value - 1 === state.acc ? { stage: 'done' } : undefined;
      }
      return {
        stage: 'mask', slot: state.slot, acc: state.acc,
        child: value === expected[state.slot],
      };
    }
    if (state.stage === 'mask') {
      const mask = value - 1;
      if (!state.child) return { stage: 'nb', slot: state.slot + 1, acc: state.acc };
      if (mask & state.acc) return undefined;      // a digit would repeat
      return { stage: 'nb', slot: state.slot + 1, acc: state.acc | mask };
    }
    return undefined;
  },
  accept: state => state.stage === 'done',
}, shape);

// Reads the area's mask layers then its size: the size is how many digits the
// area's set holds, which is also how many cells it holds because an area's
// digits are distinct.
const sizeIsSetSize = NFA.encodeSpec({
  startState: { slot: 0, count: 0 },
  transition: (state, value) => {
    if (state.slot < NUM_LAYERS) {
      const count = state.count + maskCount(state.slot, value - 1);
      return count > NUM_DIGITS ? undefined : { slot: state.slot + 1, count };
    }
    if (state.slot > NUM_LAYERS) return undefined;
    return value === state.count
      ? { slot: NUM_LAYERS + 1, count: state.count } : undefined;
  },
  accept: state => state.slot === NUM_LAYERS + 1,
}, shape);

// Reads [root row, root col, size] of two orthogonally adjacent cells: two
// cells naming different roots are in different areas, and then their areas
// share a border and so may not share a size.
const adjacentAreasDiffer = NFA.encodeSpec({
  startState: { stage: 'rowA' },
  transition: (state, value) => {
    switch (state.stage) {
      case 'rowA': return { stage: 'rowB', rowA: value };
      case 'rowB': return { stage: 'colA', sameRow: value === state.rowA };
      case 'colA': return { stage: 'colB', sameRow: state.sameRow, colA: value };
      case 'colB': return (state.sameRow && value === state.colA)
        ? { stage: 'same1' } : { stage: 'sizeA' };
      case 'same1': return { stage: 'same2' };   // one area: the sizes are free
      case 'same2': return { stage: 'done' };
      case 'sizeA': return { stage: 'sizeB', sizeA: value };
      case 'sizeB': return value === state.sizeA ? undefined : { stage: 'done' };
      default: return undefined;
    }
  },
  accept: state => state.stage === 'done',
}, shape);

// Reads the area's mask layers: the digits of the area's set must total the
// printed clue. Applying this at each clued cell also makes two clues that
// land in one area read the same number.
const clueTotal = memo(clue => NFA.encodeSpec({
  startState: { slot: 0, sum: 0 },
  transition: (state, value) => {
    if (state.slot >= NUM_LAYERS) return undefined;
    const sum = state.sum + maskSum(state.slot, value - 1);
    return sum > clue ? undefined : { slot: state.slot + 1, sum };
  },
  accept: state => state.slot === NUM_LAYERS && state.sum === clue,
}, shape));

// --- domains --------------------------------------------------------------

// The widened alphabet carries the bitmasks; grid cells hold digits.
const digitDomains = graph.makeReplicate(new Given('R1C1', ...digits));
// A pointer either starts a tree or names a neighbour that exists, so unlike
// the others this domain differs at the edges of the grid.
const parentDomains = gridCells.map(cell => new Given(
  parent.at(cell), ROOT, ...neighboursOf(cell).map(n => n.dir.code)));
const structureDomains = [
  [rootRow, Array.from({ length: geometry.numRows }, (_, i) => i + 1)],
  [rootCol, Array.from({ length: geometry.numCols }, (_, i) => i + 1)],
  [areaSize, digits],
  [depth, digits],
].map(([overlay, values]) =>
  overlay.makeReplicate(new Given(overlay.at('R1C1'), ...values)));
const maskDomains = sub.flatMap((layer, i) => [layer, full[i]].map(overlay =>
  overlay.makeReplicate(new Given(overlay.at('R1C1'), ...maskValues(i)))));

// --- the areas ------------------------------------------------------------

// A cell that starts a tree names its own coordinates as its area's root, is
// at depth 1, and the root named by any cell may not come after that cell in
// reading order -- which, since every cell of an area names the same root and
// the root is one of them, makes the root the area's first cell.
const rootRowKey = memo(row => Pair.fnToKey((p, r) => p !== ROOT || r === row, shape));
const rootColKey = memo(col => Pair.fnToKey((p, c) => p !== ROOT || c === col, shape));
const rootFirstKey = memo(at => Pair.fnToKey((r, c) =>
  r < Math.floor(at / 100) || (r === Math.floor(at / 100) && c <= at % 100), shape));
const rootDepthKey = Pair.fnToKey((p, w) => p !== ROOT || w === 1, shape);
const rootRules = gridCells.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  return [
    new Pair(rootRowKey(row), 'root-row', parent.at(cell), rootRow.at(cell)),
    new Pair(rootColKey(col), 'root-col', parent.at(cell), rootCol.at(cell)),
    new Pair(rootFirstKey(row * 100 + col), 'root-first',
      rootRow.at(cell), rootCol.at(cell)),
    new Pair(rootDepthKey, 'root-depth', parent.at(cell), depth.at(cell)),
  ];
});

// A cell that names a neighbour as its parent is in that neighbour's area, so
// it copies the neighbour's root and its area's digit set.
const followParent = gridCells.flatMap(cell => neighboursOf(cell).map(n =>
  new NFA(condEqual(n.dir.code), 'parent-copies', parent.at(cell),
    rootRow.at(cell), rootRow.at(n.cell),
    rootCol.at(cell), rootCol.at(n.cell),
    ...full.flatMap(layer => [layer.at(cell), layer.at(n.cell)]))));

const parentChoice = gridCells.flatMap(cell => neighboursOf(cell).map(n =>
  new NFA(canonicalParent(n.dir.code), 'parent-choice', parent.at(cell),
    areaSize.at(cell), areaSize.at(n.cell), depth.at(cell), depth.at(n.cell))));

const depthSteps = gridCells.flatMap(cell => [[0, 1], [1, 0]].flatMap(([dr, dc]) => {
  const other = graph.step(cell, dr, dc);
  return other === null ? [] : [new NFA(depthStep, 'depth-step',
    areaSize.at(cell), areaSize.at(other), depth.at(cell), depth.at(other))];
}));

const subtreeSets = gridCells.flatMap(cell => {
  const nbs = neighboursOf(cell);
  const expected = nbs.map(n => n.dir.opp);
  return sub.map((layer, i) => new NFA(subtreeUnion(i, expected), 'subtree-set',
    cell,
    ...nbs.flatMap(n => [parent.at(n.cell), layer.at(n.cell)]),
    layer.at(cell)));
});

// At a root the subtree is the whole area, so the two sets agree there;
// followParent then carries the area's set to every other cell of the area.
const areaSets = gridCells.map(cell => new NFA(condEqual(ROOT), 'area-set',
  parent.at(cell),
  ...sub.flatMap((layer, i) => [layer.at(cell), full[i].at(cell)])));

const areaSizes = gridCells.map(cell => new NFA(sizeIsSetSize, 'area-size',
  ...full.map(layer => layer.at(cell)), areaSize.at(cell)));

const areaBorders = gridCells.flatMap(cell => [[0, 1], [1, 0]].flatMap(([dr, dc]) => {
  const other = graph.step(cell, dr, dc);
  return other === null ? [] : [new NFA(adjacentAreasDiffer, 'adjacent-areas',
    rootRow.at(cell), rootRow.at(other),
    rootCol.at(cell), rootCol.at(other),
    areaSize.at(cell), areaSize.at(other))];
}));

const clueRules = Object.entries(CLUES).map(([cell, clue]) =>
  new NFA(clueTotal(clue), 'clue', ...full.map(layer => layer.at(cell))));

return [
  shape,
  parent.toVar('parent pointer'),
  rootRow.toVar('area root row'),
  rootCol.toVar('area root column'),
  areaSize.toVar('area size'),
  depth.toVar('steps from root'),
  ...sub.map((layer, i) => layer.toVar(`subtree digits ${i + 1}`)),
  ...full.map((layer, i) => layer.toVar(`area digits ${i + 1}`)),
  digitDomains,
  ...parentDomains,
  ...structureDomains,
  ...maskDomains,
  ...rootRules,
  ...followParent,
  ...parentChoice,
  ...depthSteps,
  ...subtreeSets,
  ...areaSets,
  ...areaSizes,
  ...areaBorders,
  ...clueRules,
];
