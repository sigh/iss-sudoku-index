// Title: Ultimate Mashup
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=q4alR1Jv6UM
// Source: https://app.crackingthecryptic.com/sudoku/rm2JjMD2G2

// Rules encoded here:
//   Normal sudoku.
//   Killer cages whose shapes are NOT drawn and must be deduced. Each cage's
//   digits sum to the small total printed in the cage's uppermost-then-leftmost
//   cell, and do not repeat within the cage. A cage holds exactly X cells, where
//   X is the digit standing in that same printed-total cell. Cages may not
//   overlap. The nine printed totals are the only cages; every other cell may be
//   caged or uncaged only as those nine cages reach it.
//   The clues outside the grid give the sum of the digits that lie inside cages
//   in that row / column.
//   R3C4 is greater than R4C4.
//
// Nothing is omitted. "Cage" is read as a killer cage in the usual sense, i.e.
// an orthogonally contiguous set of cells; the rules constrain a cage's shape
// only by its cell count, so contiguity is the only reading under which a cell
// set has a "shape" at all.

const UNCAGED = 0;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// The label overlay VL is the discovered partition: VL = 0 for an uncaged cell,
// VL = k for a cell of cage k. It needs a tenth value, so the alphabet is
// widened to 0-9 and the grid cells are pinned back to 1-9 below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const labels = graph.makeOverlay('VL');

// The nine small numbers drawn in cell corners: [total cell, total].
const CAGE_TOTALS = [
  ['R1C2', 8],
  ['R2C2', 15],
  ['R2C9', 12],
  ['R3C5', 11],
  ['R4C9', 44],
  ['R6C1', 22],
  ['R6C4', 10],
  ['R8C3', 39],
  ['R9C2', 15],
];

// The outside clues, read off the left and top margins.
const OUTSIDE_SUMS = [
  ['row', 2, 17],
  ['row', 3, 21],
  ['row', 6, 9],
  ['col', 3, 22],
  ['col', 8, 24],
];

// A cage's digits as a bitmask, one bit per digit.
const bit = digit => 1 << (digit - 1);
const maskSum = mask => DIGITS.reduce((s, d) => s + ((mask & bit(d)) ? d : 0), 0);
const maskSize = mask => DIGITS.reduce((n, d) => n + ((mask & bit(d)) ? 1 : 0), 0);
const subsetsOf = mask => {
  const out = [];
  for (let s = mask; ; s = (s - 1) & mask) { out.push(s); if (s === 0) break; }
  return out;
};

// Every digit set a cage of this total could hold. The cage's digits are
// distinct and sum to the total; its size is the digit in the total cell, which
// is one of the cage's own cells, so the set's size is one of its members.
const cageMasks = total => Array.from({ length: 1 << 9 }, (_, m) => m).filter(
  mask => maskSum(mask) === total && (mask & bit(maskSize(mask))));

const cages = CAGE_TOTALS.map(([totalCell, total], index) => {
  const masks = cageMasks(total);
  const anchor = parseCellId(totalCell);
  const maxSize = Math.max(...masks.map(maskSize));
  const otherTotalCells = CAGE_TOTALS
    .map(([cell]) => cell).filter(cell => cell !== totalCell);
  return {
    totalCell,
    total,
    label: index + 1,
    // The digit sets the cage can still grow into. A partial set outside this
    // collection can never be completed, so the scan below drops it.
    reachableMasks: new Set(masks.flatMap(subsetsOf)),
    // A cage is contiguous and holds at most maxSize cells, so it reaches no
    // further than maxSize - 1 steps from its total cell; and the total cell is
    // the cage's uppermost-then-leftmost cell, so no cage cell precedes it in
    // reading order. Another cage's total cell belongs to that cage, and cages
    // do not overlap, so it is out too.
    cells: graph.cells().filter(cell => {
      const { row, col } = parseCellId(cell);
      const inReadingOrder =
        row > anchor.row || (row === anchor.row && col >= anchor.col);
      const distance = Math.abs(row - anchor.row) + Math.abs(col - anchor.col);
      return inReadingOrder && distance < maxSize
        && !otherTotalCells.includes(cell);
    }),
  };
});

// Each cell's own list of the cages that could reach it; a total cell is pinned
// to its own cage.
const labelGivens = graph.cells().map(cell => {
  const ownCage = cages.find(cage => cage.totalCell === cell);
  const values = ownCage ? [ownCage.label] : [
    UNCAGED,
    ...cages.filter(cage => cage.cells.includes(cell)).map(cage => cage.label),
  ];
  return new Given(labels.at(cell), ...values);
});

// Cage digits: distinct, and summing to the printed total. The scan reads
// (label, digit) for each cell the cage could reach; `phase` says which of the
// two the next symbol is, and whether that digit belongs to this cage. `mask`
// collects the cage's digits so far, so a repeat is a rejected branch.
const cageSumConstraint = ({ label, total, reachableMasks, cells }) => new NFA(
  NFA.encodeSpec({
    startState: { mask: 0, phase: 'label' },
    transition: ({ mask, phase }, value) => {
      if (phase === 'label') {
        return { mask, phase: value === label ? 'take' : 'skip' };
      }
      if (phase === 'skip') return { mask, phase: 'label' };
      if (value === UNCAGED) return undefined;   // not a playable grid digit
      if (mask & bit(value)) return undefined;   // digit repeats in the cage
      const next = mask | bit(value);
      if (!reachableMasks.has(next)) return undefined;
      return { mask: next, phase: 'label' };
    },
    accept: ({ mask, phase }) => phase === 'label' && maskSum(mask) === total,
  }, shape),
  `cage${label}sum`,
  ...cells.flatMap(cell => [labels.at(cell), cell]));

// Cage size: the digit in the total cell (read first, as its own segment) is the
// number of cells carrying this cage's label.
const cageSizeConstraint = ({ label, totalCell, cells }) => new NFA(
  NFA.encodeSpec({
    startState: { size: null, count: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) return state;
      if (state.size === null) return { size: value, count: 0 };
      const count = state.count + (value === label ? 1 : 0);
      if (count > state.size) return undefined;
      return { size: state.size, count };
    },
    accept: ({ size, count }) => size !== null && count === size,
    maxDepth: cells.length + 2,
  }, shape, { multiSegment: true }),
  `cage${label}size`,
  [totalCell], labels.at(cells));

// Outside clue: the same (label, digit) scan, totalling every digit whose cell
// carries any cage's label.
const outsideConstraint = ([lineType, index, total]) => {
  const lineCells = lineType === 'row' ? graph.row(index) : graph.column(index);
  return new NFA(
    NFA.encodeSpec({
      startState: { sum: 0, phase: 'label' },
      transition: ({ sum, phase }, value) => {
        if (phase === 'label') {
          return { sum, phase: value === UNCAGED ? 'skip' : 'take' };
        }
        if (phase === 'skip') return { sum, phase: 'label' };
        if (value === UNCAGED) return undefined;   // not a playable grid digit
        const next = sum + value;
        if (next > total) return undefined;
        return { sum: next, phase: 'label' };
      },
      accept: ({ sum, phase }) => phase === 'label' && sum === total,
    }, shape),
    `outside${lineType}${index}`,
    ...lineCells.flatMap(cell => [labels.at(cell), cell]));
};

return [
  shape,
  labels.toVar('cage'),
  // The grid holds 1-9; only the overlay uses the tenth value.
  graph.makeReplicate(new Given(graph.cells()[0], ...DIGITS)),
  ...labelGivens,
  ...cages.map(cageSumConstraint),
  ...cages.map(cageSizeConstraint),
  // Each cage is one contiguous group of cells.
  ...cages.map(({ label }) => new ConnectedValues('VL', label)),
  ...OUTSIDE_SUMS.map(outsideConstraint),
  new GreaterThan('R3C4', 'R4C4'),
];
