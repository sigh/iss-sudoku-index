// Title: Hungry Rabbit in the Fog
// Author: MCMCHammer
// Video: https://www.youtube.com/watch?v=15FxG6t0VoA
// Source: https://sudokupad.app/zqpxetdz7a

// Rules encoded below:
//   Normal sudoku with the digits 1-9.
//   Poppy walks a one-cell-wide orthogonal path from her cell (R9C1) to the
//   carrot (R1C9). The path may not branch and may not touch itself, not even
//   diagonally. Two cells either side of a corner are diagonally adjacent in
//   every turning path, and no R9C1-R1C9 route can avoid turning, so the
//   diagonal clause is read as: two path cells may be diagonally adjacent only
//   when a path cell orthogonally adjacent to both lies between them.
//   Every cell has a value. Off the path the value is the digit. On the path
//   the value is the running total of the digits visited so far in the current
//   box, restarting whenever the path crosses a box border.
//   Every clue (dots, X/V, cages, odd/even, minimum, arrow, thermometer,
//   region sum line, palindrome, whispers, renban) reads values, not digits.
//   The value in the red security cage at R9C9 may not equal the value of any
//   cell on the path.
// Not encoded: fog of war, which only controls what the app displays.
// The two black killer cages state a total and nothing else, so they are plain
//   value sums with no all-different of their own.

// Values run to 45 (a whole box eaten in one visit), well past any ISS value
// range, so each cell's value is carried as two digits in base 16 across the
// VH and VL overlays: value = 16*VH + VL. The grid alphabet is widened to
// 0-15 to hold those digits, and the playable cells are pinned back to 1-9.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const POPPY = 'R9C1';
const CARROT = 'R1C9';
const SECURITY_CAGE = 'R9C9';

// VP holds, for each cell, where the path arrived from: OFF for a cell that is
// not on the path, START for Poppy's own cell, otherwise the direction of the
// previous path cell. A successor is therefore any neighbour whose VP points
// back, which is what the degree rules below count.
const OFF = 0, START = 1, FROM_N = 2, FROM_E = 3, FROM_S = 4, FROM_W = 5;
const DIRS = [
  { code: FROM_N, dr: -1, dc: 0, back: FROM_S },
  { code: FROM_E, dr: 0, dc: 1, back: FROM_W },
  { code: FROM_S, dr: 1, dc: 0, back: FROM_N },
  { code: FROM_W, dr: 0, dc: -1, back: FROM_E },
];
const ON_CODES = [START, FROM_N, FROM_E, FROM_S, FROM_W];

const path = graph.makeOverlay('VP');
const hi = graph.makeOverlay('VH');
const lo = graph.makeOverlay('VL');

const boxOf = (cell) => {
  const { row, col } = parseCellId(cell);
  return ((row - 1) / 3 | 0) * 3 + ((col - 1) / 3 | 0);
};
// Sum() terms for +/- one cell's value.
const value = (cell, sign = 1) => [[hi.at(cell), 16 * sign], [lo.at(cell), sign]];
const values = (cells, sign = 1) => cells.flatMap(cell => value(cell, sign));
const neighbourDirs = (cell) => DIRS.map(d => ({ ...d, cell: graph.step(cell, d.dr, d.dc) }))
  .filter(d => d.cell);

// ---------------------------------------------------------------- path shape
const pathDomains = gridCells.map(cell => {
  if (cell === POPPY) return new Given(path.at(cell), START);
  const codes = [OFF, ...neighbourDirs(cell).map(d => d.code)];
  // The carrot is the far end of the path, so it is never off the path.
  return new Given(path.at(cell), ...(cell === CARROT ? codes.slice(1) : codes));
});

// Orthogonally adjacent path cells must be consecutive: one of the two must
// name the other as its predecessor. This is the no-branching and the
// orthogonal no-touching rule, and it also makes VP's pointers agree with the
// used edges.
const adjacentKey = (back) => Pair.fnToKey(
  (a, b) => a === OFF || b === OFF || b === back.into || a === back.outOf, shape);
const noTouchOrth = [
  [0, 1, { into: FROM_W, outOf: FROM_E }],
  [1, 0, { into: FROM_N, outOf: FROM_S }],
].map(([dr, dc, back]) => {
  const anchors = gridCells.filter(c => graph.step(c, dr, dc));
  return path.makeReplicate(
    new Pair(adjacentKey(back), 'adjacent pair',
      path.at(anchors[0]), path.at(graph.step(anchors[0], dr, dc))),
    path.at(anchors));
});

// Diagonally adjacent path cells are only allowed at a turn, i.e. when one of
// the two cells orthogonally adjacent to both of them is also on the path.
const noTouchDiag = gridCells.flatMap(cell => [[1, 1], [1, -1]].flatMap(([dr, dc]) => {
  const far = graph.step(cell, dr, dc);
  if (!far) return [];
  const corners = [graph.step(cell, dr, 0), graph.step(cell, 0, dc)];
  return [new Or([
    new Given(path.at(cell), OFF),
    new Given(path.at(far), OFF),
    ...corners.map(corner => new Given(path.at(corner), ...ON_CODES))])];
}));

// Each path cell has exactly one successor, except the carrot which has none;
// an off-path cell has none. Counting successors this way also forces the cell
// a VP pointer names to be on the path.
const successorSpecs = new Map();
const successorSpec = (backCodes, successors) => {
  const key = `${backCodes.join('')}:${successors}`;
  if (!successorSpecs.has(key)) {
    successorSpecs.set(key, NFA.encodeSpec({
      // i indexes the cell list: 0 is the cell itself, then its neighbours.
      // n counts neighbours which point back at the cell.
      startState: { i: 0, on: false, n: 0 },
      transition: (state, v) => {
        if (state.i === 0) return { i: 1, on: v !== OFF, n: 0 };
        const n = state.n + (v === backCodes[state.i - 1] ? 1 : 0);
        return n > successors ? undefined : { i: state.i + 1, on: state.on, n };
      },
      accept: (state) => state.n === (state.on ? successors : 0),
      maxDepth: 1 + backCodes.length,
    }, shape));
  }
  return successorSpecs.get(key);
};
const degrees = gridCells.map(cell => {
  const dirs = neighbourDirs(cell);
  return new NFA(
    successorSpec(dirs.map(d => d.back), cell === CARROT ? 0 : 1),
    'successor count',
    path.at(cell), ...dirs.map(d => path.at(d.cell)));
});

// Kills path cells that form a separate closed loop: with the degree rules
// above, a single connected on-path region is a single simple path.
const connectivity = new ConnectedValues('VP', ON_CODES);

// -------------------------------------------------------------- cell values
// value = digit, plus the previous path cell's value when the path reached
// this cell from inside the same box.
const cellValues = gridCells.map(cell => {
  const inBox = neighbourDirs(cell).filter(d => boxOf(d.cell) === boxOf(cell));
  const resets = [OFF, START, ...neighbourDirs(cell)
    .filter(d => boxOf(d.cell) !== boxOf(cell)).map(d => d.code)];
  return new Or([
    new And([
      new Given(path.at(cell), ...resets),
      new Sum(0, [cell, 1], ...value(cell, -1))]),
    ...inBox.map(d => new And([
      new Given(path.at(cell), d.code),
      new Sum(0, [cell, 1], ...value(d.cell), ...value(cell, -1))]))]);
});

// --------------------------------------------------------------- value clues
// Drawn clue data, transcribed from the puzzle art.
const WHITE_DOTS = [['R7C1', 'R8C1'], ['R8C1', 'R9C1'], ['R7C2', 'R8C2'], ['R7C2', 'R7C3']];
const BLACK_DOTS = [['R8C1', 'R8C2'], ['R9C1', 'R9C2']];
const X_PAIRS = [['R5C2', 'R5C3'], ['R5C1', 'R6C1']];
const V_PAIRS = [['R4C3', 'R5C3']];
const EVEN_CELLS = ['R4C8', 'R4C9', 'R5C8', 'R5C9', 'R6C8'];  // grey squares
const ODD_CELLS = ['R4C2'];                                    // grey circle
const MINIMUM = 'R2C2';                                        // inward arrows
const ARROW = ['R8C9', 'R8C8', 'R8C7', 'R7C7', 'R7C8'];        // bulb first
const THERMO = ['R2C6', 'R3C6'];                               // bulb first
const REGION_SUM = ['R5C7', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C5', 'R4C4', 'R4C5'];
const PALINDROME = ['R3C2', 'R3C3', 'R2C3'];
const WHISPERS = ['R1C4', 'R2C4', 'R3C4', 'R3C5'];
const RENBAN = ['R1C9', 'R1C8', 'R1C7', 'R2C7', 'R2C8', 'R3C8'];
const CAGE_8 = ['R7C4'];
const CAGE_92 = ['R7C6', 'R8C6', 'R9C6'];

const parity = [
  ...EVEN_CELLS.map(cell => new Given(lo.at(cell), 0, 2, 4, 6, 8, 10, 12, 14)),
  ...ODD_CELLS.map(cell => new Given(lo.at(cell), 1, 3, 5, 7, 9, 11, 13, 15)),
];

const cages = [
  new Sum(8, ...values(CAGE_8)),
  new Sum(92, ...values(CAGE_92)),
];

const arrow = new Sum(0, ...value(ARROW[0]), ...values(ARROW.slice(1), -1));

// Region sum line: split the drawn line at its box borders and equate the
// value totals of the resulting segments.
const regionSumSegments = REGION_SUM.reduce((segments, cell) => {
  const last = segments[segments.length - 1];
  if (last && boxOf(last[0]) === boxOf(cell)) last.push(cell);
  else segments.push([cell]);
  return segments;
}, []);
const regionSum = regionSumSegments.slice(1).map(segment =>
  new Sum(0, ...values(regionSumSegments[0]), ...values(segment, -1)));

const palindrome = PALINDROME.slice(0, PALINDROME.length >> 1).map((cell, i) =>
  new Sum(0, ...value(cell), ...value(PALINDROME[PALINDROME.length - 1 - i], -1)));

const dots = [
  ...WHITE_DOTS.map(([a, b]) => new Or([
    new Sum(1, ...value(a), ...value(b, -1)),
    new Sum(1, ...value(b), ...value(a, -1))])),
  ...BLACK_DOTS.map(([a, b]) => new Or([
    new Sum(0, ...value(a), ...value(b, -2)),
    new Sum(0, ...value(b), ...value(a, -2))])),
];

const xv = [
  ...X_PAIRS.map(([a, b]) => new Sum(10, ...value(a), ...value(b))),
  ...V_PAIRS.map(([a, b]) => new Sum(5, ...value(a), ...value(b))),
];

// Order comparisons between values need the difference as a variable, since the
// values themselves are spread over two cells. VD holds one base-16 pair per
// comparison: the thermometer step, the four minimum steps, then the three
// German whisper steps.
const LESS_THAN = [
  THERMO,
  ...graph.neighbours(MINIMUM).map(cell => [MINIMUM, cell]),
];
const WHISPER_PAIRS = WHISPERS.slice(1).map((cell, i) => [WHISPERS[i], cell]);
const diffs = new Var('D', 'value differences', 2 * (LESS_THAN.length + WHISPER_PAIRS.length));
const diffCells = diffs.cells();
const diffPair = (i) => [diffCells[2 * i], diffCells[2 * i + 1]];
const positiveKey = Pair.fnToKey((h, l) => h > 0 || l > 0, shape);
const gapKey = Pair.fnToKey((h, l) => h > 0 || l >= 5, shape);
const comparisons = [
  ...LESS_THAN.flatMap(([small, large], i) => {
    const [dh, dl] = diffPair(i);
    return [
      new Given(dh, 0, 1, 2),
      new Sum(0, ...value(large), ...value(small, -1), [dh, -16], [dl, -1]),
      new Pair(positiveKey, 'difference is positive', dh, dl),
    ];
  }),
  ...WHISPER_PAIRS.flatMap(([a, b], j) => {
    const [dh, dl] = diffPair(LESS_THAN.length + j);
    return [
      new Given(dh, 0, 1, 2),
      new Or([
        new Sum(0, ...value(a), ...value(b, -1), [dh, -16], [dl, -1]),
        new Sum(0, ...value(b), ...value(a, -1), [dh, -16], [dl, -1])]),
      new Pair(gapKey, 'difference is at least 5', dh, dl),
    ];
  }),
];

// Renban: VR is the smallest value on the line as a base-16 pair, and VO holds
// each cell's offset from it. Offsets confined to 0-5 and all different are
// exactly a set of six consecutive values.
const renbanBase = new Var('R', 'renban base value', 2);
const renbanOffsets = new Var('O', 'renban offsets', RENBAN.length);
const [baseHi, baseLo] = renbanBase.cells();
const offsetCells = renbanOffsets.cells();
const renban = [
  new Given(baseHi, 0, 1, 2),
  ...offsetCells.map(cell => new Given(cell, 0, 1, 2, 3, 4, 5)),
  new AllDifferent(...offsetCells),
  ...RENBAN.map((cell, i) => new Sum(
    0, ...value(cell), [baseHi, -16], [baseLo, -1], [offsetCells[i], -1])),
];

// Security cage: no path cell may share the caged cell's value. A path cell's
// value does appear along the path, so the rule puts the caged cell off the
// path; the machine covers the other 80 cells, reading the caged value first
// and then each cell's VP, VH, VL.
const securityCells = gridCells.filter(cell => cell !== SECURITY_CAGE);
const security = [
  new Given(path.at(SECURITY_CAGE), OFF),
  new NFA(
    NFA.encodeSpec({
      // p: 0,1 read the caged value; then 2,3,4 repeat per cell.
      startState: { p: 0 },
      transition: (state, v) => {
        switch (state.p) {
          case 0: return v > 2 ? undefined : { p: 1, h: v };
          case 1: return { p: 2, caged: 16 * state.h + v };
          case 2: return { p: 3, caged: state.caged, on: v !== OFF };
          case 3: return v > 2
            ? undefined
            : { p: 4, caged: state.caged, on: state.on, h: v };
          default: {
            const cellValue = 16 * state.h + v;
            return state.on && cellValue === state.caged
              ? undefined
              : { p: 2, caged: state.caged };
          }
        }
      },
      accept: (state) => state.p === 2,
    }, shape),
    'security cage',
    ...value(SECURITY_CAGE).map(([cell]) => cell),
    ...securityCells.flatMap(cell => [path.at(cell), hi.at(cell), lo.at(cell)])),
];

return [
  shape,
  path.toVar('path predecessor'),
  hi.toVar('value high digit'),
  lo.toVar('value low digit'),
  diffs,
  renbanBase,
  renbanOffsets,
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  hi.makeReplicate(new Given(hi.at(gridCells[0]), 0, 1, 2)),
  new Given('R4C6', 1),
  ...pathDomains,
  ...noTouchOrth,
  ...noTouchDiag,
  ...degrees,
  connectivity,
  ...cellValues,
  ...parity,
  ...cages,
  arrow,
  ...regionSum,
  ...palindrome,
  ...dots,
  ...xv,
  ...comparisons,
  ...renban,
  ...security,
];
