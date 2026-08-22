// Title: BYOK Renban Edition
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=Ko7sVFYLBOE
// Source: https://app.crackingthecryptic.com/sudoku/JH8hqjFfD9

// Rules encoded here:
//   * Normal sudoku.
//   * Ten cells (listed below) print only a killer-cage total in their
//     top-left corner; every other cell of each cage is undrawn and must be
//     deduced. A cage's cells:
//       - sum to its printed total, with no repeated digit (killer);
//       - form one "renban" spanning ALL of the cage: the cage's digits are
//         exactly a run of N consecutive digits (N = cage size), any order;
//       - form a single non-branching line starting at the clue cell, moving
//         only orthogonally cell-to-cell;
//       - are positioned so the clue cell is the cage's topmost cell,
//         leftmost among ties ("NB As usual...");
//       - do not overlap another cage.
//   * Not every grid cell belongs to a cage: only cells reachable from a clue
//     under the above rules can ever join one, and the rest are plain sudoku
//     cells.
// Nothing is omitted.
//
// Model: one Var per grid cell (CAGE overlay, widened value range) holds which
// cage a cell belongs to, or a dedicated NONE value for a cell in no cage.
// Membership is restricted up front to a bounded per-cage candidate zone (see
// zoneOf), connectivity within a cage is ConnectedValues, the no-branch /
// single-start-neighbour rule is a same-cage-neighbour degree count, and the
// total/consecutive/no-repeat rule is one scanning NFA per cage over its own
// candidate zone, accumulating the cage's digit set as a bitmask.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Transcribed from the ten cage-total-only cells: single-cell cages carrying
// only a printed total, with no drawn shape.
const CAGES = [
  { cell: 'R1C1', total: 18 },
  { cell: 'R1C3', total: 11 },
  { cell: 'R1C7', total: 14 },
  { cell: 'R4C8', total: 11 },
  { cell: 'R8C1', total: 10 },
  { cell: 'R7C2', total: 39 },
  { cell: 'R6C3', total: 18 },
  { cell: 'R8C4', total: 15 },
  { cell: 'R6C5', total: 15 },
  { cell: 'R7C7', total: 18 },
];

const shape = new Shape(GRID, CAGES.length + 1);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Grid cells hold digits 1-9; the widened value range exists only for CAGE.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

const cage = graph.makeOverlay('VC');
const LABELS = CAGES.map((_, i) => i + 1);
const NONE = CAGES.length + 1;

// A run of N consecutive digits starting at `a` sums to N*a + N*(N-1)/2, with
// 1 <= a <= 10-N. The set of N for which some `a` fits a cage's total bounds
// how large that cage can possibly be -- a necessary bound used only to size
// each cage's candidate zone below, not a claim about which N is the answer.
const maxCageSize = (total) => {
  let best = 0;
  for (let n = 1; n <= 9; n++) {
    const rem = total - (n * (n - 1)) / 2;
    if (rem <= 0) continue;
    if (rem % n !== 0) continue;
    const a = rem / n;
    if (a >= 1 && a <= 10 - n) best = n;
  }
  return best;
};

// `The killer cage total must always be in the upper left corner of the cage
// (uppermost prioritised over leftmost)`: no cage cell may sit before its own
// clue cell in that (row, then column) order. Combined with the Manhattan
// distance a size-N orthogonal path can reach from its start (<= N-1 steps),
// this bounds each cage's candidate zone without picking cells from solution.
const afterClue = (clueRow, clueCol, row, col) =>
  row > clueRow || (row === clueRow && col > clueCol);

const zoneOf = (clueCell, total) => {
  const { row: cr, col: cc } = parseCellId(clueCell);
  const radius = maxCageSize(total) - 1;
  return gridCells.filter(id => {
    const { row, col } = parseCellId(id);
    if (!afterClue(cr, cc, row, col)) return false;
    return Math.abs(row - cr) + Math.abs(col - cc) <= radius;
  });
};

// Per cage: its clue cell plus every other cell that could possibly join it.
const zones = CAGES.map(({ cell, total }) => zoneOf(cell, total));
const candidates = CAGES.map(({ cell }, i) => [cell, ...zones[i]]);

// No clue cell may join a different cage (it is always its own cage's start).
const clueCellSet = new Set(CAGES.map(c => c.cell));
const zonesNoClues = zones.map(zone => zone.filter(c => !clueCellSet.has(c)));

// Every cell's CAGE domain: NONE, plus its own label if it is a clue cell, plus
// every cage label whose zone reaches it otherwise.
const labelDomain = gridCells.map(id => {
  if (clueCellSet.has(id)) {
    const i = CAGES.findIndex(c => c.cell === id);
    return new Given(cage.at(id), LABELS[i]);
  }
  const reachableBy = LABELS.filter((label, i) => zonesNoClues[i].includes(id));
  return new Given(cage.at(id), NONE, ...reachableBy);
});

// Connectivity: each cage's cells form one orthogonally-connected region.
const connectivity = LABELS.map(label => new ConnectedValues('VC', label));

// No branching: count same-cage orthogonal neighbours, capped at 2. A NONE
// cell never matches (its own label is excluded from the "same" check), so
// the cap is inert off any cage. The rules forbid only branching (a cell
// touching 3+ same-cage cells); they do not say the clue cell must be a path
// endpoint, so a cage whose line closes into a loop through its own clue cell
// (every member at degree 2, including the clue) is not excluded -- capping
// the clue cell's degree at 1 rejected such a cage and turned out to reject
// the puzzle's actual solution.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    if (state.phase === 'start') {
      return { phase: 'reading', own: value, count: 0 };
    }
    const same = value === state.own && state.own !== NONE;
    const count = state.count + (same ? 1 : 0);
    if (count > 2) return undefined;
    return { phase: 'reading', own: state.own, count };
  },
  accept: () => true,
}, geometry);
const degrees = gridCells.map(id => new NFA(degreeMachine, 'cage-degree',
  ...cage.at([id, ...graph.neighbours(id)])));

// Sum + no-repeat + renban-consecutive, per cage: scan (label, digit) over the
// cage's candidate cells, accumulating a bitmask of the digits assigned to
// this cage's label. `mask` only ever gains a bit (never loses one), so the
// final mask is exactly the set of digits the solver put in this cage,
// wherever in the scan they showed up -- an already-set bit means the label
// was assigned to that digit twice, i.e. a repeat, which is rejected.
const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
const cageChecks = CAGES.map(({ total }, i) => {
  const label = LABELS[i];
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inCage: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inCage: value === label };
      }
      if (!state.inCage) {
        return { mask: state.mask, reading: false, inCage: false };
      }
      if (value > DIGITS.length) return undefined;   // CAGE-only values
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;         // repeat within the cage
      return { mask: state.mask | bit, reading: false, inCage: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const digits = digitsOfMask(state.mask);
      if (!digits.length) return false;
      const sum = digits.reduce((a, b) => a + b, 0);
      if (sum !== total) return false;
      return digits[digits.length - 1] - digits[0] + 1 === digits.length;
    },
  }, geometry);
  return new NFA(machine, `cage-${i}-total`,
    ...candidates[i].flatMap(cell => [cage.at(cell), cell]));
});

return [
  shape,
  cage.toVar('cage'),
  new Given('R3C5', 7),
  new Given('R4C7', 3),
  new Given('R9C9', 1),
  digitDomain,
  ...labelDomain,
  ...connectivity,
  ...degrees,
  ...cageChecks,
];
