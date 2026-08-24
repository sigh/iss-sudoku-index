// Title: ThermArrow Sudoku
// Author: Thomas Prestopnik
// Video: https://www.youtube.com/watch?v=1s56YKHMw78
// Source: https://app.crackingthecryptic.com/sudoku/BB37qrbDqq
//
// Normal sudoku rules apply, and digits increase along arrows, in the
// direction of the arrow, and sum to the 1- or 2-digit number in the circle
// or pill. 2-digit numbers always read left-to-right or downwards.
//
// Every circle/pill overlay in the payload carries no printed digit -- as in
// a standard Arrow Sudoku, its value is the digit(s) placed in the
// circle/pill cell(s) themselves (Arrow/PillArrow's first argument(s)).
// "Digits increase along arrows" is read as applying to the arm cells (the
// drawn line from bulb to arrowhead), not the circle/pill cells: the circle
// or pill supplies the target total, a separate quantity from the increasing
// run summed against it. Each arm is encoded as an Arrow/PillArrow sum plus a
// Thermo over the same arm cells, ordered bulb-to-tip to match "in the
// direction of the arrow".

const at = (r, c) => makeCellId(r, c);
const R = (...rc) => at(...rc);

// Circle-headed arrows: [bulb, ...arm (bulb-to-tip order)].
// Cells transcribed from the payload's `arrows` and `overlays` arrays
// (single-cell circle overlays paired to each arrow's bulb cell).
const circleArrows = [
  [[1, 1], [1, 2], [1, 3]],
  [[1, 7], [1, 8], [1, 9]],
  [[1, 7], [2, 7], [3, 7]],
  [[1, 9], [2, 9], [3, 9]],
  [[3, 6], [3, 5], [3, 4]],
  [[3, 2], [4, 3], [5, 4]],
  [[5, 4], [6, 4], [7, 4]],
  [[6, 5], [6, 4], [6, 3], [6, 2]],
  [[4, 7], [5, 7], [6, 7]],
  [[4, 9], [5, 8], [6, 7]],
].map(cells => cells.map(rc => R(...rc)));

// Pill-headed arrows: [[tensCell, onesCell], ...arm (pill-to-tip order)].
// Pill cell pairs transcribed from the payload's 2-cell rounded-rect
// overlays; tens/ones order follows "2-digit numbers always read
// left-to-right or downwards" against each pill's orientation.
const pillArrows = [
  [[[1, 5], [2, 5]], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5]],
  [[[2, 7], [2, 8]], [2, 6], [2, 5], [2, 4]],
  [[[4, 1], [4, 2]], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8], [4, 9]],
  [[[7, 8], [7, 9]], [7, 7], [7, 6], [7, 5]],
  [[[9, 6], [9, 7]], [9, 5], [9, 4], [9, 3], [9, 2]],
].map(([pill, ...arm]) => ({
  pill: pill.map(rc => R(...rc)),
  arm: arm.map(rc => R(...rc)),
}));

return [
  new Shape('9x9'),

  ...circleArrows.flatMap(([bulb, ...arm]) => [
    new Arrow(bulb, ...arm),
    new Thermo(...arm),
  ]),

  ...pillArrows.flatMap(({ pill, arm }) => [
    new PillArrow(2, ...pill, ...arm),
    new Thermo(...arm),
  ]),
];
