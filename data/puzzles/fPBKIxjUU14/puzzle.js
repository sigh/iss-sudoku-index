// Title: Galapagos
// Author: Niverio
// Video: https://www.youtube.com/watch?v=fPBKIxjUU14
// Source: https://sudokupad.app/DhFTHL63t7

// Normal Sudoku applies.
//
// Some cells are shaded; the shaded cells are one orthogonally connected group
// containing no fully shaded 2x2. The unshaded cells split into orthogonally
// connected islands. Each island holds exactly one small-number clue, whose
// value is the sum of the island's digits, and no digit repeats on an island.
// No island lies inside a single 3x3 box, and the island's digits in every box
// it enters sum to the same amount (repeat visits to a box are one sum).
// The given 4 at R1C8 is not a clue and may be shaded or unshaded, so nothing
// constrains its shading.
//
// One label per cell carries the shading: label 1 is shaded, labels 2-9 are the
// eight clued islands in the order the clue table lists them.

const SHADED = 1;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const boxes = graph.boxes();
const gridCells = graph.cells();
const islands = graph.makeOverlay('VI');

// The source's eight small-number overlays, read in reading order.
const clueData = [
  ['R1C6', 12], ['R2C2', 21], ['R4C1', 16], ['R5C5', 16],
  ['R6C7', 16], ['R8C9', 45], ['R9C1', 16], ['R9C5', 36],
];
const clues = clueData.map(([cell, sum], index) => ({ cell, sum, label: index + 2 }));

// Machines below scan a cell list as [label, digit] pairs, so every state
// carries `labelPhase` (is the next symbol a label?) and `selected` (did the
// label just read pick this island?).
const pairUp = cells => cells.flatMap(cell => [islands.at(cell), cell]);
const gridEntries = pairUp(gridCells);

const maskSum = mask =>
  [...Array(9)].reduce((sum, _, i) => sum + (((mask >> i) & 1) ? i + 1 : 0), 0);

// Island total and no repeated digit, in one scan of the grid. `seen` is the
// bitmask of the island's digits so far; a repeat or an overshoot of the clue
// rejects, so the reachable states are only the digit sets summing to at most
// the clue.
function islandSumMachine(label, target) {
  return NFA.encodeSpec({
    startState: { labelPhase: true, selected: false, seen: 0 },
    transition: ({ labelPhase, selected, seen }, value) => {
      if (labelPhase) return { labelPhase: false, selected: value === label, seen };
      if (!selected) return { labelPhase: true, selected: false, seen };
      const bit = 1 << (value - 1);
      if (seen & bit) return undefined;
      const next = seen | bit;
      if (maskSum(next) > target) return undefined;
      return { labelPhase: true, selected: false, seen: next };
    },
    accept: ({ seen }) => maskSum(seen) === target,
    maxDepth: gridEntries.length,
  }, geometry);
}

// The island's digits inside one box sum to `boxSum`, or the island has no cell
// in the box at all (sum 0 -- digits are at least 1, so an empty sum is the only
// way to reach 0).
function boxSumMachine(label, boxSum) {
  return NFA.encodeSpec({
    startState: { labelPhase: true, selected: false, sum: 0 },
    transition: ({ labelPhase, selected, sum }, value) => {
      if (labelPhase) return { labelPhase: false, selected: value === label, sum };
      if (!selected) return { labelPhase: true, selected: false, sum };
      const next = sum + value;
      if (next > boxSum) return undefined;
      return { labelPhase: true, selected: false, sum: next };
    },
    accept: ({ sum }) => sum === 0 || sum === boxSum,
  }, geometry);
}

// The island reaches beyond the box holding its clue, which is the one box it is
// certainly in.
function leavesClueBoxMachine(label) {
  return NFA.encodeSpec({
    startState: { found: false },
    transition: ({ found }, value) => ({ found: found || value === label }),
    accept: ({ found }) => found,
  }, geometry);
}

// A shaded 2x2 is rejected; the template covers the top-left block and is
// stamped on every block origin.
const noShaded2x2Machine = NFA.encodeSpec({
  startState: { allShaded: true },
  transition: ({ allShaded }, value) => ({ allShaded: allShaded && value === SHADED }),
  accept: ({ allShaded }) => !allShaded,
}, geometry);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noShaded2x2 = islands.makeReplicate(
  new NFA(noShaded2x2Machine, 'no-shaded-2x2',
    ...islands.at(graph.block(gridCells[0], 2, 2))),
  islands.at(blockOrigins));

// Two islands may not touch: adjacent unshaded cells are in the same block of
// unshaded cells, and a block holds exactly one clue.
const separationKey = Pair.fnToKey(
  (a, b) => a === SHADED || b === SHADED || a === b, geometry);
const separation = [...graph.rows(), ...graph.columns()].map(
  line => new Pair(separationKey, 'island-separation', ...islands.at(line)));

// An island entering k boxes with equal box sums has clue = k * boxSum, and k is
// between 2 (no island fits in one box) and 9 (the grid's boxes), so the box sum
// is one of these few values. Total and box sums together fix how many boxes the
// island enters.
const boxSumsFor = clue =>
  [2, 3, 4, 5, 6, 7, 8, 9].filter(k => clue % k === 0).map(k => clue / k);

const islandRules = clues.flatMap(({ cell, sum, label }) => [
  new Given(islands.at(cell), label),
  new ConnectedValues('VI', label),
  new NFA(islandSumMachine(label, sum), `island-${label}-sum`, ...gridEntries),
  new NFA(leavesClueBoxMachine(label), `island-${label}-leaves-box`,
    ...islands.at(gridCells.filter(candidate =>
      !boxes.find(box => box.includes(cell)).includes(candidate)))),
  new Or(boxSumsFor(sum).map(boxSum => new And(
    boxes.map(box => new NFA(
      boxSumMachine(label, boxSum), `island-${label}-box-sum-${boxSum}`,
      ...pairUp(box)))))),
]);

return [
  new Shape('9x9'),
  islands.toVar('island labels'),
  new Given('R1C8', 4),
  new ConnectedValues('VI', SHADED),
  noShaded2x2,
  ...separation,
  ...islandRules,
];
