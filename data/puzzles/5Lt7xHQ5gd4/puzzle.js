// Title: Nurikiller
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=5Lt7xHQ5gd4
// Source: https://app.crackingthecryptic.com/sudoku/9PQtqQj3r7

// Normal sudoku. Every cell is also shaded black or left white. A cell
// carrying a corner clue is white; the DIGIT placed in that cell counts the
// white cells orthogonally connected to it (its area's size); the CORNER
// NUMBER is the sum of the digits in that same area (two clues give a bound
// on the sum instead of an exact value: "<9", ">10"). Digits cannot repeat
// within one white area. White areas never touch each other -- they are
// separated by black cells -- and the black cells form one connected wall
// that never makes a 2x2 square. "All possible clues have been given" means
// there are exactly as many white areas as clue cells.
//
// Modelling: a 'VL' Var overlay gives every cell a region label: 1-9 names
// the white area anchored by clue #1-9 (in the order below), 10 means
// black. Pinning each clue cell to its own label breaks the label-swap
// symmetry, so no canonical-order tiebreak is needed. Global connectivity
// (one component per label, including black) is ConnectedValues; "white
// areas never touch" is a Pair rule forbidding two different white labels
// on orthogonally adjacent cells; "no black 2x2" is a small NFA replicated
// over every block origin. Per-clue area size/sum/distinctness are each a
// custom NFA scanning the label layer (and, for size, the clue's own digit)
// in a fixed cell order -- see the per-clue section below for what each one
// tracks.

const CLUES = [
  { cell: 'R2C8', label: 1, sum: { cmp: 'eq', value: 24 } },
  { cell: 'R3C7', label: 2, sum: { cmp: 'eq', value: 9 } },
  { cell: 'R5C3', label: 3, sum: { cmp: 'eq', value: 19 } },
  { cell: 'R5C5', label: 4, sum: { cmp: 'eq', value: 21 } },
  { cell: 'R6C4', label: 5, sum: { cmp: 'eq', value: 17 } },
  { cell: 'R6C6', label: 6, sum: { cmp: 'eq', value: 26 } },
  { cell: 'R8C5', label: 7, sum: { cmp: 'eq', value: 9 } },
  { cell: 'R9C7', label: 8, sum: { cmp: 'lt', value: 9 } },   // "<9"
  { cell: 'R8C9', label: 9, sum: { cmp: 'gt', value: 10 } },  // ">10"
];
const BLACK = 10;
const NUM_LABEL_VALUES = 10; // 1-9 white areas + 10 black

const graph = cellGraph('9x9');
const gridCells = graph.cells(); // 81 cells, row-major
const vl = graph.makeOverlay('VL');
const vlVar = vl.toVar('region label');

// Real sudoku digits stay 1-9 even though the label layer widens the shape
// to 10 values.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Anchor each area's label to its own clue cell.
const labelPins = CLUES.map(({ cell, label }) => new Given(vl.at(cell), label));

// One connected component per label: the nine white areas and the black
// wall.
const connectedAreas = [
  ...CLUES.map(({ label }) => new ConnectedValues('VL', label)),
  new ConnectedValues('VL', BLACK),
];

// White areas never touch: an edge between two labelled (1-9) cells with
// different labels is forbidden. Replicated over every horizontal and
// vertical grid edge (Pair binds by array position, so one edge per call).
const noWhiteMerge = Pair.fnToKey(
  (a, b) => !(a <= 9 && b <= 9 && a !== b), NUM_LABEL_VALUES);
const horizontalEdgeOrigins = gridCells.filter(c => parseCellId(c).col <= 8);
const verticalEdgeOrigins = gridCells.filter(c => parseCellId(c).row <= 8);
const noWhiteMergeH = vl.makeReplicate(
  new Pair(noWhiteMerge, 'white areas do not touch (h)', vl.at('R1C1'), vl.at('R1C2')),
  vl.at(horizontalEdgeOrigins));
const noWhiteMergeV = vl.makeReplicate(
  new Pair(noWhiteMerge, 'white areas do not touch (v)', vl.at('R1C1'), vl.at('R2C1')),
  vl.at(verticalEdgeOrigins));

// No 2x2 all-black block, replicated over every block origin.
const noBlack2x2Machine = NFA.encodeSpec({
  startState: { allBlack: true },
  transition: ({ allBlack }, value) => ({ allBlack: allBlack && value === BLACK }),
  accept: ({ allBlack }) => !allBlack,
}, NUM_LABEL_VALUES);
const blockOrigins = gridCells.filter(c => graph.block(c, 2, 2));
const noBlack2x2 = vl.makeReplicate(
  new NFA(noBlack2x2Machine, 'no-black-2x2', ...vl.at(graph.block(gridCells[0], 2, 2))),
  vl.at(blockOrigins));

const labelOrder = vl.at(gridCells); // the 81 VL cells, same row-major order as gridCells

// Area size: the digit in the clue cell equals the count of cells labelled
// with that clue's own label. The clue's digit is read first (seeding the
// target), then every label cell in order.
function sizeMachine(label) {
  return NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (target === null) return { target: value, count: 0 };
      const hit = value === label ? 1 : 0;
      // Clamp at target+1: once the count can only fail, stop climbing.
      return { target, count: Math.min(count + hit, target + 1) };
    },
    accept: ({ target, count }) => target !== null && count === target,
  }, NUM_LABEL_VALUES);
}

// Area sum / distinctness both scan the label cell and its shadowed digit
// cell as a pair, in the same fixed order, so `gate` (true when the label
// equals this clue's) is set one step before the digit it applies to.
function interleavedCells() {
  const cells = [];
  for (let i = 0; i < gridCells.length; i++) cells.push(labelOrder[i], gridCells[i]);
  return cells;
}

// Sum of the digits in the area equals (eq) or is bounded by (lt/gt) the
// clue's corner number. Sum is clamped at a per-clue cap chosen so the
// clamp itself never changes the accept verdict.
function sumMachine(label, cmp, target) {
  const cap = cmp === 'lt' ? target : target + 1;
  return NFA.encodeSpec({
    startState: { awaitingDigit: false, gate: false, sum: 0 },
    transition: ({ awaitingDigit, gate, sum }, value) => {
      if (!awaitingDigit) return { awaitingDigit: true, gate: value === label, sum };
      const newSum = gate ? Math.min(sum + value, cap) : sum;
      return { awaitingDigit: false, gate: false, sum: newSum };
    },
    accept: ({ awaitingDigit, sum }) => {
      if (awaitingDigit) return false;
      if (cmp === 'eq') return sum === target;
      if (cmp === 'lt') return sum < target;
      return sum > target;
    },
  }, NUM_LABEL_VALUES);
}

// No repeated digit within one area: a bitmask of digits seen so far under
// this label; reusing a bit is a dead branch (rejected outright).
function distinctMachine(label) {
  return NFA.encodeSpec({
    startState: { awaitingDigit: false, gate: false, mask: 0 },
    transition: ({ awaitingDigit, gate, mask }, value) => {
      if (!awaitingDigit) return { awaitingDigit: true, gate: value === label, mask };
      if (!gate) return { awaitingDigit: false, gate: false, mask };
      const bit = 1 << (value - 1);
      if (mask & bit) return undefined; // repeat within the area
      return { awaitingDigit: false, gate: false, mask: mask | bit };
    },
    accept: ({ awaitingDigit }) => !awaitingDigit,
  }, NUM_LABEL_VALUES);
}

const sizeRules = CLUES.map(({ cell, label }) =>
  new NFA(sizeMachine(label), `size-${label}`, cell, ...labelOrder));
const sumRules = CLUES.map(({ label, sum }) =>
  new NFA(sumMachine(label, sum.cmp, sum.value), `sum-${label}`, ...interleavedCells()));
const distinctRules = CLUES.map(({ label }) =>
  new NFA(distinctMachine(label), `distinct-${label}`, ...interleavedCells()));

return [
  new Shape('9x9', NUM_LABEL_VALUES),
  digitDomain,
  vlVar,
  ...labelPins,
  ...connectedAreas,
  noWhiteMergeH,
  noWhiteMergeV,
  noBlack2x2,
  ...sizeRules,
  ...sumRules,
  ...distinctRules,
];
