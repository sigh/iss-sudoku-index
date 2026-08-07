// Title: Rudolph?
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=yZ8jw1GkHYw
// Source: https://app.crackingthecryptic.com/sudoku/JMphTDjnGG

// Normal sudoku, no given digits. Nine "quintupler" cells hold the digits 1-9
// once each and occupy one position in each row, column and box; nothing in the
// grid marks which cells they are, so their placement is solver state. A VQ Var
// overlay carries a per-cell factor: 5 at a quintupler, 1 everywhere else.
//
// "For the purpose of any arithmetic calculations, digits in quintupler cells
// count as five times the digit's value" -- so both arithmetic clues (the
// equal-sums line and the black dots) compare a cell's VALUE, digit * factor,
// and need value-reading NFAs instead of the digit-reading native classes.
//
// Cell lists are interleaved factor-before-digit: an NFA scanning them holds a
// pending factor (2 possibilities) rather than a pending digit (9) in state.

const graph = cellGraph('9x9');
const factors = graph.makeOverlay('VQ');
const gridCells = graph.cells();
const factor = cell => factors.at(cell);
const interleave = cells => cells.flatMap(cell => [factor(cell), cell]);

const factorTargets = factors.at(gridCells);
const factorOrigin = factorTargets[0];

// Each digit 1-9 is a quintupler in exactly one cell of the grid.
const quintuplerDigitSpec = digit => NFA.encodeSpec({
  startState: { factor: null, count: 0 },
  transition: (state, value) => {
    if (state.factor === null) {
      if (value !== 1 && value !== 5) return undefined;
      return { factor: value, count: state.count };
    }
    const count = state.count + (state.factor === 5 && value === digit ? 1 : 0);
    if (count > 1) return undefined;
    return { factor: null, count };
  },
  accept: (state) => state.factor === null && state.count === 1,
}, 9);

// Two-cell value relation: scans [factorA, digitA, factorB, digitB] and accepts
// iff relation(valueA, valueB) holds, where value = factor * digit.
const pairValueSpec = (relation) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0:
        if (value !== 1 && value !== 5) return undefined;
        return { phase: 1, factorA: value };
      case 1:
        return { phase: 2, valueA: state.factorA * value };
      case 2:
        if (value !== 1 && value !== 5) return undefined;
        return { phase: 3, valueA: state.valueA, factorB: value };
      case 3:
        return relation(state.valueA, state.factorB * value)
          ? { phase: 'ok' } : undefined;
      default:
        return undefined;
    }
  },
  accept: (state) => state.phase === 'ok',
  maxDepth: 4,
}, 9);

// Equal-sums line, provenance: the one drawn stroke's interpolated cell path,
// cut at box boundaries. The path visits all nine boxes, each in a single
// contiguous run, so these nine runs are the "digits on the line ... within
// each 3x3 box" groups. The rules' own worked example,
// r4c2+r5c2+r6c2 = r4c8+r5c8+r5c7, is exactly runs 2 and 6 below.
const LINE_RUNS = [
  ['R8C1', 'R9C2', 'R8C3', 'R8C2', 'R7C2'],
  ['R6C2', 'R5C2', 'R4C2'],
  ['R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8', 'R3C7'],
  ['R4C8', 'R5C8', 'R5C7'],
  ['R5C6', 'R4C5', 'R5C5', 'R6C4', 'R6C5'],
  ['R7C6'],
  ['R7C7', 'R8C8', 'R9C9', 'R9C8'],
];

// Black dots, provenance: the two edge-centred filled circles in `overlays`.
const BLACK_DOTS = [
  ['R3C3', 'R3C4'],
  ['R3C6', 'R3C7'],
];

// The nine runs share one total N. Rather than one machine over the whole
// 40-cell line -- which would need a state per (position, running total, N)
// triple -- each run is matched against a single reference run; equality with a
// common reference is equality of all nine. The shortest run is the reference,
// so the comparison state stays a single running total.
const referenceRun = LINE_RUNS.reduce((a, b) => (b.length < a.length ? b : a));
const comparedRuns = LINE_RUNS.filter((run) => run !== referenceRun);

// Scans [run cells..., reference cells...] and accepts iff the two total the
// same value.
const runMatchesReferenceSpec = (len) => NFA.encodeSpec({
  startState: { cells: 0, factor: null, total: 0 },
  transition: (state, value) => {
    if (state.factor === null) {
      if (value !== 1 && value !== 5) return undefined;
      return { cells: state.cells, factor: value, total: state.total };
    }
    const cellValue = state.factor * value;
    if (state.cells < len) {
      const total = state.total + cellValue;
      // The reference run is one cell, whose value is at most 5 * 9 = 45, so a
      // running total past 45 can never match it.
      if (total > 45) return undefined;
      return { cells: state.cells + 1, factor: null, total };
    }
    return state.total === cellValue
      ? { cells: state.cells + 1, factor: null, total: state.total }
      : undefined;
  },
  accept: (state) => state.factor === null && state.cells === len + 1,
  maxDepth: 2 * (len + 1),
}, 9);

const blackDotRatio = pairValueSpec((a, b) => a === 2 * b || b === 2 * a);

return [
  new Shape('9x9'),

  factors.toVar('quintupler factors'),
  factors.makeReplicate([new Given(factorOrigin, 1, 5)], factorTargets),

  // One quintupler per row, column and box: nine factors from {1, 5} total 13
  // only as eight 1s and one 5.
  ...factors.rowsColumnsBoxes().map((house) => new Sum(13, ...house)),
  ...Array.from({ length: 9 }, (_, i) => new NFA(
    quintuplerDigitSpec(i + 1), `quintupler-digit-${i + 1}`,
    ...interleave(gridCells))),

  ...comparedRuns.map((run) => new NFA(
    runMatchesReferenceSpec(run.length), 'equal-sums-run',
    ...interleave(run), ...interleave(referenceRun))),

  ...BLACK_DOTS.map(([a, b]) => new NFA(
    blackDotRatio, 'black-dot-value-ratio', ...interleave([a, b]))),
];
