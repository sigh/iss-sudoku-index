// Title: Puzzle No. 472: Arrow-Skyscraper Hybrid Sudoku
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=sJwCehrHd3A
// Source: https://sudokupad.app/camq2k6xqo

// Normal Sudoku rules apply. Digits along each arrow sum to the digit in its
// circled cell; digits may repeat along an arrow.
//
// Omitted: the skyscraper outside-clue digits (no clue values are recoverable
// from the drawn puzzle -- no digit or count is present for any ring position),
// and 6 of the 10 arrows, whose drawn circle or entire arm lands in the 1-cell
// outer ring around the play grid (no play-grid cell exists there, so no digit
// can be summed/targeted).

// The source draws on an 11x11 canvas (1-cell outer ring + 9x9 play grid); cell
// ids below are already converted to the 9x9 play grid. Each entry starts with
// its circled bulb, followed by the arrow arm; ring-cell path points (drawn but
// outside the 9x9 play grid) are dropped.
const arrows = [
  ['R1C3', 'R2C2', 'R3C1', 'R5C1', 'R6C2', 'R7C3', 'R6C4'],
  ['R1C3', 'R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R2C5', 'R1C6', 'R1C8'],
  ['R8C3', 'R9C4', 'R9C6', 'R8C7'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  ...arrows,
];
