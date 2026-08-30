// Title: Compass
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=lG5XPsGoxBU
// Source: https://tinyurl.com/y6uj669k

// Rules (from the video description):
//   - Divide the grid into regions based on the given clues.
//   - There will be one orthogonally connected 13-cell region for each suit,
//     plus 2 Joker cells that are not in a region.
//   - For each given clue, the numbers indicate how many cells are north,
//     south, east, or west of the clue cell.
//   - Joker cells may not be on the edges of the grid and must be rotationally
//     symmetric around the center.
//
// The grid is 6 rows x 9 columns = 54 cells = 4 x 13 + 2. A cell's value is the
// region it belongs to: 0 = Joker (no region), 1 = hearts, 2 = diamonds,
// 3 = spades, 4 = clubs. The four suit labels are pinned by the four clue
// cells, so no relabelling freedom is left for the solver.
//
// "north of the clue cell" is read as "in a row above it", and "east" as "in a
// column to its right": the rule names a direction from the clue cell, not a
// line through it, so a cell that is both north and east of the clue is counted
// once by the north number and once by the east number. Under this reading a
// region's north and south counts plus its cells in the clue's own row make 13,
// and likewise for east/west and the clue's own column.
//
// Each clue cell carries a suit symbol and is divided by a drawn X into four
// compartments, which is the usual way a compass clue is drawn. The source
// records each number's compartment as an index 0..3 within the cell, but
// nothing local fixes which index is drawn where, so the compartment-to-
// direction pairing is left to the solver: the Or below runs over all 24
// bijections from the four compartments to N/S/E/W, one branch per bijection.

const shape = new Shape('6x9', '0-4', 'Raw');
const graph = cellGraph(shape);

const NUM_ROWS = 6;
const NUM_COLS = 9;
const JOKER = 0;
const SUITS = { hearts: 1, diamonds: 2, spades: 3, clubs: 4 };
const REGION_SIZE = 13;

const allCells = [];
for (let r = 1; r <= NUM_ROWS; r++) {
  for (let c = 1; c <= NUM_COLS; c++) allCells.push(makeCellId(r, c));
}

// The four cells drawn with a suit symbol, and the numbers drawn in them
// keyed by the compartment index the source records for each number.
const COMPASS_CLUES = [
  { cell: 'R3C4', suit: SUITS.hearts, numbers: { 0: 3 } },
  { cell: 'R3C6', suit: SUITS.diamonds, numbers: {} },
  { cell: 'R4C4', suit: SUITS.spades, numbers: { 0: 4, 2: 2 } },
  { cell: 'R4C6', suit: SUITS.clubs, numbers: { 1: 1, 3: 0 } },
];

// Each suit's region: one orthogonally connected component of exactly 13 cells.
// The two Jokers are then the 54 - 4*13 cells left over, which the explicit
// count below states directly.
const regions = Object.values(SUITS).map(
  suit => new ConnectedValues('', suit, REGION_SIZE));

const clueGivens = COMPASS_CLUES.map(
  clue => new Given(clue.cell, clue.suit));

// "plus 2 Joker cells that are not in a region".
const jokerCount = new ContainExact('0_0', ...allCells);

// "Joker cells may not be on the edges of the grid": no 0 among the border
// cells (LookAndSay's zero count is "this value must not appear here").
const borderCells = allCells.filter(id => {
  const { row, col } = parseCellId(id);
  return row === 1 || row === NUM_ROWS || col === 1 || col === NUM_COLS;
});
const jokersOffEdge = new LookAndSay(`0${JOKER}`, ...borderCells);

// "[Jokers] must be rotationally symmetric around the center": under the 180
// degree rotation (r, c) -> (NUM_ROWS+1-r, NUM_COLS+1-c) a cell is a Joker
// exactly when its image is. The key tests both cells' values for Jokerhood.
const sameJokerness = Pair.fnToKey(
  (a, b) => (a === JOKER) === (b === JOKER), shape);
const jokerSymmetry = allCells.flatMap(id => {
  const { row, col } = parseCellId(id);
  const image = makeCellId(NUM_ROWS + 1 - row, NUM_COLS + 1 - col);
  // One constraint per unordered pair; the rotation has no fixed cell.
  return id < image ? [new Pair(sameJokerness, 'joker-symmetry', id, image)] : [];
});

// Cells strictly north / south / west / east of a clue cell.
const inDirection = (dir, clueCell) => {
  const { row, col } = parseCellId(clueCell);
  const test = {
    N: cell => parseCellId(cell).row < row,
    S: cell => parseCellId(cell).row > row,
    W: cell => parseCellId(cell).col < col,
    E: cell => parseCellId(cell).col > col,
  }[dir];
  return allCells.filter(test);
};

const permutations = (items) => items.length <= 1 ? [items] :
  items.flatMap((item, i) => permutations(
    [...items.slice(0, i), ...items.slice(i + 1)]).map(rest => [item, ...rest]));

// One branch per compartment-to-direction bijection. Within a branch, each
// drawn number becomes "exactly <n> cells of this suit lie in that direction",
// which is a LookAndSay (count, value) clue over the cells in that direction.
const compassReadings = new Or(
  permutations(['N', 'S', 'E', 'W']).map(dirs => new And(
    COMPASS_CLUES.flatMap(clue =>
      Object.entries(clue.numbers).map(([compartment, count]) =>
        new LookAndSay(
          `${count}${clue.suit}`,
          ...inDirection(dirs[compartment], clue.cell)))))));

return [
  shape,
  ...clueGivens,
  ...regions,
  jokerCount,
  jokersOffEdge,
  ...jokerSymmetry,
  compassReadings,
];
