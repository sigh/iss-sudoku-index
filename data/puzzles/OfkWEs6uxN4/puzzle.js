// Title: Reachin' Some Region Sums
// Author: twototenth
// Video: https://www.youtube.com/watch?v=OfkWEs6uxN4
// Source: https://app.crackingthecryptic.com/sudoku/7bh4Mb8Mtf

// Rules: normal sudoku; nine "doublers," one in each row, column and box, one
// per digit 1-9; a doubled digit counts as twice its value on the region sum
// lines. Ten blue lines are drawn but one (#9 in source order) renders no
// waypoints -- a styling-only entry, not a clue -- so nine lines are encoded.
//
// Doublers are a parallel VD flag overlay: flag 1 means an ordinary cell,
// flag 2 means a doubler. A cell's effective value is digit + extra, where extra is a
// second overlay (VX, offset by +1 to keep it in the 1-9+ range: stored
// value 1 means extra 0) equal to digit when the cell is doubled and 0
// otherwise -- i.e. digit*flag = digit + extra. That keeps every region-sum
// comparison a plain linear Sum over grid digits and VX instead of a custom
// sum-tracking state machine, and needs only a 1-10 alphabet (a full 1-18
// effective-value overlay would exceed the 16-value Shape/overlay limit).

const graph = cellGraph('9x9', 10);
const cells = graph.cells();
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);

// One doubler per row/column/box: with each flag in {1,2}, a unit's flags sum
// to 10 exactly when exactly one of its nine cells is doubled (eight 1s plus
// one 2), and to 9 or 11+ otherwise.
const oneDoublerPerUnit = [...graph.rows(), ...graph.columns(), ...graph.boxes()]
  .map(unit => new Sum(10, ...flags.at(unit)));

// Each digit 1-9 is doubled exactly once across the grid: scan every grid
// cell's digit/flag pair and count occurrences of (digit === d && flag === 2),
// rejecting as soon as a second one appears.
const doubledDigitSpec = digit => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      if (value < 1 || value > 9) return undefined;
      return { phase: 'flag', digit: value, count: state.count };
    }
    if (value !== 1 && value !== 2) return undefined;
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 'digit', count };
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, graph.gridGeometry());
const doubledOnce = Array.from(
  { length: 9 },
  (_, i) => new NFA(
    doubledDigitSpec(i + 1), `digit ${i + 1} doubled once`,
    ...cells.flatMap(cell => [cell, flag(cell)])));

// Line cells, row-major waypoint order, from the drawn blue lines. One
// entry per drawn line; the styling-only tenth line is omitted (see header
// note).
const regionSumLines = [
  ['R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R1C3', 'R2C4', 'R2C5', 'R2C6', 'R3C7'],
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C4', 'R6C5', 'R5C6', 'R4C5', 'R3C5', 'R3C6'],
  ['R3C1', 'R4C2', 'R5C2', 'R6C2', 'R7C3'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C2'],
  ['R8C3', 'R9C3', 'R9C4'],
  ['R8C6', 'R8C7', 'R8C8', 'R8C9'],
  ['R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R5C9', 'R4C9', 'R3C9', 'R2C8'],
];

// VX overlay (only needed on line cells): stored value = extra + 1, where
// extra = digit when flag is 2 (doubled) and 0 when flag is 1.
const lineCells = [...new Set(regionSumLines.flat())];
const extraOverlay = graph.makeOverlay('VX', lineCells);
const extraSpec = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      if (value < 1 || value > 9) return undefined;
      return { phase: 'flag', digit: value };
    }
    if (state.phase === 'flag') {
      if (value !== 1 && value !== 2) return undefined;
      return { phase: 'extra', expected: (value === 2 ? state.digit : 0) + 1 };
    }
    return value === state.expected ? { phase: 'done' } : undefined;
  },
  accept: state => state.phase === 'done',
}, 10);
const extraValues = lineCells.map(cell => new NFA(
  extraSpec, 'doubled-extra = (digit if doubled else 0) + 1',
  cell, flag(cell), extraOverlay.at(cell)));

// Region sum lines: cells split into segments wherever the line crosses a
// 3x3 box; every segment's effective-value sum (digit + extra - 1, per
// cell) must be equal. Segmented by box membership, then enforced as a
// chain of adjacent-segment equalities (transitive, so it implies every
// segment matches every other):
//   sum_A(digit + extra) - |A|  ==  sum_B(digit + extra) - |B|
//   sum_A(digit + extra) - sum_B(digit + extra)  ==  |A| - |B|
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};
const segmentsOf = line => {
  const segments = [];
  for (const cell of line) {
    if (segments.length && boxOf(segments.at(-1).at(-1)) === boxOf(cell)) {
      segments.at(-1).push(cell);
    } else {
      segments.push([cell]);
    }
  }
  return segments;
};
// Equal-length segment pairs cancel the |A|-|B| term to 0, so the linear
// equality is a plain equal-sum over the combined digit+extra cells;
// EqualSum states that directly. Unequal-length pairs keep the |A|-|B|
// offset as an explicit coefficient-Sum target.
const regionSumConstraints = regionSumLines.flatMap(line => {
  const segments = segmentsOf(line);
  return segments.slice(1).map((segB, i) => {
    const segA = segments[i];
    if (segA.length === segB.length) {
      return new EqualSum(
        [...segA, ...extraOverlay.at(segA)], [...segB, ...extraOverlay.at(segB)]);
    }
    return new Sum(
      segA.length - segB.length,
      ...segA.map(cell => [cell, 1]), ...extraOverlay.at(segA).map(cell => [cell, 1]),
      ...segB.map(cell => [cell, -1]), ...extraOverlay.at(segB).map(cell => [cell, -1]));
  });
});

return [
  new Shape('9x9', 10),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flag(cells[0]), 1, 2), flags.at(cells)),
  extraOverlay.toVar('doubled-extra'),

  // Restrict the ordinary grid cells back to the true 1-9 digit range; the
  // widened alphabet above is only for the VD/VX overlays.
  graph.makeReplicate(new Given(cells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9), cells),

  ...oneDoublerPerUnit,
  ...doubledOnce,
  ...extraValues,
  ...regionSumConstraints,
];
