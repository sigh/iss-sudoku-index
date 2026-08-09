// Title: Foggy "Pair"-rows.
// Author: Visumation
// Video: https://www.youtube.com/watch?v=ZIfPtNoC33g
// Source: https://sudokupad.app/yk82v3oj6m

// Rules encoded here:
//  - Nine 3x3 regions, whose positions the solver must find, sit disjointly in
//    the 11x11 grid; every other cell stays empty.
//  - Each region holds 1-9 once each. No row or column repeats a digit (empty
//    cells are not digits, so they do not clash).
//  - An outside clue counts the cells belonging to regions along the diagonal
//    it points down, and the digits on that diagonal sum to a multiple of it.
//    Two clues are drawn as "?": their value is itself unknown.
//  - A digit N in a cell with arrows equals the sum of the digits reached by
//    walking N filled cells along each arrow; empty cells are stepped over
//    without counting.
//  - Digits joined by a black dot are in a 1:2 ratio.
// Fog and the three fog lights are presentation only and are not encoded.
//
// Rows/columns are not all-different here (empty cells repeat 0 freely), so
// the grid is Raw: no implicit constraints.
const shape = new Shape('11x11', '0-9', 'Raw');
const grid = cellGraph(shape);

// VL labels each cell's position inside its region: 0 = not in a region,
// otherwise 1 + 3*rowOffset + colOffset for offsets 0-2 within the 3x3 block.
// The label layer is what makes region placement searchable; it is fixed by the
// digits (the top-left-most uncovered filled cell always starts a block), so it
// adds no freedom of its own.
const label = grid.makeOverlay('VL');
const rowOffset = a => ((a - 1) / 3) | 0;
const colOffset = a => (a - 1) % 3;

// Neighbouring labels: inside a block the label steps by 1 rightwards and by 3
// downwards; at a block's trailing edge (or outside any block) the next cell
// either is empty or starts a new block.
const labelAcross = Pair.fnToKey((a, b) =>
  a === 0 ? (b === 0 || colOffset(b) === 0)
    : colOffset(a) < 2 ? b === a + 1
      : (b === 0 || colOffset(b) === 0), shape);
const labelDown = Pair.fnToKey((a, b) =>
  a === 0 ? (b === 0 || rowOffset(b) === 0)
    : rowOffset(a) < 2 ? b === a + 3
      : (b === 0 || rowOffset(b) === 0), shape);
// A cell is empty exactly when it lies in no region.
const emptyIff = Pair.fnToKey((d, l) => (d === 0) === (l === 0), shape);
// No row or column repeats a digit; empty cells (0) are exempt.
const noRepeat = PairX.fnToKey((a, b) => a === 0 || b === 0 || a !== b, shape);
// Black dot: 1:2 ratio between two digits. With no digit on one side of the dot
// there is no pair of digits to relate.
const blackDot = Pair.fnToKey(
  (a, b) => a === 0 || b === 0 || a === 2 * b || b === 2 * a, shape);

const labelRuns = [
  ...grid.rows().map((cells, i) => new Pair(labelAcross, `across${i + 1}`, ...label.at(cells))),
  ...grid.columns().map((cells, i) => new Pair(labelDown, `down${i + 1}`, ...label.at(cells))),
];
// A block cannot run off the grid, so the border rows and columns can only hold
// the labels of a block's leading or trailing edge.
const labelBorders = [
  ...label.at(grid.row(1)).map(c => new Given(c, 0, 1, 2, 3)),
  ...label.at(grid.row(11)).map(c => new Given(c, 0, 7, 8, 9)),
  ...label.at(grid.column(1)).map(c => new Given(c, 0, 1, 4, 7)),
  ...label.at(grid.column(11)).map(c => new Given(c, 0, 3, 6, 9)),
];
const emptyLinks = grid.cells().map(
  c => new Pair(emptyIff, 'empty', c, label.at(c)));
// Exactly nine cells carry label 1, i.e. there are exactly nine regions.
const nineRegions = new ContainExact(Array(9).fill(1).join('_'), ...label.cells());

// Wherever a block starts, its nine digits are all different; with every block
// cell filled that makes them 1-9.
const regionDigits = grid.cells().flatMap(topLeft => {
  const block = grid.block(topLeft, 3, 3);
  if (block === null) return [];
  return [new Or([
    new Given(label.at(topLeft), 0, 2, 3, 4, 5, 6, 7, 8, 9),
    new AllDifferent(...block)])];
});

const rowsAndCols = [
  ...grid.rows().map((cells, i) => new PairX(noRepeat, `row${i + 1}`, ...cells)),
  ...grid.columns().map((cells, i) => new PairX(noRepeat, `col${i + 1}`, ...cells)),
];

// Outside clues, transcribed from the circled values and the arrowheads drawn
// outside the frame: [first cell of the diagonal, row step, col step, value].
// A "?" clue's value is unknown and is held in the VQ group instead.
const OUTSIDE = [
  ['R1Ca', 1, -1, 2], ['R1C9', 1, 1, 2], ['R1C2', 1, -1, 1], ['R1C7', 1, 1, 3],
  ['R1C6', 1, 1, 4], ['R1C3', 1, 1, 4], ['RbC8', -1, 1, 3], ['RbC4', -1, -1, 3],
  ['R1C5', 1, 1, null], ['R5Cb', 1, -1, null],
];
const unknownClues = OUTSIDE.filter(c => c[3] === null);
const clueVars = new Var('Q', 'outside clue values', unknownClues.length);

// One machine per clue: count the filled cells and total the digits, then check
// the count against the clue and the total for divisibility by it. For a known
// clue the running total is only needed modulo the clue.
const knownClueNFA = (k, len) => NFA.encodeSpec({
  startState: { n: 0, mod: 0 },
  transition: ({ n, mod }, v) =>
    v === 0 ? { n, mod } : n + 1 > k ? undefined : { n: n + 1, mod: (mod + v) % k },
  accept: ({ n, mod }) => n === k && mod === 0,
  maxDepth: len,
}, shape);
// The unknown-clue machine reads the diagonal, then the clue's own var cell as
// a second segment, so `accept` can compare against a value it could not know.
const unknownClueNFA = (len) => NFA.encodeSpec({
  startState: { n: 0, sum: 0, q: null },
  transition: (s, v) => {
    if (v === SEGMENT_BREAK) return s.q === null ? { ...s, q: 0 } : undefined;
    if (s.q !== null) return { ...s, q: v };
    return v === 0 ? s : s.n + 1 > len ? undefined : { n: s.n + 1, sum: s.sum + v, q: null };
  },
  accept: ({ n, sum, q }) => q !== null && q === n && (q === 0 ? sum === 0 : sum % q === 0),
  maxDepth: len + 2,
}, shape, { multiSegment: true });

// The same two checks on a two-cell diagonal are just a relation between those
// two cells.
const shortClueKey = (k) => Pair.fnToKey((a, b) =>
  (a === 0 ? 0 : 1) + (b === 0 ? 0 : 1) === k && (a + b) % k === 0, shape);

let unknownIndex = 0;
const outsideClues = OUTSIDE.map(([start, dR, dC, k], i) => {
  const cells = grid.ray(start, dR, dC);
  if (k === null) {
    const q = clueVars.cells()[unknownIndex++];
    return new NFA(unknownClueNFA(cells.length), `clue${i + 1}`, cells, [q]);
  }
  if (cells.length === 2) return new Pair(shortClueKey(k), `clue${i + 1}`, ...cells);
  return new NFA(knownClueNFA(k, cells.length), `clue${i + 1}`, ...cells);
});

// Cells carrying arrows, transcribed from the drawn arrowheads:
// [cell, ...[rowStep, colStep] per arrow].
const ARROWS = [
  ['R3C3', [0, 1], [1, 0]],
  ['R6C6', [-1, 0], [1, 0]],
  ['R6Ca', [0, -1], [1, -1]],
  ['R7C6', [0, 1], [-1, 1]],
  ['R9C9', [-1, 0], [0, -1], [-1, -1]],
  ['RaC4', [-1, 0], [0, 1]],
  ['RaCa', [-1, 0], [0, -1], [-1, -1]],
  ['RbC7', [-1, 0], [0, -1]],
  ['RbCa', [-1, 0], [0, -1], [-1, -1]],
];
const arrowTargets = new Var(
  'T', 'arrow targets', ARROWS.reduce((n, a) => n + a.length - 1, 0));

// One machine per arrow: segment 1 reads the clue cell's digit N, segment 2
// walks the ray counting only filled cells and remembering the Nth one, and
// segment 3 checks the target var against it. An empty clue cell states
// nothing, and its targets are pinned to 0 so the sum below stays satisfied.
const arrowNFA = (rayLen) => NFA.encodeSpec({
  startState: { p: 0, n: 0, seen: 0, hit: null },
  transition: (s, v) => {
    if (v === SEGMENT_BREAK) return { ...s, p: s.p + 1 };
    if (s.p === 0) return { ...s, n: v };
    if (s.p === 1) {
      if (s.n === 0 || s.hit !== null || v === 0) return s;
      const seen = s.seen + 1;
      return seen === s.n ? { ...s, seen, hit: v } : { ...s, seen };
    }
    if (s.n === 0) return v === 0 ? { ...s, p: 3 } : undefined;
    return s.hit === v ? { ...s, p: 3 } : undefined;
  },
  accept: s => s.p === 3,
  maxDepth: rayLen + 4,
}, shape, { multiSegment: true });

let targetIndex = 0;
const arrowClues = ARROWS.flatMap(([cell, ...dirs]) => {
  const targets = dirs.map(() => arrowTargets.cells()[targetIndex++]);
  const machines = dirs.map(([dR, dC], i) => {
    const ray = grid.ray(cell, dR, dC).slice(1);
    return new NFA(arrowNFA(ray.length), `arrow${cell}${i}`,
      [cell], ray, [targets[i]]);
  });
  // The clue digit equals the sum of the digits its arrows point at.
  return [new Arrow(cell, ...targets), ...machines];
});

// Black dots, from the two edge marks drawn between R9C7/R9C8 and R9C7/R10C7.
const dots = [
  new Pair(blackDot, 'dot1', 'R9C7', 'R9C8'),
  new Pair(blackDot, 'dot2', 'R9C7', 'RaC7'),
];

return [
  shape,
  label.toVar('region labels'),
  arrowTargets,
  clueVars,
  ...labelRuns,
  ...labelBorders,
  ...emptyLinks,
  nineRegions,
  ...regionDigits,
  ...rowsAndCols,
  ...outsideClues,
  ...arrowClues,
  ...dots,
];
