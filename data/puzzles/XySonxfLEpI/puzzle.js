// Title: Orchard
// Author: Blobz
// Video: https://www.youtube.com/watch?v=XySonxfLEpI
// Source: https://app.crackingthecryptic.com/blobz/orchard

// Rules encoded:
//   Normal sudoku rules apply.
//   Nine doubler fruit sit in the grid, one in each row, column and box, and
//   each digit 1-9 is doubled exactly once. A cell holding a doubler fruit
//   counts as twice its digit; every other cell counts as its digit. "Effective
//   value" below means that count, and every arithmetic or ordering rule reads
//   effective values.
//   Each of the four trees carries exactly one doubler fruit, on a branch tip.
//   The remaining five doubler fruit are off the trees.
//   Grey thermo tree: effective values increase away from the circled bulb.
//   Pink renban tree: the tree's effective values form a non-repeating set of
//   consecutive numbers.
//   Blue region sum trees: within each box, every piece of the tree has the same
//   effective-value sum N; each blue tree has its own N.
//   Cages: the effective values in a cage sum to the clue.
// Nothing in the ruleset is omitted. The rules state no no-repeat clause for the
// cages, so they are plain sums; each cage lies inside a single row or column,
// so sudoku already makes its digits distinct.

// A doubler adds the cell's own digit to its value, so the modifier is carried
// as an overlay holding either 0 (ordinary cell) or the cell's digit (doubler),
// and effective value = digit + overlay. The 0 value forces the widened 0-9
// alphabet; grid cells are pinned back to 1-9.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const doubled = graph.makeOverlay('VD');

// The cells of a clue followed by their overlay cells: summing this list is
// summing effective values.
const withDoublers = cells => [...cells, ...doubled.at(cells)];

// Exactly one doubler among `cells`: every overlay cell but one holds 0.
const oneDoubler = cells => new ContainExact(
  new Array(cells.length - 1).fill('0').join('_'), ...doubled.at(cells));

// Trees, exactly as the source draws them: one 5-cell trunk stroke per tree,
// plus three 2-cell branch strokes, each drawn tip-first into its trunk cell.
// The colour of the stroke gives the tree its rule.
const TREES = [
  {
    name: 'thermo (grey)',
    trunk: ['R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3'],
    branches: [['R1C2', 'R2C3'], ['R2C4', 'R3C3'], ['R3C2', 'R4C3']],
  },
  {
    name: 'renban (pink)',
    trunk: ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
    branches: [['R5C4', 'R6C5'], ['R4C6', 'R5C5'], ['R3C4', 'R4C5']],
  },
  {
    name: 'region sum left (blue)',
    trunk: ['R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2'],
    branches: [['R7C1', 'R8C2'], ['R6C3', 'R7C2'], ['R5C1', 'R6C2']],
  },
  {
    name: 'region sum right (blue)',
    trunk: ['R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8'],
    branches: [['R4C7', 'R5C8'], ['R2C7', 'R3C8'], ['R3C9', 'R4C8']],
  },
];

// Cage cells and totals, transcribed from the drawn killer cages.
const CAGES = [
  { total: 13, cells: ['R1C1', 'R1C2', 'R1C3'] },
  { total: 22, cells: ['R2C2', 'R2C3', 'R2C4'] },
  { total: 16, cells: ['R1C7', 'R1C8', 'R1C9'] },
  { total: 16, cells: ['R2C6', 'R2C7', 'R2C8'] },
  { total: 16, cells: ['R4C6', 'R4C7'] },
  { total: 11, cells: ['R6C1', 'R6C2'] },
  { total: 11, cells: ['R7C1', 'R8C1'] },
  { total: 17, cells: ['R9C2', 'R9C3'] },
  { total: 17, cells: ['R9C7', 'R9C8'] },
  { total: 11, cells: ['R7C9', 'R8C9'] },
  { total: 9, cells: ['R6C7', 'R6C8'] },
];

const treeCells = tree => [...tree.trunk, ...tree.branches.map(([tip]) => tip)];
const treeEdges = tree => [
  ...tree.trunk.slice(1).map((cell, i) => [tree.trunk[i], cell]),
  ...tree.branches,
];

// Every tree is drawn growing upwards -- each branch leaves the trunk towards a
// lower row -- so the base is the bottom end of the trunk. On the thermo tree
// that base is R5C3, the cell the source circles as the bulb.
const treeBase = tree => {
  const ends = [tree.trunk[0], tree.trunk[tree.trunk.length - 1]];
  return parseCellId(ends[0]).row > parseCellId(ends[1]).row ? ends[0] : ends[1];
};

const treeDegrees = tree => {
  const degrees = new Map(treeCells(tree).map(cell => [cell, 0]));
  for (const [a, b] of treeEdges(tree)) {
    degrees.set(a, degrees.get(a) + 1);
    degrees.set(b, degrees.get(b) + 1);
  }
  return degrees;
};

// The tips are the ends of the tree other than its base: the far end of each
// branch stroke, and the top of the trunk.
const treeTips = tree => {
  const degrees = treeDegrees(tree);
  const base = treeBase(tree);
  return treeCells(tree).filter(cell => degrees.get(cell) === 1 && cell !== base);
};

// Tree edges oriented away from the base, for the thermo's direction.
const edgesFromBase = tree => {
  const neighbours = new Map(treeCells(tree).map(cell => [cell, []]));
  for (const [a, b] of treeEdges(tree)) {
    neighbours.get(a).push(b);
    neighbours.get(b).push(a);
  }
  const seen = new Set([treeBase(tree)]);
  const queue = [treeBase(tree)];
  const oriented = [];
  while (queue.length) {
    const cell = queue.shift();
    for (const next of neighbours.get(cell)) {
      if (seen.has(next)) continue;
      seen.add(next);
      oriented.push([cell, next]);
      queue.push(next);
    }
  }
  return oriented;
};

// The pieces the tree makes inside one box: connected groups of the tree's cells
// within that box. A tree that leaves a box and comes back has two pieces there.
const boxPieces = tree => {
  const edges = treeEdges(tree);
  return graph.boxes().flatMap(box => {
    const cells = treeCells(tree).filter(cell => box.includes(cell));
    const parent = new Map(cells.map(cell => [cell, cell]));
    const find = cell => {
      while (parent.get(cell) !== cell) cell = parent.get(cell);
      return cell;
    };
    for (const [a, b] of edges) {
      if (parent.has(a) && parent.has(b)) parent.set(find(a), find(b));
    }
    const pieces = new Map();
    for (const cell of cells) {
      const root = find(cell);
      if (!pieces.has(root)) pieces.set(root, []);
      pieces.get(root).push(cell);
    }
    return [...pieces.values()];
  });
};

// The overlay holds 0 on an ordinary cell and the cell's own digit on a doubler.
const doublerValue = Pair.fnToKey(
  (digit, extra) => extra === 0 || extra === digit, shape);

// Reads [low digit, low overlay, high digit, high overlay] and accepts when the
// low cell's effective value is strictly below the high cell's. The digit is
// carried across one symbol so it can be added to its own overlay value.
const effectiveIncrease = NFA.encodeSpec({
  startState: { phase: 'lowDigit' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'lowDigit':
        return { phase: 'lowExtra', digit: value };
      case 'lowExtra':
        return { phase: 'highDigit', low: state.digit + value };
      case 'highDigit':
        return { phase: 'highExtra', low: state.low, digit: value };
      case 'highExtra':
        return state.low < state.digit + value ? { phase: 'done' } : undefined;
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'done',
}, shape);

const thermoTree = TREES[0];
const renbanTree = TREES[1];
const renbanCells = treeCells(renbanTree);

// The renban run is written as base + offset: the offsets are a permutation of
// 0..7, so the eight effective values are distinct and consecutive, and the base
// is the smallest of them. At most one cell of a tree is doubled, so at least
// seven of the eight effective values are plain digits (<= 9) and the run starts
// at 3 or below -- the base Var's 0-9 domain cannot cut off a legal run.
const renbanBase = new Var('M', 'renban base', 1);
const renbanOffsets = new Var('R', 'renban offsets', renbanCells.length);
const renbanOffsetValues = renbanCells.map((_, i) => i);

return [
  shape,
  doubled.toVar('doubler fruit'),
  renbanBase,
  renbanOffsets,

  // Playable digits are 1-9; the extra 0 exists only for the overlay.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  // Doubler fruit: what a doubled cell's overlay may hold, then one per house,
  // then each digit doubled exactly once across the grid.
  ...gridCells.map(cell =>
    new Pair(doublerValue, 'doubler', cell, doubled.at(cell))),
  ...graph.rowsColumnsBoxes().map(oneDoubler),
  new ContainExact('1_2_3_4_5_6_7_8_9', ...doubled.cells()),

  // One doubler fruit per tree, on a branch tip, so no other cell of a tree is
  // a doubler.
  ...TREES.map(tree => oneDoubler(treeTips(tree))),
  ...TREES.flatMap(tree => {
    const tips = treeTips(tree);
    return treeCells(tree)
      .filter(cell => !tips.includes(cell))
      .map(cell => new Given(doubled.at(cell), 0));
  }),

  // Thermo tree: one step up in effective value along every edge away from the
  // bulb.
  ...edgesFromBase(thermoTree).map(([low, high]) =>
    new NFA(effectiveIncrease, 'ThermoTree',
      low, doubled.at(low), high, doubled.at(high))),

  // Renban tree.
  ...renbanCells.map((cell, i) =>
    // effective value == base + offset
    new EqualSum(
      [cell, doubled.at(cell)],
      [renbanBase.cell(1), renbanOffsets.cell(i + 1)])),
  ...renbanCells.map((_, i) =>
    new Given(renbanOffsets.cell(i + 1), ...renbanOffsetValues)),
  new AllDifferent(...renbanOffsets.cells()),

  // Region sum trees: all of one tree's box pieces share a sum.
  ...TREES.slice(2).map(tree =>
    new EqualSum(...boxPieces(tree).map(withDoublers))),

  // Cages.
  ...CAGES.map(({ total, cells }) => new Sum(total, ...withDoublers(cells))),
];
