// Title: Sliding Doors
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=ss5Z0hY8B50
// Source: https://sudokupad.app/dx2flehouq

// Rules encoded here, in full; no clause is omitted:
//  - Draw seven 6-cell regions in the grid (some region boundaries are given),
//    and place the digits 1-6 in every row, column, and region. Regions consist
//    of 6 orthogonally connected cells.
//  - Cells not in regions should be left empty.
//  - Each clue outside the grid gives the sum of the cells in the row or column
//    from the direction of the clue until reaching an empty cell.

// Board value 0 means "this cell is empty"; 1-6 are the digits. The alphabet is
// widened to 0-7 only so the region-label overlay below has eight states, so
// board cells are restricted back to 0-6. Seven cells per line drawn from the
// seven board values makes the built-in row/column all-different say exactly
// "the digits 1-6 in every row and column", with the seventh cell empty.
const shape = new Shape('7x7', '0-7');
const graph = cellGraph(shape);

const EMPTY = 0;
const DIGITS = [1, 2, 3, 4, 5, 6];
const ALL_DIGITS_SEEN = 0b111111;
const REGIONS = [1, 2, 3, 4, 5, 6, 7];
const REGION_SIZE = 6;
const UNREGIONED = 0;

// VR<n> holds the region label of the nth board cell: 1-7 for the seven regions
// the solver draws, 0 for a cell in no region.
const region = graph.makeOverlay('VR');

const boardValues = graph.makeReplicate(
  new Given(graph.cells()[0], EMPTY, ...DIGITS));

// "Cells not in regions should be left empty", with its converse: a cell that
// is in a region holds a digit.
const emptyIffUnregioned = Pair.fnToKey(
  (value, label) => (value === EMPTY) === (label === UNREGIONED), shape);
const membership = graph.cells().map(
  cell => new Pair(emptyIffUnregioned, 'empty cells are the unregioned ones',
    cell, region.at(cell)));

// Each region is 6 orthogonally connected cells.
const regionShapes = REGIONS.map(
  label => new ConnectedValues('VR', label, REGION_SIZE));

// "Place the digits 1-6 in ... every region": walk the board in row-major order
// as [label, value, label, value, ...] and collect the values of the cells
// carrying this region's label. `seen` is the bitmask of digits collected so
// far; `active` is null while the next symbol is a label, and otherwise says
// whether the label just read was this region's, since the value it governs
// arrives on the following symbol. A repeated digit, or an empty cell inside
// the region, dead-ends; accepting only on the full mask also fixes the region
// at six cells, one per digit.
const regionDigitsSpec = (label) => ({
  startState: { seen: 0, active: null },
  transition: ({ seen, active }, value) => {
    if (active === null) return { seen, active: value === label };
    if (!active) return { seen, active: null };
    const bit = 1 << (value - 1);
    if (value === EMPTY || (seen & bit)) return undefined;
    return { seen: seen | bit, active: null };
  },
  accept: ({ seen, active }) => active === null && seen === ALL_DIGITS_SEEN,
});
const regionDigits = REGIONS.map(label => new NFA(
  NFA.encodeSpec(regionDigitsSpec(label), shape),
  `region ${label} holds 1-6`,
  ...graph.cells().flatMap(cell => [region.at(cell), cell])));

// The labels are an artifact of this encoding and the rules never name them, so
// pin one representative labelling: reading the board in row-major order, label
// k + 1 first appears after label k.
const canonicalLabels = new NFA(NFA.encodeSpec({
  startState: 0,
  transition: (introduced, label) => {
    if (label === UNREGIONED || label <= introduced) return introduced;
    return label === introduced + 1 ? introduced + 1 : undefined;
  },
  accept: (introduced) => introduced === REGIONS.length,
}, shape), 'canonical region labels', ...region.cells());

// The given region boundaries: the four thick segments drawn along cell borders
// in the source, transcribed as the cell pair each one separates. A boundary
// has a region on at least one side and the other side is outside that region,
// so the two cells cannot share a label -- and cannot both be unregioned, which
// requiring different labels already covers.
const DRAWN_WALLS = [
  ['R1C3', 'R1C4'],
  ['R2C5', 'R2C6'],
  ['R2C7', 'R3C7'],
  ['R6C2', 'R7C2'],
];
const walls = DRAWN_WALLS.map(pair => new AllDifferent(...region.at(pair)));

// The six clue numbers printed outside the grid, transcribed with the side each
// one sits on: the sum is read inwards from that side.
const OUTSIDE_CLUES = [
  { side: 'left', line: 2, total: 6 },
  { side: 'left', line: 4, total: 15 },
  { side: 'left', line: 6, total: 14 },
  { side: 'right', line: 5, total: 9 },
  { side: 'right', line: 7, total: 12 },
  { side: 'top', line: 5, total: 13 },
];
// Once the empty cell is read the rest of the line no longer matters, so the
// machine collapses into a single `done` state instead of carrying the tail.
const outsideSumSpec = (total) => ({
  startState: { sum: 0, done: false },
  transition: ({ sum, done }, value) => {
    if (done) return { sum: 0, done: true };
    if (value === EMPTY) return sum === total ? { sum: 0, done: true } : undefined;
    if (!DIGITS.includes(value)) return undefined;
    return sum + value <= total ? { sum: sum + value, done: false } : undefined;
  },
  accept: ({ done }) => done,
});
const clueCells = ({ side, line }) => {
  if (side === 'left') return graph.row(line);
  if (side === 'right') return graph.row(line).reverse();
  return graph.column(line);
};
const outsideSums = OUTSIDE_CLUES.map(clue => new NFA(
  NFA.encodeSpec(outsideSumSpec(clue.total), shape),
  `${clue.side} ${clue.line}: ${clue.total}`,
  ...clueCells(clue)));

return [
  shape,
  region.toVar('region'),
  boardValues,
  ...membership,
  ...regionShapes,
  ...regionDigits,
  canonicalLabels,
  ...walls,
  ...outsideSums,
];
