// Title: Acropora
// Author: Agent
// Video: https://www.youtube.com/watch?v=bGu6kC3-7zY
// Source: https://app.crackingthecryptic.com/sudoku/bDT6PRQrjR

// Rules encoded:
//   * Each row, each column and each region contains 1-9 once.
//   * Regions are nine orthogonally connected cells and are found by the solver.
//     Nine such regions with distinct values in each tile the 81 cells, so every
//     cell lies in exactly one region.
//   * A clued row or column splits into maximal runs of consecutive cells that
//     share a region. Its pills give those run sums in ascending order, largest
//     in the pill nearest the grid, one pill per run. The order is the sorted
//     order, not the order the runs appear along the line.
//   * "Either all clues or no clues are given" for a line: the eight rows and
//     columns with no pills drawn are left unconstrained.
//   * "The same region may appear in several pills of a line, with at least one
//     cell of another region between" restates what maximal runs already are,
//     and adds no constraint.
// Not encoded: 28 of the 39 drawn pills carry no printed number, so only their
// count is used -- that is all the drawn art gives.

const SIZE = 9;

// Pill clues, read off the 5-cell margin of the 14x14 canvas the source draws
// (its playable board is R6C6..R14C14, so canvas RxCy is board R(x-5)C(y-5)).
// Pills fill inward from the board edge, so `pills` is the drawn pill count for
// the line and `known` maps a 1-based ascending pill index to its number.
//   board row 1 <- canvas R6C4,C5           R6C5  = 32
//   board row 2 <- canvas R7C1..C5          R7C1  = 8
//   board row 3 <- canvas R8C3..C5          R8C3  = 7
//   board row 5 <- canvas R10C3..C5         R10C3 = 7
//   board row 7 <- canvas R12C1..C5         R12C2 = 9
//   board row 9 <- canvas R14C1..C5         R14C2 = 10, R14C5 = 10
//   board col 2 <- canvas R3..R5 C7         R4C7  = 13
//   board col 4 <- canvas R1..R5 C9         R5C9  = 9
//   board col 5 <- canvas R3..R5 C10        R3C10 = 15
//   board col 8 <- canvas R1..R5 C13        R4C13 = 9
const ROW_PILLS = [
  { line: 1, pills: 2, known: [[2, 32]] },
  { line: 2, pills: 5, known: [[1, 8]] },
  { line: 3, pills: 3, known: [[1, 7]] },
  { line: 5, pills: 3, known: [[1, 7]] },
  { line: 7, pills: 5, known: [[2, 9]] },
  { line: 9, pills: 5, known: [[2, 10], [5, 10]] },
];
const COL_PILLS = [
  { line: 2, pills: 3, known: [[2, 13]] },
  { line: 4, pills: 5, known: [[5, 9]] },
  { line: 5, pills: 3, known: [[1, 15]] },
  { line: 8, pills: 5, known: [[4, 9]] },
];

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

const rowCells = (r) => Array.from({ length: SIZE }, (_, i) => makeCellId(r, i + 1));
const colCells = (c) => Array.from({ length: SIZE }, (_, i) => makeCellId(i + 1, c));

// One border flag per adjacent pair on a clued line: 1 = the pair shares a
// region, 2 = a region border falls between them. Each flag is paired with the
// left (resp. upper) cell of its pair, so horizontal and vertical flags need
// separate layers; carrying the boundary here rather than in NFA state keeps
// the previous region label out of the run-sum scan below.
const hFlagCells = ROW_PILLS.flatMap(({ line }) => rowCells(line).slice(0, SIZE - 1));
const vFlagCells = COL_PILLS.flatMap(({ line }) => colCells(line).slice(0, SIZE - 1));
const hFlag = graph.makeOverlay('VH', hFlagCells);
const vFlag = graph.makeOverlay('VV', vFlagCells);

// [label(a), flag, label(b)]: accepts only when the flag is 2 exactly for a
// pair whose region labels differ, and 1 exactly for a pair that shares one.
const borderFlagNFA = NFA.encodeSpec({
  startState: { seen: null, flag: null },
  transition(state, value) {
    if (state.seen === null) return { seen: value, flag: null };
    if (state.flag === null) {
      if (value > 2) return undefined;
      return { seen: state.seen, flag: value };
    }
    if ((value !== state.seen) !== (state.flag === 2)) return undefined;
    return { done: true };
  },
  accept: (state) => state.done === true,
}, SIZE);

// Scans one line as [digit, flag, digit, flag, ..., digit]: the flags cut it
// into runs, so each run's total is accumulated without carrying a label.
// `lt` counts closed runs totalling less than `target`, `le` those totalling at
// most `target`; for sums sorted ascending, the value at 1-based rank `rank` is
// `target` exactly when lt <= rank - 1 and le >= rank.
const rankNFA = (target, rank) => NFA.encodeSpec({
  startState: { atDigit: true, sum: 0, lt: 0, le: 0 },
  transition(state, value) {
    if (state.atDigit) {
      // Saturating at target + 1 leaves both "< target" and "<= target" exact.
      return {
        atDigit: false, sum: Math.min(state.sum + value, target + 1),
        lt: state.lt, le: state.le,
      };
    }
    if (value === 1) return { ...state, atDigit: true };
    if (value !== 2) return undefined;
    const lt = state.lt + (state.sum < target ? 1 : 0);
    if (lt > rank - 1) return undefined;
    return {
      atDigit: true, sum: 0, lt,
      le: Math.min(state.le + (state.sum <= target ? 1 : 0), rank),
    };
  },
  accept(state) {
    if (state.atDigit) return false;
    const lt = state.lt + (state.sum < target ? 1 : 0);
    const le = state.le + (state.sum <= target ? 1 : 0);
    return lt <= rank - 1 && le >= rank;
  },
}, SIZE);

const interleave = (cells, flags) =>
  cells.flatMap((cell, i) => (i < flags.length ? [cell, flags[i]] : [cell]));

const lineParts = ({ line }, cellsOf, overlay) => {
  const cells = cellsOf(line);
  return { cells, flags: overlay.at(cells.slice(0, SIZE - 1)) };
};

const allLines = [
  ...ROW_PILLS.map((clue) => ({ clue, ...lineParts(clue, rowCells, hFlag) })),
  ...COL_PILLS.map((clue) => ({ clue, ...lineParts(clue, colCells, vFlag) })),
];

const flagDomains = allLines.flatMap(({ flags }) => flags.map((f) => new Given(f, 1, 2)));

const flagMeanings = allLines.flatMap(({ cells, flags }) =>
  flags.map((flag, i) => new NFA(
    borderFlagNFA, 'RegionBorder', cc.at(cells[i]), flag, cc.at(cells[i + 1]))));

// pills - 1 of the eight flags are borders (value 2), the rest are 1.
const runCounts = allLines.map(({ clue, flags }) =>
  new Sum(2 * (clue.pills - 1) + (SIZE - clue.pills), ...flags));

const runSums = allLines.flatMap(({ clue, cells, flags }) =>
  clue.known.map(([rank, target]) => new NFA(
    rankNFA(target, rank), `Pill${target}@${rank}`, ...interleave(cells, flags))));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  hFlag.toVar('hBorder'),
  vFlag.toVar('vBorder'),
  ...flagDomains,
  ...flagMeanings,
  ...runCounts,
  ...runSums,
];
