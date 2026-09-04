// Title: Chocolate Banana Killer
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=IpETnBSj9sE
// Source: https://app.crackingthecryptic.com/sudoku/4h9fBmbbFr

// Rules encoded (nothing omitted):
//  * Normal sudoku rules.
//  * Every cell is in a cage. A cage is wholly shaded or wholly unshaded; no
//    two shaded cages share an edge and no two unshaded cages share an edge.
//    Together these say the cages are exactly the orthogonally connected
//    components of the shading: same shade across an edge means same cage,
//    different shade means different cages.
//  * A cage is shaded exactly when it is a rectangle (a 1x1 square counts).
//  * Digits do not repeat within a cage.
//  * A printed number is the sum of the digits in the cage containing its
//    cell. Cages with no printed number have no total.
//
// The partition is carried by five whole-grid overlays:
//   VS  shade of the cell.
//   VL  which printed number's cage the cell is in (1-15 in CLUES order), or
//       UNCLUED for a cage with no printed number.
//   VR, VC  the row and column of the cell's cage root, the cage's first
//       cell in reading order.
//   VD  distance from the root plus one, so the root itself holds 1.
// Rooting every cage at its reading-order-first cell makes the overlays a
// function of the partition rather than a further choice.

const SHADED = 1;
const UNSHADED = 2;
const UNCLUED = 16;
const MAX_CAGE = 9;   // no repeats within a cage, so at most nine cells

// The value alphabet is widened to 16 so VL can name the 15 clued cages plus
// UNCLUED; every other layer, and the grid, is restricted back below.
const shape = new Shape('9x9', '1-16');
const graph = cellGraph(shape);
const cells = graph.cells();
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const DIGITS = range(1, 9);

// The 15 printed numbers, as [row, col, total]; each sits in the top-left
// corner of the cell named.
const CLUES = [
  [1, 1, 45], [1, 9, 18],
  [2, 2, 43], [2, 7, 11],
  [4, 2, 21], [4, 9, 17],
  [5, 4, 4], [5, 5, 7],
  [6, 8, 15],
  [7, 1, 10], [7, 6, 8],
  [8, 5, 31], [8, 8, 13],
  [9, 3, 11], [9, 9, 40],
];

const shade = graph.makeOverlay('VS');
const label = graph.makeOverlay('VL');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const depth = graph.makeOverlay('VD');

const domains = [
  graph.makeReplicate(new Given(cells[0], ...DIGITS)),
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED)),
  rootRow.makeReplicate(new Given(rootRow.cells()[0], ...DIGITS)),
  rootCol.makeReplicate(new Given(rootCol.cells()[0], ...DIGITS)),
  // Nine cells reach at most eight steps from the root.
  depth.makeReplicate(new Given(depth.cells()[0], ...range(1, MAX_CAGE))),
];

// Each orthogonal edge once, as [cell, later cell].
const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));

// --- Cages are the components of the shading -------------------------------
// Reads [shade(a), shade(b), rootRow(a), rootRow(b), rootCol(a), rootCol(b),
// label(a), label(b)] for one edge. Same shade: same cage, so the same root
// and the same label. Different shade: different cages, so they cannot both
// carry the same clued label (two unclued cages may sit side by side).
const edgeSpec = NFA.encodeSpec({
  startState: { phase: 0, same: null, carry: null },
  transition: (state, value) => {
    const { phase, same } = state;
    if (phase === 0) return { phase: 1, same: null, carry: value };
    if (phase === 1) return { phase: 2, same: value === state.carry, carry: null };
    if (phase === 2 || phase === 4) {
      return { phase: phase + 1, same, carry: same ? value : null };
    }
    if (phase === 3 || phase === 5) {
      if (same && value !== state.carry) return undefined;
      return { phase: phase + 1, same, carry: null };
    }
    if (phase === 6) return { phase: 7, same, carry: value };
    if (phase === 7) {
      const equal = value === state.carry;
      if (same ? !equal : (equal && value !== UNCLUED)) return undefined;
      return { phase: 8, same: null, carry: null };
    }
    return undefined;
  },
  accept: state => state.phase === 8,
}, shape);

const edgeAgreement = edges.map(([a, b]) => new NFA(edgeSpec, 'same shade same cage',
  shade.at(a), shade.at(b), rootRow.at(a), rootRow.at(b),
  rootCol.at(a), rootCol.at(b), label.at(a), label.at(b)));

// Reads [rootRow, rootCol, depth] of one cell: the root named never comes
// after the cell itself, and a cell holds depth 1 exactly when it names
// itself as root.
const rootSpecs = new Map();
const rootSpec = (row, col) => {
  const key = `${row}_${col}`;
  if (!rootSpecs.has(key)) {
    rootSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 0 },
      transition: (state, value) => {
        if (state.phase === 0) {
          return value > row ? undefined : { phase: 1, sameRow: value === row };
        }
        if (state.phase === 1) {
          if (state.sameRow && value > col) return undefined;
          return { phase: 2, isRoot: state.sameRow && value === col };
        }
        if (state.phase === 2) {
          return (value === 1) === state.isRoot ? { phase: 3 } : undefined;
        }
        return undefined;
      },
      accept: state => state.phase === 3,
    }, shape));
  }
  return rootSpecs.get(key);
};

const rootOrder = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(rootSpec(row, col), 'root is first in reading order',
    rootRow.at(cell), rootCol.at(cell), depth.at(cell));
});

// Reads [shade(cell), depth(cell)] then [shade(n), depth(n)] for each
// orthogonal neighbour n. A non-root cell's depth is one more than the least
// depth among its same-shade neighbours, which pins depth to the true
// distance from the root; following the depths down always reaches a depth-1
// cell, i.e. the root, so every cell's named root lies in its own cage.
const depthSpec = NFA.encodeSpec({
  startState: { phase: 'shade' },
  transition: (state, value) => {
    if (state.phase === 'shade') return { phase: 'depth', s: value };
    if (state.phase === 'depth') {
      return { phase: 'n-shade', s: state.s, d: value, exact: value === 1 };
    }
    if (state.phase === 'n-shade') {
      return { ...state, phase: 'n-depth', pend: value === state.s };
    }
    // n-depth: only same-shade neighbours count.
    const { s, d, exact, pend } = state;
    if (pend && d > 1 && value < d - 1) return undefined;
    return { phase: 'n-shade', s, d, exact: exact || (pend && value === d - 1) };
  },
  accept: state => state.phase === 'n-shade' && state.exact,
}, shape);

const depthSteps = cells.map(cell => new NFA(depthSpec, 'depth from root',
  shade.at(cell), depth.at(cell),
  ...graph.neighbours(cell).flatMap(n => [shade.at(n), depth.at(n)])));

// --- Shaded cages are rectangles, unshaded cages are not --------------------
// A connected group of cells is a rectangle exactly when no 2x2 window holds
// three of its cells and one outsider (that pattern is an inward corner).
// Reads the four shades of one window and rejects exactly three shaded.
const windowSpec = NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => Math.min(count + (value === SHADED ? 1 : 0), 4),
  accept: count => count !== 3,
  maxDepth: 4,
}, shape);

// One window per top-left cell that has a cell below and to the right.
const windowOrigins = cells.filter(cell => graph.block(cell, 2, 2));
const shadedRectangles = shade.makeReplicate(
  new NFA(windowSpec, 'shaded cages are rectangles',
    ...shade.at(graph.block(windowOrigins[0], 2, 2))),
  shade.at(windowOrigins));

// An unshaded cage that is a rectangle is an unshaded block whose every
// in-grid neighbour is shaded. Blocks larger than MAX_CAGE cells cannot be a
// cage at all (digits would repeat), so those up to MAX_CAGE are enumerated:
// each block has a shaded cell inside or an unshaded cell on its rim.
const blockShapes = range(1, MAX_CAGE).flatMap(h => range(1, Math.floor(MAX_CAGE / h))
  .map(w => [h, w]));

const unshadedNotRectangles = blockShapes.flatMap(([h, w]) => cells.flatMap(cell => {
  const block = graph.block(cell, h, w);
  if (!block) return [];
  const inside = new Set(block);
  const rim = [...new Set(block.flatMap(c => graph.neighbours(c)).filter(c => !inside.has(c)))];
  return [new Or([
    ...block.map(c => new Given(shade.at(c), SHADED)),
    ...rim.map(c => new Given(shade.at(c), UNSHADED)),
  ])];
}));

// --- Digits do not repeat within a cage -------------------------------------
// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b), digit(a), digit(b)]:
// two cells naming the same root are in one cage and must differ. Applied to
// every pair of cells not already distinct by row, column or box.
const distinctSpec = NFA.encodeSpec({
  startState: { phase: 0, same: true, carry: null },
  transition: (state, value) => {
    const { phase, same } = state;
    if (phase >= 6) return undefined;
    if (phase % 2 === 0) return { phase: phase + 1, same, carry: same ? value : null };
    const stillSame = same && value === state.carry;
    if (phase === 5) return stillSame ? undefined : { phase: 6, same: false, carry: null };
    return { phase: phase + 1, same: stillSame, carry: null };
  },
  accept: state => state.phase === 6,
}, shape);

const sharesHouse = (a, b) => {
  const p = parseCellId(a);
  const q = parseCellId(b);
  return p.row === q.row || p.col === q.col ||
    (Math.floor((p.row - 1) / 3) === Math.floor((q.row - 1) / 3) &&
      Math.floor((p.col - 1) / 3) === Math.floor((q.col - 1) / 3));
};

const cageDistinct = cells.flatMap((a, i) => cells.slice(i + 1)
  .filter(b => !sharesHouse(a, b))
  .map(b => new NFA(distinctSpec, 'no repeats in a cage',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b), a, b)));

// --- Printed numbers ---------------------------------------------------------
// Two printed numbers never share a cage (see the description), so each clue
// gets its own label; ConnectedValues makes that label one connected group,
// which with the edge rule above is exactly the clue's cage.
const clueCells = CLUES.map(([row, col]) => makeCellId(row, col));

const clueLabels = clueCells.flatMap((cell, i) => [
  new Given(label.at(cell), i + 1),
  new ConnectedValues('VL', i + 1),
]);

// Reads [label, digit] over the whole grid and sums the digits carrying the
// clue's label; `sum` is clamped one past the total.
const sumSpec = (clueLabel, total) => NFA.encodeSpec({
  startState: { member: null, sum: 0 },
  transition: (state, value) => {
    if (state.member === null) return { member: value === clueLabel, sum: state.sum };
    const sum = state.member ? state.sum + value : state.sum;
    return sum > total ? undefined : { member: null, sum };
  },
  accept: state => state.member === null && state.sum === total,
}, shape);

const clueSums = CLUES.map(([, , total], i) => new NFA(sumSpec(i + 1, total),
  `cage total ${total}`, ...cells.flatMap(cell => [label.at(cell), cell])));

return [
  shape,
  shade.toVar('shaded'),
  label.toVar('clue cage'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  depth.toVar('depth from root'),
  ...domains,
  ...edgeAgreement,
  ...rootOrder,
  ...depthSteps,
  shadedRectangles,
  ...unshadedNotRectangles,
  ...cageDistinct,
  ...clueLabels,
  ...clueSums,
];
