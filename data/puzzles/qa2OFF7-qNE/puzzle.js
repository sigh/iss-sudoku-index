// Title: No petting!
// Author: theasylm
// Video: https://www.youtube.com/watch?v=qa2OFF7-qNE
// Source: https://sudokupad.app/unwvl51pjs

// Rules encoded:
// - Normal sudoku (default row/column/box all-different, no givens).
// - Every cell carries a hidden shading state: unshaded, or shaded exactly one
//   of green/brown/black. Shading is solver-discovered state, not drawn;
//   nothing requires it to be contiguous ("shading does not need to be
//   contiguous").
// - Colored outside sum clues (rows/columns) are always true ("none of which
//   lie"): each equals the sum of the digits in that row/column whose cells
//   are shaded the clue's color.
// - A lower-right corner digit clue is true (cell's digit equals the clue)
//   exactly when that single cell is shaded any color, and false (digit
//   differs) exactly when it is unshaded.
// - Each little killer diagonal sum and each Kropki (1:2 ratio) dot carries a
//   hidden truth flag: truthful means the stated fact holds AND every cell the
//   clue touches is shaded; lying means the stated fact is false AND at least
//   one touched cell is unshaded ("truthful clues are fully-shaded; lying
//   clues must not be fully-shaded"). The little killers (14) split 7
//   truthful/7 lying and the Kropki dots (2) split 1/1 ("equal number of
//   truth-tellers and liars").

const graph = cellGraph('9x9');

// Shading layer, one Var per grid cell: 1 = unshaded, 2 = green, 3 = brown,
// 4 = black. A hidden state the solver must discover; no rule pins it.
const UNSHADED = 1, GREEN = 2, BROWN = 3, BLACK = 4;
const shade = graph.makeOverlay('VS');
const shadeCells = shade.at(graph.cells());
const shaded = cell => shade.at(cell);

// Corner digit clues: cell -> the lower-right-corner digit.
const cornerClues = {
  R1C3: 6, R1C5: 4, R1C6: 3,
  R2C1: 8, R2C7: 4, R2C9: 5,
  R3C2: 2, R3C4: 6, R3C9: 2,
  R4C5: 9, R4C7: 8, R4C9: 4,
  R5C4: 4, R5C6: 6, R5C8: 5, R5C9: 6,
  R6C6: 1, R6C7: 3,
  R7C3: 5, R7C5: 8, R7C6: 7, R7C9: 3,
  R8C8: 1,
  R9C8: 4,
};

// Kropki (1:2 ratio) dot pairs, drawn as small black-filled squares straddling
// an edge.
const kropkiDots = [
  ['R6C3', 'R6C4'],
  ['R2C4', 'R2C5'],
];

// Little killer diagonals: ordered cell list (from the off-grid arrow, into
// the grid) plus the stated total.
const littleKillers = [
  { total: 39, cells: ['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'] },
  { total: 49, cells: ['R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'] },
  { total: 17, cells: ['R6C1', 'R7C2', 'R8C3', 'R9C4'] },
  { total: 8, cells: ['R2C9', 'R1C8'] },
  { total: 24, cells: ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'] },
  { total: 11, cells: ['R9C7', 'R8C8', 'R7C9'] },
  { total: 12, cells: ['R4C9', 'R3C8', 'R2C7', 'R1C6'] },
  { total: 37, cells: ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'] },
  { total: 24, cells: ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'] },
  { total: 22, cells: ['R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4'] },
  { total: 16, cells: ['R7C1', 'R8C2', 'R9C3'] },
  { total: 5, cells: ['R8C1', 'R9C2'] },
  { total: 15, cells: ['R1C7', 'R2C8', 'R3C9'] },
  { total: 23, cells: ['R5C9', 'R4C8', 'R3C7', 'R2C6', 'R1C5'] },
];

// Colored outside row/column sum clues (always true): colored squares outside
// the grid, each labelled '<total><color-letter>'.
const colorRowTotals = {
  [BROWN]: { 1: 3, 2: 9, 3: 17, 4: 21, 5: 21, 6: 38, 7: 44, 8: 4, 9: 5 },
  [BLACK]: { 7: 1, 9: 9 },
  [GREEN]: { 6: 5, 8: 15, 9: 11 },
};
const colorColTotals = {
  [BROWN]: { 2: 4, 3: 12, 4: 18, 5: 30, 6: 23, 7: 18, 8: 36, 9: 21 },
  [BLACK]: { 1: 1, 4: 2, 7: 7 },
  [GREEN]: { 1: 15, 2: 10, 3: 6 },
};

// -- Corner digit clues: shaded(cell) === (digit === clue) --------------

function cornerCluePair(cell, digit) {
  const key = Pair.fnToKey((d, c) => (c !== UNSHADED) === (d === digit), 9);
  return new Pair(key, `corner clue ${digit}`, cell, shaded(cell));
}

// -- Colored row/column sums: sum of digits masked by shade === color ---

// Scans a row/column (9 cells => 18 symbols) as interleaved (digit, shadeVar)
// pairs and accumulates the digit only where the shade var equals
// `colorValue`. Sum is monotonic non-decreasing, so once it passes `total` it
// can never come back -- clamp it to a single "overshot" sink (`total + 1`) to
// keep the state count small; `maxDepth` is a hard backstop.
function colorSumSpec(colorValue, total) {
  return NFA.encodeSpec({
    startState: { sum: 0 },
    transition: (state, value) =>
      (state.digit === undefined)
        ? { sum: state.sum, digit: value }
        : { sum: Math.min(state.sum + state.digit * (value === colorValue), total + 1) },
    accept: (state) => state.digit === undefined && state.sum === total,
    maxDepth: 18,
  }, 9);
}

function colorSumNFAs(colorValue, totals, houseCells, label) {
  return Object.entries(totals).map(([n, total]) => new NFA(
    colorSumSpec(colorValue, total),
    `${label}${n}`,
    ...houseCells(+n).flatMap(cell => [cell, shaded(cell)]),
  ));
}

// -- Little killers: hidden truth flag gates the sum + full-shading check --

// cells read as [flag, digit1, shade1, digit2, shade2, ...]. Truthful (flag 1)
// requires the real sum and every cell shaded; lying (flag 2) requires a
// different sum and at least one cell unshaded. Sum is monotonic
// non-decreasing, so once it passes `total` it can never return -- clamp it to
// a single "overshot" sink to keep the state count small.
function littleKillerSpec(total, cellCount) {
  return NFA.encodeSpec({
    startState: null,
    transition: (state, value) => {
      // The flag cell is Given-restricted to {1, 2}, but the automaton must
      // reject other values itself to avoid branching its state on all 9
      // grid values (a 4.5x blowup for no semantic reason).
      if (state === null) return (value === 1 || value === 2)
        ? { flag: value, sum: 0, allShaded: true } : [];
      if (state.digit === undefined) return { ...state, digit: value };
      return {
        flag: state.flag,
        sum: Math.min(state.sum + state.digit, total + 1),
        allShaded: state.allShaded && value !== UNSHADED,
      };
    },
    accept: (state) =>
      state !== null && state.digit === undefined &&
      (state.flag === 1
        ? (state.sum === total && state.allShaded)
        : (state.sum !== total && !state.allShaded)),
    maxDepth: 1 + 2 * cellCount,
  }, 9);
}

const lkFlags = new Var('L', 'little killer truth flags', littleKillers.length);

function littleKillerNFA(lk, i) {
  return new NFA(
    littleKillerSpec(lk.total, lk.cells.length),
    `LK${i + 1}`,
    lkFlags.cell(i + 1),
    ...lk.cells.flatMap(cell => [cell, shaded(cell)]),
  );
}

// -- Kropki dots: hidden truth flag gates the 1:2 ratio + full-shading check --

// cells read as [flag, digitA, shadeA, digitB, shadeB]. Truthful requires the
// 1:2 ratio and both cells shaded; lying requires no 1:2 ratio and at least
// one cell unshaded.
const kropkiSpec = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    // See the little-killer spec above for why invalid flag values reject
    // immediately instead of branching the state.
    if (state === null) return (value === 1 || value === 2)
      ? { flag: value, step: 0 } : [];
    if (state.step === 0) return { ...state, step: 1, dA: value };
    if (state.step === 1) return { ...state, step: 2, shadedA: value !== UNSHADED };
    if (state.step === 2) return { ...state, step: 3, dB: value };
    const shadedB = value !== UNSHADED;
    const ratio = state.dA === 2 * state.dB || state.dB === 2 * state.dA;
    const bothShaded = state.shadedA && shadedB;
    return {
      step: 4,
      ok: state.flag === 1 ? (ratio && bothShaded) : (!ratio && !bothShaded),
    };
  },
  accept: (state) => state !== null && state.step === 4 && state.ok,
  maxDepth: 5,
}, 9);

const kropkiFlags = new Var('K', 'kropki truth flags', kropkiDots.length);

function kropkiNFA([a, b], i) {
  return new NFA(
    kropkiSpec,
    `KD${i + 1}`,
    kropkiFlags.cell(i + 1),
    a, shaded(a), b, shaded(b),
  );
}

return [
  new Shape('9x9'),

  // Shading layer: every cell is unshaded/green/brown/black.
  shade.toVar('cell shading'),
  shade.makeReplicate(new Given(shadeCells[0], UNSHADED, GREEN, BROWN, BLACK)),

  ...Object.entries(cornerClues).map(([cell, digit]) => cornerCluePair(cell, digit)),

  ...colorSumNFAs(BROWN, colorRowTotals[BROWN], n => graph.row(n), 'RowB'),
  ...colorSumNFAs(BLACK, colorRowTotals[BLACK], n => graph.row(n), 'RowK'),
  ...colorSumNFAs(GREEN, colorRowTotals[GREEN], n => graph.row(n), 'RowG'),
  ...colorSumNFAs(BROWN, colorColTotals[BROWN], n => graph.column(n), 'ColB'),
  ...colorSumNFAs(BLACK, colorColTotals[BLACK], n => graph.column(n), 'ColK'),
  ...colorSumNFAs(GREEN, colorColTotals[GREEN], n => graph.column(n), 'ColG'),

  lkFlags,
  ...lkFlags.cells().map(cell => new Given(cell, 1, 2)),
  ...littleKillers.map(littleKillerNFA),
  new ContainExact(
    Array(7).fill(1).concat(Array(7).fill(2)).join('_'),
    ...lkFlags.cells(),
  ),

  kropkiFlags,
  ...kropkiFlags.cells().map(cell => new Given(cell, 1, 2)),
  ...kropkiDots.map(kropkiNFA),
  new ContainExact('1_2', ...kropkiFlags.cells()),
];
