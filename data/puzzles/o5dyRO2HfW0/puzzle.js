// Title: Schrodinger's Doublers
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=o5dyRO2HfW0
// Source: https://app.crackingthecryptic.com/sudoku/2hm49qMB8N

// Digits 0-6 once each per row/column/box, spread over 6 cells: one cell per
// house (the Schrodinger cell) holds two digits, counted as their sum for
// later rules. One cell per house is a doubler, counting its value (the
// Schrodinger sum if the two coincide) as double for later rules. Each digit
// 0-6 appears exactly once among the digits held in doubler cells. On each
// drawn line, split at box boundaries, every per-box run of cell values sums
// to the same total (a per-line total, not shared between the two lines).

const SENTINEL = 7; // one above the top digit (6): "no second digit" here.
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const shape = new Shape('6x6', '0-11'); // wide enough for VS's sentinel and
// the doubled-value split (VH,VL below); playable cells are restricted back
// to their true ranges via the Givens near the bottom.
const graph = cellGraph(shape);
const cells = graph.cells();
const VS = graph.makeOverlay('VS'); // second Schrodinger digit, or SENTINEL
const VD = graph.makeOverlay('VD'); // doubler flag: 1 normal, 2 doubler

// Provenance: deep-sky-blue (#34BBE6) and chocolate (#EB7532) line entries,
// resolved to cell paths by the geometry helper.
const LINE1 = ['R6C1', 'R6C2', 'R5C3', 'R4C3', 'R5C4', 'R6C5', 'R5C5', 'R5C6',
  'R4C6', 'R3C6', 'R3C5', 'R4C5', 'R4C4', 'R3C4', 'R2C3', 'R1C3', 'R1C2', 'R2C1'];
const LINE2 = ['R4C2', 'R3C3', 'R2C4', 'R1C4', 'R2C5'];
const lineCells = [...LINE1, ...LINE2];
const VH = graph.makeOverlay('VH', lineCells); // doubled cell value = 12*VH+VL
const VL = graph.makeOverlay('VL', lineCells); // (only needed on line cells)

// Each house (row/column/box) scans primary, second, primary, second, ... .
// It must see every digit 0-6 exactly once, forcing exactly one non-sentinel
// second digit per house -- the Schrodinger cell -- by pigeonhole.
const houseSpec = NFA.encodeSpec({
  startState: { mask: 0, second: false },
  transition: (s, x) => {
    if (!s.second) {
      if (x > 6) return undefined; // a primary digit is never the sentinel
      const bit = 1 << x;
      return s.mask & bit ? undefined : { mask: s.mask | bit, second: true };
    }
    if (x === SENTINEL) return { mask: s.mask, second: false };
    if (x > 6) return undefined; // VS is restricted to 0-6 or SENTINEL elsewhere
    const bit = 1 << x;
    return s.mask & bit ? undefined : { mask: s.mask | bit, second: false };
  },
  accept: s => !s.second && s.mask === 0b1111111,
}, shape);

// A two-digit cell is an unordered pair; this removes only the artificial
// digit-order symmetry between the grid digit and VS.
const canonicalPair = Pair.fnToKey((a, b) => b === SENTINEL || b < a, shape);

// Global scan (all 36 cells, primary/second/doubler-flag interleaved) for one
// target digit. Six doubler cells exist grid-wide (one per row); this accepts
// iff exactly one of them holds `target`, whether as its primary digit or
// (when the doubler coincides with the Schrodinger cell) as its second digit.
const doublerDigitSpec = target => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (s, x) => {
    if (s.phase === 'digit') return x > 6 ? undefined : { phase: 'second', digit: x, count: s.count };
    if (s.phase === 'second') {
      return (x > 6 && x !== SENTINEL) ? undefined
        : { phase: 'flag', digit: s.digit, second: x, count: s.count };
    }
    // phase 'flag'
    if (x !== 1 && x !== 2) return undefined;
    const hit = x === 2 && (s.digit === target || s.second === target);
    const count = s.count + (hit ? 1 : 0);
    return count <= 1 ? { phase: 'digit', count } : undefined;
  },
  accept: s => s.phase === 'digit' && s.count === 1,
}, shape);

// Ties a line cell's primary/second/doubler-flag to its doubled value, split
// as 12*VH+VL since the raw doubled value can reach 22 (two digits summing to
// 11, doubled).
const valueSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x > 6 ? undefined : { k: 1, digit: x };
    if (s.k === 1) {
      if (x > 6 && x !== SENTINEL) return undefined;
      return { k: 2, raw: x === SENTINEL ? s.digit : s.digit + x };
    }
    if (s.k === 2) return (x === 1 || x === 2) ? { k: 3, doubled: s.raw * x } : undefined;
    if (s.k === 3) return x === Math.floor(s.doubled / 12) ? { k: 4, low: s.doubled % 12 } : undefined;
    if (s.k === 4) return x === s.low ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, shape);

const houses = graph.rowsColumnsBoxes().map((house, i) =>
  new NFA(houseSpec, `schrodinger-house-${i + 1}`, ...house.flatMap(cell => [cell, VS.at(cell)])));
const canonicalPairs = cells.map(cell => new Pair(canonicalPair, 'canonical-pair', cell, VS.at(cell)));
// Five 1-flags and one 2-flag total 7 in every required placement group.
const doublerPlacements = graph.rowsColumnsBoxes().map(group => new Sum(7, ...VD.at(group)));
const doublerBijections = range(0, 6).map(target =>
  new NFA(doublerDigitSpec(target), `doubler-digit-${target}`,
    ...cells.flatMap(cell => [cell, VS.at(cell), VD.at(cell)])));
const valueTies = lineCells.map(cell =>
  new NFA(valueSpec, 'line-cell-doubled-value', cell, VS.at(cell), VD.at(cell), VH.at(cell), VL.at(cell)));

// Split each line at box boundaries into contiguous per-box runs (matches the
// puzzle's own worked example on the shorter line), then require every run's
// total to equal every other run's total, on that line only.
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return `${Math.floor((row - 1) / 2)}_${Math.floor((col - 1) / 3)}`;
};
const segmentsByBox = line => {
  const segments = [];
  let currentBox = null;
  for (const cell of line) {
    const box = boxOf(cell);
    if (box !== currentBox) {
      segments.push([]);
      currentBox = box;
    }
    segments[segments.length - 1].push(cell);
  }
  return segments;
};
const valueTerms = (cellList, coeff) => cellList.flatMap(cell => [[VH.at(cell), 12 * coeff], [VL.at(cell), coeff]]);
const chainEqualSums = segments => segments.slice(1).map((seg, i) =>
  new Sum(0, ...valueTerms(segments[i], 1), ...valueTerms(seg, -1)));
const lineSumEqualities = [...chainEqualSums(segmentsByBox(LINE1)), ...chainEqualSums(segmentsByBox(LINE2))];

return [
  shape,
  VS.toVar('second Schrodinger digit'),
  VD.toVar('doubler flag'),
  VH.toVar('doubled value (high, base 12)'),
  VL.toVar('doubled value (low, base 12)'),
  graph.makeReplicate(new Given(cells[0], ...range(0, 6))),
  VS.makeReplicate(new Given(VS.at(cells[0]), ...range(0, 7)), VS.cells()),
  VD.makeReplicate(new Given(VD.at(cells[0]), 1, 2), VD.cells()),
  VH.makeReplicate(new Given(VH.at(lineCells[0]), 0, 1), VH.cells()),
  ...houses,
  ...canonicalPairs,
  ...doublerPlacements,
  ...doublerBijections,
  ...valueTies,
  ...lineSumEqualities,
];
