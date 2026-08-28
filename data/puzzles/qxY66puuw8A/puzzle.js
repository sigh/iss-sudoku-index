// Title: The Sudoku Decision Tree
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=qxY66puuw8A
// Source: https://cracking-the-cryptic.web.app/sudoku/6bbrTbm8BF

// Normal Sudoku rules apply. Digits along an arrow sum to the number in its
// circle; digits may repeat along an arrow. Five circles are single cells
// (Arrow); six are two-cell pills whose digits are read left to right as a
// two-digit total (PillArrow, pillSize 2). No givens.

const shape = new Shape('9x9');
const at = (r, c) => makeCellId(r, c);

// Single-cell bulb, then its arm (the five arrows with a plain circle
// spanning one cell).
const arrows = [
  [[2, 1], [2, 2], [1, 3]],
  [[4, 7], [3, 6], [2, 6], [1, 6]],
  [[5, 9], [6, 9], [7, 9]],
  [[4, 1], [3, 2], [3, 3]],
  [[7, 3], [7, 4], [7, 5], [8, 6]],
].map(line => new Arrow(...line.map(rc => at(...rc))));

// Two-cell pill (left, right), then its arm (the six arrows with a wide
// rounded circle spanning two adjacent cells).
const pillArrows = [
  [[[3, 2], [3, 3]], [[3, 4], [3, 5], [2, 5], [1, 5], [1, 4]]],
  [[[2, 8], [2, 9]], [[1, 9], [1, 8], [1, 7]]],
  [[[5, 3], [5, 4]], [[5, 2], [6, 2], [6, 1]]],
  [[[6, 1], [6, 2]], [[7, 1], [7, 2], [6, 3], [6, 4], [6, 5]]],
  [[[7, 1], [7, 2]], [[8, 3], [8, 4], [8, 5]]],
  [[[4, 2], [4, 3]], [[5, 4], [5, 5], [5, 6], [5, 7], [6, 8]]],
].map(([pill, arm]) => new PillArrow(
  2, ...pill.map(rc => at(...rc)), ...arm.map(rc => at(...rc))));

return [shape, ...arrows, ...pillArrows];
