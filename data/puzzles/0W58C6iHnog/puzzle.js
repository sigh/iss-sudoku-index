// Title: With friends like this...
// Author: Ratfinkz
// Video: https://www.youtube.com/watch?v=0W58C6iHnog
// Source: https://sudokupad.app/vgpr0pfsqm

// Rules encoded here:
//   - Normal Sudoku (no given digits).
//   - Cages: digits do not repeat, and the printed total is the sum of the
//     cage's non-negator digits minus the sum of its negator digits.
//   - No two cells of the same cage that share a border hold consecutive
//     digits.
//   - Exactly one negator in every row, every column and every box; the nine
//     negator digits are 1-9 with no repeats. No negator position is drawn --
//     the solver determines them.
//   - Each diamond holds its own row number or its own column number, and the
//     diamond digits are all different.
//   - The white Kropki dot marks two consecutive digits.
// Nothing is omitted.

// "Friendly cells" is read as the seven marked diamonds rather than every cell
// of the grid matching its row or column number. The rules' own closing clause
// forces this: in any completed Sudoku the digit r lies somewhere in row r and
// that cell matches its row number, so under the whole-grid reading all nine
// digits always appear as friendly cells and "not all digits need appear as a
// friendly cell" could never hold.

// The value range is widened to 0-9 so the negator overlay can use 0 for "not a
// negator"; grid cells are pinned back to 1-9 below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Negator overlay: VN<n> shadows the nth grid cell and holds that cell's digit
// when the cell is a negator, and 0 when it is not. Holding the digit rather
// than a flag lets each cage total be a single linear equation.
const negators = graph.makeOverlay('VN');
const neg = cell => negators.at(cell);

// Cage cells and printed totals, transcribed from the drawn cages.
const cages = [
  { total: 39, cells: ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'] },
  { total: 45, cells: ['R3C6', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R7C5'] },
  { total: 37, cells: ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'] },
  { total: 9, cells: ['R4C7', 'R4C8'] },
  { total: 7, cells: ['R2C5', 'R3C5'] },
  { total: 14, cells: ['R2C7', 'R2C8', 'R2C9'] },
  { total: 3, cells: ['R5C8', 'R5C9'] },
  { total: 10, cells: ['R7C2', 'R8C1', 'R8C2', 'R9C2'] },
  { total: 8, cells: ['R7C4', 'R8C4', 'R9C4'] },
  { total: 7, cells: ['R1C1', 'R1C2', 'R2C1'] },
];

// Cells carrying a drawn diamond.
const diamonds = ['R1C3', 'R2C3', 'R3C6', 'R4C6', 'R5C5', 'R6C4', 'R8C6'];

// Every bordering pair inside a cage, derived from the cage cells: stepping
// only right and down visits each shared border exactly once.
const cageBorders = cages.flatMap(({ cells }) => {
  const members = new Set(cells);
  return cells.flatMap(cell => [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter(other => other !== null && members.has(other))
    .map(other => [cell, other]));
});

// A cell's overlay value is 0, or else the cell's own digit.
const marksOwnDigit = Pair.fnToKey(
  (digit, mark) => mark === 0 || mark === digit, shape);

const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, shape);

// Eight 0s among a house's nine overlay cells leaves exactly one negator.
const ONE_NEGATOR = '0_0_0_0_0_0_0_0';
// Each of 1-9 exactly once across all 81 overlay cells: the negator digits are
// a set of 1-9 with no repeats.
const NEGATOR_DIGITS = '1_2_3_4_5_6_7_8_9';

return [
  shape,
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  negators.toVar('negator digits'),

  ...graph.cells().map(
    cell => new Pair(marksOwnDigit, 'negator', cell, neg(cell))),
  ...negators.rowsColumnsBoxes().map(
    house => new ContainExact(ONE_NEGATOR, ...house)),
  new ContainExact(NEGATOR_DIGITS, ...negators.cells()),

  // A negator's digit is in the plain cell sum once as +d, so -2d turns it
  // into the -d the rule asks for.
  ...cages.map(({ total, cells }) => new Sum(
    total, ...cells, ...cells.map(cell => [neg(cell), -2]))),
  ...cages.map(({ cells }) => new AllDifferent(...cells)),
  ...cageBorders.map(
    ([a, b]) => new Pair(notConsecutive, 'cage border', a, b)),

  ...diamonds.map(cell => {
    const { row, col } = parseCellId(cell);
    return new Given(cell, ...new Set([row, col]));
  }),
  new AllDifferent(...diamonds),

  new WhiteDot('R8C1', 'R9C1'),
];
