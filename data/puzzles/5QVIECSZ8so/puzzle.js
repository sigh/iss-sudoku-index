// Title: Tata Steel Chess Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5QVIECSZ8so
// Source: https://cracking-the-cryptic.web.app/sudoku/D8G844rT8p

// Normal sudoku (digits 1-9 once each in every row, column and box) plus a
// chess-piece reading of the digits themselves:
//   - 1-4 are pawns, 5 is a king, 8 is a rook (6, 7, 9 carry no piece role).
//   - A rook sees every cell orthogonally outward from itself -- along both
//     its row and its column -- until a pawn blocks further view; the
//     blocking pawn's own cell is itself seen.
//   - A king may not be seen by a rook that sits outside the king's own box.
//   - The grey cells (column 1 for rows 2/3/7/8/9; row 1 for columns
//     3/4/5/7/8/9 -- the only cells the source highlights) are clued: the
//     digit the solver places there also states the total number of cells
//     the rook sharing that cell's row (a column-1 grey cell) or column (a
//     row-1 grey cell) can see altogether -- all four directions from the
//     rook's own square combined, pawns included, the rook's own cell
//     excluded.
// Since every digit 1-9 appears exactly once per row/column, each row and
// column has exactly one king and exactly one rook, so the king-safety rule
// resolves to one check per row and one per column, and each sight clue
// names one specific rook (unambiguous, since a row's rook is the same
// physical piece as its own column's rook).

const graph = cellGraph('9x9');

const PAWN_MIN = 1, PAWN_MAX = 4, KING = 5, ROOK = 8;
const isPawn = v => v >= PAWN_MIN && v <= PAWN_MAX;

// -- King-safety NFA ------------------------------------------------------
//
// Single pass along a row or column. Tracks the first chess piece (king or
// rook) found and which box-band its position falls in; a pawn seen after
// that first piece marks the line as blocked. On meeting the second piece,
// the branch dies (via `undefined`, i.e. this reading of the grid is
// rejected) exactly when the line is unblocked and the two pieces sit in
// different box-bands -- the forbidden "king seen from outside its box".
const kingSafetySpec = NFA.encodeSpec({
  startState: { step: 0, phase: 'none', blocked: false, firstBand: null },
  transition: ({ step, phase, blocked, firstBand }, value) => {
    const band = Math.floor(step / 3);
    const isPiece = value === KING || value === ROOK;
    if (isPiece) {
      if (phase === 'none') {
        return { step: step + 1, phase: 'foundFirst', blocked, firstBand: band };
      }
      if (phase === 'foundFirst') {
        if (!blocked && band !== firstBand) return undefined;
        return { step: step + 1, phase: 'done', blocked, firstBand };
      }
      return { step: step + 1, phase, blocked, firstBand };
    }
    return {
      step: step + 1,
      phase,
      blocked: blocked || (phase === 'foundFirst' && isPawn(value)),
      firstBand,
    };
  },
  accept: () => true,
  maxDepth: 9,
}, 9);

function kingSafetyConstraint(name, line) {
  return new NFA(kingSafetySpec, name, line);
}

// -- Total rook sight (4-direction) NFA ------------------------------------
//
// One shared spec for a family of NFAs, each hypothesising a specific rook
// square (r, c): four segments count outward from (r, c) -- left along the
// row, right along the row, up the column, down the column -- each stopping
// (inclusive) at the first pawn, then a fifth single-cell segment checks the
// combined total against the clue cell's own digit. The (r, c) hypothesis
// itself is asserted by a sibling `Given` in the branch that uses this NFA,
// not inside the automaton.
const totalSightSpec = NFA.encodeSpec({
  startState: { segIndex: 0, phase: 'counting', count: 0, total: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      const segIndex = state.segIndex + 1;
      // Clamp above the true 8-per-direction, 16-combined max; once the
      // running total can only fail to match the (<=9) clue digit, further
      // distinctions are pointless.
      const total = Math.min(state.total + state.count, 10);
      return segIndex <= 3
        ? { segIndex, phase: 'counting', count: 0, total }
        : { segIndex, phase: state.phase, count: state.count, total };
    }
    if (state.segIndex <= 3) {
      if (state.phase === 'blocked') return state;
      const count = Math.min(state.count + 1, 10);
      return { ...state, count, phase: isPawn(value) ? 'blocked' : 'counting' };
    }
    // segIndex === 4: the single clue cell. Reject unless its digit is
    // exactly the combined total from the four counted segments.
    return value === state.total ? state : undefined;
  },
  accept: (state) => state.segIndex === 4,
  maxDepth: 21,
}, 9, { multiSegment: true });

// Cells strictly left/right of column `c` in `row`, and strictly
// above/below row `r` in `col` -- each ordered outward from (r, c), which is
// itself excluded from every segment.
function outwardSegments(row, col, r, c) {
  return [
    row.slice(0, c - 1).reverse(),
    row.slice(c),
    col.slice(0, r - 1).reverse(),
    col.slice(r),
  ];
}

// One candidate placement of the rook at (r, c): asserts the placement and,
// given it, that the four-direction total matches the clue cell's digit.
function rookSightBranch(r, c, clueCell) {
  const row = graph.row(r);
  const col = graph.column(c);
  const [left, right, up, down] = outwardSegments(row, col, r, c);
  return new And([
    new Given(row[c - 1], ROOK),
    new NFA(totalSightSpec, 'TS', left, right, up, down, [clueCell]),
  ]);
}

// A row's grey clue (column 1): disjoin over the 9 columns the row's rook
// could occupy.
function rowSightClue(r) {
  const clueCell = graph.row(r)[0];
  const branches = [];
  for (let c = 1; c <= 9; c++) branches.push(rookSightBranch(r, c, clueCell));
  return new Or(branches);
}

// A column's grey clue (row 1): disjoin over the 9 rows the column's rook
// could occupy.
function columnSightClue(c) {
  const clueCell = graph.column(c)[0];
  const branches = [];
  for (let r = 1; r <= 9; r++) branches.push(rookSightBranch(r, c, clueCell));
  return new Or(branches);
}

const sightRows = [2, 3, 7, 8, 9];
const sightCols = [3, 4, 5, 7, 8, 9];

return [
  new Shape('9x9'),

  new Given('R1C6', 8),
  new Given('R2C5', 2), new Given('R2C6', 7), new Given('R2C8', 3),
  new Given('R4C1', 3), new Given('R4C5', 7),
  new Given('R5C1', 8),
  new Given('R6C1', 5), new Given('R6C5', 3), new Given('R6C7', 2),
  new Given('R7C1', 9), new Given('R7C2', 7),
  new Given('R9C5', 9),

  ...graph.rows().map((line, i) => kingSafetyConstraint(`KSR${i + 1}`, line)),
  ...graph.columns().map((line, i) => kingSafetyConstraint(`KSC${i + 1}`, line)),

  ...sightRows.map(r => rowSightClue(r)),
  ...sightCols.map(c => columnSightClue(c)),
];
