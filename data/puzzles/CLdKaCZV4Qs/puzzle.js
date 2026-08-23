// Title: Crosswalk
// Author: grkles
// Video: https://www.youtube.com/watch?v=CLdKaCZV4Qs
// Source: https://app.crackingthecryptic.com/sudoku/6HqJL2Mpjd
//
// Normal sudoku rules apply (standard rows/cols/boxes, from the payload's
// 3x3 box regions). "Digits may not repeat along lines" is one AllDifferent
// per line, over its full cell run (regions=lines[].wayPoints, decoded to
// cell paths by the geometry helper). "Clues outside the grid give the sum
// of the digits in that row or column which are on lines" is one Sum per
// outside clue, over just the cells of that row/column that lie on some
// line (rows/columns with no clue overlay are unconstrained by this rule).

const lines = [
  ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'],
  ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8'],
  ['R3C5', 'R2C6', 'R1C7'],
  ['R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R5C7', 'R4C8', 'R3C9'],
  ['R5C3', 'R6C2', 'R7C1'],
  ['R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R7C5', 'R8C4', 'R9C3'],
];

// Outside clues: overlay center [row=-0.5, col] is a column clue (col is
// 0-indexed in the payload); center [row, col=-0.5] is a row clue. Cells
// below are each row/column's line cells, derived from `lines` above, not
// hand re-picked.
const onLineCellsInRow = (r) =>
  lines.flat().filter((id) => parseCellId(id).row === r);
const onLineCellsInCol = (c) =>
  lines.flat().filter((id) => parseCellId(id).col === c);

const colClues = [
  [1, 20],
  [2, 15],
  [3, 23],
  [5, 17],
  [8, 24],
];
const rowClues = [
  [2, 10],
  [4, 27],
  [5, 11],
  [6, 17],
  [7, 17],
];

return [
  new Shape('9x9'),
  ...lines.map((cells) => new AllDifferent(...cells)),
  ...colClues.map(
    ([c, total]) => new Sum(total, ...onLineCellsInCol(c))
  ),
  ...rowClues.map(
    ([r, total]) => new Sum(total, ...onLineCellsInRow(r))
  ),
];
