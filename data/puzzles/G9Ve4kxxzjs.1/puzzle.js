// Title: May 8, 2022: B1G3 X-Sums
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=G9Ve4kxxzjs
// Source: https://tinyurl.com/2h9jb83u

// 6x6 grid. Normal sudoku rules apply: default 6x6 grid with default
// row/column/box all-different (the drawn regions are the standard six 2x3
// boxes; the payload lists no jigsaw regions).
//
// X-Sum: the sum of the first X digits of a row/column, read starting from
// the digit adjacent to the outside clue and continuing away from it, where
// X is that adjacent digit itself.

// Given digits, transcribed from the payload's grid array (1-indexed
// rows/cols).
const GIVENS = [
  { row: 1, col: 1, value: 4 },
  { row: 3, col: 6, value: 6 },
  { row: 4, col: 1, value: 6 },
  { row: 4, col: 4, value: 5 },
  { row: 6, col: 6, value: 5 },
];

const geometry = cellGeometry('6x6');

// Outside X-Sum clues, transcribed from the payload's `text` overlay marks
// outside the playable grid (R0/R7/C0/C7 mark the margin ring around the
// 1-indexed R1-R6/C1-C6 grid).
const CLUES = [
  { axis: 'col', index: 4, from: 'start', target: 5 }, // above C4, reading down
  { axis: 'col', index: 3, from: 'end', target: 6 },   // below C3, reading up
  { axis: 'row', index: 3, from: 'start', target: 3 }, // left of R3, reading right
  { axis: 'row', index: 4, from: 'end', target: 3 },   // right of R4, reading left
];

// A lane's 6 cells, ordered starting from the clue's side.
const laneCells = ({ axis, index, from }) => Array.from({ length: 6 }, (_, i) => {
  const pos = from === 'start' ? i + 1 : 6 - i;
  return axis === 'col' ? makeCellId(pos, index) : makeCellId(index, pos);
});

const xSumClues = CLUES.map(clue => XSum.fromCells(clue.target, laneCells(clue), geometry));

return [
  new Shape('6x6'),
  ...GIVENS.map(g => new Given(makeCellId(g.row, g.col), g.value)),
  ...xSumClues,
];
