// Title: Parity Tic-Tac-Toe
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=wMq4uOtyakg
// Source: https://sudokupad.app/11dz689p6l

// Normal sudoku rules apply. White dots mark orthogonally adjacent cells
// whose digits are consecutive; black dots mark orthogonally adjacent cells
// in a 1:2 ratio.
//
// Todd places odd digits, Steven places even digits (they aren't drawn
// givens -- every digit's "player" is just its parity). A player claims a
// 3x3 box by completing a straight line of three cells of their parity
// within it (3 rows, 3 columns, 2 diagonals -- 8 candidate lines per box),
// while the opponent completes none; every box must have such a definitive
// claimant. Reading the 9 boxes as their own 3x3 grid (reading order), a
// player wins the overall game by claiming a straight line of three boxes,
// while the opponent claims no such line; the overall game also has a
// definitive winner. Both levels use the same win-or-not evaluation, so one
// NFA spec factory (below) is shared by both. The 9 boxes split 4-5 between
// the two players ("a very close game").

const graph = cellGraph();

// The 8 lines (3 rows, 3 columns, 2 diagonals) of a 3x3 grid of `at`
// values, by local (row, col).
function gridLines(at) {
  const lines = [];
  for (let r = 0; r < 3; r++) lines.push([at(r, 0), at(r, 1), at(r, 2)]);
  for (let c = 0; c < 3; c++) lines.push([at(0, c), at(1, c), at(2, c)]);
  lines.push([at(0, 0), at(1, 1), at(2, 2)]);
  lines.push([at(0, 2), at(1, 1), at(2, 0)]);
  return lines;
}

// Index form of the 8 lines over a 9-long row-major sequence (used for both
// a box's own 9 cells and the 9-box meta-grid, read in the same order).
const LINE_INDEXES = gridLines((r, c) => 3 * r + c);

// From a row-major sequence of 9 symbols (1 = Todd/odd, 2 = Steven/even),
// the unique claimant: 1 or 2 if exactly one symbol completes a line and the
// other does not, else null (no definitive winner -- both or neither do).
function lineWinner(seq) {
  const hasLine = sym => LINE_INDEXES.some(line => line.every(i => seq[i] === sym));
  const oddWins = hasLine(1), evenWins = hasLine(2);
  return oddWins === evenWins ? null : (oddWins ? 1 : 2);
}

// An NFA spec reading 9 `toSymbol`-mapped cells followed by a trailing claim
// cell (restricted elsewhere to {1, 2}): accepts iff the claim cell equals
// the sequence's unique line winner, rejecting outright when the 9 cells
// have no definitive winner. `seq` grows to length 9 then the transition
// switches to checking the trailing cell; states are small (bounded by the
// 2^9 possible symbol sequences), well under the NFA state cap.
function makeGameSpec(toSymbol) {
  return NFA.encodeSpec({
    startState: { seq: [] },
    transition: (state, value) => {
      if (state.seq.length < 9) return { seq: [...state.seq, toSymbol(value)] };
      const winner = lineWinner(state.seq);
      if (winner === null || value !== winner) return undefined;
      return { seq: state.seq, done: true };
    },
    accept: (state) => state.done === true,
  }, 9);
}

// Symbol is the cell digit's parity: 1 = odd/Todd, 2 = even/Steven. Box-claim
// and winner cells are always 1 or 2 by construction (Given below), and
// parity maps those the same way (1 is odd, 2 is even), so the meta level
// reuses this spec unchanged. Compiling on parity rather than the raw digit
// also keeps the NFA's state count bounded regardless of which claim value
// a state explores at compile time.
const gameSpec = makeGameSpec(v => (v % 2 === 1) ? 1 : 2);

// One claim Var per box, box n's claim at claimCells[n - 1] -- box numbering
// and cell order follow graph.box(n) (1-based, reading order; 9 cells
// row-major within the box), matching gridLines' (row, col) convention.
const claimVar = new Var('C', 'box claim: 1 = Todd (odd), 2 = Steven (even)', 9);
const claimCells = claimVar.cells();

const boxGameNFAs = Array.from({ length: 9 }, (_, i) => new NFA(
  gameSpec, `boxGame${i + 1}`, ...graph.box(i + 1), claimCells[i],
));

// Overall winner Var: 1 = Todd (odd) wins the multi-box game, 2 = Steven
// (even) wins.
const winnerVar = new Var('W', 'overall winner: 1 = Todd (odd), 2 = Steven (even)', 1);
const winnerCell = winnerVar.cells()[0];

const metaGameNFA = new NFA(
  gameSpec, 'metaGame', ...claimCells, winnerCell,
);

// Kropki dot pairs below are transcribed from the drawn edge marks: solid
// black-filled dots are BlackDot (ratio); white-filled black-bordered dots
// are WhiteDot (consecutive).

const blackDots = [
  ['R5C4', 'R5C5'],
  ['R5C5', 'R5C6'],
  ['R5C2', 'R5C3'],
  ['R4C9', 'R5C9'],
  ['R1C8', 'R2C8'],
  ['R8C5', 'R9C5'],
  ['R8C2', 'R9C2'],
];

const whiteDots = [
  ['R4C4', 'R5C4'],
  ['R5C4', 'R6C4'],
  ['R1C9', 'R2C9'],
  ['R2C9', 'R3C9'],
  ['R3C7', 'R3C8'],
  ['R3C8', 'R3C9'],
  ['R5C1', 'R5C2'],
  ['R4C7', 'R5C7'],
  ['R8C9', 'R9C9'],
  ['R8C8', 'R8C9'],
  ['R7C8', 'R8C8'],
  ['R2C5', 'R3C5'],
  ['R3C5', 'R3C6'],
  ['R2C6', 'R3C6'],
  ['R1C4', 'R1C5'],
];

return [
  new Shape('9x9'),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),

  claimVar,
  ...claimCells.map(id => new Given(id, 1, 2)),
  ...boxGameNFAs,

  // "It's a very close game, with one player claiming four boxes and the
  // other claiming five": a 4-5 split of the 9 claims, either way round.
  // Sum of claim values (1 = Todd, 2 = Steven) is 4*1+5*2=14 or 5*1+4*2=13;
  // every other split gives a different total (9, 10, ..., 18).
  new Or([new Sum(13, ...claimCells), new Sum(14, ...claimCells)]),

  winnerVar,
  new Given(winnerCell, 1, 2),
  metaGameNFA,
];
