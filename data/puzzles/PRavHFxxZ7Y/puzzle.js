// Title: House of Cards
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=PRavHFxxZ7Y
// Source: https://sudokupad.app/nam4l5oykp

// Rules encoded here:
//   - Normal 6x6 sudoku: 1-6 once each per row, column and 2x3 box.
//   - Each cage sum is the same, and digits may repeat within a cage.
//   - Digits in cells separated by a gold dot are not consecutive.
// Omitted: the skyscraper clues in the ring of cells around the grid. Each of
//   those 24 cells is blank, so there is no clue value to encode.
//
// Coordinates are the 6x6 playing grid; the drawn canvas is 8x8 with the board
// inset by one cell of skyscraper-clue margin on every side.

// ISS's default boxes for a 6x6 grid are 2 rows by 3 columns, which is the box
// layout the rules name and the payload lists.
const shape = new Shape('6x6');
const at = (r, c) => makeCellId(r, c);

// The four dashed cage outlines drawn inside the 6x6.
const cageCells = [
  [[1, 2], [1, 3], [2, 2]],
  [[2, 3], [2, 4], [2, 5]],
  [[4, 2], [4, 3], [5, 2], [5, 3]],
  [[2, 6], [3, 6], [4, 6]],
].map(cells => cells.map(rc => at(...rc)));

// No cage carries a printed total, and the rules give only the equality, so the
// shared value stays unknown: EqualSum ties the four totals to each other
// without naming one. It is also the sum-style reading the rules ask for --
// a Cage would additionally force the cells apart, which "digits may repeat
// within a cage" rules out.
const equalCageSums = new EqualSum(...cageCells);

// The single gold dot sits on the r3c1|r3c2 edge.
const goldDot = new Pair(
  Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, shape),
  'gold dot: not consecutive',
  at(3, 1), at(3, 2));

return [shape, equalCageSums, goldDot];
