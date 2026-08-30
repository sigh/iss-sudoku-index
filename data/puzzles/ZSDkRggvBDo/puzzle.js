// Title: Take Five
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ZSDkRggvBDo
// Source: https://cracking-the-cryptic.web.app/sudoku/LTh4Nh2fqT

// Normal Sudoku rules apply: each row, column and 3x3 box contains 1-9 once.
// The grid has no givens, and no clue is drawn inside it.
//
// Take Five: the five digits printed beside a row or column appear in that row
// or column in the printed order, reading away from the clue -- left to right
// for a row clue, top to bottom for a column clue. They need not be adjacent;
// the lane's other four digits may sit anywhere among and around them.
//
// The puzzle prints no rules text anywhere -- the rule is stated only in the
// video -- so the sentence above is a reading, not a quotation. It is the one
// encoded here; the other candidate readings are listed in the description.

// The eighteen drawn margin boxes, transcribed in grid order: ROW_CLUES[i] is
// the box left of row i+1 read left to right, COL_CLUES[j] the box above
// column j+1 read top to bottom.
const ROW_CLUES = [
  [1, 2, 8, 9, 6],
  [6, 9, 2, 3, 1],
  [6, 5, 8, 7, 4],
  [6, 3, 2, 1, 5],
  [4, 9, 1, 6, 8],
  [8, 4, 6, 7, 3],
  [8, 3, 6, 2, 7],
  [7, 6, 2, 5, 4],
  [5, 9, 4, 6, 8],
];
const COL_CLUES = [
  [7, 6, 9, 3, 2],
  [4, 3, 6, 8, 9],
  [9, 3, 5, 4, 6],
  [6, 4, 5, 1, 7],
  [7, 2, 6, 3, 9],
  [3, 1, 8, 5, 7],
  [9, 2, 8, 1, 6],
  [5, 3, 7, 9, 2],
  [6, 4, 5, 9, 3],
];

// One machine per clue, scanning its lane in the clue's reading direction.
// State `k` is how many clue digits have been matched so far, in order; a cell
// holding the next unmatched clue digit advances k, any other cell leaves it
// unchanged. Matching the next clue digit greedily (no branch that declines it)
// loses no lanes: of all embeddings of a subsequence, the leftmost-greedy one
// exists whenever any does. The lane is accepted once all five are matched.
const subsequenceSpec = (clue) => NFA.encodeSpec({
  startState: { k: 0 },
  transition: ({ k }, v) => (k < clue.length && v === clue[k]) ? { k: k + 1 } : { k },
  accept: ({ k }) => k === clue.length,
}, 9);

const rowCells = (row) => [...Array(9).keys()].map((i) => makeCellId(row, i + 1));
const colCells = (col) => [...Array(9).keys()].map((i) => makeCellId(i + 1, col));

const rowClues = ROW_CLUES.map(
  (clue, i) => new NFA(subsequenceSpec(clue), `take-five R${i + 1}`, rowCells(i + 1)));
const colClues = COL_CLUES.map(
  (clue, j) => new NFA(subsequenceSpec(clue), `take-five C${j + 1}`, colCells(j + 1)));

return [
  new Shape('9x9'),
  ...rowClues,
  ...colClues,
];
