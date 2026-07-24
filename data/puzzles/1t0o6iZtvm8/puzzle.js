// Title: RAT RUN 33: Hot and Cold
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=1t0o6iZtvm8
// Source: https://sudokupad.app/dqu2xb1itj

// Standard 9x9 sudoku, no givens.
//
// Hot/Cold zone: every cell is hot or cold (a free Var flag, VZ1..VZ81). Each
// zone is one orthogonally-connected region (ConnectedValues, one per zone
// value over the whole-grid VZ overlay). No 2x2 block may be a single zone.
// (Every wall is just a restatement of the zone rule itself -- a wall exists
// exactly where two orthogonally adjacent cells are in different zones -- so
// it needs no separate encoding; the few drawn walls are solving UI, not
// extra information.)
//
// A cell's value is its digit+1 if hot, digit-1 if cold.
//
// Box balance: each box's hot-cell values must sum to its cold-cell values.
// Encoded as one NFA per box scanning [digit, zone] for each of its 9 cells
// and accumulating a running signed total (+value if hot, -value if cold)
// that must land on zero.
//
// Currants: a blackcurrant sits between two cells whose values have one
// double the other, and a redcurrant sits between two cells whose values
// have opposite parity; both kinds also require their two cells to share a
// zone. Each is one NFA over [digitA, zoneA, digitB, zoneB] checking the
// value relation, plus a same-zone Pair.
//
// Not encoded: the Finkz/Phinx maze-path/cupcake fiction (zone connectivity
// alone does not pin which zone holds which mouse/cupcake pair) and the TEST
// CONSTRAINT rat identity.

const HOT = 1, COLD = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const N = geometry.numValues; // 9

const zone = graph.makeOverlay('VZ');
const zoneCell = cell => zone.at(cell);

// --- No 2x2 block may be a single zone. ---
const noMonoMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value];
    if (next.length < 4) return { block: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, N);

// --- Box balance: hot value = digit+1, cold value = digit-1; hot sum = cold sum. ---
const MIN_SUM = -72, MAX_SUM = 90; // bounds a box's running signed total can reach
const boxBalanceMachine = NFA.encodeSpec({
  startState: { phase: 'digit', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'zone', digit: value, sum: state.sum };
    const contribution = value === HOT ? state.digit + 1 : -(state.digit - 1);
    const sum = state.sum + contribution;
    if (sum < MIN_SUM || sum > MAX_SUM) return undefined;
    return { phase: 'digit', sum };
  },
  accept: (state) => state.phase === 'digit' && state.sum === 0,
}, N);

// --- Currants: relations on value (digit+1 hot / digit-1 cold), plus same-zone. ---
const blackCurrants = [
  ['R1C8', 'R1C9'], ['R1C6', 'R1C7'], ['R6C9', 'R7C9'], ['R8C6', 'R8C7'],
  ['R7C8', 'R8C8'], ['R8C2', 'R8C3'], ['R9C2', 'R9C3'], ['R2C2', 'R3C2'],
  ['R3C2', 'R4C2'], ['R3C3', 'R4C3'], ['R1C9', 'R2C9'], ['R4C7', 'R5C7'],
  ['R5C9', 'R6C9'],
];
const redCurrants = [
  ['R2C1', 'R3C1'], ['R3C5', 'R3C6'], ['R8C4', 'R8C5'], ['R5C8', 'R6C8'],
];

function currantMachine(relation) {
  return NFA.encodeSpec({
    startState: {},
    transition: (state, value) => {
      if (state.digitA === undefined) return { digitA: value };
      if (state.zoneA === undefined) return { digitA: state.digitA, zoneA: value };
      if (state.digitB === undefined) return { ...state, digitB: value };
      const valueA = state.zoneA === HOT ? state.digitA + 1 : state.digitA - 1;
      const valueB = value === HOT ? state.digitB + 1 : state.digitB - 1;
      return { ok: relation(valueA, valueB) };
    },
    accept: (state) => state.ok === true,
  }, N);
}
const blackCurrantMachine = currantMachine((a, b) => a === 2 * b || b === 2 * a);
const redCurrantMachine = currantMachine((a, b) => (a % 2) !== (b % 2));

// No-mono-2x2 is the same shifted 2x2 check at every anchor (a block's
// top-left cell); stamp it as one Replicate instead of 64 copies.
const monoAnchors = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMonoReplicate = zone.makeReplicate(
  new NFA(noMonoMachine, 'no-mono-2x2', ...zone.at(graph.block(monoAnchors[0], 2, 2))),
  zone.at(monoAnchors));

return [
  new Shape('9x9'),
  zone.toVar('hot(1) / cold(2) zone'),
  // --- Restrict the zone flags to HOT/COLD. ---
  zone.makeReplicate(new Given(zone.cells()[0], HOT, COLD)),
  // --- Each zone is a single orthogonally-connected region. ---
  new ConnectedValues('VZ', HOT),
  new ConnectedValues('VZ', COLD),
  // --- No 2x2 block may be a single zone. ---
  noMonoReplicate,
  // --- Box balance: hot value = digit+1, cold value = digit-1; hot sum = cold sum. ---
  ...graph.boxes().flatMap(boxCells => {
    const scan = boxCells.flatMap(cell => [cell, zoneCell(cell)]);
    return [new NFA(boxBalanceMachine, 'box-balance', ...scan)];
  }),
  // --- Currants: relations on value (digit+1 hot / digit-1 cold), plus same-zone. ---
  ...blackCurrants.flatMap(([a, b]) => [
    new NFA(blackCurrantMachine, 'blackcurrant', a, zoneCell(a), b, zoneCell(b)),
    new SameValues(2, zoneCell(a), zoneCell(b)),
  ]),
  ...redCurrants.flatMap(([a, b]) => [
    new NFA(redCurrantMachine, 'redcurrant', a, zoneCell(a), b, zoneCell(b)),
    new SameValues(2, zoneCell(a), zoneCell(b)),
  ]),
];
