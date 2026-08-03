// Title: Chromosomesx
// Author: Bellal & ThePedallingPianist
// Video: https://www.youtube.com/watch?v=U0La5iQNkl4
// Source: https://app.crackingthecryptic.com/sudoku/p8FLjRMMJ6

// Normal sudoku. Doublers: exactly one cell per row, column and box is a
// doubler, and the nine doubler digits are 1-9 once each; a doubler's
// value counts as twice its digit for the equal-sums line. Equal sums
// line: the blue line's cells within each box it passes through sum to
// one shared total N, each box-visit counted separately. The R6C5/R6C6
// yellow join is decorative -- box 5's two visits stay two segments
// rather than merging through it (both from the rules text).

// N can exceed 9, so the shape is widened to 10 states and grid digits
// are restricted back to 1-9. VD is the doubler flag (1 normal, 2
// doubled). VNT/VNO hold N's tens/ones digit (N = 10*(VNT-1)+(VNO-1));
// every segment machine reads them after its own cells and accepts only
// when its scanned effective sum matches that shared value.

const shape = new Shape('9x9', 10);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);

const flagTargets = flags.at(gridCells);
const flagOrigin = flagTargets[0];

const targetTens = 'VNT';
const targetOnes = 'VNO';

// One machine per digit: across the whole grid, that digit occurs under a
// doubler flag exactly once. Together with one-doubler-per-row/column/box
// below, this forces the nine doubler cells to hold 1-9 once each.
const doubledDigitNFA = digit => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, count: state.count };
    }
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 'digit', count };
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, shape);

// One machine per segment length: sum the segment's interleaved
// digit/flag pairs into an effective total (doubled where flagged),
// clamped at a sink above any value the widened target could hold, then
// read the target's tens/ones cells and accept only on an exact match.
const MAX_TOTAL = 69; // 10*(7-1) + (10-1): the widest value VNT/VNO can hold.
const segmentSumCache = new Map();
const segmentSumNFA = length => {
  if (segmentSumCache.has(length)) return segmentSumCache.get(length);
  const encoded = NFA.encodeSpec({
    startState: { phase: 'digit', step: 0, sum: 0 },
    transition: (state, value) => {
      // Reject out-of-range symbols immediately (each cell's own Given
      // already restricts it; this just keeps the compiled state count
      // down by not branching on values that can never occur).
      if (state.phase === 'digit') {
        if (value > 9) return undefined;
        return { phase: 'flag', step: state.step, sum: state.sum, digit: value };
      }
      if (state.phase === 'flag') {
        if (value !== 1 && value !== 2) return undefined;
        const sum = Math.min(state.sum + state.digit * value, MAX_TOTAL + 1);
        const step = state.step + 1;
        return { phase: step === length ? 'tens' : 'digit', step, sum };
      }
      if (state.phase === 'tens') {
        if (value > 7) return undefined;
        return { phase: 'ones', sum: state.sum, tens: value };
      }
      const target = (state.tens - 1) * 10 + (value - 1);
      return state.sum === target ? { phase: 'done' } : undefined;
    },
    accept: state => state.phase === 'done',
  }, shape);
  segmentSumCache.set(length, encoded);
  return encoded;
};

// The blue line's 18 maximal same-box runs: the ten drawn strokes joined
// end to end by their shared endpoints into one 73-cell open path, then
// split at every box change (the decorative R6C5/R6C6 yellow join is
// excluded, so box 5's two runs stay separate).
const segments = [
  ['R6C6', 'R5C6', 'R4C6'],
  ['R3C7', 'R3C8'],
  ['R4C7', 'R5C7', 'R5C8', 'R6C8', 'R6C7'],
  ['R7C7', 'R8C7'],
  ['R8C6', 'R8C5', 'R7C6', 'R7C5', 'R7C4'],
  ['R7C3', 'R8C3', 'R7C2'],
  ['R6C2', 'R5C1', 'R6C1'],
  ['R7C1', 'R8C1', 'R8C2', 'R9C1', 'R9C2', 'R9C3'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R9C7', 'R9C8', 'R8C8', 'R7C8', 'R8C9', 'R7C9'],
  ['R6C9', 'R5C9', 'R4C8'],
  ['R3C9', 'R2C9', 'R2C8', 'R2C7', 'R1C8', 'R1C7'],
  ['R1C6', 'R1C5', 'R1C4'],
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'],
  ['R4C1', 'R5C2', 'R5C3', 'R4C3', 'R4C2'],
  ['R3C2', 'R2C2', 'R2C3'],
  ['R2C4', 'R3C4', 'R2C5', 'R2C6', 'R3C6'],
  ['R4C5', 'R4C4', 'R5C4', 'R5C5', 'R6C5'],
];

return [
  shape,
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flagOrigin, 1, 2), flagTargets),

  new Var('NT', 'equal-sums target tens digit', 1),
  new Var('NO', 'equal-sums target ones digit', 1),
  new Given(targetTens, 1, 2, 3, 4, 5, 6, 7),

  ...Array.from({ length: 9 }, (_, r) => new Sum(10, ...flags.at(graph.row(r + 1)))),
  ...Array.from({ length: 9 }, (_, c) => new Sum(10, ...flags.at(graph.column(c + 1)))),
  ...graph.boxes().map(box => new Sum(10, ...flags.at(box))),

  ...Array.from({ length: 9 }, (_, i) =>
    new NFA(doubledDigitNFA(i + 1), `doubled-${i + 1}`, ...interleave(gridCells))),

  ...segments.map(cells => new NFA(
    segmentSumNFA(cells.length), 'equal-sums-line',
    ...interleave(cells), targetTens, targetOnes,
  )),
];
