// Title: Ying Yang Yogn
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=NuRBHtT3tU4
// Source: https://sudokupad.app/o9rylnnnw1

// Rules encoded:
// - Sudoku: digits 1-9, rows/columns/3x3 boxes all different (the grid draws
//   the nine 3x3 boxes; the rules text adds no other placement rule).
// - Yin Yang Yong: divide the grid into three regions of orthogonally
//   connected cells; no 2x2 area entirely within one region.
// - Clues always sit entirely within one region: both cells of an edge clue
//   share a region.
// - Two regions are truthful (every clue in them obeys its rule); the third
//   is the liar region (every clue in it breaks its rule).
// - Clue types: V sum 5; black dot 1:2; white dot consecutive; yellow square
//   not consecutive; green diamond difference >= 5; red dot one odd, one
//   even; circle = sum of the digits seen along its arrow that are in the
//   circle's region, stopping at the first region border (or grid edge).

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// ---------------------------------------------------------------------------
// Region partition: one label (1/2/3) per cell on a VRG overlay.
// ---------------------------------------------------------------------------
const LABELS = [1, 2, 3];
const region = graph.makeOverlay('VRG');
const regionDomain = region.makeReplicate(new Given(region.cells()[0], ...LABELS));

// Labels share one layer, so one non-empty connected set per label also makes
// the three regions disjoint and non-empty.
const regionConnectivity = LABELS.map(v => new ConnectedValues('VRG', v));

// No 2x2 block is a single region: accept once one of the four labels
// differs from the first.
const noMono2x2Spec = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, shape);
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = region.makeReplicate(
  new NFA(noMono2x2Spec, 'no-mono-2x2', ...region.at(graph.block(graph.cells()[0], 2, 2))),
  region.at(blockOrigins));

// The regions are unnamed, so relabelling 1/2/3 describes the same partition.
// One representative per partition: scanning row-major, each label first
// appears only after every smaller label; all three must appear.
const canonicalLabelSpec = NFA.encodeSpec({
  startState: { maxSeen: 0 },
  transition: ({ maxSeen }, value) => {
    if (value <= maxSeen) return { maxSeen };
    if (value === maxSeen + 1) return { maxSeen: value };
    return undefined;
  },
  accept: ({ maxSeen }) => maxSeen === LABELS.length,
}, shape);
const canonicalLabel = new NFA(
  canonicalLabelSpec, 'canonical region labelling', ...region.at(graph.cells()));

// The liar region is named from outside the layer: VLIAR holds its label.
const liar = new Var('VLIAR', 'liar region label', 1);
const liarDomain = new Given(liar.cells()[0], ...LABELS);

// ---------------------------------------------------------------------------
// Edge clues. Each NFA reads [liar, region(a), region(b), a, b]: the two
// regions must match (clue sits in one region), and the relation must hold
// exactly when that region is not the liar.
// ---------------------------------------------------------------------------
// Label reads outside 1-3 are rejected: the Givens already exclude them, and
// dropping them keeps the compiled NFAs small.
const isLabel = (value) => LABELS.includes(value);
const RELATIONS = {
  v: (a, b) => a + b === 5,
  black: (a, b) => a === 2 * b || b === 2 * a,
  white: (a, b) => Math.abs(a - b) === 1,
  yellow: (a, b) => Math.abs(a - b) !== 1,
  green: (a, b) => Math.abs(a - b) >= 5,
  red: (a, b) => (a + b) % 2 === 1,
};
const edgeSpec = (relation) => NFA.encodeSpec({
  startState: { phase: 'liar' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'liar': return isLabel(value) ? { phase: 'regA', liar: value } : undefined;
      case 'regA':
        return isLabel(value) ? { phase: 'regB', liar: state.liar, reg: value } : undefined;
      case 'regB':
        return value === state.reg
          ? { phase: 'a', truthful: state.reg !== state.liar } : undefined;
      case 'a': return { phase: 'b', truthful: state.truthful, a: value };
      case 'b':
        return relation(state.a, value) === state.truthful ? { phase: 'done' } : undefined;
      default: return undefined;
    }
  },
  accept: (state) => state.phase === 'done',
}, shape);

// Edge marks transcribed from the overlay centres (each centre sits on the
// shared border of the two cells listed).
const EDGE_CLUES = {
  v: [['R8C1', 'R8C2'], ['R9C1', 'R9C2'], ['R8C8', 'R9C8'], ['R8C9', 'R9C9'],
      ['R2C8', 'R2C9'], ['R1C8', 'R1C9'], ['R1C1', 'R2C1'], ['R1C2', 'R2C2']],
  black: [['R4C9', 'R5C9'], ['R5C9', 'R6C9'], ['R6C3', 'R6C4']],
  white: [['R4C1', 'R4C2'], ['R1C3', 'R1C4'], ['R1C4', 'R1C5'], ['R7C3', 'R8C3']],
  yellow: [['R3C4', 'R3C5'], ['R4C1', 'R5C1'], ['R5C1', 'R6C1'], ['R7C6', 'R8C6']],
  green: [['R9C6', 'R9C7'], ['R9C5', 'R9C6'], ['R5C8', 'R6C8'], ['R2C7', 'R3C7']],
  red: [['R2C4', 'R2C5'], ['R7C4', 'R7C5']],
};
const edgeClues = Object.entries(EDGE_CLUES).flatMap(([type, pairs]) => {
  const spec = edgeSpec(RELATIONS[type]);
  return pairs.map(([a, b]) => new NFA(
    spec, `${type} ${a}-${b}`, liar.cells()[0], region.at(a), region.at(b), a, b));
});

// ---------------------------------------------------------------------------
// Circle clues. Each NFA reads [liar, region(c), c] and then
// (region(x), x) for each cell x along the arrow, beyond the circle. The
// running sum counts digits while the ray stays in the circle's region and
// freezes at the first cell of another region; it is clamped at 10 (any
// larger sum also differs from a single digit). The clue holds exactly when
// the circle's region is not the liar.
// ---------------------------------------------------------------------------
const SUM_CLAMP = 10;
const circleSpec = NFA.encodeSpec({
  startState: { phase: 'liar' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'liar': return isLabel(value) ? { phase: 'regC', liar: value } : undefined;
      case 'regC':
        return isLabel(value)
          ? { phase: 'target', truthful: value !== state.liar, reg: value } : undefined;
      case 'target':
        return { phase: 'rayReg', truthful: state.truthful, reg: state.reg,
                 target: value, sum: 0 };
      case 'rayReg':
        // Leaving the region freezes the verdict; later ray cells are unread.
        if (value !== state.reg) {
          return { phase: 'closed', ok: (state.sum === state.target) === state.truthful };
        }
        return { ...state, phase: 'rayDigit' };
      case 'rayDigit':
        return { ...state, phase: 'rayReg', sum: Math.min(state.sum + value, SUM_CLAMP) };
      case 'closed': return state;
      default: return undefined;
    }
  },
  accept: (state) => state.phase === 'closed'
    ? state.ok
    : state.phase === 'rayReg' && (state.sum === state.target) === state.truthful,
}, shape);

// Circle cells from the white/blue ring overlays; direction from the small
// blue diamond drawn a quarter cell off the circle's centre.
const CIRCLES = [
  { cell: 'R3C2', dR: 0, dC: 1 },
  { cell: 'R1C6', dR: 0, dC: 1 },
  { cell: 'R2C6', dR: 0, dC: -1 },
  { cell: 'R5C4', dR: 0, dC: 1 },
  { cell: 'R5C5', dR: 1, dC: 0 },
  { cell: 'R7C8', dR: 1, dC: 0 },
  { cell: 'R6C7', dR: -1, dC: 0 },
  { cell: 'R9C3', dR: -1, dC: 0 },
  { cell: 'R5C2', dR: 1, dC: 0 },
  { cell: 'R7C2', dR: 0, dC: 1 },
  { cell: 'R8C5', dR: 0, dC: 1 },
];
const circleClues = CIRCLES.map(({ cell, dR, dC }) => new NFA(
  circleSpec, `circle ${cell}`,
  liar.cells()[0], region.at(cell), cell,
  ...graph.ray(cell, dR, dC).slice(1).flatMap(x => [region.at(x), x])));

return [
  shape,
  region.toVar('region'),
  regionDomain,
  ...regionConnectivity,
  noMono2x2,
  canonicalLabel,
  liar,
  liarDomain,
  ...edgeClues,
  ...circleClues,
];
