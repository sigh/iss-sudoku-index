// Title: Think outside the Snake
// Author: Filuta
// Video: https://www.youtube.com/watch?v=_2d3D3ZXa24
// Source: https://app.crackingthecryptic.com/sudoku/GPDqrrQDG7

// Rules encoded here, in full:
//  * Normal sudoku.
//  * Draw a one-cell-wide snake: a non-branching, non-looping string of
//    orthogonally connected cells with two ends (head and tail), which may not
//    touch itself orthogonally.
//  * The snake divides the rest of the grid into orthogonally connected
//    regions. Every region sums to the same total, and no region repeats a
//    digit.
//  * All six given digits lie on the snake, and read along the snake from head
//    to tail they may not decrease.
//
// Five whole-grid Var overlays carry the two structures the solver must find.
// VS is the snake layer: off-snake, head, or the direction of a cell's
// predecessor along the snake. VR/VC/VD describe the off-snake regions: each
// off-snake cell names its region's anchor cell (VR = anchor row, VC = anchor
// column) and its distance from that anchor (VD). VM carries, for each snake
// cell, the largest given digit met so far walking from the head. VT1/VT2 hold
// the shared region total, which the rules leave unstated.

const OFF = 1;                 // VS: this cell is not on the snake
const HEAD = 2;                // VS: the snake's head -- it has no predecessor
// VS values 3-6: the direction of this cell's predecessor along the snake.
const DIRS = [
  { dRow: -1, dCol: 0, code: 3 },   // predecessor is the cell above
  { dRow: 0, dCol: 1, code: 4 },    // ... to the right
  { dRow: 1, dCol: 0, code: 5 },    // ... below
  { dRow: 0, dCol: -1, code: 6 },   // ... to the left
];
// A neighbour reached by one direction names this cell with the opposite code.
const OPPOSITE = { 3: 5, 4: 6, 5: 3, 6: 4 };
const MAX_VS = 6;

// VM: the running maximum of the given digits already met, as an ordinal so
// that "may not decrease" is a comparison of VM values. NONE precedes them all.
const NONE = 1;
// The six printed digits, all of which the rules place on the snake.
const GIVENS = [
  { cell: 'R3C5', value: 3 },
  { cell: 'R6C3', value: 3 },
  { cell: 'R6C6', value: 6 },
  { cell: 'R6C9', value: 1 },
  { cell: 'R7C4', value: 6 },
  { cell: 'R8C3', value: 5 },
];
const GIVEN_VALUES = [...new Set(GIVENS.map(g => g.value))].sort((a, b) => a - b);
const encMax = (digit) => NONE + 1 + GIVEN_VALUES.indexOf(digit);
const MAX_VM = NONE + GIVEN_VALUES.length;

// A region's digits do not repeat, so it holds at most nine cells; it therefore
// never reaches more than eight steps from its anchor, and its total is at most
// 1+2+...+9. Both bounds size the machines below.
const MAX_SPAN = 8;
const MAX_TOTAL = 45;
// VT1/VT2 hold the shared total in base 9: total = 9*(VT1-1) + (VT2-1).
const MAX_VT1 = Math.floor(MAX_TOTAL / 9) + 1;
const decodeTotal = (high, low) => 9 * (high - 1) + (low - 1);

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

const vs = graph.makeOverlay('VS');
const vr = graph.makeOverlay('VR');
const vc = graph.makeOverlay('VC');
const vd = graph.makeOverlay('VD');
const vm = graph.makeOverlay('VM');

const rowOf = (cell) => parseCellId(cell).row;
const colOf = (cell) => parseCellId(cell).col;
// Reading order, which is also the order the overlays list their cells in.
const orderOf = (cell) => (rowOf(cell) - 1) * 9 + colOf(cell);
const taxicab = (a, b) =>
  Math.abs(rowOf(a) - rowOf(b)) + Math.abs(colOf(a) - colOf(b));

// The in-grid orthogonal neighbours of a cell, with the direction reaching each.
const stepsFrom = (cell) => DIRS
  .map(dir => ({ dir, cell: graph.step(cell, dir.dRow, dir.dCol) }))
  .filter(step => step.cell !== null);

// Compiling an NFA spec is expensive and most cells share one: memoise by the
// spec's parameters so each distinct machine is built once.
const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};

// --- Snake shape --------------------------------------------------------
// Read as [VS of the cell, then VS of each in-grid neighbour], with `codes`
// naming the direction that reaches each neighbour in that same order.
//
// Every snake cell but the head names a neighbour as its predecessor, and no
// cell is named by more than one neighbour, so the predecessor links form
// paths and cycles and only the head can end one. Requiring a snake cell's
// on-snake neighbours to be exactly its predecessor and its one successor is
// the "may not touch itself orthogonally" rule, and it also keeps any cycle
// from touching the head's chain -- which leaves the cycle a separate
// component, forbidden by the ConnectedValues below. One head, one chain and
// no cycles is a single non-branching snake with two ends.
const snakeMachine = memo((codes) => NFA.encodeSpec({
  startState: { i: -1 },
  transition: (state, value) => {
    if (state.i === -1) {
      if (value === OFF) return { i: 0, off: true };
      // A predecessor direction must point at an in-grid cell.
      if (value !== HEAD && !codes.includes(value)) return undefined;
      return { i: 0, off: false, pred: value, succ: 0 };
    }
    // The neighbour list ends here; a further symbol is not this cell's.
    if (state.i >= codes.length) return undefined;
    const code = codes[state.i];
    const next = state.i + 1;
    const isSuccessor = value === OPPOSITE[code];
    if (state.off) {
      // An off-snake cell is nobody's predecessor.
      return isSuccessor ? undefined : { i: next, off: true };
    }
    const isPredecessor = state.pred === code;
    // The predecessor must be on the snake, and may not name this cell back.
    if (isPredecessor && (value === OFF || isSuccessor)) return undefined;
    // Any other on-snake neighbour would be a touch or a branch.
    if (value !== OFF && !isPredecessor && !isSuccessor) return undefined;
    const succ = state.succ + (isSuccessor ? 1 : 0);
    if (succ > 1) return undefined;
    return { i: next, off: false, pred: state.pred, succ };
  },
  accept: (state) => state.i === codes.length,
}, numValues));

const snakeShape = gridCells.map(cell => {
  const steps = stepsFrom(cell);
  return new NFA(snakeMachine(steps.map(step => step.dir.code)), 'snake',
    vs.at(cell), ...vs.at(steps.map(step => step.cell)));
});

// --- Given digits along the snake ---------------------------------------
// Read as [VS of the cell, VM of the cell, then VM of each in-grid neighbour].
// VM is the largest given digit met from the head to this cell inclusive, so a
// given cell's own digit must be at least its predecessor's VM, and becomes the
// new maximum. `givenCode` is this cell's given digit as a VM value, or null
// where the cell carries no given.
const orderMachine = memo((codes, givenCode) => NFA.encodeSpec({
  startState: { phase: 'vs' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'vs':
        if (value === OFF) return { phase: 'vm', mode: 'off' };
        if (value === HEAD) return { phase: 'vm', mode: 'head' };
        return { phase: 'vm', mode: 'pred', pred: value };
      case 'vm':
        // Off-snake cells take the sentinel, so they carry no free state.
        if (state.mode === 'off') {
          return value === NONE ? { phase: 'done' } : undefined;
        }
        if (state.mode === 'head') {
          return value === (givenCode === null ? NONE : givenCode)
            ? { phase: 'done' } : undefined;
        }
        return { phase: 'nbr', i: 0, pred: state.pred, max: value };
      case 'done':
        return { phase: 'done' };
      default: {
        // The neighbour list ends here; a further symbol is not this cell's.
        if (state.i >= codes.length) return undefined;
        const next = state.i + 1;
        if (state.pred !== codes[state.i]) {
          return { phase: 'nbr', i: next, pred: state.pred, max: state.max };
        }
        // `value` is the predecessor's running maximum.
        if (givenCode === null) {
          return state.max === value ? { phase: 'done' } : undefined;
        }
        if (value > givenCode || state.max !== givenCode) return undefined;
        return { phase: 'done' };
      }
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues));

const givenDigitAt = new Map(GIVENS.map(given => [given.cell, given.value]));
const snakeOrder = gridCells.map(cell => {
  const steps = stepsFrom(cell);
  const digit = givenDigitAt.get(cell);
  return new NFA(
    orderMachine(steps.map(step => step.dir.code),
      digit === undefined ? null : encMax(digit)),
    'given-order',
    vs.at(cell), vm.at(cell), ...vm.at(steps.map(step => step.cell)));
});

// --- Regions: anchors ---------------------------------------------------
// Read as [VR, VC, VD] of one cell. A region's anchor is its first cell in
// reading order, so no cell may name an anchor that follows it, and the anchor
// is exactly the cell that stands at distance 1 from itself.
const anchorMachine = memo((row, col) => NFA.encodeSpec({
  startState: { phase: 'vr' },
  transition: (state, value) => {
    if (state.phase === 'vr') {
      if (value > row) return undefined;
      return { phase: 'vc', sameRow: value === row };
    }
    if (state.phase === 'vc') {
      if (state.sameRow && value > col) return undefined;
      return { phase: 'vd', isAnchor: state.sameRow && value === col };
    }
    return (value === 1) === state.isAnchor ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, numValues));

const anchors = gridCells.map(cell => new NFA(
  anchorMachine(rowOf(cell), colOf(cell)), 'anchor',
  vr.at(cell), vc.at(cell), vd.at(cell)));

// Snake cells are parked at distance 1, which the machine above resolves to
// VR/VC naming the cell itself: a snake cell carries no free region state, and
// since it is its own anchor no off-snake cell can name it as one.
const parkedSnakeDepth = Pair.fnToKey(
  (snake, depth) => snake === OFF || depth === 1, numValues);
const snakeDepthPins = gridCells.map(cell => new Pair(
  parkedSnakeDepth, 'snake-depth', vs.at(cell), vd.at(cell)));

// --- Regions: one anchor per connected component ------------------------
// Read as [VS, VR, VC of the cell, then VS, VR, VC of the neighbour]: two
// orthogonally adjacent off-snake cells lie in the same region, so they name
// the same anchor.
const sameAnchorMachine = NFA.encodeSpec({
  startState: { phase: 'vs1' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'vs1':
        return { phase: 'vr1', off: value === OFF };
      case 'vr1':
        return { phase: 'vc1', off: state.off, row: value };
      case 'vc1':
        return { phase: 'vs2', off: state.off, row: state.row, col: value };
      case 'vs2':
        return {
          phase: 'vr2', both: state.off && value === OFF,
          row: state.row, col: state.col,
        };
      case 'vr2':
        if (state.both && value !== state.row) return undefined;
        return { phase: 'vc2', both: state.both, col: state.col };
      default:
        return !state.both || value === state.col ? { phase: 'done' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);

const sameAnchor = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(sameAnchorMachine, 'same-region',
    vs.at(cell), vr.at(cell), vc.at(cell),
    vs.at(other), vr.at(other), vc.at(other))));

// Read as [VS, VD of the cell, then VS, VD of each in-grid neighbour]: an
// off-snake cell that is not an anchor stands one step further out than some
// off-snake neighbour, and no off-snake neighbour is more than one step nearer.
// VD is then the distance to the anchor, which puts the anchor inside the
// cell's own component and leaves VD no freedom.
const distanceMachine = memo((neighbourCount) => NFA.encodeSpec({
  startState: { phase: 'vs' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'vs':
        return value === OFF ? { phase: 'vd' } : { phase: 'done' };
      case 'vd':
        return value === 1
          ? { phase: 'done' } : { phase: 'ns', d: value, found: false };
      case 'done':
        return { phase: 'done' };
      case 'ns':
        return { phase: 'nd', d: state.d, found: state.found, off: value === OFF };
      default:
        if (!state.off) return { phase: 'ns', d: state.d, found: state.found };
        if (value < state.d - 1) return undefined;
        return {
          phase: 'ns', d: state.d, found: state.found || value === state.d - 1,
        };
    }
  },
  accept: (state) => state.phase === 'done' || (state.phase === 'ns' && state.found),
}, numValues));

const distances = gridCells.map(cell => {
  const neighbours = graph.neighbours(cell);
  return new NFA(distanceMachine(neighbours.length), 'anchor-distance',
    vs.at(cell), vd.at(cell),
    ...neighbours.flatMap(other => [vs.at(other), vd.at(other)]));
});

// --- Regions: no repeated digit -----------------------------------------
// Read as [VR, VR, VC, VC, digit, digit] of a pair of cells: two cells naming
// the same anchor share a region, so their digits differ. Pairs sharing a row,
// column or box are left out -- Sudoku already keeps those distinct.
const distinctMachine = NFA.encodeSpec({
  startState: { phase: 'vr1' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'vr1':
        return { phase: 'vr2', row: value };
      case 'vr2':
        return value === state.row ? { phase: 'vc1' } : { phase: 'done' };
      case 'vc1':
        return { phase: 'vc2', col: value };
      case 'vc2':
        return value === state.col ? { phase: 'd1' } : { phase: 'done' };
      case 'd1':
        return { phase: 'd2', digit: value };
      case 'd2':
        return value === state.digit ? undefined : { phase: 'done' };
      default:
        return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);

const boxOf = (cell) =>
  Math.floor((rowOf(cell) - 1) / 3) * 3 + Math.floor((colOf(cell) - 1) / 3);
const keptApartBySudoku = (a, b) =>
  rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b);

const regionDistinct = gridCells.flatMap((cell, index) => gridCells
  .slice(index + 1)
  .filter(other => !keptApartBySudoku(cell, other))
  .map(other => new NFA(distinctMachine, 'region-distinct',
    vr.at(cell), vr.at(other), vc.at(cell), vc.at(other), cell, other)));

// --- Regions: one shared total ------------------------------------------
// One machine per cell that could be an anchor. The first segment reads
// [VS, VD, digit of the anchor, then VR, VC, digit of every cell that could
// name it]; the second reads [VT1, VT2]. A cell may only name an anchor that
// precedes it in reading order and lies within its distance bound, so that
// window holds the whole region. The machine is inert unless the anchor cell is
// off-snake and at distance 1, which is what makes it an anchor.
const totalMachine = memo((row, col) => NFA.encodeSpec({
  startState: { phase: 'vs' },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return state.phase === 'inert'
        ? { phase: 'inert' } : { phase: 'high', sum: state.sum };
    }
    switch (state.phase) {
      case 'vs':
        return value === OFF ? { phase: 'vd' } : { phase: 'inert' };
      case 'vd':
        return value === 1 ? { phase: 'seed' } : { phase: 'inert' };
      case 'inert':
        return { phase: 'inert' };
      case 'seed':
        // The anchor's own digit opens the total.
        return { phase: 'vr', sum: value };
      case 'vr':
        return { phase: 'vc', sum: state.sum, sameRow: value === row };
      case 'vc':
        return {
          phase: 'digit', sum: state.sum, mine: state.sameRow && value === col,
        };
      case 'digit': {
        const sum = state.sum + (state.mine ? value : 0);
        return sum > MAX_TOTAL ? undefined : { phase: 'vr', sum };
      }
      case 'high':
        return { phase: 'low', sum: state.sum, high: value };
      default:
        return decodeTotal(state.high, value) === state.sum
          ? { phase: 'ok' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'inert' || phase === 'ok',
}, numValues, { multiSegment: true }));

const regionTotals = gridCells.map(anchor => {
  // Every cell that could name this anchor: later in reading order, and no
  // further away than a nine-cell region reaches.
  const members = gridCells.filter(cell =>
    orderOf(cell) > orderOf(anchor) && taxicab(cell, anchor) <= MAX_SPAN);
  return new NFA(totalMachine(rowOf(anchor), colOf(anchor)), 'region-total',
    [vs.at(anchor), vd.at(anchor), anchor,
    ...members.flatMap(cell => [vr.at(cell), vc.at(cell), cell])],
    ['VT1', 'VT2']);
});

return [
  new Shape('9x9'),
  ...GIVENS.map(given => new Given(given.cell, given.value)),

  vs.toVar('snake'),
  vr.toVar('anchorRow'),
  vc.toVar('anchorCol'),
  vd.toVar('anchorDistance'),
  vm.toVar('givenMax'),
  new Var('T', 'regionTotal', 2),

  // Overlay domains: the unused top of each range would otherwise be free.
  vs.makeReplicate(new Given(vs.cells()[0],
    ...Array.from({ length: MAX_VS }, (_, i) => i + 1))),
  vm.makeReplicate(new Given(vm.cells()[0],
    ...Array.from({ length: MAX_VM }, (_, i) => i + 1))),
  new Given('VT1', ...Array.from({ length: MAX_VT1 }, (_, i) => i + 1)),

  // Every given digit lies on the snake.
  ...GIVENS.map(given => new Given(vs.at(given.cell),
    ...Array.from({ length: MAX_VS - 1 }, (_, i) => i + 2))),

  // The snake has exactly one head, and its cells form one connected region.
  new ContainExact(String(HEAD), ...vs.cells()),
  new ConnectedValues('VS',
    Array.from({ length: MAX_VS - 1 }, (_, i) => i + 2)),
  ...snakeShape,
  ...snakeOrder,

  ...snakeDepthPins,
  ...anchors,
  ...sameAnchor,
  ...distances,
  ...regionDistinct,
  ...regionTotals,
];
