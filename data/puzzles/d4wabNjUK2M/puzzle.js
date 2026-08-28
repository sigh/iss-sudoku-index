// Title: Tic-Tac-Toe Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=d4wabNjUK2M
// Source: https://cracking-the-cryptic.web.app/sudoku/GF9LpggQ8R

// Standard sudoku (rows, columns and boxes each hold 1-9 once) plus the meta
// rule, taken from the video description since this source carries no rules
// text of its own (single-puzzle video naming and linking this exact source):
// "Each cell in the central 3x3 box maps to a box in the larger grid, and
// shares parity (odd/even) with the winning tic-tac-toe line in that box. No
// 3x3 box can have both a line of three even digits and one of three odd
// digits." A box's tic-tac-toe "lines" are its 3 rows, 3 columns and 2
// diagonals (8 total, the standard tic-tac-toe win conditions). The
// central-box cell at meta-position (bi, bj) maps to the grid box at
// position (bi, bj) by spatial correspondence (top-left cell <-> top-left
// box, ...); box 5's own centre cell therefore maps to box 5 itself.

const numValues = 9;
const SEQ_LEN = 10; // 9 box cells + 1 mapped central-box cell (box 5 repeats its own centre)

// Line indices into a box's 9 cells, read row-major (p0..p8).
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],           // diagonals
];

// One state machine, shared by all 9 boxes: read the box's 9 cells in
// row-major order, then its mapped central-box cell. State packs the parity
// bits seen so far (1 = odd, 0 = even), MSB-first: state = state*2 +
// value%2. maxDepth bounds the otherwise-unbounded doubling to exactly the
// 10 symbols each instance reads. accept() unpacks the 10 bits and checks
// the rule: (a) no box has both an all-even line and an all-odd line among
// its 8 lines, and (b) the mapped central cell's parity matches at least one
// of the box's monochrome lines (its "winning" line).
const ticTacToeParitySpec = NFA.encodeSpec({
  startState: 0,
  transition: (state, value) => state * 2 + (value % 2),
  accept: (state) => {
    const bits = [];
    for (let i = SEQ_LEN - 1; i >= 0; i--) bits.push((state >> i) & 1);
    const box = bits.slice(0, 9);
    const central = bits[9];
    let hasEvenLine = false, hasOddLine = false;
    for (const line of LINES) {
      const parities = line.map(i => box[i]);
      if (parities.every(p => p === 0)) hasEvenLine = true;
      if (parities.every(p => p === 1)) hasOddLine = true;
    }
    const noBothParities = !(hasEvenLine && hasOddLine);
    const centralMatchesAWinningLine = central === 1 ? hasOddLine : hasEvenLine;
    return noBothParities && centralMatchesAWinningLine;
  },
  maxDepth: SEQ_LEN,
}, numValues);

const boxTicTacToeParity = [];
for (let bi = 0; bi < 3; bi++) {
  for (let bj = 0; bj < 3; bj++) {
    const boxCells = [];
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        boxCells.push(makeCellId(3 * bi + dr + 1, 3 * bj + dc + 1));
      }
    }
    const centralCell = makeCellId(4 + bi, 4 + bj);
    boxTicTacToeParity.push(
      new NFA(ticTacToeParitySpec, `box${3 * bi + bj + 1}`, ...boxCells, centralCell));
  }
}

return [
  new Shape('9x9'),
  // Givens.
  new Given('R1C1', 7), new Given('R1C3', 4), new Given('R1C7', 2), new Given('R1C9', 3),
  new Given('R3C1', 8), new Given('R3C4', 7), new Given('R3C6', 9), new Given('R3C9', 6),
  new Given('R4C3', 1), new Given('R4C7', 5),
  new Given('R5C1', 2), new Given('R5C9', 8),
  new Given('R6C1', 5), new Given('R6C3', 3), new Given('R6C7', 9), new Given('R6C9', 4),
  new Given('R8C4', 5), new Given('R8C6', 2),
  new Given('R9C2', 2), new Given('R9C3', 6), new Given('R9C5', 7), new Given('R9C7', 4), new Given('R9C8', 5),
  ...boxTicTacToeParity,
];
