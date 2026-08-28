// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=wlp9uQP16uc
// Source: https://cracking-the-cryptic.web.app/sudoku/MFRLnfBMqj

// Normal sudoku rules apply (default row/column/box all-different).
// Digit meaning: 1 = King, 2 = Rook, 3 = Bishop, 4 = Knight; digits 5-9
// carry no piece.
// No King may be "in check":
//   - no two Kings a King's move apart (adjacent, including diagonally);
//   - no King a Knight's move from any Knight;
//   - no King on the same diagonal as a Bishop unless a Knight or a Rook
//     blocks the line of sight between them;
//   - no King in the same row/column as a Rook unless a Knight or a Bishop
//     blocks the line of sight between them.
// Two grey thermometers increase strictly from the round bulb end.
// One outside arrow gives the diagonal sum 22 for its 8 cells; digits may
// repeat along it (LittleKiller semantics).

const N = 9;
const graph = cellGraph('9x9');

// ---- Givens (R1C3=4 R1C4=9 R3C1=2 R3C4=3 R3C9=5 R4C9=1 R5C1=7 R8C8=8
// R9C7=6; transcribed from the payload's `cells[].value`.) ----
const givens = [
  new Given('R1C3', 4), new Given('R1C4', 9),
  new Given('R3C1', 2), new Given('R3C4', 3), new Given('R3C9', 5),
  new Given('R4C9', 1),
  new Given('R5C1', 7),
  new Given('R8C8', 8),
  new Given('R9C7', 6),
];

// ---- Thermometers (grey lines; bulb = round end, drawn data from the
// payload's `lines` array with underlay circles marking each bulb). ----
const thermos = [
  new Thermo('R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7'),
  new Thermo('R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'),
];

// ---- Outside diagonal-sum arrow (payload's single `arrows` entry, paired
// with the "22" overlay by nearest position to its off-grid ray). ----
const diagonalSum = LittleKiller.fromCells(
  22, graph.ray('R9C2', -1, 1), cellGeometry('9x9'));

// One Replicate per (dr, dc) offset template: each covers every in-bounds
// edge for that offset in one shifted-copy group instead of one Pair per
// edge (`lint_constraints.js` flags the un-replicated form as stamped
// copies of a handful of templates).
function pairReplicateGroup(key, name, dr, dc) {
  const origins = graph.cells().filter(cell => graph.step(cell, dr, dc) !== null);
  const originCell = origins[0];
  return new Replicate(
    [new Pair(key, name, originCell, graph.step(originCell, dr, dc))],
    Replicate.encodeTargetCells(origins, originCell, graph),
    originCell,
  );
}

// ---- Kings a King's move apart: one Replicate group per offset, walked
// with 4 of the 8 directions so each unordered edge is covered exactly
// once. ----
const KING_DIRS = [[0, 1], [1, -1], [1, 0], [1, 1]];
const kingKingKey = Pair.fnToKey((a, b) => !(a === 1 && b === 1), 9);
const kingKingChecks = KING_DIRS.map(
  (offset) => pairReplicateGroup(kingKingKey, 'king-king', offset[0], offset[1]));

// ---- Kings a Knight's move from a Knight: one Replicate group per
// offset, walked with 4 of the 8 offsets so each unordered edge is
// covered once. ----
const KNIGHT_DIRS = [[1, 2], [1, -2], [2, 1], [2, -1]];
const kingKnightKey = Pair.fnToKey(
  (a, b) => !((a === 1 && b === 4) || (a === 4 && b === 1)), 9);
const kingKnightChecks = KNIGHT_DIRS.map(
  (offset) => pairReplicateGroup(kingKnightKey, 'king-knight', offset[0], offset[1]));

// ---- No King on the same diagonal as a Bishop unless a Knight or Rook
// blocks the path: one NFA per grid diagonal (both directions), scanned in
// either order since the rule is symmetric. State tracks the most recent
// unblocked King/Bishop seen since the last blocker on this diagonal:
//   'clear'     - no unblocked King or Bishop pending
//   'sawKing'   - a King is pending with no blocker since
//   'sawBishop' - a Bishop is pending with no blocker since
// Seeing the opposite piece while one is pending is an unblocked
// King-Bishop sightline: reject. A Rook(2)/Knight(4) blocker always clears
// the pending piece; digits 5-9 (no piece) pass the state through
// unchanged.
const kingBishopSpec = NFA.encodeSpec({
  startState: 'clear',
  transition: (state, value) => {
    if (value === 1) return state === 'sawBishop' ? undefined : 'sawKing';
    if (value === 3) return state === 'sawKing' ? undefined : 'sawBishop';
    if (value === 2 || value === 4) return 'clear';
    return state;
  },
  accept: () => true,
}, 9);

const diagonals = [];
for (let c = 1; c <= N; c++) diagonals.push(graph.ray(makeCellId(1, c), 1, 1));
for (let r = 2; r <= N; r++) diagonals.push(graph.ray(makeCellId(r, 1), 1, 1));
for (let c = 1; c <= N; c++) diagonals.push(graph.ray(makeCellId(1, c), 1, -1));
for (let r = 2; r <= N; r++) diagonals.push(graph.ray(makeCellId(r, N), 1, -1));
const diagonalChecks = diagonals
  .filter(cells => cells.length >= 2)
  .map((cells, i) => new NFA(kingBishopSpec, `king-bishop-${i}`, ...cells));

// ---- No King in the same row/column as a Rook unless a Knight or Bishop
// blocks the path: same construction, scanned along every row and column.
// A Bishop(3)/Knight(4) blocker clears the pending piece here instead. ----
const kingRookSpec = NFA.encodeSpec({
  startState: 'clear',
  transition: (state, value) => {
    if (value === 1) return state === 'sawRook' ? undefined : 'sawKing';
    if (value === 2) return state === 'sawKing' ? undefined : 'sawRook';
    if (value === 3 || value === 4) return 'clear';
    return state;
  },
  accept: () => true,
}, 9);

const rowColChecks = [];
for (let r = 1; r <= N; r++) {
  rowColChecks.push(new NFA(kingRookSpec, `king-rook-row-${r}`, ...graph.row(r)));
}
for (let c = 1; c <= N; c++) {
  rowColChecks.push(new NFA(kingRookSpec, `king-rook-col-${c}`, ...graph.column(c)));
}

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
  diagonalSum,
  ...kingKingChecks,
  ...kingKnightChecks,
  ...diagonalChecks,
  ...rowColChecks,
];
