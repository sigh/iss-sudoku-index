// Title: What Happens when Mark DOESN'T get Lucky
// Author: Genomico
// Video: https://www.youtube.com/watch?v=l32JZFKFEsE
// Source: https://cracking-the-cryptic.web.app/sudoku/Rpq6Nrrj8T

// Six independent 6x6 sudokus (1-6, ordinary row/column/box all-different,
// 3x2 boxes), drawn 3-across x 2-down with a one-cell gutter between
// adjacent boards. Each board carries one outside-clue variant on the
// row/column lines that face away from every other board (a "given" lane
// below); every lane that instead faces an adjacent board has no printed
// clue, only a drawn circle in the gutter cell -- that circle is the shared
// value both boards' own outside-clue formula must independently equal (a
// "linked" lane below). The six variants, read from the rounded labels next
// to each board (TL/TM/TR = top row of boards, BL/BM/BR = bottom row):
//   TL  Difference:    |1st digit - 2nd digit| seen from the clue's edge.
//   TM  Outside-2:     the clue digit sits in the 1st or 2nd cell from the
//                       clue's edge.
//   TR  Next-to-6 Sum: sum of the cell(s) orthogonally adjacent to the 6 in
//                       that line.
//   BL  Skyscraper:    count of digits visible from the clue's edge (a digit
//                       is visible iff it exceeds every digit before it).
//   BM  MaxAscending:  length of the longest run of strictly-ascending
//                       consecutive digits, reading from the clue's edge.
//   BR  First seen odd/even: the first odd digit seen from the clue's edge
//                       if the clue is odd, or the first even digit if the
//                       clue is even. Every 1-6 line holds exactly one
//                       first-odd value and one first-even value, so this is
//                       "the clue equals whichever of those two the line
//                       produces" -- both are computed straight from the
//                       line, with no circularity.
// Six boards of independent digits means rows/columns repeat between boards,
// so this is a Raw grid with every row/column/box all-different stated
// explicitly. ISS's native Skyscraper requires a Sudoku-type grid, so BL's
// rule is hand-built as an NFA with the identical "first new maximum" count.
//
// The drawn 13x20 board (six 6x6 boards plus gutters) exceeds ISS's 16-per-
// side grid cap, and the geometry carries no meaning here (a Raw grid states
// every rule explicitly; nothing reads physical adjacency across boards), so
// the six boards are packed edge-to-edge into a 14x16 grid instead -- still
// enough room (224 cells) for all 216 board cells, addressed by (board,
// local row, local col) rather than by drawn position. The 42 linking
// circles are not part of that grid at all: they are 42 free `Var` cells,
// each shared by exactly the two lane-constraints (one per adjacent board)
// that must agree on it -- the auxiliary state the puzzle leaves undetermined
// on the grid itself.

const boardNames = ['TL', 'TM', 'TR', 'BL', 'BM', 'BR'];
const VARIANT_OF = {
  TL: 'difference', TM: 'outside2', TR: 'nextTo6',
  BL: 'skyscraper', BM: 'maxAscending', BR: 'firstSeenParity',
};
// Each board's top-left corner as drawn in the source (1-indexed row, col),
// used only to translate the drawn givens/outside-clue positions below into
// (board, local row, local col) -- not to place cells in the packed grid.
const SOURCE_ORIGIN = { TL: [1, 1], TM: [1, 8], TR: [1, 15], BL: [8, 1], BM: [8, 8], BR: [8, 15] };

const PACKED_COLS = 16; // 6*36 = 216 board cells packed into a 14x16 grid.
function cellId(board, localRow, localCol) {
  const flat = boardNames.indexOf(board) * 36 + localRow * 6 + localCol;
  return makeCellId(Math.floor(flat / PACKED_COLS) + 1, (flat % PACKED_COLS) + 1);
}
function boardCells(board) {
  const cells = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) cells.push(cellId(board, r, c));
  return cells;
}
// Translate a drawn (row, col) into the board that contains it, local-indexed.
function localOf(sourceRow, sourceCol) {
  for (const board of boardNames) {
    const [r0, c0] = SOURCE_ORIGIN[board];
    if (sourceRow >= r0 && sourceRow < r0 + 6 && sourceCol >= c0 && sourceCol < c0 + 6) {
      return { board, localRow: sourceRow - r0, localCol: sourceCol - c0 };
    }
  }
  throw new Error(`No board contains R${sourceRow}C${sourceCol}`);
}

// A line clue reads from the clue's own edge inward, nearest cell first.
// `index` is the drawn (1-indexed) row (left/right lanes) or column
// (top/bottom lanes) of the clue, in the *source* 13x20 layout.
function topLine(board, sourceCol) {
  const [r0] = SOURCE_ORIGIN[board];
  return [0, 1, 2, 3, 4, 5].map(dr => cellId(board, dr, sourceCol - SOURCE_ORIGIN[board][1]));
}
function bottomLine(board, sourceCol) { return topLine(board, sourceCol).slice().reverse(); }
function leftLine(board, sourceRow) {
  return [0, 1, 2, 3, 4, 5].map(dc => cellId(board, sourceRow - SOURCE_ORIGIN[board][0], dc));
}
function rightLine(board, sourceRow) { return leftLine(board, sourceRow).slice().reverse(); }
const LINE_FN = { top: topLine, bottom: bottomLine, left: leftLine, right: rightLine };

// --- Per-variant "derive one step, then test against a target" machines ---
// Each `derive(state, value)` consumes one of the 6 line cells (state carries
// `.i`, the 0-based read count, supplied by the wrapper below) and returns
// the next partial state. `matches(state, target)` tells whether the fully
// scanned line (state.i === 6) produced `target`. The wrapper reuses this
// pair unchanged for a literal printed clue (`target` is a JS constant) and
// for a shared, solver-determined circle (`target` is read as a 7th NFA
// symbol off the shared Var cell) -- both must be the same rule.
const VARIANTS = {
  // Only the first two cells matter; cells 3-6 are read and ignored.
  difference: {
    derive(state, v) {
      if (state.i === 0) return { v1: v };
      if (state.i === 1) return { v1: state.v1, diff: Math.abs(v - state.v1) };
      return { v1: state.v1, diff: state.diff };
    },
    matches(state, target) { return state.diff === target; },
  },
  // Only the first two cells matter.
  outside2: {
    derive(state, v) {
      if (state.i === 0) return { a: v };
      if (state.i === 1) return { a: state.a, b: v };
      return { a: state.a, b: state.b };
    },
    matches(state, target) { return target === state.a || target === state.b; },
  },
  // Track the previous cell (to add it once a 6 is read) and a flag meaning
  // "the cell just read is 6's other neighbour, add it now".
  nextTo6: {
    derive(state, v) {
      if (state.phase === undefined) { // first cell of the line
        if (v === 6) return { phase: 'right', sum: 0 };
        return { phase: 'seek', prev: v };
      }
      if (state.phase === 'seek') {
        if (v === 6) return { phase: 'right', sum: state.prev };
        return { phase: 'seek', prev: v };
      }
      if (state.phase === 'right') return { phase: 'done', sum: state.sum + v };
      return { phase: 'done', sum: state.sum }; // already resolved, ignore the rest
    },
    matches(state, target) { return state.sum === target; },
  },
  // Count strictly-new maximums, in reading order -- same rule as ISS's own
  // native `Skyscraper`, hand-built because that class requires a Sudoku
  // grid and this puzzle's board is Raw (see header).
  skyscraper: {
    derive(state, v) {
      const maxSoFar = state.maxSoFar ?? 0;
      const count = state.count ?? 0;
      if (v > maxSoFar) return { maxSoFar: v, count: count + 1 };
      return { maxSoFar, count };
    },
    matches(state, target) { return state.count === target; },
  },
  // Longest strictly-ascending run length, in reading order.
  maxAscending: {
    derive(state, v) {
      if (state.prev === undefined) return { prev: v, curRun: 1, maxRun: 1 };
      if (v > state.prev) {
        const curRun = state.curRun + 1;
        return { prev: v, curRun, maxRun: Math.max(state.maxRun, curRun) };
      }
      return { prev: v, curRun: 1, maxRun: state.maxRun };
    },
    matches(state, target) { return state.maxRun === target; },
  },
  // Track the first odd value and the first even value seen; exactly one of
  // the two is what the printed clue must equal (see header comment).
  firstSeenParity: {
    derive(state, v) {
      const isOdd = v % 2 === 1;
      const foundOdd = state.foundOdd ?? (isOdd ? v : null);
      const foundEven = state.foundEven ?? (!isOdd ? v : null);
      return { foundOdd, foundEven };
    },
    matches(state, target) { return target === state.foundOdd || target === state.foundEven; },
  },
};

// targetMode is either {type: 'const', value: N} for a printed clue, or
// {type: 'var', cell: id} for a shared, undetermined circle cell.
function laneConstraint(name, variantKey, lineCells, targetMode) {
  const { derive, matches } = VARIANTS[variantKey];
  const cells = targetMode.type === 'const' ? lineCells : [...lineCells, targetMode.cell];
  const spec = NFA.encodeSpec({
    startState: { i: 0 },
    transition: (state, value) => {
      if (state.i < 6) return { ...derive(state, value), i: state.i + 1 };
      // 7th symbol: the shared circle Var itself.
      return matches(state, value) ? { i: 7, done: true } : undefined;
    },
    accept: (state) => targetMode.type === 'const'
      ? (state.i === 6 && matches(state, targetMode.value))
      : (state.i === 7 && state.done === true),
  }, 9);
  return new NFA(spec, name, ...cells);
}

// --- Board structure: rows, columns and boxes, all explicit (Raw grid) ---
const rowGroups = boardNames.flatMap(board =>
  [0, 1, 2, 3, 4, 5].map(r => new AllDifferent(...[0, 1, 2, 3, 4, 5].map(c => cellId(board, r, c)))));
const colGroups = boardNames.flatMap(board =>
  [0, 1, 2, 3, 4, 5].map(c => new AllDifferent(...[0, 1, 2, 3, 4, 5].map(r => cellId(board, r, c)))));
const boxGroups = boardNames.flatMap(board => {
  const groups = [];
  for (let rt = 0; rt < 2; rt++) {
    for (let ch = 0; ch < 3; ch++) {
      const cells = [0, 1, 2].flatMap(dr => [0, 1].map(dc =>
        cellId(board, rt * 3 + dr, ch * 2 + dc)));
      groups.push(new AllDifferent(...cells));
    }
  }
  return groups;
});

// --- Givens, transcribed from the payload's grid values (drawn position) ---
const GIVENS = [
  [1, 18, 6], [3, 16, 6], [5, 6, 3], [5, 10, 5], [5, 12, 4], [5, 19, 6],
  [6, 10, 4], [6, 12, 5], [6, 17, 6], [9, 18, 4], [9, 19, 5], [10, 5, 4],
  [11, 4, 2], [12, 6, 4],
];
const givenLocal = GIVENS.map(([r, c, v]) => ({ ...localOf(r, c), v }));
const givenCellSet = new Set(givenLocal.map(({ board, localRow, localCol }) => `${board},${localRow},${localCol}`));
const givenConstraints = givenLocal.map(({ board, localRow, localCol, v }) =>
  new Given(cellId(board, localRow, localCol), v));

// The 14x16 packing (224 cells) holds only 216 real board cells; the last 8
// cells of row 14 are pure padding with no rule touching them. Pin each to a
// single value so it cannot manufacture spurious "solutions" that differ only
// in an unused cell (iss_solution marks these '.').
const paddingCells = [9, 10, 11, 12, 13, 14, 15, 16].map(c => makeCellId(14, c));
const paddingPins = paddingCells.map(cell => new Given(cell, 1));

// Every board cell (and, trivially, the pinned padding above) holds 1-6; the
// grid alphabet is widened to 1-9 only so a shared circle Var (below) can
// hold a Next-to-6 sum as high as 9. All these cells need the identical
// single-cell restriction: one `Replicate` of a single-cell `Given` (built
// below, once `graph` exists), not 224 near-duplicate `Given`s. Board/row/col
// iteration order below is exactly increasing packed-grid cellIndex order, so
// the first entry is a valid Replicate origin (it precedes every other
// target), and the padding cells -- highest cellIndex of all -- sort last.
const domainRestrictedCells = [
  ...boardNames.flatMap(board =>
    [0, 1, 2, 3, 4, 5].flatMap(r => [0, 1, 2, 3, 4, 5].map(c => cellId(board, r, c)))),
  ...paddingCells,
];

// --- Outside clues on edges facing away from every other board (printed) ---
// [board, side, index, value] -- transcribed from the payload's outside-clue
// overlay text and position; index is the 1-indexed drawn row (left/right
// lanes) or column (top/bottom lanes) the clue belongs to.
const GIVEN_LANES = [
  ['BL', 'bottom', 1, 3], ['BL', 'bottom', 2, 1], ['BL', 'bottom', 3, 3],
  ['BL', 'bottom', 4, 2], ['BL', 'bottom', 5, 2], ['BL', 'bottom', 6, 2],
  ['BL', 'left', 8, 3], ['BL', 'left', 9, 3], ['BL', 'left', 10, 1],
  ['BL', 'left', 11, 4], ['BL', 'left', 12, 2], ['BL', 'left', 13, 2],
  ['BR', 'bottom', 17, 6], ['BR', 'bottom', 18, 6], ['BR', 'bottom', 19, 4],
  ['BR', 'bottom', 20, 4],
  ['BR', 'right', 11, 3], ['BR', 'right', 12, 2], ['BR', 'right', 13, 1],
  ['TL', 'left', 1, 1], ['TL', 'left', 2, 1], ['TL', 'left', 3, 1],
  ['TL', 'left', 4, 2], ['TL', 'left', 5, 1], ['TL', 'left', 6, 4],
  ['TL', 'top', 1, 3], ['TL', 'top', 2, 1], ['TL', 'top', 3, 2],
  ['TL', 'top', 4, 3], ['TL', 'top', 5, 2], ['TL', 'top', 6, 5],
  ['TM', 'top', 8, 5], ['TM', 'top', 9, 4], ['TM', 'top', 10, 2],
  ['TM', 'top', 11, 6], ['TM', 'top', 12, 6], ['TM', 'top', 13, 5],
  ['TR', 'right', 2, 3],
  ['TR', 'top', 16, 5],
];
const givenLaneConstraints = GIVEN_LANES.map(([board, side, index, value]) =>
  laneConstraint(`${board}-${side}${index}`, VARIANT_OF[board],
    LINE_FN[side](board, index), { type: 'const', value }));

// --- Circle links: edges facing an adjacent board (undetermined, shared) ---
// [boardA, sideA, boardB, sideB, index] -- one row per drawn circle; index is
// the drawn row (vertical gutters) or column (horizontal gutter) both boards
// share at that circle. The circle's own value is not printed anywhere.
const LINKS = [
  ['TL', 'right', 'TM', 'left', 1], ['TL', 'right', 'TM', 'left', 2],
  ['TL', 'right', 'TM', 'left', 3], ['TL', 'right', 'TM', 'left', 4],
  ['TL', 'right', 'TM', 'left', 5], ['TL', 'right', 'TM', 'left', 6],
  ['BL', 'right', 'BM', 'left', 8], ['BL', 'right', 'BM', 'left', 9],
  ['BL', 'right', 'BM', 'left', 10], ['BL', 'right', 'BM', 'left', 11],
  ['BL', 'right', 'BM', 'left', 12], ['BL', 'right', 'BM', 'left', 13],
  ['TM', 'right', 'TR', 'left', 1], ['TM', 'right', 'TR', 'left', 2],
  ['TM', 'right', 'TR', 'left', 3], ['TM', 'right', 'TR', 'left', 4],
  ['TM', 'right', 'TR', 'left', 5], ['TM', 'right', 'TR', 'left', 6],
  ['BM', 'right', 'BR', 'left', 8], ['BM', 'right', 'BR', 'left', 9],
  ['BM', 'right', 'BR', 'left', 10], ['BM', 'right', 'BR', 'left', 11],
  ['BM', 'right', 'BR', 'left', 12], ['BM', 'right', 'BR', 'left', 13],
  ['TL', 'bottom', 'BL', 'top', 1], ['TL', 'bottom', 'BL', 'top', 2],
  ['TL', 'bottom', 'BL', 'top', 3], ['TL', 'bottom', 'BL', 'top', 4],
  ['TL', 'bottom', 'BL', 'top', 5], ['TL', 'bottom', 'BL', 'top', 6],
  ['TM', 'bottom', 'BM', 'top', 8], ['TM', 'bottom', 'BM', 'top', 9],
  ['TM', 'bottom', 'BM', 'top', 10], ['TM', 'bottom', 'BM', 'top', 11],
  ['TM', 'bottom', 'BM', 'top', 12], ['TM', 'bottom', 'BM', 'top', 13],
  ['TR', 'bottom', 'BR', 'top', 15], ['TR', 'bottom', 'BR', 'top', 16],
  ['TR', 'bottom', 'BR', 'top', 17], ['TR', 'bottom', 'BR', 'top', 18],
  ['TR', 'bottom', 'BR', 'top', 19], ['TR', 'bottom', 'BR', 'top', 20],
];

const shape = new Shape('14x16', 9, 'Raw');
const graph = cellGraph(shape);

const domainOrigin = domainRestrictedCells[0];
const domainRestriction = new Replicate(
  [new Given(domainOrigin, 1, 2, 3, 4, 5, 6)],
  Replicate.encodeTargetCells(domainRestrictedCells, domainOrigin, graph),
  domainOrigin,
);

// One free Var per circle, anchored (for addressing only) to one grid cell
// per link -- its value is unconnected to that cell's own digit.
const anchors = boardNames.flatMap(boardCells).slice(0, LINKS.length);
const circles = graph.makeOverlay('VC', anchors);
const circleVar = circles.toVar('circle links');
const circleCells = circles.cells();

const linkConstraints = LINKS.flatMap(([boardA, sideA, boardB, sideB, index], i) => {
  const shared = circleCells[i];
  return [
    laneConstraint(`${boardA}-${sideA}${index}-link`, VARIANT_OF[boardA],
      LINE_FN[sideA](boardA, index), { type: 'var', cell: shared }),
    laneConstraint(`${boardB}-${sideB}${index}-link`, VARIANT_OF[boardB],
      LINE_FN[sideB](boardB, index), { type: 'var', cell: shared }),
  ];
});

return [
  shape,
  circleVar,
  ...givenConstraints,
  ...paddingPins,
  domainRestriction,
  ...rowGroups,
  ...colGroups,
  ...boxGroups,
  ...givenLaneConstraints,
  ...linkConstraints,
];
