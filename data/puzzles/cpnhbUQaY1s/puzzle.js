// Title: Entropic Detour
// Author: Myxo
// Video: https://www.youtube.com/watch?v=cpnhbUQaY1s
// Source: https://sudokupad.app/cbbvbid2vt

// Sudoku (baseline row/col/box). Difference Pairs: white dot -> consecutive,
// on 3 given edges. Loop: a single closed loop, orthogonal, no repeated
// cell, forbidden on the 8 big circles. Entropic Line: every 3 consecutive
// loop cells cover one digit from each of {1,2,3}/{4,5,6}/{7,8,9}. Detour:
// turn counts differ across all 9 boxes; each big circle's own digit is the
// turn count of its own box (self-referential clue).
//
// Loop membership is a per-cell "shape" Var (off / straight / one of four
// turns): a shape bakes in exactly which 2 of the cell's edges the loop
// uses (or none), so degree and "no revisit" are automatic, and
// edge-agreement between neighbours joins shapes into loops. The rules
// never say the loop can't run alongside itself, so ConnectedValues cannot
// by itself prove a single loop (two disjoint loops can be cell-adjacent
// without sharing a used edge); it is still added as a sound (never rejects
// a real solution) partial check.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const isTurn = s => s >= UL;   // the four corners

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const shapeCell = cell => shape.at(cell);
const gridCells = graph.cells();

const memo = fn => { const m = new Map(); return k => (m.has(k) ? m : m.set(k, fn(k))).get(k); };

// --- Shape domains: a cell may use an edge only if the neighbour exists, so
// border cells can't take shapes that point off the grid.
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const shapeDomains = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
  return new Given(shapeCell(cell), ...allowed);
});

// --- The loop must not visit any big circle.
const BIG_CIRCLES = ['R1C1', 'R2C6', 'R1C8', 'R8C8', 'R5C3', 'R6C7', 'R7C5', 'R9C1'];
const circlesOffLoop = BIG_CIRCLES.map(cell => new Given(shapeCell(cell), OFF));

// --- Edge agreement: neighbours must agree on the shared edge. Reads the two
// cells' shapes; the first uses the edge towards the second iff the second uses
// the edge back.
const edgeAgreeKey = (toB, toA) => Pair.fnToKey(
  (a, b) => toB(a) === toA(b), geometry.numValues);
const replicateEdgeAgreement = (name, key, dRow, dCol) => {
  const origins = gridCells.filter(cell => graph.step(cell, dRow, dCol));
  const origin = origins[0];
  return shape.makeReplicate(
    new Pair(key, name, shapeCell(origin), shapeCell(graph.step(origin, dRow, dCol))),
    origins.map(shapeCell));
};
const edgeRules = [
  replicateEdgeAgreement('edge-h', edgeAgreeKey(usesRight, usesLeft), 0, 1),
  replicateEdgeAgreement('edge-v', edgeAgreeKey(usesDown, usesUp), 1, 0),
];

// --- Difference Pairs: white dots on the 3 drawn edges.
const whiteDots = [
  ['R3C4', 'R3C5'],
  ['R8C1', 'R8C2'],
  ['R9C6', 'R9C7'],
].map(([a, b]) => new WhiteDot(a, b));

// --- Entropic line: each on-loop cell, together with the (up to two)
// neighbours its own shape connects to, must show one digit from each band.
// Reads the cell's shape, then its digit, then the digit of each neighbour
// that exists on the grid (in fixed U,D,L,R order); a neighbour's digit only
// counts towards the band set when the cell's shape uses that direction. Off
// cells are unconstrained.
const bandOf = digit => (digit - 1) / 3 | 0;   // {1,2,3}->0, {4,5,6}->1, {7,8,9}->2
const ALL_BANDS = 0b111;
const DIRS = [
  ['U', -1, 0, usesUp],
  ['D', 1, 0, usesDown],
  ['L', 0, -1, usesLeft],
  ['R', 0, 1, usesRight],
];
const entropicMachineFor = memo(key => {
  const preds = key.split(',').map(id => DIRS.find(([d]) => d === id)[3]);
  return NFA.encodeSpec({
    startState: { phase: 'shape' },
    transition: (state, value) => {
      if (state.phase === 'shape') return { phase: 'digit', shape: value };
      if (state.phase === 'digit') {
        return { phase: 'neighbour', shape: state.shape, bands: 1 << bandOf(value), idx: 0 };
      }
      // 'done' is a sink: this machine is always fed exactly 2 + preds.length
      // symbols, so no further symbol should arrive, but the compiler probes
      // every value from every reachable state.
      if (state.phase === 'done') return undefined;
      const { shape: s, bands, idx } = state;
      const nextBands = preds[idx](s) ? (bands | (1 << bandOf(value))) : bands;
      const nextIdx = idx + 1;
      return nextIdx === preds.length
        ? { phase: 'done', shape: s, bands: nextBands }
        : { phase: 'neighbour', shape: s, bands: nextBands, idx: nextIdx };
    },
    accept: ({ phase, shape: s, bands }) =>
      phase === 'done' && (s === OFF || bands === ALL_BANDS),
  }, geometry.numValues);
});
const entropics = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const dirs = DIRS.filter(([, dR, dC]) =>
    !(dR === -1 && row === 1) && !(dR === 1 && row === geometry.numRows) &&
    !(dC === -1 && col === 1) && !(dC === 1 && col === geometry.numCols));
  const key = dirs.map(([id]) => id).join(',');
  const neighbourCells = dirs.map(([, dR, dC]) => graph.step(cell, dR, dC));
  return new NFA(entropicMachineFor(key), 'entropic', shapeCell(cell), cell, ...neighbourCells);
});

// --- Detour: reads a box's 9 shape cells, then a trailing target value;
// accepts when the box's turn count equals ('eq') or differs from ('ne') the
// target.
const turnCountMachine = memo(relation => NFA.encodeSpec({
  startState: { seen: 0, count: 0 },
  transition: ({ seen, count }, value) => {
    if (seen < 9) return { seen: seen + 1, count: count + (isTurn(value) ? 1 : 0) };
    return (relation === 'eq' ? count === value : count !== value) ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues));

// Box index (1-based, reading order) holding each big circle; box 5 (centre)
// has none.
const CIRCLE_BOX = {
  R1C1: 1, R2C6: 2, R1C8: 3, R5C3: 4, R6C7: 6, R7C5: 8, R8C8: 9, R9C1: 7,
};
const boxShapeCells = n => graph.box(n).map(shapeCell);

// Each circled box's own turn count equals its circle's digit.
const turnEquals = Object.entries(CIRCLE_BOX).map(([cell, n]) =>
  new NFA(turnCountMachine('eq'), 'turn-count', ...boxShapeCells(n), cell));

// The 8 circled boxes' turn counts are pairwise distinct (their digits, tied
// to their true counts above, form the AllDifferent).
const distinctCircleDigits = new AllDifferent(...Object.keys(CIRCLE_BOX));

// Box 5's own turn count (no circle to read it from) must still differ from
// every circled box's turn count.
const turnDiffersFromBox5 = Object.keys(CIRCLE_BOX).map(cell =>
  new NFA(turnCountMachine('ne'), 'turn-count-differs', ...boxShapeCells(5), cell));

return [
  new Shape('9x9'),
  shape.toVar('shape'),
  ...shapeDomains,
  ...circlesOffLoop,
  ...edgeRules,
  ...whiteDots,
  // Loop cells form a single connected blob under cell adjacency. Sound
  // (never rejects a genuine single loop) but not a full proof of oneness.
  new ConnectedValues('VS', [HORIZ, VERT, UL, UR, DL, DR]),
  ...entropics,
  ...turnEquals,
  distinctCircleDigits,
  ...turnDiffersFromBox5,
];
