// Title: Vignettes
// Author: zetamath
// Video: https://www.youtube.com/watch?v=PBmVXzQcpR0
// Source: https://app.crackingthecryptic.com/sudoku/LLTqgTJ682

// Six independent 6x6 Sudoku grids, one per drawn vignette (top-left,
// top-middle, top-right, bottom-left, bottom-middle, bottom-right; labelled
// A-F below). Grid A is the real ISS grid; grids B-F are
// modelled as Var overlays sharing grid A's row/column/box shape, each with
// its own explicit row/column/box AllDifferent groups (Var cells are not
// auto-grouped). Every grid also carries its own doubler-flag overlay
// (values 1 = ordinary, 2 = Doubler): one flag of 2 per row/column/box
// (flag sum 7 = five 1s + one 2). The rules text does not require the six
// Doubler cells within a grid to hold distinct digits, so that is not
// encoded. Every value-reading clue (dots, XV, arrows, renban, whisper,
// cages) scans grid-digit/flag pairs and uses digit * flag as the cell's
// effective value; row/column/box Sudoku uses the plain digit.

const graph = cellGraph('6x6');
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const digitGrid = { A: graph };
for (const L of ['B', 'C', 'D', 'E', 'F']) digitGrid[L] = graph.makeOverlay('V' + L);
const flagGrid = {};
for (const L of LETTERS) flagGrid[L] = digitGrid[L].makeOverlay('V' + L + 'X');

// Local-coordinate cell in grid L, and its paired doubler flag.
const cellAt = (L, r, c) => {
  const base = makeCellId(r, c);
  return L === 'A' ? base : digitGrid[L].at(base);
};
const flagAt = (L, r, c) => flagGrid[L].at(cellAt(L, r, c));
const interleave = (L, coords) => coords.flatMap(([r, c]) => [cellAt(L, r, c), flagAt(L, r, c)]);

// A two-cell scan accepting when the effective values meet a predicate.
const effectivePairSpec = predicate => NFA.encodeSpec({
  startState: { phase: 'first-digit' },
  transition: (state, value) => {
    if (state.phase === 'first-digit') return { phase: 'first-flag', digit: value };
    if (state.phase === 'first-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return { phase: 'second-digit', first: state.digit * value };
    }
    if (state.phase === 'second-digit') return { phase: 'second-flag', first: state.first, digit: value };
    if (state.phase === 'second-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return predicate(state.first, state.digit * value) ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
}, 6);

// Renban of exactly n cells: n distinct effective values forming one
// consecutive run, any order.
const renbanSpec = n => NFA.encodeSpec({
  startState: { phase: 'digit', values: [] },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value, values: state.values };
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    if (state.values.includes(effective)) return undefined;
    const values = [...state.values, effective].sort((a, b) => a - b);
    if (values.length > n || values.at(-1) - values[0] >= n) return undefined;
    return { phase: 'digit', values };
  },
  accept: state => state.phase === 'digit'
    && state.values.length === n && state.values.at(-1) - state.values[0] === n - 1,
  maxDepth: 2 * n,
}, 6);

// German Whisper: consecutive cells in list order differ by >= threshold,
// on effective values (any line length).
const whisperChainSpec = threshold => NFA.encodeSpec({
  startState: { phase: 'digit', prev: null },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value, prev: state.prev };
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    if (state.prev !== null && Math.abs(effective - state.prev) < threshold) return undefined;
    return { phase: 'digit', prev: effective };
  },
  accept: state => state.phase === 'digit',
}, 6);

// Arrow: bulb effective value equals the sum of the arm cells' effective
// values (any arm length).
const arrowSpec = NFA.encodeSpec({
  startState: { phase: 'bulb-digit' },
  transition: (state, value) => {
    if (state.phase === 'bulb-digit') return { phase: 'bulb-flag', digit: value };
    if (state.phase === 'bulb-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return { phase: 'arm-digit', target: state.digit * value, sum: 0 };
    }
    if (state.phase === 'arm-digit') {
      return { phase: 'arm-flag', digit: value, target: state.target, sum: state.sum };
    }
    if (value !== 1 && value !== 2) return undefined;
    const sum = state.sum + state.digit * value;
    if (sum > state.target) return undefined;
    return { phase: 'arm-digit', target: state.target, sum };
  },
  accept: state => state.phase === 'arm-digit' && state.sum === state.target,
}, 6);

// Killer cage: effective values sum to the total (distinctness of the
// underlying digits is a separate AllDifferent, not part of this scan).
const effectiveCageSpec = target => NFA.encodeSpec({
  startState: { phase: 'digit', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value, sum: state.sum };
    if (value !== 1 && value !== 2) return undefined;
    const sum = state.sum + state.digit * value;
    return sum <= target ? { phase: 'digit', sum } : undefined;
  },
  accept: state => state.phase === 'digit' && state.sum === target,
}, 6);

// Per-grid Sudoku scaffolding: digit and doubler Var registration, flag
// domain {1,2}, and one flag of 2 per row/column/box. Grids B-F additionally
// need their own row/column/box AllDifferent groups (grid A gets them for
// free from Shape/graph).
const perGridScaffolding = LETTERS.flatMap(L => {
  const dGrid = digitGrid[L];
  const fGrid = flagGrid[L];
  const cells = dGrid.cells();
  return [
    ...(L === 'A' ? [] : [dGrid.toVar(`grid ${L} digits`)]),
    fGrid.toVar(`doubler flags ${L}`),
    fGrid.makeReplicate(new Given(fGrid.at(cells[0]), 1, 2), fGrid.at(cells)),
    ...dGrid.rowsColumnsBoxes().map(group => new Sum(7, ...fGrid.at(group))),
    ...(L === 'A' ? [] : dGrid.rowsColumnsBoxes().map(group => new AllDifferent(...group))),
  ];
});

// No two grids double the same local position: with six doublers per grid
// (36 total) and 36 positions, "no position doubled twice" forces exactly
// one doubler per position, i.e. the six flags at each position sum to
// 6 + 1 = 7 (five grids ordinary at 1, one grid doubled at 2).
const noSharedDoublers = [];
for (let r = 1; r <= 6; r++) {
  for (let c = 1; c <= 6; c++) {
    noSharedDoublers.push(new Sum(7, ...LETTERS.map(L => flagAt(L, r, c))));
  }
}

// Top-left grid (A): Kropki dots, provenance: the black/white edge overlays.
const blackDots = [[[3, 6], [3, 7]], [[2, 2], [3, 2]], [[5, 2], [6, 2]], [[7, 2], [7, 3]]]
  .map(([[r1, c1], [r2, c2]]) => [r1 - 1, c1 - 1, r2 - 1, c2 - 1]);
const whiteDots = [
  [[3, 3], [3, 4]], [[2, 5], [3, 5]], [[3, 6], [4, 6]], [[4, 6], [5, 6]],
  [[4, 7], [5, 7]], [[7, 6], [7, 7]], [[6, 4], [7, 4]], [[6, 3], [6, 4]],
].map(([[r1, c1], [r2, c2]]) => [r1 - 1, c1 - 1, r2 - 1, c2 - 1]);
const ratioSpec = effectivePairSpec((a, b) => a === 2 * b || b === 2 * a);
const consecutiveSpec = effectivePairSpec((a, b) => Math.abs(a - b) === 1);
const kropkiDots = [
  ...blackDots.map(([r1, c1, r2, c2]) =>
    new NFA(ratioSpec, 'black dot values', ...interleave('A', [[r1, c1], [r2, c2]]))),
  ...whiteDots.map(([r1, c1, r2, c2]) =>
    new NFA(consecutiveSpec, 'white dot values', ...interleave('A', [[r1, c1], [r2, c2]]))),
];

// Top-middle grid (B): XV, provenance: the "V"/"X" text edge overlays.
const vMarks = [[[5, 9], [6, 9]], [[5, 11], [6, 11]], [[5, 13], [6, 13]], [[3, 13], [3, 14]]]
  .map(([[r1, c1], [r2, c2]]) => [r1 - 1, c1 - 8, r2 - 1, c2 - 8]);
const xMarks = [[[7, 11], [7, 12]], [[2, 14], [3, 14]], [[2, 11], [3, 11]], [[3, 9], [4, 9]]]
  .map(([[r1, c1], [r2, c2]]) => [r1 - 1, c1 - 8, r2 - 1, c2 - 8]);
const vSpec = effectivePairSpec((a, b) => a + b === 5);
const xSpec = effectivePairSpec((a, b) => a + b === 10);
const xvMarks = [
  ...vMarks.map(([r1, c1, r2, c2]) =>
    new NFA(vSpec, 'V value sum 5', ...interleave('B', [[r1, c1], [r2, c2]]))),
  ...xMarks.map(([r1, c1, r2, c2]) =>
    new NFA(xSpec, 'X value sum 10', ...interleave('B', [[r1, c1], [r2, c2]]))),
];

// Top-right grid (C): arrows, provenance: the seven drawn arrow paths
// (bulb first, snapped to the circled cell).
const arrows = [
  [[2, 18], [3, 17], [4, 16]],
  [[4, 17], [4, 18], [4, 19], [4, 20]],
  [[4, 17], [5, 18], [5, 19]],
  [[7, 17], [7, 16], [6, 16], [5, 17]],
  [[7, 17], [7, 18], [7, 19], [6, 20]],
  [[2, 21], [3, 21], [4, 21]],
  [[3, 20], [2, 20], [3, 19], [3, 18]],
].map(path => path.map(([r, c]) => [r - 1, c - 15]));
const arrowConstraints = arrows.map(path =>
  new NFA(arrowSpec, 'arrow sum', ...interleave('C', path)));

// Bottom-left grid (D): renban, provenance: the five purple line entries.
const renbanLines = [
  [[12, 3], [11, 3], [10, 2], [10, 3], [10, 4]],
  [[9, 3], [9, 4], [10, 5], [10, 6]],
  [[10, 7], [11, 6], [12, 5]],
  [[11, 7], [12, 7], [13, 7]],
  [[13, 3], [14, 3], [14, 4]],
].map(path => path.map(([r, c]) => [r - 8, c - 1]));
const renbanConstraints = renbanLines.map(path =>
  new NFA(renbanSpec(path.length), 'renban values', ...interleave('D', path)));

// Bottom-middle grid (E): German Whisper (>= 5, per the rules text), one
// constraint per drawn green line entry.
const whisperLines = [
  [[10, 9], [9, 10]],
  [[10, 10], [11, 10]],
  [[9, 11], [10, 11], [11, 12], [12, 11], [13, 11]],
  [[11, 12], [10, 13]],
  [[10, 11], [9, 12]],
  [[13, 10], [14, 9], [14, 10]],
  [[14, 12], [13, 13], [12, 14]],
].map(path => path.map(([r, c]) => [r - 8, c - 8]));
const whisperSpec = whisperChainSpec(5);
const whisperConstraints = whisperLines.map(path =>
  new NFA(whisperSpec, 'whisper values (diff >= 5)', ...interleave('E', path)));

// Bottom-right grid (F): killer cages, provenance: the six drawn cages.
const cages = [
  { cells: [[9, 17], [10, 17], [11, 17]], total: 7 },
  { cells: [[10, 18], [11, 18], [12, 18]], total: 11 },
  { cells: [[13, 16], [13, 17], [13, 18]], total: 15 },
  { cells: [[11, 19], [12, 19]], total: 6 },
  { cells: [[10, 19], [10, 20], [10, 21]], total: 10 },
  { cells: [[12, 20], [13, 20], [14, 20]], total: 10 },
].map(({ cells, total }) => ({ cells: cells.map(([r, c]) => [r - 8, c - 15]), total }));
const cageConstraints = cages.flatMap(({ cells, total }) => [
  new AllDifferent(...cells.map(([r, c]) => cellAt('F', r, c))),
  new NFA(effectiveCageSpec(total), `cage sum ${total}`, ...interleave('F', cells)),
]);

return [
  new Shape('6x6'),
  ...perGridScaffolding,
  ...noSharedDoublers,
  ...kropkiDots,
  ...xvMarks,
  ...arrowConstraints,
  ...renbanConstraints,
  ...whisperConstraints,
  ...cageConstraints,
];
