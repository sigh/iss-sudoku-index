// Title: Coordinate Coordinate Arrows Arrows
// Author: damo_89
// Video: https://www.youtube.com/watch?v=tQtDcvWTSXw
// Source: https://sudokupad.app/by6i2h7toi

// Doublers: 9 hidden cells (one per row/column/box, all different digits)
// double their cell's value. A parallel `VD` overlay flag (1 = normal,
// 2 = doubled) tracks this; `digit * flag` is the effective value
// everywhere the rules say "value".
//
// Coordinate arrows: the arrow's two cells spell a coordinate (start's
// effective value = row, tip's effective value = column) and the cell at
// that coordinate holds, as its own effective value, the sum of the two
// arrow values. Both coordinate components must be valid grid indices
// (1-9). There is no native 2D "value at (row, col) named by two other
// cells" primitive, so each arrow is expressed as: a small NFA per
// candidate row r (1-9) that, when the start cell's effective value
// matches r, scans row r's own cells for the column named by the tip's
// effective value and checks the sum there -- 9 NFAs per arrow. A further
// NFA per arrow pair enforces "each arrow indicates a different cell".

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const gridCells = graph.cells();
const interleaveFlags = (cells) => cells.flatMap(cell => [cell, flags.at(cell)]);

const flagTargets = flags.at(gridCells);
const flagOrigin = flagTargets[0];

// One digit is doubled per row/column/box: flags sum to 10 (eight 1s, one 2).
const placementSums = [
  ...Array.from({ length: 9 }, (_, r) => new Sum(10, ...flags.at(graph.row(r + 1)))),
  ...Array.from({ length: 9 }, (_, c) => new Sum(10, ...flags.at(graph.column(c + 1)))),
  ...graph.boxes().map(box => new Sum(10, ...flags.at(box))),
];

// Each digit 1-9 is doubled exactly once across the grid (the 9 doublers
// hold all different digits; 9 doublers over 9 digits forces a bijection).
const doubledDigitNFA = (digit) => NFA.encodeSpec({
  startState: { phase: 0, last: 0, count: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, last: value, count: state.count };
    const count = state.count + (state.last === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 0, last: 0, count };
  },
  accept: (state) => state.phase === 0 && state.count === 1,
}, 9);

// An arrow endpoint's effective value must be a legal coordinate (1-9).
// This is a genuine 2-cell (digit, flag) relation, so use Pair rather than
// a single-purpose NFA.
const rangeKey = Pair.fnToKey((digit, flagValue) => digit * flagValue <= 9, 9);

// For a fixed candidate row r: reads [start digit, start flag, tip digit,
// tip flag, then row r's 9 cells interleaved digit/flag in column order].
// If the start's effective value isn't r, the rest of the scan is
// irrelevant and always accepted. Otherwise the tip's effective value
// names the column within row r whose effective value must equal the sum.
const rowScanCache = new Map();
const rowScanNFA = (r) => {
  if (rowScanCache.has(r)) return rowScanCache.get(r);
  const spec = NFA.encodeSpec({
    startState: { phase: 'S1' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'S1':
          return { phase: 'S2', sd: value };
        case 'S2':
          return (state.sd * value === r) ? { phase: 'T1' } : { phase: 'skip' };
        case 'T1':
          return { phase: 'T2', td: value };
        case 'T2': {
          const effT = state.td * value;
          if (effT < 1 || effT > 9) return undefined;
          return { phase: 'scanD', sum: r + effT, remaining: effT - 1 };
        }
        case 'scanD':
          return { phase: 'scanF', sum: state.sum, remaining: state.remaining, gd: value };
        case 'scanF': {
          if (state.remaining === 0) {
            return (state.gd * value === state.sum) ? { phase: 'matched' } : undefined;
          }
          return { phase: 'scanD', sum: state.sum, remaining: state.remaining - 1 };
        }
        case 'skip':
          return { phase: 'skip' };
        case 'matched':
          return { phase: 'matched' };
      }
    },
    accept: (state) => state.phase === 'skip' || state.phase === 'matched',
  }, 9);
  rowScanCache.set(r, spec);
  return spec;
};

// Reads two arrows' [Si, Ti, Sj, Tj] (each interleaved digit/flag) and
// rejects only when both arrows resolve to the exact same (row, col).
// Effective values above 9 can never name a legal row/column, so they are
// collapsed to one sentinel (10) -- that keeps the compiled state count
// small without weakening the check (such a branch is already forbidden
// by the range Pair on every arrow endpoint).
const clampEff = (v) => Math.min(v, 10);

const distinctTargetNFA = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0: return { phase: 1, sid: value };
      case 1: return { phase: 2, effSi: clampEff(state.sid * value) };
      case 2: return { phase: 3, effSi: state.effSi, tid: value };
      case 3: return { phase: 4, effSi: state.effSi, effTi: clampEff(state.tid * value) };
      case 4: return { phase: 5, effSi: state.effSi, effTi: state.effTi, sjd: value };
      case 5: {
        const effSj = clampEff(state.sjd * value);
        if (effSj !== state.effSi) return { phase: 'ok' };
        return { phase: 6, effSi: state.effSi, effTi: state.effTi };
      }
      case 6: return { phase: 7, effSi: state.effSi, effTi: state.effTi, tjd: value };
      case 7: {
        const effTj = clampEff(state.tjd * value);
        if (effTj === state.effTi) return undefined;
        return { phase: 'ok' };
      }
      case 'ok': return { phase: 'ok' };
    }
  },
  accept: (state) => state.phase === 'ok',
}, 9);

// Arrows as [start, tip]: start's effective value is the target row, tip's
// is the target column (drawn arrowhead identifies the tip).
const arrows = [
  ['R8C4', 'R9C4'],
  ['R8C5', 'R9C5'],
  ['R8C6', 'R9C6'],
  ['R4C9', 'R4C8'],
  ['R5C9', 'R5C8'],
  ['R6C9', 'R6C8'],
  ['R3C9', 'R2C9'],
  ['R8C7', 'R9C8'],
  ['R8C8', 'R7C9'],
  ['R2C6', 'R3C7'],
  ['R9C3', 'R8C2'],
  ['R5C4', 'R6C4'],
];

const arrowEndpoints = [...new Set(arrows.flat())];

const arrowPairs = [];
for (let i = 0; i < arrows.length; i++) {
  for (let j = i + 1; j < arrows.length; j++) {
    arrowPairs.push([arrows[i], arrows[j]]);
  }
}

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  new Given('R2C5', 5),
  new Given('R3C3', 3),
  new Given('R7C1', 7),
  new Given('R7C7', 9),

  flags.makeReplicate(
    [new Given(flagOrigin, 1, 2)],
    flagTargets,
  ),
  ...placementSums,
  ...Array.from({ length: 9 }, (_, digit) =>
    new NFA(doubledDigitNFA(digit + 1), `doubled-${digit + 1}`, ...interleaveFlags(gridCells))),

  ...arrowEndpoints.map(cell =>
    new Pair(rangeKey, 'coord-arrow-range', cell, flags.at(cell))),

  ...arrows.flatMap(([start, tip]) =>
    Array.from({ length: 9 }, (_, i) => i + 1).map(r =>
      new NFA(
        rowScanNFA(r), `coord-arrow-row-${r}`,
        ...interleaveFlags([start, tip]),
        ...interleaveFlags(graph.row(r)),
      ))),

  ...arrowPairs.map(([[si, ti], [sj, tj]]) =>
    new NFA(
      distinctTargetNFA, 'coord-arrow-distinct',
      ...interleaveFlags([si, ti, sj, tj]),
    )),
];
