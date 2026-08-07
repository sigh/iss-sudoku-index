// Title: Nontuple Dutch
// Author: Tomato Pie
// Video: https://www.youtube.com/watch?v=Jjoim82Puns
// Source: https://sudokupad.app/Q6HfJRFj4r

// Rules encoded here:
//   Normal sudoku (no givens).
//   Adjacent digits along an orange line differ by at least 4.
//   Digits are skyscraper heights; an outside clue counts the skyscrapers
//     visible from that side, taller ones hiding shorter ones.
//   Digits on an arrow sum to the digit in its circle (repeats allowed).
//   An inequality symbol between two digits points at the smaller one.
//   A digit in a grey square is even.
// The closing "P.S." tells the solver that the orange lines also satisfy two
// unnamed variant line types. It asserts a property the lines already have
// rather than adding one, so it contributes no constraint; nothing is omitted.

const geometry = cellGraph('9x9').gridGeometry();
const row = (r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => makeCellId(r, c));

// Drawn data: nine orange strokes, one per row, each spanning C1-C9.
const orangeLines = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
  (r) => new Whisper(4, ...row(r)));

// Drawn data: six labels one cell outside the grid, beside rows 1-3 on both
// sides -- left ">1", "3", "2" and right ">1", "3", "2" (top to bottom).
// A clue's cells run away from it, so the left clue for row r reads C1->C9 and
// the right clue reads C9->C1.
const skyscraper = (value, r, fromLeft) =>
  Skyscraper.fromCells(
    value, fromLeft ? row(r) : row(r).slice().reverse(), geometry);

// ">1" states an inequality on the count rather than a count, which Skyscraper
// takes as a fixed value; the disjunction covers every count above 1, and 9
// cells can show at most 9 skyscrapers.
const atLeastTwoVisible = (r, fromLeft) =>
  new Or([2, 3, 4, 5, 6, 7, 8, 9].map((v) => skyscraper(v, r, fromLeft)));

return [
  new Shape('9x9'),

  ...orangeLines,

  atLeastTwoVisible(1, true),
  atLeastTwoVisible(1, false),
  skyscraper(3, 2, true),
  skyscraper(3, 2, false),
  skyscraper(2, 3, true),
  skyscraper(2, 3, false),

  // Drawn data: grey circle on R6C6 with a grey shaft running R6C6 -> R5C5 ->
  // R4C4, arrowhead at R4C4.
  new Arrow('R6C6', 'R5C5', 'R4C4'),

  // Drawn data: "^" on the R7C9/R8C9 edge, "v" on the R8C9/R9C9 edge, "<" on
  // the R9C8/R9C9 edge. GreaterThan lists the larger cell first.
  new GreaterThan('R8C9', 'R7C9'),
  new GreaterThan('R8C9', 'R9C9'),
  new GreaterThan('R9C9', 'R9C8'),

  // Drawn data: grey square shading on R8C9.
  new Given('R8C9', 2, 4, 6, 8),
];
