// Title: Invisible Killers
// Author: yttrio
// Video: https://www.youtube.com/watch?v=44bYOpPHJlQ
// Source: https://sudokupad.app/k01vyssa50

// Rules encoded here:
//   * Normal sudoku. The grid has no given digits.
//   * Eleven killer cages are present but not drawn. Digits in a cage do not
//     repeat and sum to the clue printed in that cage's top-left-most cell
//     (top-most row first, then left-most column in that row). Cages do not
//     overlap. Only the clue cell of each cage is known; the rest of each
//     cage's cells are for the solver to find.
//   * Every cage visits at least two 3x3 boxes and holds the same number of
//     cells in each box it visits.
//   * "Killer cage" and "the cells each cage visits" are read as the usual
//     killer-cage shape: each cage is one orthogonally connected group.
// Nothing is omitted.
//
// Model. A full-grid Var overlay VL labels every cell with the cage that owns
// it: label 1 means "in no cage", label 1+i means "in cage i". One label per
// cell is what makes the cages non-overlapping. The alphabet is widened to 12
// so the eleven cage labels plus the no-cage label fit; the playable grid cells
// are restricted back to 1-9.
//   VT   digit-used flags, one per (cage, digit): 2 = the cage uses that digit.
//   VN   box counts, one per (cage, box): 1+n = the cage has n cells in the box.
//   VM   cells-per-visited-box, one per cage.
// The cage sum and the no-repeat rule are both carried by VT: the flags name
// the cage's digit set, so distinctness is structural and the total is a plain
// weighted sum of the flags. State machines tie each flag and each box count
// back to the labels and digits actually placed. The Var domains (VT in 1-2,
// VN in 1-5, VM in 1-4) are left to those machines rather than declared.

const NO_CAGE = 1;              // VL label for a cell in no cage
const MAX_M = 4;                // b*m <= 9 distinct digits with b >= 2 boxes
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const BOXES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Cage clue cells and totals, transcribed from the eleven drawn clue numbers,
// in reading order.
const CAGES = [
  ['R1C4', 34], ['R1C9', 45], ['R2C2', 45], ['R2C5', 30], ['R3C6', 17],
  ['R4C2', 28], ['R4C3', 12], ['R5C7', 32], ['R6C8', 27], ['R8C4', 26],
  ['R9C1', 25],
];

const shape = new Shape('9x9', 12);
const graph = cellGraph(shape);
const labels = graph.makeOverlay('VL');
const gridCells = graph.cells();
const readingIndex = (cell) => {
  const { row, col } = parseCellId(cell);
  return (row - 1) * 9 + (col - 1);
};
const cageLabel = (i) => 2 + i;

// One row per cage in both tables: VT is (cage, digit), VN is (cage, box).
const digitUsed = new Var('T', 'digit used by cage', '11x9');
const boxCount = new Var('N', 'cage cells per box', '11x9');
const perBox = new Var('M', 'cage cells per visited box', CAGES.length);
const usedCell = (i, d) => digitUsed.cell(i + 1, d);
const countCell = (i, b) => boxCount.cell(i + 1, b);

// Cells a cage can reach: its clue cell is its top-most-then-left-most cell,
// so no cage cell precedes the clue cell in reading order.
const cageCells = CAGES.map(([clue]) =>
  gridCells.filter((c) => readingIndex(c) >= readingIndex(clue)));

// Every cell of the label overlay may hold the no-cage label plus the label of
// each cage that can reach it; the clue cell itself is pinned to its own cage.
const labelDomains = gridCells.map((cell) => {
  const clueOwner = CAGES.findIndex(([clue]) => clue === cell);
  if (clueOwner >= 0) return new Given(labels.at(cell), cageLabel(clueOwner));
  const allowed = [NO_CAGE];
  CAGES.forEach(([clue], i) => {
    if (readingIndex(cell) >= readingIndex(clue)) allowed.push(cageLabel(i));
  });
  return new Given(labels.at(cell), ...allowed);
});

// The widened alphabet exists only for the labels: real digits stay 1-9.
const digitRange = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Flag machine: reading (label, digit) for each reachable cell and then the
// flag itself, count how many of the cage's cells hold digit `d`. State `t` is
// the position in the label/digit/flag cycle, `m` remembers whether the label
// just read was this cage's, and `n` is the count so far. A second cell of the
// same cage holding `d` is a dead branch, which is where the no-repeat rule
// lives; the flag must then equal 1 + n.
const flagSpec = (label, digit, numCells) => NFA.encodeSpec({
  startState: { t: 0, m: 0, n: 0 },
  transition: (s, v) => {
    if (v === SEGMENT_BREAK) return { t: 2, m: 0, n: s.n };
    if (s.t === 0) return { t: 1, m: v === label ? 1 : 0, n: s.n };
    if (s.t === 1) {
      const n = s.n + (s.m === 1 && v === digit ? 1 : 0);
      return n > 1 ? undefined : { t: 0, m: 0, n };
    }
    if (s.t === 2) return v === s.n + 1 ? { t: 3, m: 0, n: s.n } : undefined;
    return undefined;
  },
  accept: (s) => s.t === 3,
  maxDepth: 2 * numCells + 2,
}, shape, { multiSegment: true });

const flagMachines = CAGES.flatMap((_, i) => {
  const stream = cageCells[i].flatMap((c) => [labels.at(c), c]);
  return DIGITS.map((d) => new NFA(
    flagSpec(cageLabel(i), d, cageCells[i].length), `cage${i + 1}d${d}`,
    stream, [usedCell(i, d)]));
});

// Sum of the digits the cage uses is its clue: each flag contributes
// d * (flag - 1), and nine unused flags already contribute a fixed 45.
const cageTotals = CAGES.map(([, total], i) => new Sum(
  total + 45, ...DIGITS.map((d) => [usedCell(i, d), d])));

// Box-count machine: over the nine label cells of one box, then the count cell.
const countSpec = (label) => NFA.encodeSpec({
  startState: { t: 0, n: 0 },
  transition: (s, v) => {
    if (v === SEGMENT_BREAK) return { t: 1, n: s.n };
    if (s.t === 0) {
      const n = s.n + (v === label ? 1 : 0);
      return n > MAX_M ? undefined : { t: 0, n };
    }
    if (s.t === 1) return v === s.n + 1 ? { t: 2, n: s.n } : undefined;
    return undefined;
  },
  accept: (s) => s.t === 2,
  maxDepth: 11,
}, shape, { multiSegment: true });

const countMachines = CAGES.flatMap((_, i) => {
  const spec = countSpec(cageLabel(i));
  return BOXES.map((b) => new NFA(
    spec, `cage${i + 1}box${b}`, labels.at(graph.box(b)), [countCell(i, b)]));
});

// Equal cells in every box visited: each box count is either 0 or the cage's
// own per-visited-box figure.
const equalBoxKey = Pair.fnToKey((m, n) => n === 1 || n === m + 1, shape);
const equalBoxes = CAGES.flatMap((_, i) => BOXES.map(
  (b) => new Pair(equalBoxKey, 'boxShare', perBox.cell(i + 1), countCell(i, b))));

// At least two boxes visited: at least two of the nine counts are non-zero.
const twoBoxSpec = NFA.encodeSpec({
  startState: 0,
  transition: (s, v) => Math.min(s + (v === 1 ? 0 : 1), 2),
  accept: (s) => s === 2,
  maxDepth: 9,
}, shape);
const twoBoxes = CAGES.map((_, i) => new NFA(
  twoBoxSpec, `cage${i + 1}spread`, ...BOXES.map((b) => countCell(i, b))));

// Redundant link between the two layers: the box counts and the digit flags
// both count the cage's cells, each over an offset of nine, so they agree.
const sizeAgreement = CAGES.map((_, i) => new EqualSum(
  BOXES.map((b) => countCell(i, b)), DIGITS.map((d) => usedCell(i, d))));

// Each cage is one orthogonally connected group of cells.
const connected = CAGES.map((_, i) => new ConnectedValues('VL', cageLabel(i)));

return [
  shape,
  labels.toVar('cage labels'),
  digitUsed,
  boxCount,
  perBox,
  digitRange,
  ...labelDomains,
  ...flagMachines,
  ...cageTotals,
  ...countMachines,
  ...equalBoxes,
  ...twoBoxes,
  ...sizeAgreement,
  ...connected,
];
