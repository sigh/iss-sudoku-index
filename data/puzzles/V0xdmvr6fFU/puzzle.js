// Title: Frame Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=V0xdmvr6fFU
// Source: https://app.crackingthecryptic.com/L9GP786JPb

// Normal sudoku: 1-9 once each in every row, column, and 3x3 box (default
// Shape('9x9') boxes match the payload's regions array). No given digits.
//
// Each outside-grid clue gives the sum of the three cells nearest that edge
// of the row or column it labels (rules: "the sum of the first three cells
// in that row or column starting from the position of the clue"). The 36
// clue tables below are transcribed from the 36 outside-grid clue labels
// (nine per side), one sum per row-end and one per column-end.

const rowClues = [
  // [row, left-3-sum, right-3-sum] -- left/right overlay pairs by row
  [1, 20, 18], [2, 12, 12], [3, 13, 15], [4, 18, 19], [5, 11, 12],
  [6, 16, 14], [7, 18, 19], [8, 12, 13], [9, 15, 13],
];

const colClues = [
  // [col, top-3-sum, bottom-3-sum] -- top/bottom overlay pairs by column
  [1, 17, 22], [2, 14, 13], [3, 14, 10], [4, 15, 16], [5, 14, 15],
  [6, 16, 14], [7, 10, 22], [8, 21, 16], [9, 14, 7],
];

const rowSums = rowClues.flatMap(([r, left, right]) => [
  new Sum(left, makeCellId(r, 1), makeCellId(r, 2), makeCellId(r, 3)),
  new Sum(right, makeCellId(r, 9), makeCellId(r, 8), makeCellId(r, 7)),
]);

const colSums = colClues.flatMap(([c, top, bottom]) => [
  new Sum(top, makeCellId(1, c), makeCellId(2, c), makeCellId(3, c)),
  new Sum(bottom, makeCellId(9, c), makeCellId(8, c), makeCellId(7, c)),
]);

return [
  new Shape('9x9'),
  ...rowSums,
  ...colSums,
];
