// Title: Double, Double
// Author: zetamath
// Video: https://www.youtube.com/watch?v=BrMVhhaiUvE
// Source: https://app.crackingthecryptic.com/sudoku/tTm73r746q

// Normal sudoku rules apply. The digit in R4C5 (drawn with a square marker)
// is 2, 4, 6, or 8. Every other drawn line is a double arrow: the sum of the
// digits along the line equals the sum of the digits in the two circles at
// its ends. The grid also holds 9 hidden doublers, one per row/column/box,
// each doubling a different digit 1-9; a doubler cell's effective value for
// double-arrow sums is twice its digit. No cell is marked as a doubler in
// the source, so doubler placement is entirely solver-deduced.
//
// VD is a parallel flag layer: 1 means an ordinary cell, 2 means a doubler.
// Every double-arrow line scans grid digit / VD flag pairs and uses
// digit * flag as each cell's effective value.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const gridCells = graph.cells();
const flag = cell => flags.at(cell);
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);

// Exactly one doubler (flag 2) among the nine flags of a row/column/box:
// 8 ones + 1 two sums to 10; any other split sums to a different total.
const ONE_DOUBLER_SUM = 10;

// Scans the whole grid as interleaved [digit, flag] pairs and accepts iff
// exactly one cell holds `digit` under a doubler flag (flag == 2). Applied
// once per digit 1-9 to encode "each digit 1-9 is doubled exactly once".
const doubledDigitSpec = digit => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, count: state.count };
    }
    if (value !== 1 && value !== 2) return undefined;
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 'digit', count };
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, 9);

// Scans a double-arrow line (first and last cells are the circles, every
// cell between is the shaft) as interleaved [digit, flag] pairs, tracking
// effective-value circleSum minus shaftSum; accepts when that difference is
// zero after all cells, i.e. the two sums are equal. `totalCells` is baked
// in per line (its length) so the spec knows which position is the last one.
// Each remaining cell can shift diff by at most 18 (max effective value), so
// once |diff| exceeds 18 * cells-left the branch can never reach zero --
// pruning it keeps the compiled state count within the NFA state limit.
const doubleArrowSpec = totalCells => NFA.encodeSpec({
  startState: { phase: 'digit', idx: 0, diff: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', idx: state.idx, diff: state.diff, digit: value };
    }
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    const isCircle = state.idx === 0 || state.idx === totalCells - 1;
    const diff = state.diff + (isCircle ? effective : -effective);
    const idx = state.idx + 1;
    const remaining = totalCells - idx;
    if (Math.abs(diff) > 18 * remaining) return undefined;
    return { phase: 'digit', idx, diff };
  },
  accept: state => state.phase === 'digit' && state.idx === totalCells && state.diff === 0,
}, 9);

// Double-arrow lines, each [circle, ...shaft, circle]. Provenance: geometry
// helper's interpolated cell paths for the 11 grey strokes, extended at
// each end to the white circle underlay whose cell the stroke's terminal
// waypoint falls short of (a double arrow's rendered stroke stops at the
// circle's edge, not its centre). Two circles are each a shared endpoint of
// two lines (R3C2, R4C7) and one circle is a shared endpoint of three lines
// (R7C4); each remains a separate double-arrow because every one of the 16
// drawn circles is used as an endpoint by at least one line only under that
// reading.
const doubleArrows = [
  ['R2C3', 'R1C2', 'R1C1', 'R2C2', 'R3C1', 'R3C2'],
  ['R3C2', 'R4C2', 'R5C2', 'R6C2'],
  ['R2C5', 'R2C6', 'R1C6', 'R1C7'],
  ['R3C8', 'R3C7', 'R4C7'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C5', 'R6C4', 'R6C5', 'R6C6', 'R7C7'],
  ['R7C4', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R4C7'],
  ['R7C4', 'R8C4', 'R9C4'],
  ['R9C1', 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R7C4'],
  ['R7C6', 'R8C7', 'R7C8', 'R8C8'],
  ['R8C8', 'R8C9', 'R7C9', 'R6C9'],
  ['R6C9', 'R6C8', 'R6C7'],
];

return [
  new Shape('9x9'),
  new Given('R4C5', 2, 4, 6, 8),

  flags.toVar('doubler flags'),
  flags.makeReplicate([new Given(flag(gridCells[0]), 1, 2)], flags.at(gridCells)),
  ...graph.rows().map(row => new Sum(ONE_DOUBLER_SUM, ...flags.at(row))),
  ...graph.columns().map(col => new Sum(ONE_DOUBLER_SUM, ...flags.at(col))),
  ...graph.boxes().map(box => new Sum(ONE_DOUBLER_SUM, ...flags.at(box))),
  ...Array.from({ length: 9 }, (_, i) =>
    new NFA(doubledDigitSpec(i + 1), `doubled-digit-${i + 1}`, ...interleave(gridCells))),

  ...doubleArrows.map((cells, i) =>
    new NFA(doubleArrowSpec(cells.length), `double-arrow-${i + 1}`, ...interleave(cells))),
];
