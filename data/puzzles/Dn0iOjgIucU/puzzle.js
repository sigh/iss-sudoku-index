// Title: Fillomino-ish Killer Sudoku
// Author: SirWoezel
// Video: https://www.youtube.com/watch?v=Dn0iOjgIucU
// Source: https://app.crackingthecryptic.com/webapp/bPgHhFJdm4

// Rules encoded here:
//   * Normal sudoku, plus the one given digit R5C2 = 1.
//   * The whole grid is divided into killer cages of at least 2 cells. Digits
//     do not repeat within a cage; a cage whose total is printed adds to it,
//     and a "??" total is unknown and constrains nothing.
//   * The total of a cage is printed in the leftmost cell of the highest row
//     the cage reaches, so no cell of a cage lies above its printed total, nor
//     to the left of it within that row.
//   * Every cage contains exactly one circle, and the digit in that circle is
//     the number of cells in the cage.
//   * Two different cages of the same size share no row and no column.
// Nothing is omitted.
//
// A cage is an orthogonally connected set of cells: that is what "normal Killer
// Sudoku rules apply" makes a cage, and the puzzle is set as a Fillomino
// variant, whose regions are polyominoes.
// There are exactly fifteen cages, because every cage carries exactly one
// printed total and exactly one circle, and fifteen of each are drawn.
//
// Model: two whole-grid Var overlays. VG holds the label 1..15 of the cage that
// owns a cell -- the value range is widened to 15 to make room for the labels
// -- and VS holds that cage's size. Each label belongs to its own printed
// total, so the labels are not interchangeable and there is no permutation
// symmetry to break.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// A cage holds at least 2 cells, and at most 9 because its digits are distinct.
const SIZES = [2, 3, 4, 5, 6, 7, 8, 9];

// Transcribed from the drawn clues: one printed cage total per cell, `null`
// where the printed total is "??".
const CAGES = [
  { cell: 'R1C1', total: null },
  { cell: 'R2C2', total: null },
  { cell: 'R5C1', total: null },
  { cell: 'R2C1', total: 41 },
  { cell: 'R1C4', total: null },
  { cell: 'R1C5', total: null },
  { cell: 'R2C6', total: 11 },
  { cell: 'R6C2', total: 21 },
  { cell: 'R7C4', total: null },
  { cell: 'R7C6', total: 19 },
  { cell: 'R7C8', total: null },
  { cell: 'R5C9', total: 44 },
  { cell: 'R2C9', total: null },
  { cell: 'R5C5', total: 36 },
  { cell: 'R5C6', total: null },
];

// Transcribed from the drawn circles, one per cell centre.
const CIRCLES = [
  'R2C2', 'R2C6', 'R3C3', 'R3C4', 'R3C7', 'R4C2', 'R4C8', 'R5C5',
  'R6C2', 'R6C8', 'R7C3', 'R7C6', 'R7C7', 'R8C4', 'R8C8',
];

const shape = new Shape(GRID, CAGES.length);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const cage = graph.makeOverlay('VG');
const size = graph.makeOverlay('VS');

// n distinct digits from 1-9 add to between 1+..+n and 9+..+(10-n), so a
// printed total already limits how many cells its cage can have.
const possibleSizes = (total) => total === null ? SIZES : SIZES.filter(
  n => total >= (n * (n + 1)) / 2 && total <= (n * (19 - n)) / 2);

// Where a cage can reach: never above its printed total's row, never left of
// the total within that row, and never more than (largest possible size - 1)
// steps away, since a connected cage joining two cells d orthogonal steps apart
// needs at least d+1 cells.
const zoneOf = (c) => {
  const clue = parseCellId(c.cell);
  const limit = Math.max(...possibleSizes(c.total)) - 1;
  return gridCells.filter(cell => {
    const { row, col } = parseCellId(cell);
    if (row < clue.row || (row === clue.row && col < clue.col)) return false;
    return Math.abs(row - clue.row) + Math.abs(col - clue.col) <= limit;
  });
};
const zones = CAGES.map(zoneOf);

const labelsOf = (cell) => {
  const clueIndex = CAGES.findIndex(c => c.cell === cell);
  // A printed total sits in its own cage.
  if (clueIndex >= 0) return [clueIndex + 1];
  return zones.flatMap((zone, i) => zone.includes(cell) ? [i + 1] : []);
};

// Grid cells hold digits; the widened value range exists only for the labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Every cell carries exactly one cage label, which is what makes the cages a
// partition of the grid with nothing overlapping and nothing left over.
const labelDomain = gridCells.map(
  cell => new Given(cage.at(cell), ...labelsOf(cell)));

// A cell's size cell can only hold a size one of its candidate cages can have.
const sizesOf = (cell) => SIZES.filter(n => labelsOf(cell).some(
  label => possibleSizes(CAGES[label - 1].total).includes(n)));
const sizeDomain = [
  size.makeReplicate(new Given(size.at(gridCells[0]), ...SIZES)),
  ...gridCells.filter(cell => sizesOf(cell).length < SIZES.length).map(
    cell => new Given(size.at(cell), ...sizesOf(cell))),
];

const connectivity = CAGES.map((c, i) => new ConnectedValues('VG', i + 1));

// The fifteen cages tile all 81 cells.
const totalArea = new Sum(81, ...CAGES.map(c => size.at(c.cell)));

// Digits do not repeat inside a cage, and a printed total is the sum of its
// cage's digits. One machine per cage scans its zone as (label, digit) pairs;
// `reading` is true while the next cell read is the digit belonging to the
// label just seen. The seen digits are split across three machines of three
// digits each, because one machine carrying all nine at once compiles to
// sixty-four times as many states for the same rule.
const DIGIT_BLOCKS = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
const zoneReads = (i) => zones[i].flatMap(cell => [cage.at(cell), cell]);

const cageDistinct = CAGES.flatMap((c, i) => DIGIT_BLOCKS.map((block, b) => {
  const label = i + 1;
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inCage: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inCage: value === label };
      }
      if (!state.inCage) {
        return { mask: state.mask, reading: false, inCage: false };
      }
      // Grid cells never exceed 9; the wider alphabet is only for labels.
      if (value > DIGITS.length) return undefined;
      const bit = block.indexOf(value);
      if (bit < 0) return { mask: state.mask, reading: false, inCage: false };
      if (state.mask & (1 << bit)) return undefined;
      return { mask: state.mask | (1 << bit), reading: false, inCage: false };
    },
    accept: (state) => !state.reading,
  }, geometry);
  return new NFA(machine, `cage-${label}-digits-${b + 1}`, ...zoneReads(i));
}));

const cageTotals = CAGES.flatMap((c, i) => {
  if (c.total === null) return [];
  const label = i + 1;
  const machine = NFA.encodeSpec({
    startState: { sum: 0, reading: false, inCage: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { sum: state.sum, reading: true, inCage: value === label };
      }
      if (!state.inCage) {
        return { sum: state.sum, reading: false, inCage: false };
      }
      if (value > DIGITS.length) return undefined;
      const sum = state.sum + value;
      // A running total only grows, so an overshoot is already dead.
      if (sum > c.total) return undefined;
      return { sum, reading: false, inCage: false };
    },
    accept: (state) => !state.reading && state.sum === c.total,
  }, geometry);
  return [new NFA(machine, `cage-${label}-total`, ...zoneReads(i))];
});

// The cage's own size cell is read first and counted down once per cell the
// cage owns, so the count of label cells is exactly the size the overlay holds.
const cageSizes = CAGES.map((c, i) => {
  const label = i + 1;
  const machine = NFA.encodeSpec({
    startState: { remaining: null },
    transition: (state, value) => {
      if (state.remaining === null) return { remaining: value };
      if (value !== label) return state;
      if (state.remaining === 0) return undefined;
      return { remaining: state.remaining - 1 };
    },
    accept: (state) => state.remaining === 0,
  }, geometry);
  return new NFA(machine, `cage-${label}-size`,
    size.at(c.cell), ...cage.at(zones[i]));
});

// Neighbours in the same cage carry the same size. Each cage is connected and
// contains its own printed total's cell, whose size cell the machine above ties
// to the true count, so this spreads that count over the whole cage.
// Cells are read as (label, label, size, size): once the two labels differ the
// machine stops looking, which is what keeps the state count down.
const agreeMachine = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    switch (state.step) {
      case 0: return { step: 1, label: value };
      case 1: return value === state.label ? { step: 2 } : { step: 'skip' };
      case 2: return { step: 3, size: value };
      case 3: return value === state.size ? { step: 'done' } : undefined;
      default: return { step: 'skip' };
    }
  },
  accept: (state) => state.step === 'skip' || state.step === 'done',
}, geometry);

const sizeAgreement = gridCells.flatMap(
  a => [graph.step(a, 0, 1), graph.step(a, 1, 0)].flatMap(
    b => b === null ? [] : [new NFA(agreeMachine, 'neighbour-cage-size',
      cage.at(a), cage.at(b), size.at(a), size.at(b))]));

// Exactly one circle per cage: fifteen circles, fifteen cages, so no two
// circles may share a cage.
const oneCirclePerCage = new AllDifferent(...cage.at(CIRCLES));

// The digit in a circle is the size of the cage the circle sits in.
const circleDigits = CIRCLES.map(
  cell => new SameValues(2, cell, size.at(cell)));

// Two different cages of the same size share no row and no column: within one
// line, every cell whose size is s belongs to the same cage. One machine per
// size scans a line as (size, label) pairs and remembers the one label allowed
// to carry that size.
const sameSizeMachines = SIZES.map(s => NFA.encodeSpec({
  startState: { label: 0, isSize: false, reading: false },
  transition: (state, value) => {
    if (!state.reading) {
      return { label: state.label, isSize: value === s, reading: true };
    }
    if (!state.isSize) {
      return { label: state.label, isSize: false, reading: false };
    }
    if (state.label !== 0 && state.label !== value) return undefined;
    return { label: value, isSize: false, reading: false };
  },
  accept: (state) => !state.reading,
}, geometry));

const sameSizeSeparated = SIZES.flatMap((s, i) => [
  ...graph.rows(), ...graph.columns(),
].map(line => new NFA(sameSizeMachines[i], `one-cage-of-size-${s}-per-line`,
  ...line.flatMap(cell => [size.at(cell), cage.at(cell)]))));

return [
  shape,
  cage.toVar('cage'),
  size.toVar('cage size'),
  new Given('R5C2', 1),
  digitDomain,
  ...labelDomain,
  ...sizeDomain,
  ...connectivity,
  totalArea,
  ...cageDistinct,
  ...cageTotals,
  ...cageSizes,
  ...sizeAgreement,
  oneCirclePerCage,
  ...circleDigits,
  ...sameSizeSeparated,
];
