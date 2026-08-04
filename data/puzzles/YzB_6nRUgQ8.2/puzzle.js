// Title: Feb. 20, 2023: Position Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=YzB_6nRUgQ8
// Source: https://tinyurl.com/5n74rhay

// Normal sudoku rules apply (rows, columns, boxes all-different, the ISS
// default). Twelve outside clues sit above/below a column or left/right of
// a row. Each clue value is the position, counted inward from the clue's
// edge, of the largest of the three cells nearest that edge in that
// row/column (position 1 = the cell nearest the clue). Rows/columns are
// already all-different, so no tie among the three cells is possible.

const givens = [
  new Given('R1C3', 8), new Given('R1C7', 6),
  new Given('R2C2', 2), new Given('R2C8', 8),
  new Given('R3C1', 4), new Given('R3C9', 3),
  new Given('R4C4', 5), new Given('R4C6', 6),
  new Given('R6C4', 7), new Given('R6C6', 3),
  new Given('R7C1', 7), new Given('R7C9', 8),
  new Given('R8C2', 4), new Given('R8C8', 3),
  new Given('R9C3', 6), new Given('R9C7', 5),
];

// NFA over an ordered 3-cell window: tracks the running max and the step
// (1-3) at which it was last set, and accepts when that step equals
// `position`. Bounded to exactly 3 symbols, so no state blowup.
const makePositionNFA = (position) => NFA.encodeSpec({
  startState: { max: 0, pos: 0, step: 0 },
  transition: ({ max, pos, step }, value) => {
    const newStep = step + 1;
    return value > max
      ? { max: value, pos: newStep, step: newStep }
      : { max, pos, step: newStep };
  },
  accept: (state) => state.pos === position,
  maxDepth: 3,
}, /* numValues= */ 9);
const positionNFA = { 1: makePositionNFA(1), 2: makePositionNFA(2), 3: makePositionNFA(3) };

// Outside position clues, transcribed from the payload's `text` overlay
// entries (fpuzzles border coordinates: R0/R10 above/below the grid,
// C0/C10 left/right of it). Each entry is [row-or-column index, clue value].
const topClues = [[1, 1], [9, 1]];
const bottomClues = [[1, 3], [4, 2], [6, 2], [9, 2]];
const leftClues = [[1, 2], [5, 2], [9, 2]];
const rightClues = [[1, 2], [5, 3], [9, 3]];

const topNFAs = topClues.map(([c, v]) =>
  new NFA(positionNFA[v], 'PosTop', makeCellId(1, c), makeCellId(2, c), makeCellId(3, c)));
const bottomNFAs = bottomClues.map(([c, v]) =>
  new NFA(positionNFA[v], 'PosBottom', makeCellId(9, c), makeCellId(8, c), makeCellId(7, c)));
const leftNFAs = leftClues.map(([r, v]) =>
  new NFA(positionNFA[v], 'PosLeft', makeCellId(r, 1), makeCellId(r, 2), makeCellId(r, 3)));
const rightNFAs = rightClues.map(([r, v]) =>
  new NFA(positionNFA[v], 'PosRight', makeCellId(r, 9), makeCellId(r, 8), makeCellId(r, 7)));

return [
  new Shape('9x9'),
  ...givens,
  ...topNFAs,
  ...bottomNFAs,
  ...leftNFAs,
  ...rightNFAs,
];
