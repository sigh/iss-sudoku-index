// Title: Alien X-Sums
// Author: Christoph Seeliger & The Friendly Aliens
// Video: https://www.youtube.com/watch?v=2CHe1BVE1p8
// Source: https://app.crackingthecryptic.com/sudoku/8DMFt79hNB

// Standard 9x9 Sudoku rules apply. Each outside X-Sum reads 1000 in an
// unknown base. An X-Sum is at most 45, so 1000 can be decimal 8 (base 2) or
// 27 (base 3); each clue is one of those two values. The in-grid 1000 text
// marks have no stated X-Sum geometry and are omitted.
const geometry = cellGeometry('9x9');
const clueCells = (axis, index, direction) => Array.from({length: 9}, (_, offset) => (
  axis === 'C'
    ? makeCellId(direction > 0 ? offset + 1 : 9 - offset, index)
    : makeCellId(index, direction > 0 ? offset + 1 : 9 - offset)
));
const xSum = (axis, index, direction) => {
  const cells = clueCells(axis, index, direction);
  return new Or([
    XSum.fromCells(8, cells, geometry),
    XSum.fromCells(27, cells, geometry),
  ]);
};

return [
  new Shape('9x9'),
  // Outside 1000 labels transcribed from the drawn clue lanes.
  xSum('C', 1, 1), xSum('C', 5, 1), xSum('C', 9, 1),
  xSum('R', 5, -1), xSum('R', 7, -1), xSum('R', 8, -1),
  xSum('C', 1, -1), xSum('C', 2, -1), xSum('C', 3, -1), xSum('C', 4, -1), xSum('C', 5, -1),
  xSum('R', 1, 1), xSum('R', 9, 1),
];
