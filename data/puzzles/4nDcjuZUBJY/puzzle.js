// Title: Zodiac Project: Ponta Delgada
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=4nDcjuZUBJY
// Source: https://sudokupad.app/2p1an6oilw

// Rules, all of which are encoded below.
//  * Normal sudoku.
//  * The nine cells containing a clue form an extra region: digits 1-9, no
//    repeats.
//  * Modified Nurikabe. Shade some cells so that all shaded cells form one
//    orthogonally connected area (water); each orthogonally connected group of
//    unshaded cells (an island) contains exactly one clue; no 2x2 is fully
//    shaded or fully unshaded.
//  * Thermal killer. Each island is a killer cage: its digits do not repeat and
//    sum to its clue. "?" states no total; "<8" states a total below 8.
//  * Within an island the digits all increase, or all decrease, at every step
//    away from the clue cell through the island.
//
// The shading and the island partition are what the solver has to find, so they
// live in Var overlays over the grid:
//   VL  island label: 0 = water, k = the island holding clue k. Water and each
//       island are separate connected classes on this one layer.
//   VT  thermal direction: 0 = water, 1 = the island's digits increase away
//       from its clue, 2 = they decrease.
//   VA..VI  one masked digit copy per island: 0 where the cell is outside that
//       island, the cell's digit where it is inside. The cage total is then a
//       plain Sum over the mask and "digits do not repeat" a PairX over it.
// 0 has to be a usable value for the masks and for water, so the alphabet is
// 0-9 and the grid cells are restricted back to 1-9.

const WATER = 0;
const INCREASING = 1;
const DECREASING = 2;

// The nine drawn clue labels with the cell each one sits in. `total` is the
// cage sum, `maxTotal` the bound for the "<8" clue, and `maxCells` the largest
// number of distinct 1-9 digits that can make that total: 43 takes exactly 8
// (7 distinct digits reach only 42, 9 always make 45), 33 takes at most 7
// (8 distinct digits already make 36), 12 at most 4 (5 make at least 15), and a
// total of 7 or below at most 3 (4 make at least 10). An unstated total leaves
// all 9.
const clues = [
  { cell: 'R3C2', total: 43, maxTotal: null, maxCells: 8 },
  { cell: 'R4C4', total: 12, maxTotal: null, maxCells: 4 },
  { cell: 'R9C7', total: 33, maxTotal: null, maxCells: 7 },
  { cell: 'R8C8', total: 33, maxTotal: null, maxCells: 7 },
  { cell: 'R5C9', total: null, maxTotal: 7, maxCells: 3 },
  { cell: 'R7C4', total: null, maxTotal: null, maxCells: 9 },
  { cell: 'R9C2', total: 7, maxTotal: null, maxCells: 3 },
  { cell: 'R4C1', total: null, maxTotal: null, maxCells: 9 },
  { cell: 'R1C7', total: null, maxTotal: null, maxCells: 9 },
];

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const label = graph.makeOverlay('VL');
const direction = graph.makeOverlay('VT');

// An island is connected and holds its clue, so no cell of it can be more than
// maxCells - 1 orthogonal steps from that clue. Each mask therefore only needs
// to cover the clue's reachable cells.
const reaches = (clue, cell) => {
  const a = parseCellId(clue.cell);
  const b = parseCellId(cell);
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) <= clue.maxCells - 1;
};
const masks = clues.map((clue, i) => graph.makeOverlay(
  'V' + 'ABCDEFGHI'[i], gridCells.filter(cell => reaches(clue, cell))));

const labelOf = i => i + 1;

// --- Digits and overlay domains. ---
const domains = [
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  direction.makeReplicate(
    new Given(direction.cells()[0], WATER, INCREASING, DECREASING)),
  // A cell may only carry the label of an island that can reach it.
  ...gridCells.map(cell => new Given(
    label.at(cell), WATER,
    ...clues.map((clue, i) => reaches(clue, cell) ? labelOf(i) : null)
      .filter(v => v !== null))),
];

// --- Nurikabe. ---
// Each clue is in its own island, so the nine islands are distinct and every
// island holds exactly one clue.
const clueLabels = clues.map(
  (clue, i) => new Given(label.at(clue.cell), labelOf(i)));

// One water region; and each label class is a single region, so no island
// splits into two blobs.
const connectivity = [
  new ConnectedValues('VL', WATER),
  ...clues.map((_, i) => new ConnectedValues('VL', labelOf(i))),
];

// Two adjacent unshaded cells are in the same island by definition, which is
// what makes the label classes the islands; the same relation spreads one
// thermal direction across each island. One template per step direction,
// stamped on every cell that has a neighbour that way.
const agreeOnLandKey = Pair.fnToKey(
  (a, b) => a === WATER || b === WATER || a === b, shape);
const edgeRules = (overlay, name) => [[0, 1], [1, 0]].map(([dRow, dCol]) => {
  const origin = gridCells[0];
  const starts = gridCells.filter(cell => graph.step(cell, dRow, dCol));
  return overlay.makeReplicate(
    new Pair(agreeOnLandKey, name,
      overlay.at(origin), overlay.at(graph.step(origin, dRow, dCol))),
    overlay.at(starts));
});
const partition = [
  ...edgeRules(label, 'one island'),
  ...edgeRules(direction, 'one direction'),
  // A cell is shaded on the direction layer exactly when it is on the labels.
  ...gridCells.map(cell => new Pair(
    Pair.fnToKey((l, d) => (l === WATER) === (d === WATER), shape),
    'shading agrees', label.at(cell), direction.at(cell))),
];

// Reads the four labels of a 2x2 block and requires both a water cell and an
// island cell among them.
const mixed2x2 = NFA.encodeSpec({
  startState: { water: false, land: false },
  transition: ({ water, land }, value) => ({
    water: water || value === WATER,
    land: land || value !== WATER,
  }),
  accept: ({ water, land }) => water && land,
}, shape);
const noMono2x2 = [label.makeReplicate(
  new NFA(mixed2x2, 'no mono 2x2',
    ...label.at(graph.block(gridCells[0], 2, 2))),
  label.at(gridCells.filter(cell => graph.block(cell, 2, 2))))];

// --- Killer cages over the masks. ---
const maskedDigitKey = Pair.fnToKey((m, g) => m === WATER || m === g, shape);
const maskRules = masks.flatMap((mask, i) => {
  const insideKey = Pair.fnToKey(
    (l, m) => (l === labelOf(i)) === (m !== WATER), shape);
  return mask.cells().flatMap(maskCell => {
    const gridCell = mask.gridAt(maskCell);
    return [
      new Pair(insideKey, 'island mask', label.at(gridCell), maskCell),
      new Pair(maskedDigitKey, 'masked digit', maskCell, gridCell),
    ];
  });
});

// Two cells of one island never share a digit; cells outside it read 0.
const noRepeatKey = Pair.fnToKey(
  (a, b) => a === WATER || b === WATER || a !== b, shape);
const noRepeats = masks.map(
  mask => new PairX(noRepeatKey, 'cage digits differ', ...mask.cells()));

// "<8" becomes an equality by absorbing the shortfall into a slack cell; an
// island always holds at least one digit, so the shortfall is at most 6.
const slackCell = 'VS';
const totals = [
  new Var('S', 'below-8 slack', 1),
  new Given(slackCell, 0, 1, 2, 3, 4, 5, 6),
  ...clues.flatMap((clue, i) => {
    if (clue.total !== null) return [new Sum(clue.total, ...masks[i].cells())];
    if (clue.maxTotal !== null) {
      return [new Sum(clue.maxTotal, ...masks[i].cells(), slackCell)];
    }
    return [];
  }),
];

// --- Thermal direction. ---
// Islands are trees: a cycle of island cells either contains a fully unshaded
// 2x2, or encloses cells - enclosed water would be cut off from the rest of the
// water, and an enclosed island cell would need a ring of eight island cells
// around it, i.e. a full 3x3, which contains a fully unshaded 2x2 again. On a
// tree, "the digits increase along every step away from the clue" is exactly
// "every island cell except the clue has one island neighbour below it, and the
// clue has none": the parent is that neighbour, and any cell whose smaller
// neighbour were a child would start a strictly descending chain that has to
// end at a leaf with no smaller neighbour at all. Decreasing islands are the
// mirror image, read from the direction layer.
// The machine reads the cell's direction, then its digit, then each orthogonal
// neighbour as a (label, digit) pair; water cells absorb the rest and pass.
const thermalMachine = target => NFA.encodeSpec({
  startState: { phase: 'direction' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'direction':
        return value === WATER
          ? { phase: 'water' }
          : { phase: 'digit', dir: value };
      case 'digit':
        return {
          phase: 'neighbourLabel', dir: state.dir, digit: value, count: 0,
        };
      case 'neighbourLabel':
        return {
          phase: 'neighbourDigit', dir: state.dir, digit: state.digit,
          count: state.count, sameIsland: value !== WATER,
        };
      case 'neighbourDigit': {
        const nearer = state.sameIsland && (state.dir === INCREASING
          ? value < state.digit : value > state.digit);
        const count = state.count + (nearer ? 1 : 0);
        return count > target ? undefined : {
          phase: 'neighbourLabel', dir: state.dir, digit: state.digit, count,
        };
      }
      case 'water':
        return { phase: 'water' };
    }
  },
  accept: state => state.phase === 'water'
    || (state.phase === 'neighbourLabel' && state.count === target),
}, shape);
const towardsClue = [thermalMachine(0), thermalMachine(1)];
const clueCells = new Set(clues.map(clue => clue.cell));
const thermals = gridCells.map(cell => new NFA(
  towardsClue[clueCells.has(cell) ? 0 : 1], 'thermal',
  direction.at(cell), cell,
  ...graph.neighbours(cell).flatMap(other => [label.at(other), other])));

return [
  shape,
  label.toVar('island'),
  direction.toVar('direction'),
  ...masks.map((mask, i) => mask.toVar(`island ${labelOf(i)} digits`)),
  ...domains,
  ...clueLabels,
  ...connectivity,
  ...partition,
  ...noMono2x2,
  ...maskRules,
  ...noRepeats,
  ...totals,
  ...thermals,
  new AllDifferent(...clues.map(clue => clue.cell)),
];
