// Title: Under the Radar
// Author: guru
// Video: https://www.youtube.com/watch?v=BOBL1dG5Ksw
// Source: https://sudokupad.app/vr35ejkt5p

// Rules encoded below:
//   Normal sudoku (rows, columns, boxes hold 1-9).
//   Radar cells: nine hidden cells, one in each row, column and 3x3 box. A radar
//     cell at RrCc looks at the grid-edge cell in each orthogonal direction --
//     R1Cc, R9Cc, RrC1, RrC9 -- omitting any of those that is the radar cell
//     itself ("a radar cell never scans itself"), and scans some subset of them.
//     Its DIGIT is how many of those cells it scans; its VALUE is the total of
//     the digits in the scanned cells. Every other cell's VALUE is its digit.
//   German whispers (green lines): adjacent VALUES differ by at least 5.
//   Decrypted German whispers (brown line): adjacent DIGITS differ by at least 5.
//   Renban (pink lines): the VALUES are a set of non-repeating consecutive numbers.
//   Killer cages: DIGITS in a cage do not repeat; the VALUES sum to the clue.
//   Kropki: a black dot means the two VALUES are in a 2:1 ratio, a white dot that
//     they are consecutive. "Not all dots are necessarily given", so unmarked
//     edges carry no negative constraint.
//   The fog covering the grid is a presentation rule and restricts no digit.

// Drawn clue data, transcribed from the puzzle's cages, lines and edge dots.
const CAGES = [
  { sum: 10, cells: ['R8C1', 'R9C1', 'R9C2', 'R9C3'] },
  { sum: 6, cells: ['R1C2', 'R2C1', 'R2C2'] },
  { sum: 48, cells: ['R4C5', 'R5C5', 'R5C6'] },
  { sum: 29, cells: ['R8C5', 'R9C5'] },
  { sum: 16, cells: ['R7C3', 'R7C4'] },
  { sum: 26, cells: ['R2C4', 'R3C4'] },
];
// Green (#67f067) whisper lines; the payload draws the R2C7-R2C8 stroke twice.
const GREEN_LINES = [['R2C7', 'R2C8'], ['R7C9', 'R8C9', 'R9C9']];
// Pink (#f067f0) renban lines.
const PINK_LINES = [['R4C1', 'R5C1', 'R6C1'], ['R5C7', 'R5C8', 'R6C8']];
// Brown (#a37644) decrypted-whisper line.
const BROWN_LINE = ['R4C4', 'R4C5', 'R4C6'];
// Black and white edge dots.
const BLACK_DOTS = [
  ['R9C1', 'R9C2'], ['R6C2', 'R6C3'], ['R3C2', 'R3C3'], ['R7C8', 'R7C9'],
];
const WHITE_DOTS = [['R7C7', 'R7C8'], ['R8C7', 'R9C7']];
const GIVENS = [['R8C2', 5], ['R9C3', 4]];

// Value 0 is reserved for the auxiliary layers (an unset radar flag, the tens
// digit of a value below 10); the grid cells are restricted back to 1-9 below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// The edge cells a radar at `cell` may scan: the grid-edge cell in each
// orthogonal direction, dropping the direction whose edge cell is `cell` itself.
const scanTargets = (cell) => {
  const { row, col } = parseCellId(cell);
  return [
    row !== 1 ? makeCellId(1, col) : null,
    row !== 9 ? makeCellId(9, col) : null,
    col !== 1 ? makeCellId(row, 1) : null,
    col !== 9 ? makeCellId(row, 9) : null,
  ].filter(target => target !== null);
};

// Cells whose VALUE (rather than digit) is read by some clue; every other cell
// contributes only its digit, so it needs no value layer.
const clueValueCells = new Set([
  ...CAGES.flatMap(cage => cage.cells),
  ...GREEN_LINES.flat(), ...PINK_LINES.flat(),
  ...BLACK_DOTS.flat(), ...WHITE_DOTS.flat(),
]);
const valueCells = graph.cells().filter(cell => clueValueCells.has(cell));

const radar = graph.makeOverlay('VR');              // 0 = ordinary, 1 = radar
// A cell's value can reach 34 (four scanned edge digits, two per line, so at
// most 9+8+9+8), which is past the grid's value range, so it is held as
// 10*tens + units across two layers over the value-carrying cells only.
const tens = graph.makeOverlay('VT', valueCells);
const units = graph.makeOverlay('VU', valueCells);

// The value of `cell` as [cell, coefficient] terms for a Sum, scaled by `k`.
const valueTerms = (cell, k = 1) => [[tens.at(cell), 10 * k], [units.at(cell), k]];

// One machine per value-carrying cell, over
//   [radar flag, own digit, value tens, value units, ...scan targets].
// It reads the flag and the claimed value, then walks the target cells,
// branching at each into "scanned" and "not scanned"; a run is accepted when
// exactly `digit` targets were taken and their digits account for the whole
// value. An ordinary cell instead just requires value === digit, and leaves its
// targets free. `need`/`rem` are the targets and value total still outstanding;
// branches that can no longer be completed by 1-9 digits are dropped so the
// state count stays bounded.
const scanSpec = (numTargets) => NFA.encodeSpec({
  startState: { p: 'flag' },
  transition: (state, value) => {
    switch (state.p) {
      case 'flag':
        if (value > 1) return undefined;
        return { p: 'digit', radar: value };
      case 'digit':
        if (value === 0) return undefined;
        return { p: 'tens', radar: state.radar, d: value };
      case 'tens':
        return { p: 'units', radar: state.radar, d: state.d, t: value };
      case 'units': {
        const total = state.t * 10 + value;
        // An ordinary cell's value is its digit.
        if (!state.radar) return total === state.d ? { p: 'free' } : undefined;
        // A radar cell scans `d` of its targets, so d targets must exist and
        // their digits (each 1-9) must be able to total exactly `total`.
        if (state.d > numTargets) return undefined;
        if (total < state.d || total > 9 * state.d) return undefined;
        return { p: 'scan', need: state.d, rem: total };
      }
      case 'free':
        return { p: 'free' };
      case 'scan': {
        const taken = { p: 'scan', need: state.need - 1, rem: state.rem - value };
        const canTake = state.need > 0
          && taken.rem >= taken.need && taken.rem <= 9 * taken.need;
        return canTake ? [state, taken] : [state];
      }
    }
  },
  accept: (state) => (
    state.p === 'free'
    || (state.p === 'scan' && state.need === 0 && state.rem === 0)),
}, shape);
const scanSpecs = new Map([2, 3, 4].map(n => [n, scanSpec(n)]));

// For a cell whose value is never read, all that survives of the radar rule is
// the bound on its digit: it cannot scan more cells than it has targets.
const degreeKeys = new Map([2, 3, 4].map(n => [n, Pair.fnToKey(
  (flag, digit) => flag !== 1 || digit <= n, shape)]));

// value(a) - value(b) = 1, written over the two value layers.
const oneMore = (a, b) => new Sum(1, ...valueTerms(a), ...valueTerms(b, -1));

// Whisper slack: |value difference| = 5 + slack, and slack <= 33 - 5 = 28
// because a value lies in 1..34, so its tens digit is at most 2.
const slackTens = new Var('S', 'whisper slack tens', 3);
const slackUnits = new Var('W', 'whisper slack units', 3);
const greenEdges = GREEN_LINES.flatMap(
  line => line.slice(1).map((cell, i) => [line[i], cell]));

return [
  shape,
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...GIVENS.map(([cell, digit]) => new Given(cell, digit)),

  // --- radar placement ---
  radar.toVar('radar cells'),
  radar.makeReplicate(new Given(radar.at('R1C1'), 0, 1)),
  ...graph.rowsColumnsBoxes().map(
    cells => new ContainExact('1', ...radar.at(cells))),

  // --- radar digits and values ---
  tens.toVar('value tens'),
  units.toVar('value units'),
  ...valueCells.map((cell) => {
    const targets = scanTargets(cell);
    return new NFA(
      scanSpecs.get(targets.length), 'radar scan',
      radar.at(cell), cell, tens.at(cell), units.at(cell), ...targets);
  }),
  ...graph.cells().filter(cell => !clueValueCells.has(cell)).map(
    cell => new Pair(
      degreeKeys.get(scanTargets(cell).length), 'radar degree',
      radar.at(cell), cell)),

  // --- killer cages: distinct digits, and the values sum to the clue.
  // The printed total is a total of VALUES, so it cannot be a Cage total over
  // the cage's own cells; the digits-do-not-repeat half is the AllDifferent and
  // the total is the Sum over the value layers below. ---
  ...CAGES.map(cage => new AllDifferent(...cage.cells)),
  ...CAGES.map(cage => new Sum(
    cage.sum, ...cage.cells.flatMap(cell => valueTerms(cell)))),

  // --- green german whispers on values ---
  ...greenEdges.map(([a, b], i) => new Or([
    new Sum(5, ...valueTerms(a), ...valueTerms(b, -1),
      [slackTens.cell(i + 1), -10], [slackUnits.cell(i + 1), -1]),
    new Sum(5, ...valueTerms(b), ...valueTerms(a, -1),
      [slackTens.cell(i + 1), -10], [slackUnits.cell(i + 1), -1])])),
  slackTens,
  slackUnits,
  ...slackTens.cells().map(cell => new Given(cell, 0, 1, 2)),

  // --- brown decrypted german whisper on digits ---
  new Whisper(5, ...BROWN_LINE),

  // --- pink renban on values: the three values are k, k+1, k+2 in some order,
  // so disjoin over which cell holds which of the three ---
  ...PINK_LINES.map(line => new Or(
    [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(
      ([lo, mid, hi]) => new And([
        oneMore(line[mid], line[lo]),
        oneMore(line[hi], line[mid])])))),

  // --- kropki on values ---
  ...BLACK_DOTS.map(([a, b]) => new Or([
    new Sum(0, ...valueTerms(a), ...valueTerms(b, -2)),
    new Sum(0, ...valueTerms(b), ...valueTerms(a, -2))])),
  ...WHITE_DOTS.map(([a, b]) => new Or([oneMore(a, b), oneMore(b, a)])),
];
