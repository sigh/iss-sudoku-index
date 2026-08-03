// Title: Arrows Dilemma
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=IqJGm62Rn80
// Source: https://app.crackingthecryptic.com/sudoku/mjGqjGPHM7

// Exactly six digits from 1-9 fill the 6x6 grid, once each per row, column
// and box (standard default 2x3 box tiling); the solver determines which
// six digits are in play. Digits along an arrow sum to the digit in that
// arrow's circle. Three arrows share the circle at R4C3, each an
// independent sum constraint back to that one cell; the other four
// circles each carry a single arrow. Arrow cell lists are transcribed from
// the drawn arrow/circle waypoints.

const arrows = [
  new Arrow('R4C3', 'R3C4', 'R2C4', 'R1C4'),
  new Arrow('R4C3', 'R5C3', 'R6C3'),
  new Arrow('R4C3', 'R3C2', 'R3C1'),
  new Arrow('R4C6', 'R3C5', 'R2C5'),
  new Arrow('R5C6', 'R6C5', 'R6C4'),
  new Arrow('R6C1', 'R6C2', 'R5C2', 'R4C1'),
  new Arrow('R2C1', 'R1C2', 'R2C3'),
];

return [
  // Widen the alphabet to 1-9 while keeping the 6-cell rows/columns/boxes;
  // RegionSameValues makes every row, column and box agree on one unknown
  // 6-digit subset of 1-9.
  new Shape('6x6', 9),
  new RegionSameValues(),
  ...arrows,
];
