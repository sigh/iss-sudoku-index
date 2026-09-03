// Title: Bring Your Own Thermos
// Author: Wolff
// Video: https://www.youtube.com/watch?v=3nWuATfz1rU
// Source: https://app.crackingthecryptic.com/sudoku/BLHT4RmMFF

// Normal 9x9 sudoku. The solver draws the thermos:
//   - digits ascend from the bulb along each thermo;
//   - thermos run orthogonally, turning as often as needed, never diagonally;
//   - a corner-marked cell is the bulb for up to four thermos (two for R9C9);
//   - every other cell lies on at most one thermo, so two thermos may share
//     only a corner-marked cell that is the bulb of both;
//   - a corner-marked clue counts the cells, itself included once, covered by
//     the thermos bulbed in that cell.
// All of it is encoded; nothing is omitted.
//
// Drawing model. Two whole-grid Var overlays hold the drawing:
//   VP  the direction from a cell to its predecessor -- the neighbour one step
//       nearer the bulb -- or NONE when the cell is on no thermo;
//   VB  which bulb's thermos the cell belongs to, or OFF.
// One predecessor per cell is what makes a cell lie on at most one thermo, and
// the two overlays are pinned to the drawing, not free: an off-thermo cell is
// NONE/OFF, an on-thermo cell's predecessor and bulb are the ones it is drawn
// with. Following predecessors walks back towards a bulb, and the digits
// strictly decrease as it goes, so no cycle of predecessors can exist: every
// chain ends at a cell with VP = NONE, which the VP/VB link forces to be a
// bulb. So the VB = b cells are exactly the cells of bulb b's thermos.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const vp = graph.makeOverlay('VP');
const vb = graph.makeOverlay('VB');

// VP values: NONE, or the direction from the cell to its predecessor.
// `opposite` is the value a neighbour in this direction would hold if this
// cell were its predecessor.
const NONE = 1;
const DIRS = [
  { code: 2, dr: -1, dc: 0, opposite: 3 },  // predecessor is above
  { code: 3, dr: 1, dc: 0, opposite: 2 },   // predecessor is below
  { code: 4, dr: 0, dc: -1, opposite: 5 },  // predecessor is to the left
  { code: 5, dr: 0, dc: 1, opposite: 4 },   // predecessor is to the right
];

// VB values: OFF, or one label per corner-marked cell.
const OFF = 1;

// The four small digits printed in a cell's top-left corner, and the four
// large given digits.
const CLUES = { R2C7: 10, R3C2: 4, R5C5: 27, R9C9: 5 };
const GIVENS = { R1C5: 7, R5C3: 8, R5C8: 6, R8C6: 4 };

const BULBS = Object.keys(CLUES);
const labelOf = new Map(BULBS.map((cell, i) => [cell, OFF + 1 + i]));
const VB_VALUES = [OFF, ...BULBS.map(cell => labelOf.get(cell))];

// A cell may point only at a neighbour that exists. A bulb has no predecessor.
const vpDomains = gridCells.map(cell => new Given(
  vp.at(cell),
  ...(labelOf.has(cell)
    ? [NONE]
    : [NONE, ...DIRS.filter(d => graph.step(cell, d.dr, d.dc)).map(d => d.code)])));

// A corner-marked cell is the bulb of its own thermos and of no others, which
// is also what keeps another bulb's thermo from running through it. Every
// other cell is off the thermos or on one bulb's.
const vbDomains = [
  vb.makeReplicate(new Given(vb.cells()[0], ...VB_VALUES)),
  ...BULBS.map(cell => new Given(vb.at(cell), labelOf.get(cell))),
];

// A non-bulb cell is on a thermo exactly when it has a predecessor.
const onThermo = Pair.fnToKey(
  (p, b) => (p === NONE) === (b === OFF), geometry.numValues);
const linkRules = gridCells.filter(cell => !labelOf.has(cell)).map(
  cell => new Pair(onThermo, 'on-thermo', vp.at(cell), vb.at(cell)));

// One machine per orthogonal pair (a, b), reading
//   [VP(a), VP(b), VB(a), VB(b), digit(a), digit(b)].
// `dirAB` is the VP value a holds when b is its predecessor, `dirBA` the value
// b holds when a is its predecessor. Where one is the other's predecessor they
// are on the same thermo, so their bulb labels agree, and the digit ascends
// from predecessor to successor. Where neither is, the machine consumes the
// remaining four cells (the `free` countdown) and constrains nothing.
const stepSpec = (dirAB, dirBA) => NFA.encodeSpec({
  startState: { phase: 'vpA' },
  transition: (s, value) => {
    if (s.free !== undefined) {
      return s.free > 1 ? { free: s.free - 1 } : { done: true };
    }
    switch (s.phase) {
      case 'vpA':
        return { phase: 'vpB', aP: value === dirAB };
      case 'vpB': {
        const bP = value === dirBA;
        if (!s.aP && !bP) return { free: 4 };
        return { phase: 'vbA', aP: s.aP, bP };
      }
      case 'vbA':
        return { phase: 'vbB', aP: s.aP, bP: s.bP, label: value };
      case 'vbB':
        return value === s.label
          ? { phase: 'digitA', aP: s.aP, bP: s.bP } : undefined;
      case 'digitA':
        return { phase: 'digitB', aP: s.aP, bP: s.bP, digitA: value };
      default:
        if (s.aP && !(s.digitA > value)) return undefined;
        if (s.bP && !(value > s.digitA)) return undefined;
        return { done: true };
    }
  },
  accept: s => s.done === true,
}, geometry.numValues);

// Right and down neighbours cover every orthogonal pair exactly once.
const PAIR_STEPS = [
  { dr: 0, dc: 1, dirAB: 5, dirBA: 4, spec: stepSpec(5, 4) },
  { dr: 1, dc: 0, dirAB: 3, dirBA: 2, spec: stepSpec(3, 2) },
];
const stepRules = gridCells.flatMap(cell => PAIR_STEPS.flatMap(step => {
  const other = graph.step(cell, step.dr, step.dc);
  if (!other) return [];
  return [new NFA(step.spec, 'thermo-step',
    vp.at(cell), vp.at(other), vb.at(cell), vb.at(other), cell, other)];
}));

// A cell that is not a bulb has at most one successor, so the thermos through
// it do not branch. The machine reads the VP cells of the neighbours in a
// fixed order and counts how many name this cell as their predecessor;
// `targets` is that per-position VP value, so it is baked into the machine.
const branchSpecs = new Map();
const atMostOneSuccessor = (targets) => {
  const key = targets.join('_');
  if (!branchSpecs.has(key)) {
    branchSpecs.set(key, NFA.encodeSpec({
      startState: { i: 0, count: 0 },
      transition: ({ i, count }, value) => {
        const next = count + (value === targets[i] ? 1 : 0);
        return next > 1 ? undefined : { i: i + 1, count: next };
      },
      accept: ({ i }) => i === targets.length,
      // The position index would otherwise climb without bound.
      maxDepth: targets.length,
    }, geometry.numValues));
  }
  return branchSpecs.get(key);
};
// The bulbs need no such rule: their thermo limit equals their number of
// orthogonal neighbours -- four for the interior cells R2C7, R3C2 and R5C5,
// and two for R9C9 in the grid corner.
const branchRules = gridCells.filter(cell => !labelOf.has(cell)).map(cell => {
  const successors = DIRS.flatMap(d => {
    const n = graph.step(cell, d.dr, d.dc);
    return n ? [{ cell: vp.at(n), target: d.opposite }] : [];
  });
  // A grid corner has two neighbours, where the same rule is a pair relation.
  if (successors.length === 2) {
    const [x, y] = successors;
    return new Pair(
      Pair.fnToKey((a, b) => !(a === x.target && b === y.target),
        geometry.numValues),
      'one-successor', x.cell, y.cell);
  }
  return new NFA(
    atMostOneSuccessor(successors.map(s => s.target)), 'one-successor',
    ...successors.map(s => s.cell));
});

// The clue counts the cells labelled with that bulb. Those cells are also
// orthogonally connected -- every thermo of the bulb runs orthogonally back to
// it -- which is what lets ConnectedValues carry the count.
const clueRules = BULBS.map(
  cell => new ConnectedValues('VB', labelOf.get(cell), CLUES[cell]));

return [
  new Shape('9x9'),
  ...Object.entries(GIVENS).map(([cell, digit]) => new Given(cell, digit)),
  vp.toVar('predecessor'),
  vb.toVar('bulb'),
  ...vpDomains,
  ...vbDomains,
  ...linkRules,
  ...stepRules,
  ...branchRules,
  ...clueRules,
];
