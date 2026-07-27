// Title: Treasury Island
// Author: SUDOOOOOKUfan87
// Video: https://www.youtube.com/watch?v=GXd2QbPKQwk
// Source: https://sudokupad.app/5y0k8sp8ev

// Rules encoded here:
//   Normal sudoku. Every cell is island or water. Each purple cell is an
//   island cell and each island holds exactly one purple cell. Different
//   islands may not touch orthogonally. The water is orthogonally connected
//   and holds no 2x2 all-water block. A normal island holds non-repeating
//   digits summing to its purple total, or to 6, 9 or 25 when no total is
//   given, and its purple digit is the island's cell count. Exactly one of
//   the islands with no given total is Treasury Island: it is exempt from the
//   sum, distinctness and cell-count rules, and instead splits into
//   non-overlapping dominoes that each sum to 10.
// "Totals are not necessarily in the top left most cell of an island" adds no
// constraint: it says a total is read from its own purple cell wherever that
// sits, which is how the totals are attached below. Nothing is omitted.

// The value range is widened to 11 so the auxiliary layers can hold the ten
// island labels plus water; the playable grid is restricted back to 1-9.
const WATER = 11;
const shape = new Shape('9x9', 11);
const graph = cellGraph(shape);
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();

// Island label per cell: 1-10 name the ten islands in the order listed
// below, WATER marks a water cell.
const label = graph.makeOverlay('VS');
// Domino partner direction per cell, meaningful only on Treasury Island.
const domino = graph.makeOverlay('VD');
const NONE = 1;
const UP = 2;
const DOWN = 3;
const LEFT = 4;
const RIGHT = 5;
const STEPS = new Map([
  [UP, [-1, 0]], [DOWN, [1, 0]], [LEFT, [0, -1]], [RIGHT, [0, 1]],
]);

// Which island is Treasury Island has to be worked out, so it is a variable.
const treasury = new Var('T', 'treasury island', 1);
const TREASURY = treasury.cells()[0];

// The ten purple cells and their drawn cage totals (null = no total given).
const ISLANDS = [
  { purple: 'R1C2', total: 9 },
  { purple: 'R1C5', total: 25 },
  { purple: 'R1C8', total: null },
  { purple: 'R2C3', total: 6 },
  { purple: 'R4C2', total: null },
  { purple: 'R4C4', total: null },
  { purple: 'R7C3', total: 25 },
  { purple: 'R8C6', total: 6 },
  { purple: 'R9C2', total: null },
  { purple: 'R9C4', total: null },
].map((island, i) => ({ ...island, id: i + 1 }));

const NO_TOTAL_SUMS = [6, 9, 25];
const MAX_SUM = Math.max(...NO_TOTAL_SUMS);
const TOTALLESS = ISLANDS.filter(i => i.total === null).map(i => i.id);
const isTotalless = (id) => TOTALLESS.includes(id);

// A normal island's digits are distinct, so n cells sum to at least
// 1+2+...+n. That caps its size, and a connected region of n cells stays
// within n-1 steps of its purple cell. The bound is used to keep the scans
// below short; Treasury Island has no sum, so it gets no such bound.
const maxSize = (total) => {
  let n = 0;
  while ((n + 1) * (n + 2) / 2 <= total) n++;
  return n;
};
const reach = (purple, radius) => {
  const p = parseCellId(purple);
  return gridCells.filter(cell => {
    const c = parseCellId(cell);
    return Math.abs(c.row - p.row) + Math.abs(c.col - p.col) <= radius;
  });
};
const REACH = new Map(ISLANDS.map(island =>
  [island.id,
  new Set(reach(island.purple, maxSize(island.total ?? MAX_SUM) - 1))]));

// Every grid cell holds a digit; every label cell holds water, an untotalled
// label, or a totalled label whose island can reach it; every direction cell
// points inside the grid.
const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const labelDomain = gridCells.map(cell => new Given(
  label.at(cell),
  WATER,
  ...ISLANDS.filter(i => isTotalless(i.id) || REACH.get(i.id).has(cell))
    .map(i => i.id)));
const dominoDomain = gridCells.map(cell => new Given(
  domino.at(cell),
  NONE,
  ...[...STEPS].filter(([, [dR, dC]]) => graph.step(cell, dR, dC))
    .map(([direction]) => direction)));

// Each purple cell is an island cell, and names its own island. Pinning one
// purple cell per label also gives "exactly one purple cell per island" and
// removes the label-permutation symmetry.
const purpleLabels = ISLANDS.map(
  island => new Given(label.at(island.purple), island.id));

// Each island, and the water, is a single orthogonally-connected region.
const connectivity = [
  ...ISLANDS.map(island => new ConnectedValues('VS', island.id)),
  new ConnectedValues('VS', WATER),
];

// The two orthogonal steps that visit every edge of the grid exactly once.
const EDGE_STEPS = [[0, 1], [1, 0]];
const neighbourPairs = gridCells.flatMap(cell =>
  EDGE_STEPS
    .map(([dR, dC]) => graph.step(cell, dR, dC))
    .filter(other => other)
    .map(other => [cell, other]));

// Orthogonal neighbours share an island label, or at least one is water.
const noTouchKey = Pair.fnToKey(
  (a, b) => a === b || a === WATER || b === WATER, numValues);
const noTouch = EDGE_STEPS.map(([dR, dC]) => label.makeReplicate(
  new Pair(noTouchKey, 'islands-do-not-touch',
    label.at(gridCells[0]), label.at(graph.step(gridCells[0], dR, dC))),
  label.at(gridCells.filter(cell => graph.step(cell, dR, dC)))));

// No 2x2 block is entirely water. A negative water count marks a block that a
// non-water cell has already broken.
const noWater2x2Machine = NFA.encodeSpec({
  startState: { water: 0 },
  transition: ({ water }, value) => {
    if (water < 0 || value !== WATER) return { water: -1 };
    return water === 3 ? undefined : { water: water + 1 };
  },
  accept: ({ water }) => water < 0,
}, numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noWater2x2 = label.makeReplicate(
  new NFA(noWater2x2Machine, 'no-2x2-water',
    ...label.at(graph.block(gridCells[0], 2, 2))),
  label.at(blockOrigins));

// Treasury Island is one of the islands with no given total.
const treasuryDomain = new Given(TREASURY, ...TOTALLESS);

// The machines below are all prefixed with the treasury variable when their
// island might be Treasury Island: reading its own id sends the machine to a
// `skip` state that accepts anything, because Treasury Island obeys none of
// the size, sum, distinctness or reach rules.
const prefixFor = (id) => isTotalless(id) ? [TREASURY] : [];
const startFor = (id, normalStart) =>
  isTotalless(id) ? { mode: 'treasury?' } : normalStart;
const skipStep = (state, value, id, normalStart) => {
  if (state.mode === 'skip') return state;
  if (state.mode === 'treasury?') {
    return value === id ? { mode: 'skip' } : normalStart;
  }
  return null;
};

// Unless it is Treasury Island, an untotalled island stays within reach of
// its purple cell: a far cell may carry its label only when the treasury
// variable names it.
const confine = ISLANDS.filter(i => isTotalless(i.id)).flatMap(island => {
  const key = Pair.fnToKey(
    (chosen, cellLabel) => chosen === island.id || cellLabel !== island.id,
    numValues);
  return gridCells.filter(cell => !REACH.get(island.id).has(cell)).map(
    cell => new Pair(key, `island-${island.id}-confined`,
      TREASURY, label.at(cell)));
});

// The purple digit counts the island's cells.
const sizeMachine = (id) => {
  const normalStart = { mode: 'purple' };
  return NFA.encodeSpec({
    startState: startFor(id, normalStart),
    transition: (state, value) => {
      const skipped = skipStep(state, value, id, normalStart);
      if (skipped) return skipped;
      if (state.mode === 'purple') {
        return { mode: 'count', size: value, count: 0 };
      }
      const { size, count } = state;
      if (value !== id) return state;
      return count === size
        ? undefined : { mode: 'count', size, count: count + 1 };
    },
    accept: (state) => state.mode === 'skip'
      || (state.mode === 'count' && state.count === state.size),
  }, numValues);
};

// The island's digits do not repeat and sum to its total, or to 6, 9 or 25
// when it has no total. The state is the set of digits the island has used so
// far, which carries both halves of the rule. The scan interleaves each label
// cell with its own digit, so the machine knows whether the digit it is about
// to read belongs to island `id`.
const scanCells = (cells) => cells.flatMap(cell => [label.at(cell), cell]);
const bitSum = (mask) => {
  let total = 0;
  for (let digit = 1; digit <= 9; digit++) {
    if (mask & (1 << (digit - 1))) total += digit;
  }
  return total;
};
const sumMachine = (id, total) => {
  const normalStart = { mode: 'label', mask: 0 };
  const cap = total ?? MAX_SUM;
  return NFA.encodeSpec({
    startState: startFor(id, normalStart),
    transition: (state, value) => {
      const skipped = skipStep(state, value, id, normalStart);
      if (skipped) return skipped;
      if (state.mode === 'label') {
        return { mode: 'digit', mask: state.mask, mine: value === id };
      }
      if (!state.mine) return { mode: 'label', mask: state.mask };
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;
      const mask = state.mask | bit;
      return bitSum(mask) > cap ? undefined : { mode: 'label', mask };
    },
    accept: (state) => state.mode === 'skip'
      || (state.mode === 'label'
        && (total === null
          ? NO_TOTAL_SUMS.includes(bitSum(state.mask))
          : bitSum(state.mask) === total)),
  }, numValues);
};

const islandRules = ISLANDS.flatMap(({ id, purple, total }) => {
  const scope = [...REACH.get(id)];
  const prefix = prefixFor(id);
  return [
    new NFA(sizeMachine(id), `island-${id}-size`,
      ...prefix, purple, ...label.at(scope)),
    new NFA(sumMachine(id, total), `island-${id}-sum`,
      ...prefix, ...scanCells(scope)),
  ];
});

// A cell carries a domino direction exactly when it lies on Treasury Island.
// Scanning [treasury, label, direction] lets one machine compare all three.
const onTreasuryMachine = NFA.encodeSpec({
  startState: { mode: 'treasury' },
  transition: (state, value) => {
    if (state.mode === 'treasury') return { mode: 'label', island: value };
    if (state.mode === 'label') {
      return { mode: 'direction', mine: value === state.island };
    }
    return state.mine === (value !== NONE) ? { mode: 'done' } : undefined;
  },
  accept: (state) => state.mode === 'done',
}, numValues);
const onTreasury = gridCells.map(cell => new NFA(
  onTreasuryMachine, 'domino-covers-treasury',
  TREASURY, label.at(cell), domino.at(cell)));

// Two orthogonally adjacent cells form a domino exactly when the first points
// at the second and the second points back, and a domino's digits sum to 10.
// Every Treasury cell lying in exactly one such domino is what "divides into
// non-overlapping dominoes that each sum to 10" asks for.
const dominoMachine = (forward, backward) => NFA.encodeSpec({
  startState: { mode: 'from' },
  transition: (state, value) => {
    if (state.mode === 'from') {
      return { mode: 'to', paired: value === forward };
    }
    if (state.mode === 'to') {
      return (value === backward) !== state.paired
        ? undefined : { mode: 'first', paired: state.paired };
    }
    if (state.mode === 'first') {
      return { mode: 'second', paired: state.paired, first: value };
    }
    return state.paired && state.first + value !== 10
      ? undefined : { mode: 'done' };
  },
  accept: (state) => state.mode === 'done',
}, numValues);
const acrossMachine = dominoMachine(RIGHT, LEFT);
const downMachine = dominoMachine(DOWN, UP);
const dominoPairs = neighbourPairs.map(([a, b]) => new NFA(
  parseCellId(a).row === parseCellId(b).row ? acrossMachine : downMachine,
  'domino-pair', domino.at(a), domino.at(b), a, b));

return [
  shape,
  label.toVar('island label'),
  domino.toVar('domino direction'),
  treasury,
  digitDomain,
  ...labelDomain,
  ...dominoDomain,
  ...purpleLabels,
  ...connectivity,
  ...noTouch,
  noWater2x2,
  treasuryDomain,
  ...confine,
  ...islandRules,
  ...onTreasury,
  ...dominoPairs,
];
