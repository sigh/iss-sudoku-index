// Title: Roman Whispers
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=HMdV3F5wK48
// Source: https://app.crackingthecryptic.com/sudoku/pT24tfPFL8

// Rules: Normal sudoku rules apply. Adjacent digits on a grey line must
// differ by at least 5. The digits in two orthogonally adjacent cells must
// not add up to 5 or 10.
//
// Grid: default 9x9 with default row/column/box all-different (payload
// regions are the standard nine 3x3 boxes). No givens.
//
// Whisper lines: 7 grey lines carry the "differ by >= 5" rule (Whisper's
// default difference is already 5, passed explicitly for clarity). Cell
// paths transcribed from the drawn line waypoints. One segment of the third
// line bends diagonally (R2C9 to R3C8); Whisper binds consecutive pairs by
// list order, so a non-orthogonal step is still a valid pair for this class.
const WHISPER_LINES = [
  ['R3C1', 'R3C2', 'R3C3'],
  ['R1C5', 'R1C6', 'R2C6', 'R2C5'],
  ['R2C7', 'R2C8', 'R2C9', 'R3C8'],
  ['R5C4', 'R4C4', 'R4C5', 'R5C5'],
  ['R5C2', 'R6C2', 'R6C3', 'R5C3'],
  ['R7C6', 'R8C6'],
  ['R9C8', 'R9C9'],
];

const whispers = WHISPER_LINES.map(cells => new Whisper(5, ...cells));

// Global rule 3: no orthogonally-adjacent pair (anywhere on the grid, not
// just on the whisper lines) sums to 5 or 10. Stated as a blanket rule with
// no markers, so every orthogonal edge gets the negated-predicate Pair,
// generalized from a scoped marker family to the whole grid. Two Replicate
// stamps (one right-offset template, one down-offset template) cover the
// grid's 144 orthogonal edges (72 horizontal + 72 vertical) exactly once,
// one per Replicate target cell.
const graph = cellGraph('9x9');
const notFiveOrTenKey = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);
const origin = 'R1C1';
const rightTargets = graph.cells().filter(c => graph.step(c, 0, 1) !== null);
const downTargets = graph.cells().filter(c => graph.step(c, 1, 0) !== null);
const notFiveOrTenPairs = [
  graph.makeReplicate(
    [new Pair(notFiveOrTenKey, 'not 5 or 10', origin, graph.step(origin, 0, 1))],
    rightTargets),
  graph.makeReplicate(
    [new Pair(notFiveOrTenKey, 'not 5 or 10', origin, graph.step(origin, 1, 0))],
    downTargets),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...notFiveOrTenPairs,
];
