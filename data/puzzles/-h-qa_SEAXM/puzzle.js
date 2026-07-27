// Title: Oops! All Regions
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=-h-qa_SEAXM
// Source: https://sudokupad.app/7nrei23yv6

// Rules encoded here, over the 9x9 drawing canvas:
//
//  - The playable grid is the 7x7 block R2C2-R8C8. It holds the digits 1-7 with
//    no repeat in a row or column.
//  - The 18 grey canvas cells are outside the puzzle and stay empty. The other
//    14 canvas cells around the grid are blank outer clue cells; each holds a
//    digit 1-7 and belongs to a region, but is in no row or column group.
//  - Extended chaos construction: those 49 + 14 = 63 cells split into nine
//    orthogonally-connected 7-cell regions, with no repeated digit in a region.
//    Two given black borders put R5C3/R6C3 and R4C7/R5C7 in different regions.
//  - Numbered rooms: a clue digit C is either a blank outer cell's own digit or
//    a grey rectangle's given digit. If the first cell looking into the grid
//    from that clue holds N, the Nth cell in that direction holds C.
//  - Outside cell counters: a circled cell's digit equals the number of outer
//    clue cells in its region, and every cell for which that holds is circled.
//
// Nothing is omitted. The one constraint below that is not a rule is the label
// order machine: it canonicalises which region is called 1, 2, ... and so fixes
// the naming of the nine regions, never the partition itself.

// Value 0 is playable so that it can mark "not in any region" and a region with
// no outer clue cells.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// The 9x9 main grid cannot hold the answer: its rows and columns are always
// all-different, but a canvas row mixes the 7x7's digits with an outer clue
// digit that is free to repeat them. Digits therefore live in the VD layer and
// region labels in the VR layer -- and VR has to be a full-grid layer because
// that is what ConnectedValues accepts.
const digitLayer = graph.makeOverlay('VD');
const regionLayer = graph.makeOverlay('VR');
// VK1..VK9: how many outer clue cells region L contains (0-7).
const counters = new Var('K', 'counters', 9);
// VC1..VC6: the digits given in the six rectangles, in GIVEN_CLUES order. They
// are clues rather than cells of the answer, so they are kept out of VD.
const clueValues = new Var('C', 'clues', 6);

// --- Drawn data ------------------------------------------------------------

// The grey canvas cells: outside every region, and empty in the answer. Six of
// them carry a white rectangle with a given numbered-rooms clue; the rest are
// fully grey.
const GREY_CELLS = [
  'R1C1', 'R1C2', 'R1C4', 'R1C7', 'R1C8', 'R1C9',
  'R2C1', 'R4C1', 'R5C1', 'R4C9', 'R8C9',
  'R9C1', 'R9C2', 'R9C3', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
];
// The digits printed in the six rectangles.
const GIVEN_CLUES = {
  R1C4: 2, R1C8: 1, R4C9: 6, R5C1: 4, R9C6: 5, R9C7: 3,
};
// The seven circled cells.
const CIRCLED_CELLS = ['R1C6', 'R2C2', 'R6C8', 'R7C3', 'R7C4', 'R7C8', 'R8C8'];
// The two thick black borders drawn inside the grid, as the cell pairs they
// separate.
const GIVEN_BORDERS = [['R5C3', 'R6C3'], ['R4C7', 'R5C7']];

// --- Derived geometry ------------------------------------------------------

const isInner = (cell) => {
  const { row, col } = parseCellId(cell);
  return row >= 2 && row <= 8 && col >= 2 && col <= 8;
};
const greySet = new Set(GREY_CELLS);
// Ring cells that are not grey: the blank outer clue cells.
const outerCells = graph.cells().filter(c => !isInner(c) && !greySet.has(c));
const liveCells = graph.cells().filter(c => !greySet.has(c));

// Each clue cell (blank outer cell or given rectangle) reads the seven grid
// cells of its row or column, starting from the one nearest the clue.
const clueRay = (cell) => {
  const { row, col } = parseCellId(cell);
  if (row === 1) return graph.column(col).filter(isInner);
  if (row === 9) return graph.column(col).filter(isInner).reverse();
  if (col === 1) return graph.row(row).filter(isInner);
  return graph.row(row).filter(isInner).reverse();
};
// A clue is a (cell it sits in, cell holding its digit) pair: a blank outer cell
// clues with its own answer digit, a rectangle with its given digit.
const clues = [
  ...outerCells.map(cell => [cell, digitLayer.at(cell)]),
  ...Object.keys(GIVEN_CLUES).map(
    (cell, i) => [cell, clueValues.cell(i + 1)]),
];

// --- Cell domains ----------------------------------------------------------

// The main grid is unused. Pin it to a Latin square so it adds no solutions.
const unusedGrid = graph.cells().map(cell => {
  const { row, col } = parseCellId(cell);
  return new Given(cell, (row + col) % 9);
});

// Grey cells are empty and belong to no region; pinning them to 0 keeps them out
// of the answer without adding solutions. The live cells all take the same
// candidate set, so each layer states it once and Replicate stamps it (the
// template sits on the layer's first cell, which Replicate uses only as the
// translation origin).
const digitDomains = [
  digitLayer.makeReplicate(
    new Given(digitLayer.cells()[0], 1, 2, 3, 4, 5, 6, 7),
    digitLayer.at(liveCells)),
  ...GREY_CELLS.map(cell => new Given(digitLayer.at(cell), 0)),
];

const clueGivens = Object.values(GIVEN_CLUES).map(
  (value, i) => new Given(clueValues.cell(i + 1), value));

const regionDomains = [
  regionLayer.makeReplicate(
    new Given(regionLayer.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9),
    regionLayer.at(liveCells)),
  ...GREY_CELLS.map(cell => new Given(regionLayer.at(cell), 0)),
];

const counterDomains = counters.cells().map(
  cell => new Given(cell, 0, 1, 2, 3, 4, 5, 6, 7));

// --- 7x7 rows and columns --------------------------------------------------

const rowColGroups = [
  ...graph.rows(), ...graph.columns(),
].map(cells => cells.filter(isInner))
  .filter(cells => cells.length === 7)
  .map(cells => new AllDifferent(...digitLayer.at(cells)));

// --- Chaos construction ----------------------------------------------------

// Nine regions of seven cells each.
const regionSizes = new ContainExact(
  [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap(l => Array(7).fill(l)).join('_'),
  ...regionLayer.at(liveCells));

const connectivity = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
  label => new ConnectedValues('VR', label));

const givenBorders = GIVEN_BORDERS.map(
  ([a, b]) => new AllDifferent(regionLayer.at(a), regionLayer.at(b)));

// Seven cells and no repeated digit means every region holds each of 1-7 once,
// so the rule splits into one machine per (label, digit): scan every live cell
// as a (label, digit) pair and count the cells carrying both, which must be
// exactly one. Splitting it this way rather than tracking a set of seen digits
// per label costs 63 tiny machines instead of 9 large ones, and runs about ten
// times faster.
const regionDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap(label =>
  [1, 2, 3, 4, 5, 6, 7].map(digit => {
    const spec = NFA.encodeSpec({
      startState: { count: 0, phase: 'label' },
      transition: (state, value) => {
        if (state.phase === 'label') {
          return { count: state.count, phase: value === label ? 'check' : 'skip' };
        }
        if (state.phase === 'skip') return { count: state.count, phase: 'label' };
        if (value !== digit) return { count: state.count, phase: 'label' };
        if (state.count) return undefined;
        return { count: 1, phase: 'label' };
      },
      accept: (state) => state.phase === 'label' && state.count === 1,
    }, shape);
    return new NFA(spec, 'region digits',
      ...liveCells.flatMap(cell => [regionLayer.at(cell), digitLayer.at(cell)]));
  }));

// --- Numbered rooms --------------------------------------------------------

// Reads the clue digit C, then the seven cells looking into the grid. The first
// of them gives N, and `left` counts down to the Nth cell, which must hold C.
const roomSpec = NFA.encodeSpec({
  startState: { phase: 'clue' },
  transition: (state, value) => {
    // Every cell in the scan holds a digit 1-7.
    if (value < 1 || value > 7) return undefined;
    if (state.phase === 'clue') return { phase: 'first', clue: value };
    if (state.phase === 'first') {
      if (value === 1) return value === state.clue ? { phase: 'done' } : undefined;
      return { phase: 'count', clue: state.clue, left: value - 1 };
    }
    if (state.phase === 'count') {
      if (state.left === 1) {
        return value === state.clue ? { phase: 'done' } : undefined;
      }
      return { phase: 'count', clue: state.clue, left: state.left - 1 };
    }
    return { phase: 'done' };
  },
  accept: (state) => state.phase === 'done',
}, shape);

const numberedRooms = clues.map(([cell, valueCell]) => new NFA(
  roomSpec, 'numbered room', valueCell, ...digitLayer.at(clueRay(cell))));

// --- Outside cell counters -------------------------------------------------

// VK<label> is read from the first cell, then the outer clue cells' labels are
// counted against it.
const counterCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(label => {
  const spec = NFA.encodeSpec({
    startState: { target: null },
    transition: (state, value) => {
      if (state.target === null) return { target: value, count: 0 };
      const count = state.count + (value === label ? 1 : 0);
      return count > state.target ? undefined : { target: state.target, count };
    },
    accept: (state) => state.target !== null && state.count === state.target,
  }, shape);
  return new NFA(spec, 'region outer count',
    counters.cell(label), ...regionLayer.at(outerCells));
});

// VK<label> again, then the circled cells as (label, digit) pairs. A region
// holding outer clue cells has exactly one circle and its digit is the count; a
// region holding none has no circle. Since a region holds each of 1-7 once,
// that is also the "all possible circles are given" negative: the one cell whose
// digit matches the count is the circled one.
const counterCircles = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(label => {
  const spec = NFA.encodeSpec({
    startState: { phase: 'count' },
    transition: (state, value) => {
      if (state.phase === 'count') {
        return { phase: 'label', count: value, seen: 0 };
      }
      if (state.phase === 'label') {
        return { ...state, phase: value === label ? 'check' : 'skip' };
      }
      if (state.phase === 'skip') return { ...state, phase: 'label' };
      if (state.seen || value !== state.count) return undefined;
      return { phase: 'label', count: state.count, seen: 1 };
    },
    accept: (state) => state.phase === 'label'
      && state.seen === (state.count > 0 ? 1 : 0),
  }, shape);
  return new NFA(spec, 'region circles',
    counters.cell(label),
    ...CIRCLED_CELLS.flatMap(cell => [regionLayer.at(cell), digitLayer.at(cell)]));
});

// --- Region label symmetry -------------------------------------------------

// The nine labels are interchangeable, so without this every partition would
// appear 9! times. Labels must first appear in increasing order down the
// row-major scan of the live cells, which leaves exactly one naming per
// partition.
const labelOrder = new NFA(NFA.encodeSpec({
  startState: 0,
  transition: (highest, value) => (
    value <= highest + 1 ? Math.max(highest, value) : undefined),
  accept: (highest) => highest === 9,
}, shape), 'label order', ...regionLayer.at(liveCells));

return [
  shape,
  new NoBoxes(),
  digitLayer.toVar('digits'),
  regionLayer.toVar('regions'),
  counters,
  clueValues,
  ...unusedGrid,
  ...digitDomains,
  ...clueGivens,
  ...regionDomains,
  ...counterDomains,
  ...rowColGroups,
  regionSizes,
  ...connectivity,
  ...givenBorders,
  ...regionDigits,
  ...numberedRooms,
  ...counterCounts,
  ...counterCircles,
  labelOrder,
  // Correctness-neutral: flattening the digit cells' priority makes the search
  // branch on region labels first, growing regions rather than filling digits,
  // which is about three times faster here.
  new SearchPriority(0, ...digitLayer.at(liveCells)),
];
