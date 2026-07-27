// Title: Nexus
// Author: Ren the Mushroom
// Video: https://www.youtube.com/watch?v=Tk2pIdd-u8c
// Source: https://sudokupad.app/y7x01mea2l

// Normal sudoku rules apply. One undisclosed cell is the "multiplier nexus":
// if its digit is n, then for every k = 1..9, exactly n cells holding digit
// k sit at taxicab distance k from the nexus (the nexus cell itself is
// never counted: its own taxicab distance to itself is 0, which no digit
// 1-9 can match).
//
// The nexus location is unknown, so it is modelled with two off-grid Vars,
// VR/VC (its row/column, 1-9), plus VN (its digit, 1-9). The value range is
// widened by one (a sentinel, geometry.numValues) purely so two derived
// per-cell overlays can express "this cell does not count towards anything"
// as one extra value instead of a separate flag; the real grid is pinned
// back to 1-9 by the Replicate below.
//
// Two full-grid Var overlays hold, per grid cell B, quantities derived from
// VR/VC/VN by one small 5-cell NFA per B (sequence VR, VC, grid(B), VM(B),
// VS(B)):
//   VM(B): grid(B)'s value if taxicab(nexus, B) equals grid(B), else the
//          sentinel -- "does B count, and for which k".
//   VS(B): grid(B)'s value if B is exactly the nexus cell (VR,VC equal B's
//          row,col), else the sentinel -- used only to pin VN below.
// One more NFA reads VS across the whole grid, then VN, asserting VN equals
// the one non-sentinel VS value (there is always exactly one, since VR/VC
// always address exactly one grid cell).
// Nine more NFAs -- one per k = 1..9 -- each read VN, then every VM cell,
// counting VM cells equal to k and requiring that count equal VN: this is
// the rule's "exactly n" clause applied to each k in turn.

const shape = new Shape('9x9', 10);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const SENTINEL = geometry.numValues; // one past the real 1-9 digit range
const DIGITS = Array.from({ length: 9 }, (_, i) => i + 1);

const gridCells = graph.cells();

const rowVar = new Var('R', 'Nexus row', 1);
const colVar = new Var('C', 'Nexus column', 1);
const nVar = new Var('N', 'Nexus value (n)', 1);
const [rowCell] = rowVar.cells();
const [colCell] = colVar.cells();
const [nCell] = nVar.cells();

const mvOverlay = graph.makeOverlay('VM');
const selOverlay = graph.makeOverlay('VS');
const mvVar = mvOverlay.toVar('Distance-masked value');
const selVar = selOverlay.toVar('Position-masked value');

// Restrict the playable grid back to real digits; the sentinel is only
// meaningful on the two derived overlays.
const gridDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// The nexus row/column/value cells never take the sentinel either.
const nexusDomains = [rowCell, colCell, nCell].map(
  cell => new Given(cell, ...DIGITS));

// Per-cell derivation of VM(B) and VS(B) from VR, VC, grid(B).
const perCellNfas = gridCells.map(cell => {
  const { row: rB, col: cB } = parseCellId(cell);
  const spec = NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (state, value) => {
      switch (state.phase) {
        case 0: // consumed VR
          return { phase: 1, dr: Math.abs(value - rB), eqR: value === rB };
        case 1: { // consumed VC
          const dist = state.dr + Math.abs(value - cB);
          const isNexus = state.eqR && value === cB;
          return { phase: 2, dist, isNexus };
        }
        case 2: // consumed grid(B)
          return {
            phase: 3,
            matchDist: state.dist === value,
            isNexus: state.isNexus,
            v: value,
          };
        case 3: { // consumed VM(B): must equal grid(B)'s value iff distance matched
          const wanted = state.matchDist ? state.v : SENTINEL;
          if (value !== wanted) return undefined;
          return { phase: 4, isNexus: state.isNexus, v: state.v };
        }
        case 4: { // consumed VS(B): must equal grid(B)'s value iff this is the nexus
          const wanted = state.isNexus ? state.v : SENTINEL;
          return value === wanted ? 'OK' : undefined;
        }
      }
    },
    accept: state => state === 'OK',
  }, geometry);
  return new NFA(
    spec, `nexus-derive-${cell}`,
    rowCell, colCell, cell, mvOverlay.at(cell), selOverlay.at(cell));
});

// VN equals the one VS value that is not the sentinel.
const extractNSpec = NFA.encodeSpec({
  startState: { found: null, pos: 0 },
  transition: (state, value) => {
    if (state.pos < gridCells.length) {
      let found = state.found;
      if (value !== SENTINEL) {
        // More than one non-sentinel VS is impossible by construction
        // (VR, VC always address exactly one grid cell).
        if (found !== null) return undefined;
        found = value;
      }
      return { found, pos: state.pos + 1 };
    }
    // Final cell: VN itself.
    return value === state.found ? 'OK' : undefined;
  },
  accept: state => state === 'OK',
}, geometry);
const extractN = new NFA(
  extractNSpec, 'nexus-value', ...selOverlay.cells(), nCell);

// For each k = 1..9: the count of VM cells equal to k must equal VN.
const countingNfas = DIGITS.map(k => {
  const spec = NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: (state, value) => {
      if (state.target === null) return { target: value, count: 0 }; // VN
      const hit = value === k ? 1 : 0;
      return {
        target: state.target,
        count: Math.min(state.count + hit, state.target + 1),
      };
    },
    accept: state => state.target !== null && state.count === state.target,
  }, geometry);
  return new NFA(spec, `nexus-count-${k}`, nCell, ...mvOverlay.cells());
});

return [
  shape,
  new Given('R1C4', 8), new Given('R2C3', 5), new Given('R2C7', 7),
  new Given('R3C1', 4), new Given('R3C6', 2), new Given('R4C4', 3),
  new Given('R5C1', 6), new Given('R5C5', 1), new Given('R5C8', 4),
  new Given('R7C5', 4), new Given('R7C9', 3), new Given('R8C1', 1),
  new Given('R9C1', 3), new Given('R9C3', 7), new Given('R9C4', 5),
  gridDomain,
  rowVar, colVar, nVar,
  ...nexusDomains,
  mvVar, selVar,
  ...perCellNfas,
  extractN,
  ...countingNfas,
];
