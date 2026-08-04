// Title: Even Lighting
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=eEGd4S5JO6M
// Source: https://app.crackingthecryptic.com/sudoku/PnnNbp7GHR

// Normal sudoku rules apply, standard 3x3 boxes. Some cells (solver-located)
// are doublers: a doubler cell's value is twice its digit; every other
// cell's value equals its digit. VD is a 1/2 overlay (2 = doubler); doubler
// placement carries no other stated constraint, so it is otherwise free.
// VE is a 1/2 overlay (2 = even-valued): a cell is even-valued iff it is a
// doubler or its digit is even (doubling always yields an even value, so a
// doubler is even-valued regardless of its own digit's parity). One NFA
// ties VE to (digit, VD) for every grid cell.
//
// "The even-valued cells (including doublers) form a single orthogonally
// connected area" -> ConnectedValues on VE's even value.
//
// "Every even-valued cell must see at least one doubler in a straight line
// horizontally or vertically (odd-valued cells block the view). Doublers
// must not see each other." Only odd-valued (non-doubler, odd-digit) cells
// block; a doubler is always even-valued, so it can never itself block.
// Sight is unobstructed within a maximal run of non-odd cells, so "sees a
// doubler" reduces to "the run contains a doubler" -- true for every cell
// in the run, including a doubler run-mate (which is why an even cell that
// is itself a doubler trivially satisfies the "must see a doubler" clause,
// while "doublers must not see each other" then forbids any *other*
// doubler sharing that run). Four overlays carry a run-scoped "doubler seen
// so far" flag, one per scan direction (row left-to-right, row
// right-to-left, column top-to-bottom, column bottom-to-top), reset to
// false at a blocking (odd) cell or a run boundary:
//   VA: row, scanning west -> east    VB: row, scanning east -> west
//   VC: column, scanning north -> south   VF: column, scanning south -> north
// A cell's own inclusive flag (VA/VB/VC/VF at that cell) is true iff its
// run contains a doubler anywhere; the immediate neighbour's inclusive flag
// in the matching direction is exactly the "excluding this cell itself"
// reading, which is what "doublers must not see each other" needs.
//
// Cages: "the values of cells in a cage sum to the total ... digits may not
// repeat in a cage (though values may repeat)" -> AllDifferent on digits,
// plus a per-cage NFA summing effective values (digit * VD) to the total.
// A cage with no drawn total is AllDifferent only.

const graph = cellGraph('9x9');
const doubler = graph.makeOverlay('VD');
const evenFlag = graph.makeOverlay('VE');
const rowFwd = graph.makeOverlay('VA');
const rowBack = graph.makeOverlay('VB');
const colFwd = graph.makeOverlay('VC');
const colBack = graph.makeOverlay('VF');

const vd = cell => doubler.at(cell);
const ve = cell => evenFlag.at(cell);
const va = cell => rowFwd.at(cell);
const vb = cell => rowBack.at(cell);
const vc = cell => colFwd.at(cell);
const vf = cell => colBack.at(cell);

const EVEN = 2, ODD = 1;
const DOUBLER = 2, NORMAL = 1;
const SEEN = 2, UNSEEN = 1;

// NFA: scans (digit, VD, VE) triples for every grid cell and requires
// VE = EVEN iff the cell is a doubler or its digit is even.
const evenTieSpec = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value };
    if (state.phase === 'flag') {
      const isDoubler = value === DOUBLER;
      const isEven = isDoubler || (state.digit % 2 === 0);
      return { phase: 've', expected: isEven ? EVEN : ODD };
    }
    if (value !== state.expected) return undefined;
    return { phase: 'digit' };
  },
  accept: state => state.phase === 'digit',
}, 9);

// NFA: scans (digit, VD, reachFlag) triples along one directional run
// (segment = one row or one column, in scan order) and requires reachFlag
// to be SEEN iff a doubler has occurred since the run's last odd (blocking,
// non-doubler-odd-digit) cell, inclusive of the current cell. A blocking
// cell always reads UNSEEN and resets the running state. One spec serves
// all four scan directions; only the cell order passed to NFA differs.
const reachSpec = NFA.encodeSpec({
  startState: { phase: 'digit', carry: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return { phase: 'digit', carry: false };
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, carry: state.carry };
    }
    if (state.phase === 'flag') {
      const isDoubler = value === DOUBLER;
      const blocking = !isDoubler && (state.digit % 2 === 1);
      const expectSeen = !blocking && (state.carry || isDoubler);
      return { phase: 'reach', blocking, expectSeen };
    }
    const expected = state.expectSeen ? SEEN : UNSEEN;
    if (value !== expected) return undefined;
    return { phase: 'digit', carry: state.blocking ? false : state.expectSeen };
  },
  accept: state => state.phase === 'digit',
}, 9, { multiSegment: true });

const tieCells = cells => cells.flatMap(cell => [cell, vd(cell), ve(cell)]);
const reachCells = (cells, flag) => cells.flatMap(cell => [cell, vd(cell), flag(cell)]);

const rows = graph.rows();
const columns = graph.columns();

// Cages: [total | null, cells], transcribed from the drawn cage geometry.
const cages = [
  [40, ['R1C1', 'R1C2', 'R2C1']],
  [40, ['R1C4', 'R1C5', 'R2C5']],
  [null, ['R2C2', 'R2C3', 'R3C3', 'R3C4', 'R4C4']],
  [16, ['R6C4', 'R7C3', 'R7C4', 'R8C2', 'R8C3']],
  [4, ['R9C2']],
  [15, ['R9C3', 'R9C4']],
  [13, ['R5C1', 'R6C1', 'R6C2']],
  [12, ['R3C1', 'R4C1']],
  [6, ['R3C2', 'R4C2']],
  [9, ['R3C8', 'R3C9']],
  [31, ['R1C7', 'R2C7', 'R3C5', 'R3C6', 'R3C7']],
  [17, ['R4C5', 'R5C5']],
  [13, ['R7C5', 'R7C6', 'R8C5']],
  [14, ['R8C6', 'R8C7', 'R9C6']],
  [5, ['R9C8', 'R9C9']],
  [null, ['R6C8', 'R6C9', 'R7C9']],
  [10, ['R5C7', 'R6C7']],
  [17, ['R7C7', 'R7C8', 'R8C8']],
];

const cageEffectiveCells = cells => cells.flatMap(cell => [cell, vd(cell)]);

const cageSumCache = new Map();
const cageSumSpec = total => {
  if (cageSumCache.has(total)) return cageSumCache.get(total);
  const spec = NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') return { phase: 'flag', digit: value, sum: state.sum };
      const sum = state.sum + state.digit * value;
      if (sum > total) return undefined;
      return { phase: 'digit', sum };
    },
    accept: state => state.phase === 'digit' && state.sum === total,
  }, 9);
  cageSumCache.set(total, spec);
  return spec;
};

// A single-cell cage's total is a plain two-cell (digit, flag) relation --
// use Pair rather than a same-size NFA.
const singleCellCageKeyCache = new Map();
const singleCellCageKey = total => {
  if (singleCellCageKeyCache.has(total)) return singleCellCageKeyCache.get(total);
  const key = Pair.fnToKey((digit, flag) => digit * flag === total, 9);
  singleCellCageKeyCache.set(total, key);
  return key;
};

return [
  new Shape('9x9'),
  doubler.toVar('doubler flags'),
  evenFlag.toVar('even flags'),
  rowFwd.toVar('row west-to-east reach'),
  rowBack.toVar('row east-to-west reach'),
  colFwd.toVar('column north-to-south reach'),
  colBack.toVar('column south-to-north reach'),

  doubler.makeReplicate(new Given(vd(graph.cells()[0]), NORMAL, DOUBLER)),
  evenFlag.makeReplicate(new Given(ve(graph.cells()[0]), ODD, EVEN)),
  rowFwd.makeReplicate(new Given(va(graph.cells()[0]), UNSEEN, SEEN)),
  rowBack.makeReplicate(new Given(vb(graph.cells()[0]), UNSEEN, SEEN)),
  colFwd.makeReplicate(new Given(vc(graph.cells()[0]), UNSEEN, SEEN)),
  colBack.makeReplicate(new Given(vf(graph.cells()[0]), UNSEEN, SEEN)),

  new NFA(evenTieSpec, 'even-flag-tie', ...tieCells(graph.cells())),

  new NFA(reachSpec, 'row-fwd-reach', ...rows.map(row => reachCells(row, va))),
  new NFA(reachSpec, 'row-back-reach', ...rows.map(row => reachCells([...row].reverse(), vb))),
  new NFA(reachSpec, 'col-fwd-reach', ...columns.map(col => reachCells(col, vc))),
  new NFA(reachSpec, 'col-back-reach', ...columns.map(col => reachCells([...col].reverse(), vf))),

  new ConnectedValues('VE', EVEN),

  // Every even-valued cell sees a doubler: exempt if odd, else at least one
  // of the four inclusive reach flags at the cell itself is SEEN.
  ...graph.cells().map(cell => new Or([
    new Given(ve(cell), ODD),
    new Given(va(cell), SEEN),
    new Given(vb(cell), SEEN),
    new Given(vc(cell), SEEN),
    new Given(vf(cell), SEEN),
  ])),

  // Doublers must not see each other: exempt if not a doubler, else every
  // neighbour's inclusive reach flag *in the direction away from this
  // cell* (the exclusive-of-self reading) must be UNSEEN.
  ...graph.cells().map(cell => {
    const west = graph.step(cell, 0, -1);
    const east = graph.step(cell, 0, 1);
    const north = graph.step(cell, -1, 0);
    const south = graph.step(cell, 1, 0);
    const noOtherDoublerSeen = new And([
      ...(west ? [new Given(va(west), UNSEEN)] : []),
      ...(east ? [new Given(vb(east), UNSEEN)] : []),
      ...(north ? [new Given(vc(north), UNSEEN)] : []),
      ...(south ? [new Given(vf(south), UNSEEN)] : []),
    ]);
    return new Or([new Given(vd(cell), NORMAL), noOtherDoublerSeen]);
  }),

  ...cages.flatMap(([total, cells]) => [
    ...(cells.length > 1 ? [new AllDifferent(...cells)] : []),
    ...(total === null ? [] : cells.length === 1 ? [
      new Pair(singleCellCageKey(total), `cage-value-sum-${total}`, cells[0], vd(cells[0])),
    ] : [
      new NFA(cageSumSpec(total), `cage-value-sum-${total}`, ...cageEffectiveCells(cells)),
    ]),
  ]),
];
