// Title: The Pawn's Gambit
// Author: HalfBakedLunatic
// Video: https://www.youtube.com/watch?v=OfmRA7I8j8Y
// Source: https://app.crackingthecryptic.com/sudoku/N888QBFmpJ

// Normal sudoku rules apply. Three thermometers: digits strictly increase
// from the bulb (a fourth line entry in the source carries no waypoints and
// no matching bulb underlay, so its path is unrecoverable and omitted).
//
// Digits double as chess pieces: 1=King, 2=Rook, 3=Bishop, 4=Knight,
// 5=Pawn moving down the board, 6=Pawn moving up the board. 7-9 are plain
// digits with no piece meaning. "No King can be in check" expands to:
//  - no two Kings a king's move apart;
//  - no King a knight's move from any Knight;
//  - no King on the same diagonal as a Bishop unless a Knight/Rook/Pawn
//    (2, 4, 5 or 6) sits between them on that diagonal;
//  - no King in the same row/column as a Rook unless a Knight/Bishop/Pawn
//    (3, 4, 5 or 6) sits between them on that row/column;
//  - no King diagonally in the row directly below a downward pawn (5);
//  - no King diagonally in the row directly above an upward pawn (6).

const graph = cellGraph('9x9');
const cells = graph.cells();

// One undirected cell-pair rule, stamped by relative offset (a "template") over
// every cell where the offset stays on the grid: one Replicate per offset,
// covering both endpoints so a single pass generates each pair once. The
// Replicate origin must be the template's own first cell (R1C1 is off-grid
// for an up/left-pointing offset), so graph.makeReplicate()'s fixed
// allCells[0] origin cannot serve every offset here.
const replicateOffsetPairs = (key, name, offsets) => offsets.map(([dr, dc]) => {
  const origins = cells.filter(cell => graph.step(cell, dr, dc) !== null);
  const [origin] = origins;
  // lint-ok: bare-replicate-constructor
  return new Replicate(
    [new Pair(key, name, origin, graph.step(origin, dr, dc))],
    Replicate.encodeTargetCells(origins, origin, graph),
    origin,
  );
});

// Givens, transcribed from the payload's `cells` array.
const givens = [
  new Given('R1C4', 6), new Given('R1C6', 5), new Given('R1C9', 2),
  new Given('R2C2', 1), new Given('R2C7', 5),
  new Given('R3C3', 5), new Given('R3C9', 6),
  new Given('R5C5', 6),
  new Given('R6C7', 6),
  new Given('R7C1', 5), new Given('R7C3', 6), new Given('R7C7', 8), new Given('R7C8', 4),
  new Given('R8C3', 3), new Given('R8C5', 5),
];

// Thermometers, bulb cell first (payload `lines`, matched to the `underlays`
// bulb circles). The source's fourth line has no waypoints and no matching
// underlay; omitted.
const thermos = [
  new Thermo('R5C1', 'R5C2', 'R5C3'),
  new Thermo('R2C3', 'R1C3', 'R1C2'),
  new Thermo('R3C8', 'R2C8', 'R2C9'),
];

// Rule: no two Kings (1) a king's move apart. A king move is one of 8 offsets;
// each undirected pair only needs the 4 that are not another one's reverse.
const kingKingKey = Pair.fnToKey((a, b) => !(a === 1 && b === 1), 9);
const KING_MOVE_OFFSETS = [[0, 1], [1, -1], [1, 0], [1, 1]];
const noKingKing = replicateOffsetPairs(
  kingKingKey, 'no two kings a king-move apart', KING_MOVE_OFFSETS);

// Rule: no King (1) a knight's move from any Knight (4). Same halving as the
// king-move offsets above: a knight move is one of 8 offsets, 4 up to reversal.
const kingKnightKey = Pair.fnToKey(
  (a, b) => !((a === 1 && b === 4) || (a === 4 && b === 1)), 9);
const KNIGHT_MOVE_OFFSETS = [[1, -2], [1, 2], [2, -1], [2, 1]];
const noKingKnight = replicateOffsetPairs(
  kingKnightKey, 'no king a knight-move from a knight', KNIGHT_MOVE_OFFSETS);

// Every maximal diagonal in one direction, walked from the edge cell whose
// backward step is off-grid so each diagonal is enumerated exactly once.
const diagonalsInDirection = (dr, dc) => cells
  .filter(start => graph.step(start, -dr, -dc) === null)
  .map(start => {
    const diag = [];
    for (let cur = start; cur !== null; cur = graph.step(cur, dr, dc)) diag.push(cur);
    return diag;
  })
  .filter(diag => diag.length >= 2);
const diagonals = [...diagonalsInDirection(1, 1), ...diagonalsInDirection(1, -1)];

// Rule: no King (1) sees a Bishop (3) along a diagonal unless a Knight/Rook/
// Pawn (2, 4, 5 or 6) lies between them. Scanned left-to-right/top-to-bottom:
// `pending` remembers whether an unblocked King or Bishop was last seen since
// the last blocker; seeing the other type while one is still pending is the
// violation. 7-9 are transparent (no piece, so no blocking effect).
const bishopKingSpec = NFA.encodeSpec({
  startState: { pending: null },
  transition: ({ pending }, value) => {
    if (value === 2 || value === 4 || value === 5 || value === 6) return { pending: null };
    if (value === 1) return pending === 'B' ? undefined : { pending: 'K' };
    if (value === 3) return pending === 'K' ? undefined : { pending: 'B' };
    return { pending };
  },
  accept: () => true,
}, 9);
const noBishopChecksKing = diagonals.map(diag =>
  new NFA(bishopKingSpec, 'no unblocked bishop-king diagonal', ...diag));

// Rule: no King (1) shares a row/column with a Rook (2) unless a Knight/
// Bishop/Pawn (3, 4, 5 or 6) lies between them. Same pending-scan shape as
// the bishop rule, with the blocker/piece sets swapped for rook semantics.
const rookKingSpec = NFA.encodeSpec({
  startState: { pending: null },
  transition: ({ pending }, value) => {
    if (value === 3 || value === 4 || value === 5 || value === 6) return { pending: null };
    if (value === 1) return pending === 'R' ? undefined : { pending: 'K' };
    if (value === 2) return pending === 'K' ? undefined : { pending: 'R' };
    return { pending };
  },
  accept: () => true,
}, 9);
const noRookChecksKing = [...graph.rows(), ...graph.columns()].map(line =>
  new NFA(rookKingSpec, 'no unblocked rook-king line', ...line));

// Rule: no King (1) diagonally in the row below a downward pawn (5), or
// diagonally in the row above an upward pawn (6) -- a chess pawn's capture
// squares, one direction per pawn colour.
const pawnDownKey = Pair.fnToKey((pawn, king) => !(pawn === 5 && king === 1), 9);
const pawnUpKey = Pair.fnToKey((pawn, king) => !(pawn === 6 && king === 1), 9);
const noPawnChecksKing = [
  ...replicateOffsetPairs(
    pawnDownKey, 'downward pawn attacks king diagonally below', [[1, -1], [1, 1]]),
  ...replicateOffsetPairs(
    pawnUpKey, 'upward pawn attacks king diagonally above', [[-1, -1], [-1, 1]]),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
  ...noKingKing,
  ...noKingKnight,
  ...noBishopChecksKing,
  ...noRookChecksKing,
  ...noPawnChecksKing,
];
