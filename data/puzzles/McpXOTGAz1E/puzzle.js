// Title: Embark
// Author: dumediat
// Video: https://www.youtube.com/watch?v=McpXOTGAz1E
// Source: https://tinyurl.com/3wbmu73f

// Rules encoded, on a 14x14 board that carries no given digits:
//  - Nine non-overlapping 3x3 square regions sit somewhere in the grid. Each
//    holds 1-9 once. A cell in no region holds no digit and is "empty".
//  - Digits do not repeat in a row or a column of the whole 14x14 board.
//  - Killer cages: the digits inside sum to the printed total and do not
//    repeat. Empty cells inside a cage contribute nothing.
//  - Every empty cell is either shaded black or carries a segment of a
//    non-intersecting loop drawn through the centres of all unshaded empty
//    cells. No two shaded cells are orthogonally adjacent.
//  - Each arrow clue holds a digit, lies inside a region, and its digit counts
//    the shaded cells along the ray from the clue to the edge of the grid.
//
// Two rules are omitted.
//  - The rules provide for shaded cells printed in the puzzle. The source draws
//    all fifteen shaded cells of the answer, in two colours, and nothing in it
//    separates a printed clue cell from a cell the solver shades, so no shaded
//    cell is asserted here.
//  - The loop is required to be a single closed loop. What is encoded is that
//    every loop cell has exactly two used edges, that neighbouring cells agree
//    about the edge between them, and that the loop cells are orthogonally
//    connected as a set. Two separate closed loops running alongside each other
//    satisfy all of that, so the encoding admits them.
//
// The fog of war and its three light sources are solving UI, not a rule about
// the final grid, and are not encoded.

const shape = new Shape('14x14', '0-15', 'Raw');
const graph = cellGraph(shape);
// One overlay code per cell, holding what the cell turns out to be. The board
// itself holds only the digit: 0 for an empty cell, 1-9 for a digit cell.
//   0     empty and shaded black
//   1-9   a digit cell, at this position (reading order) inside its own 3x3
//         region -- so 1 is the region's top-left cell and 9 its bottom-right
//   10-15 empty and unshaded, carrying the loop segment that joins the two
//         named edges of the cell
const state = graph.makeOverlay('VL');
const SHADED = 0;
const [EW, NS, NE, NW, SE, SW] = [10, 11, 12, 13, 14, 15];
const LOOP = [EW, NS, NE, NW, SE, SW];
const CODES = [...Array(16).keys()];

const isDigitCode = v => v >= 1 && v <= 9;
const bandRow = v => (v - 1) / 3 | 0;   // 0-2, the cell's row inside its region
const bandCol = v => (v - 1) % 3;       // 0-2, its column inside its region
const usesN = v => v === NS || v === NE || v === NW;
const usesS = v => v === NS || v === SE || v === SW;
const usesE = v => v === EW || v === NE || v === SE;
const usesW = v => v === EW || v === NW || v === SW;

// Board digit against overlay code: a digit cell holds 1-9, anything else 0.
const digitKey = Pair.fnToKey(
  (digit, code) => isDigitCode(code) ? digit >= 1 && digit <= 9 : digit === 0,
  shape);
const digitCells = graph.cells().map(
  cell => new Pair(digitKey, `digit-${cell}`, cell, state.at(cell)));

// Everything that relates a cell's code to its right-hand neighbour's.
//  - region shape: a region cell that is not in its region's last column is
//    followed by the next position code, and a cell that is not in its
//    region's first column follows the previous one. The two implications
//    together are what makes the nine codes tile as 3x3 blocks.
//  - shading: no two shaded cells orthogonally adjacent.
//  - loop: the two cells agree about whether the edge between them is used.
const acrossKey = Pair.fnToKey((a, b) =>
  (!(isDigitCode(a) && bandCol(a) < 2) || b === a + 1) &&
  (!(isDigitCode(b) && bandCol(b) > 0) || a === b - 1) &&
  !(a === SHADED && b === SHADED) &&
  usesE(a) === usesW(b), shape);
// The same three rules downwards; a region's next row is three codes on.
const downKey = Pair.fnToKey((a, b) =>
  (!(isDigitCode(a) && bandRow(a) < 2) || b === a + 3) &&
  (!(isDigitCode(b) && bandRow(b) > 0) || a === b - 3) &&
  !(a === SHADED && b === SHADED) &&
  usesS(a) === usesN(b), shape);
const acrossSteps = graph.rows().map(
  (row, i) => new Pair(acrossKey, `across-${i + 1}`, ...state.at(row)));
const downSteps = graph.columns().map(
  (col, i) => new Pair(downKey, `down-${i + 1}`, ...state.at(col)));

// Codes an edge cell cannot hold: a region that would hang off the board, and
// a loop segment that would use an edge of the board.
const edgeCodes = graph.cells().map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = CODES.filter(v => {
    if (isDigitCode(v)) {
      const top = row - bandRow(v);
      const left = col - bandCol(v);
      return top >= 1 && top + 2 <= 14 && left >= 1 && left + 2 <= 14;
    }
    return !(usesN(v) && row === 1) && !(usesS(v) && row === 14)
      && !(usesW(v) && col === 1) && !(usesE(v) && col === 14);
  });
  return allowed.length === CODES.length
    ? null : new Given(state.at(cell), ...allowed);
}).filter(given => given !== null);

// Exactly nine regions: nine cells carry the top-left position code.
const regionCount = new ContainExact(
  Array(9).fill(1).join('_'), ...state.at(graph.cells()));

// Each region holds 1-9 once: where a cell is a region's top-left, the 3x3
// block starting there is all-different, and the block's cells are digit cells
// by the region shape above, so nine different digits is 1-9.
const regionDigits = graph.cells().filter(cell => graph.block(cell, 3, 3)).map(
  cell => new Or([
    new Given(state.at(cell), ...CODES.filter(v => v !== 1)),
    new AllDifferent(...graph.block(cell, 3, 3)),
  ]));

// Digits do not repeat, counting only the cells that hold a digit.
const noRepeatKey = PairX.fnToKey(
  (a, b) => a === 0 || b === 0 || a !== b, shape);
const rowsAndColumns = [
  ...graph.rows().map(
    (row, i) => new PairX(noRepeatKey, `row-${i + 1}`, ...row)),
  ...graph.columns().map(
    (col, i) => new PairX(noRepeatKey, `column-${i + 1}`, ...col)),
];

// Cages, transcribed from the drawn cages and their top-left totals.
const CAGES = [
  [13, [[14, 13], [14, 14]]],
  [16, [[11, 12], [11, 13], [12, 13]]],
  [15, [[9, 12], [10, 12], [10, 13]]],
  [4, [[11, 10], [11, 11], [12, 11], [12, 12]]],
  [11, [[10, 9], [11, 9]]],
  [10, [[11, 6], [11, 7], [12, 6]]],
  [13, [[9, 3], [9, 4], [9, 5], [10, 5]]],
  [12, [[7, 2], [8, 2], [8, 3]]],
  [11, [[4, 3], [5, 3], [6, 3], [7, 3]]],
  [8, [[4, 1], [4, 2], [5, 1], [6, 1], [7, 1]]],
  [15, [[3, 4], [3, 5], [3, 6], [3, 7]]],
  [9, [[4, 6], [5, 6], [5, 7]]],
  [9, [[6, 8], [6, 9]]],
  [10, [[7, 7], [7, 8], [8, 8]]],
  [18, [[3, 11], [3, 12], [4, 12]]],
  [14, [[2, 8], [3, 8], [3, 9], [3, 10], [4, 10]]],
  [12, [[1, 7], [2, 7]]],
  [13, [[11, 5], [12, 5]]],
  [2, [[4, 8], [4, 9], [5, 9]]],
  [10, [[2, 2], [3, 2]]],
  [14, [[2, 3], [2, 4]]],
];
// An empty cell in a cage holds 0, so it neither adds to the total nor
// collides with a digit: one Sum and one no-repeat relation per cage.
const cages = CAGES.flatMap(([total, cells], i) => {
  const ids = cells.map(([row, col]) => makeCellId(row, col));
  return [
    new Sum(total, ...ids),
    new PairX(noRepeatKey, `cage-${i + 1}`, ...ids),
  ];
});

// Arrow clues, transcribed from the drawn arrow glyphs and their rotations.
const ARROWS = [
  [[1, 8], [1, 0]],
  [[4, 3], [1, 0]],
  [[2, 10], [1, 0]],
  [[2, 12], [0, 1]],
  [[7, 9], [0, 1]],
  [[9, 2], [0, 1]],
  [[10, 14], [-1, 0]],
  [[12, 10], [-1, 0]],
  [[12, 7], [0, -1]],
  [[13, 14], [0, -1]],
  [[14, 12], [0, -1]],
];
// Read the clue's own digit, then the codes along its ray, and count down one
// per shaded cell: `leftN` is how many shaded cells the clue still owes.
const arrowNFA = NFA.encodeSpec({
  startState: 'clue',
  transition: (state, value) => {
    if (state === 'clue') {
      return isDigitCode(value) ? `left${value}` : undefined;
    }
    if (value !== SHADED) return state;
    const left = +state.slice(4);
    return left > 0 ? `left${left - 1}` : undefined;
  },
  accept: state => state === 'left0',
}, shape);
const arrows = ARROWS.flatMap(([[row, col], [dR, dC]]) => {
  const cell = makeCellId(row, col);
  const ray = graph.ray(cell, dR, dC).slice(1);
  return [
    // An arrow clue must contain a digit and be part of a 3x3 region.
    new Given(state.at(cell), 1, 2, 3, 4, 5, 6, 7, 8, 9),
    new NFA(arrowNFA, `arrow-${cell}`, cell, ...state.at(ray)),
  ];
});

return [
  shape,
  state.toVar('cell state'),
  ...digitCells,
  ...acrossSteps,
  ...downSteps,
  ...edgeCodes,
  regionCount,
  ...regionDigits,
  ...rowsAndColumns,
  ...cages,
  ...arrows,
  // The loop cells form one orthogonally connected set.
  new ConnectedValues('VL', LOOP),
];
