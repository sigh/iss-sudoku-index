// Title: Tenleven Slythera Crimsonite
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=KgYlica32XI
// Source: https://sudokupad.app/r2zxe5nquo

// Rules encoded here:
//  1. Four non-overlapping 3x3 boxes are placed in the 7x7 grid; the solver finds
//     their position. Each box holds the digits 1-9. Cells outside every box are
//     empty (value 0).
//  2. Digits (1-9) may not repeat in a row, a column, or a box; 0s may repeat
//     freely since they are not digits.
//  3. Each cage's cells (drawn top-leftmost-cell total) sum to its clue and hold
//     no repeated digit; a cage's empty (0) cells contribute nothing to either
//     rule.
//  4. A snake occupies each box: a one-cell-wide orthogonal path visiting every
//     cell of that box exactly once.
//  5. Two digits consecutive along a snake sum to 10 or 11.
// Nothing is omitted.
//
// The answer cannot live in the ISS main grid: 13 of the 49 cells hold no digit
// (value 0), and a main-grid row/column is always all-different across the whole
// alphabet, so a row of 7 cells could not hold more than one 0. The grid is
// therefore pinned to a fixed Latin square and contributes nothing; the real
// answer lives in the VD overlay, mirrored cell-for-cell onto the grid.

const shape = new Shape('7x7', '0-9');
const grid = cellGraph(shape);
const geom = grid.gridGeometry();
const cells = grid.cells();

const BLANK = 0;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// One overlay per per-cell unknown, all indexed by the grid cell they shadow.
const D = grid.makeOverlay('VD');  // 1-9 = the digit in this cell, 0 = empty
const T = grid.makeOverlay('VT');  // 1 = a box has its top-left corner here, 2 = no
const F = grid.makeOverlay('VF');  // 1 = this cell lies inside a box, 2 = no
const P = grid.makeOverlay('VP');  // this cell's step (1-9) along its box's snake,
//                                     0 if the cell is outside every box

// The inert main grid: a cyclic Latin square, satisfied by construction, so the
// real puzzle plays out entirely in the overlays above.
const mainGrid = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new Given(cell, (row + col) % geom.numValues);
});

// Every overlay cell keeps the same domain across its whole layer.
const overlayDomain = (overlay, ...values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
const domains = [
  overlayDomain(D, BLANK, ...DIGITS),
  overlayDomain(T, 1, 2),
  overlayDomain(F, 1, 2),
  overlayDomain(P, BLANK, ...DIGITS),
];

// A box corner needs a whole 3x3 block below and right of it.
const corners = cells.filter(cell => grid.block(cell, 3, 3) !== null);
const cornerRoom = T.makeReplicate(
  new Given(T.cells()[0], 2),
  T.at(cells.filter(cell => grid.block(cell, 3, 3) === null)));

// A cell holds a digit/step exactly when it lies inside a box.
const zeroKey = Pair.fnToKey((value, f) => (value !== BLANK) === (f === 1), geom);
const filledD = cells.map(cell => new Pair(zeroKey, 'filled-digit', D.at(cell), F.at(cell)));
const filledP = cells.map(cell => new Pair(zeroKey, 'filled-step', P.at(cell), F.at(cell)));

// A cell is inside a box exactly when one box corner sits in the 3x3 window that
// ends at it, and no more than one may: that single equation is both "the boxes
// tile the filled cells" and "the boxes do not overlap". Both overlays are
// 1 = yes / 2 = no, so a count of yeses over n cells is 2n minus their sum.
const coverage = cells.map(cell => {
  const window = [];
  for (let dRow = -2; dRow <= 0; dRow++) for (let dCol = -2; dCol <= 0; dCol++) {
    const corner = grid.step(cell, dRow, dCol);
    if (corner !== null) window.push(T.at(corner));
  }
  return window.length === 1
    ? new SameValues(2, window[0], F.at(cell))
    : new Sum(2 * window.length - 2, ...window, [F.at(cell), -1]);
});

// Four boxes of nine cells fill 36 of the 49 cells.
const boxTotal = new Sum(2 * cells.length - 4 * 9, ...F.cells());

// --- Per-box rules (1, 4, 5), guarded by whether a box actually starts here. ---

// Reads a cell's own (digit, step), then finds -- among only that box's own
// cells -- the neighbour one step earlier, and checks the two digits sum to 10
// or 11. Step 1 has no predecessor, so it needs no check (its own successor
// checks the edge from the other side). Chaining this rule for steps 2-9 forces
// a simple path (no branch, no revisit) that reaches every one of the 9 cells,
// since AllDifferent(step) below already makes the 9 steps a bijection onto 1-9.
const predecessorAndSum = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'digit':
        return { phase: 'step', digit: value };
      case 'step':
        return value === 1
          ? { phase: 'found' }
          : { phase: 'neighbourStep', digit: state.digit, want: value - 1 };
      case 'neighbourStep':
        return { phase: 'neighbourDigit', digit: state.digit, want: state.want, step: value };
      case 'neighbourDigit': {
        if (state.step !== state.want) {
          return { phase: 'neighbourStep', digit: state.digit, want: state.want };
        }
        const total = state.digit + value;
        return (total === 10 || total === 11) ? { phase: 'found' } : undefined;
      }
      case 'found':
        return { phase: 'found' };
    }
  },
  accept: state => state.phase === 'found',
}, geom);

// The snake has no marked start, so it could equally be numbered forwards or
// backwards -- a symmetry invisible to every clue. Pin it by requiring the
// block's own top-left cell to carry the lower step of the two, which always
// picks exactly one of the two numberings (reversing a path swaps the relative
// order of every cell pair, this one included).
const directionKey = Pair.fnToKey((a, b) => a < b, geom);

const boxRules = corners.map(corner => {
  const block = grid.block(corner, 3, 3);
  const blockSet = new Set(block);
  const snakeSteps = block.map(cell => {
    const neighbourCells = grid.neighbours(cell).filter(n => blockSet.has(n));
    return new NFA(predecessorAndSum, 'snake', D.at(cell), P.at(cell),
      ...neighbourCells.flatMap(n => [P.at(n), D.at(n)]));
  });
  return new Or([
    new Given(T.at(corner), 2),
    new And([
      new AllDifferent(...D.at(block)),
      new AllDifferent(...P.at(block)),
      ...snakeSteps,
      new Pair(directionKey, 'snake-direction', P.at(block[0]), P.at(block[block.length - 1])),
    ]),
  ]);
});

// --- Whole-grid rules (2): rows and columns hold at most one of each digit;
// 0s may repeat, which no AllDifferent can say, so the pairwise relation states
// it directly. ---
const rowColKey = PairX.fnToKey((a, b) => a !== b || a === BLANK, geom);
const rowsAndColumns = [...grid.rows(), ...grid.columns()].map(
  house => new PairX(rowColKey, 'no-repeat', ...D.at(house)));

// --- Cages (3), read off the two real cage entries; the payload's third
// "cages" entry is a metadata stub holding the setter's own solution string,
// not a drawn cage. ---
const CAGES = [
  { total: 10, cells: ['R2C1', 'R3C1', 'R3C2', 'R4C1', 'R4C2'] },
  { total: 11, cells: ['R4C6', 'R4C7', 'R5C6', 'R5C7', 'R6C7'] },
];
const cageRules = CAGES.flatMap(({ total, cells: cageCells }) => [
  new PairX(rowColKey, 'no-repeat', ...D.at(cageCells)),
  new Sum(total, ...D.at(cageCells)),
]);

// The one given, read off the payload's `cells` array.
const givenR3C5 = new Given(D.at('R3C5'), 1);

return [
  shape,
  new NoBoxes(),
  D.toVar('D'), T.toVar('T'), F.toVar('F'), P.toVar('P'),
  ...mainGrid, ...domains, cornerRoom,
  ...filledD, ...filledP, ...coverage, boxTotal,
  ...boxRules,
  ...rowsAndColumns,
  ...cageRules,
  givenR3C5,
];
