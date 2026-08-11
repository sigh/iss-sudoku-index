// Title: Build Your Own Region Sums
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=gFj8f3-_YdE
// Source: https://app.crackingthecryptic.com/sudoku/QH26FPT6mF

// Normal sudoku rules apply. Eighteen grey dots mark the ends of nine
// "box-sum lines": digits on a line have the same sum within each 3x3 box
// the line passes through. Neither which dots pair into a line, nor the
// path each pairing takes, is drawn -- both are for the solver to find.
// Lines move orthogonally only, cannot touch themselves orthogonally,
// cannot branch, cannot cross themselves or another line, must start and
// end in different boxes, and cannot re-enter a box once left.
//
// Modelled with an integer label overlay VG over every grid cell: 10 means
// unused, 1-9 names one line. Connectivity, degree and the pairing below
// close the topology; the box-sum equality and the box/line-count facts are
// then layered on top. "Cannot re-enter a box" is NOT encoded; it is the
// one deliberate omission (see the puzzle's write-up for the reasoning).
//
// - ConnectedValues(VG, L), one per L in 1..9: the cells naming line L form
//   a single connected region (and, since 9 disjoint non-empty regions must
//   exist, all nine lines are actually present).
// - Degree: one NFA per grid cell reads its own label, then its orthogonal
//   neighbours' labels. An unused cell (label 10) is unconstrained. A used
//   cell's same-label-neighbour count must be exactly 1 if it is one of the
//   18 dots, else exactly 2. Connected + "all dots degree 1, everything
//   else degree 2" is a tree with exactly two leaves, i.e. one simple path
//   between two dots -- no separate subtour-elimination step is needed.
//   The same count also forbids an orthogonal self-touch for free: a touch
//   would be a same-label neighbour beyond the two (or one) already spent
//   on the real path edges, and the NFA rejects any count past its target.
// - ContainExact over the 18 dot cells' own labels: each of 1-9 appears
//   exactly twice, so every line owns exactly two dots (its ends) and no
//   label is left empty or over/under-subscribed.
// - A first-occurrence NFA over the dots in row-major order requires label
//   k's first dot to appear before label k+1's: breaks the otherwise-free
//   9! relabelling symmetry among the nine interchangeable lines.
// - AllDifferent(2 cells) forbidding equal labels on any two dots that
//   share a box: the only way "start and end in different boxes" can fail
//   once the path structure above is already forced.
// - Box-sum: for every (box, line) pair, an NFA scans the box's own 9
//   cells (label then digit) and writes the digit-sum of that box's
//   line-L cells into a two-digit (tens, ones) Var pair -- a plain Var
//   tops out at 16 values (CellGeometry.MAX_SIZE) but a box-sum can reach
//   45, so it is split base-10, offset by +1 so both digits stay in the
//   widened 1-10 grid alphabet (real tens/ones = stored value - 1). A
//   second two-digit Var pair per line holds that line's shared target
//   sum; an Or ties every box-sum to either 0 (box not visited) or the
//   line's own target -- exactly the "equal sum in each box it passes
//   through" rule, with no need to know in advance which or how many
//   boxes a line visits.

const UNUSED = 10; // label overlay sentinel: cell belongs to no line

const shape = new Shape('9x9', 10); // widened alphabet: 1-9 real digits, 10 = unused label sentinel
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const boxes = graph.boxes(); // 9 boxes, row-major, each 9 cells row-major within the box

// Restrict the playable grid back to real digits; the widened alphabet is
// only needed for the label/box-sum-digit overlays below.
const gridDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Provenance: the 18 grey-dot circle underlays on the puzzle canvas,
// converted from their drawn centers and sorted row-major.
const dots = [
  'R1C7', 'R1C8', 'R2C7', 'R3C4', 'R4C5', 'R4C6', 'R4C8', 'R5C3', 'R5C7',
  'R6C1', 'R6C7', 'R6C9', 'R7C4', 'R8C3', 'R8C7', 'R9C3', 'R9C7', 'R9C8',
];
const dotSet = new Set(dots);

// Provenance: the puzzle's three printed givens.
const givens = [
  new Given('R3C8', 6),
  new Given('R4C7', 1),
  new Given('R5C4', 9),
];

const label = graph.makeOverlay('VG');
const labelDomain = label.makeReplicate(
  new Given(label.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9, UNUSED));
// Every dot is an actual line end, never the unused sentinel.
const dotGivens = dots.map(d => new Given(label.at(d), 1, 2, 3, 4, 5, 6, 7, 8, 9));

const connectivity = Array.from(
  { length: 9 }, (_, i) => new ConnectedValues('VG', i + 1));

// --- Degree: dots get exactly one same-label neighbour, everything else
// gets exactly two (or is unused and unconstrained). See header comment for
// why this also forbids self-touch and closes the path topology.
function degreeMachine(requiredDegree, numValues, unused) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: (state, value) => {
      if (state.phase === 'start') {
        return value === unused
          ? { phase: 'off' }
          : { phase: 'on', target: value, count: 0 };
      }
      if (state.phase === 'off') return { phase: 'off' };
      const count = state.count + (value === state.target ? 1 : 0);
      return count > requiredDegree
        ? undefined
        : { phase: 'on', target: state.target, count };
    },
    accept: (state) => state.phase === 'off' || state.count === requiredDegree,
  }, numValues);
}
const interiorDegree = degreeMachine(2, geometry.numValues, UNUSED);
const dotDegree = degreeMachine(1, geometry.numValues, UNUSED);
const degreeConstraints = gridCells.map(cell => new NFA(
  dotSet.has(cell) ? dotDegree : interiorDegree,
  'line-degree',
  ...label.at([cell, ...graph.neighbours(cell)])));

// --- Each line owns exactly two dots.
const dotLabelCells = label.at(dots);
const linesOwnTwoDots = new ContainExact(
  Array.from({ length: 9 }, (_, i) => i + 1).flatMap(v => [v, v]).join('_'),
  ...dotLabelCells);

// --- Break the 9! relabelling symmetry: label k's first dot (in row-major
// order) must appear before label k+1's.
const canonicalOrderMachine = NFA.encodeSpec({
  startState: { maxSeen: 0 },
  transition: ({ maxSeen }, value) => {
    if (value <= maxSeen) return { maxSeen };
    if (value === maxSeen + 1) return { maxSeen: value };
    return undefined; // introduced a label out of canonical order
  },
  accept: () => true,
}, geometry.numValues);
const canonicalLabelOrder = new NFA(
  canonicalOrderMachine, 'canonical-label-order', ...dotLabelCells);

// --- Two dots sharing a box can never be one line's two ends: their labels
// must differ, i.e. a 2-cell AllDifferent.
const endpointsDifferentBoxes = boxes.flatMap(boxCells => {
  const boxDots = dots.filter(d => boxCells.includes(d));
  const pairs = [];
  for (let i = 0; i < boxDots.length; i++) {
    for (let j = i + 1; j < boxDots.length; j++) {
      pairs.push(new AllDifferent(
        label.at(boxDots[i]), label.at(boxDots[j])));
    }
  }
  return pairs;
});

// --- Box-sum machinery: one (tens, ones) Var pair per (box, line), plus one
// (tens, ones) Var pair per line for its shared target sum. Both digits are
// stored +1 (so 0 is representable within the widened 1-10 alphabet); a
// value of (1, 1) means the true sum is 0, i.e. that box is not on that line.
const idx = (boxNum, lineLabel) => (boxNum - 1) * 9 + lineLabel; // 1..81

const boxSumTens = new Var('BT', 'box-line sum tens digit (+1)', 81);
const boxSumOnes = new Var('BO', 'box-line sum ones digit (+1)', 81);
const targetTens = new Var('TT', 'line target sum tens digit (+1)', 9);
const targetOnes = new Var('TO', 'line target sum ones digit (+1)', 9);
// A box-line sum is at most 45 (a full box), so its tens digit is 0-4;
// stored +1 that is 1-5. Ones (stored +1: 1-10) already fits the grid's
// widened alphabet with no extra restriction.
// Pure-addressing locator graphs (same cell count as the Var group, row-
// major order matches the Var's own order) so the domain restriction can be
// one Replicate instead of one Given per cell.
const boxSumTensLocator = cellGraph('9x9').makeOverlay('VBT');
const targetTensLocator = cellGraph('1x9').makeOverlay('VTT');
const boxSumTensDomain = boxSumTensLocator.makeReplicate(
  new Given(boxSumTensLocator.cells()[0], 1, 2, 3, 4, 5));
const targetTensDomain = targetTensLocator.makeReplicate(
  new Given(targetTensLocator.cells()[0], 1, 2, 3, 4, 5));

// Reads (label, digit) for the box's 9 cells (in that order, so the running
// "does this cell match" flag is a boolean, not a 10-valued pending digit --
// keeps the compiled state count well under the 4096 cap), then the box's
// own (tens, ones) Var pair, and accepts iff their decoded value equals the
// accumulated sum.
function boxSumMachine(targetLabel, numValues) {
  return NFA.encodeSpec({
    startState: { phase: 'label', pairsRead: 0, sum: 0, match: false },
    transition: (state, value) => {
      switch (state.phase) {
        case 'label':
          return {
            phase: 'digit', pairsRead: state.pairsRead, sum: state.sum,
            match: value === targetLabel,
          };
        case 'digit': {
          const sum = state.sum + (state.match ? value : 0);
          const pairsRead = state.pairsRead + 1;
          return pairsRead < 9
            ? { phase: 'label', pairsRead, sum, match: false }
            : { phase: 'tens', pairsRead, sum };
        }
        case 'tens':
          return { phase: 'ones', sum: state.sum, tens: (value - 1) * 10 };
        case 'ones': {
          const total = state.tens + (value - 1);
          return total === state.sum ? { phase: 'done' } : undefined;
        }
      }
    },
    accept: (state) => state.phase === 'done',
  }, numValues);
}

const boxSumConstraints = [];
const targetTies = [];
for (let b = 1; b <= 9; b++) {
  const boxCells = boxes[b - 1];
  for (let lineLabel = 1; lineLabel <= 9; lineLabel++) {
    const i = idx(b, lineLabel);
    const bt = boxSumTens.cell(i);
    const bo = boxSumOnes.cell(i);
    const tt = targetTens.cell(lineLabel);
    const to = targetOnes.cell(lineLabel);
    const machine = boxSumMachine(lineLabel, geometry.numValues);
    const inputCells = boxCells.flatMap(c => [label.at(c), c]);
    boxSumConstraints.push(new NFA(
      machine, `box${b}-line${lineLabel}-sum`, ...inputCells, bt, bo));

    targetTies.push(new Or([
      new And([new Given(bt, 1), new Given(bo, 1)]), // not visited
      new And([ // visited: equals this line's shared target
        new SameValues(2, bt, tt),
        new SameValues(2, bo, to),
      ]),
    ]));
  }
}

return [
  shape,
  gridDomain,
  ...givens,

  label.toVar('line label (1-9 = line id, 10 = unused)'),
  labelDomain,
  ...dotGivens,

  ...connectivity,
  ...degreeConstraints,
  linesOwnTwoDots,
  canonicalLabelOrder,
  ...endpointsDifferentBoxes,

  boxSumTens,
  boxSumOnes,
  targetTens,
  targetOnes,
  boxSumTensDomain,
  targetTensDomain,
  ...boxSumConstraints,
  ...targetTies,
];
