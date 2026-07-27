// Title: Ho Ho Ho
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=7jTBwImMuz0
// Source: https://sudokupad.app/1w3s6u8q7d

// Normal sudoku rules apply (Shape's default row/column/box all-different).
//
// Blue line ("digits along a blue line must sum to the same total in each
// 3x3 box the line visits"): the three closed deepskyblue (#2ecbff) diamond
// loops, encoded with RegionSumLine. RegionSumLine has no built-in loop
// wraparound (only SumLine supports a trailing 'LOOP' marker), so each loop's
// cell list below is rotated to start where a box-visit begins, so that no
// single box's cells are split across the array's start/end boundary.
//
// Red line ("adjacent digits along a red line have a difference of at least
// six"): the salmon/coral (#f08767) branching lines -- the only other line
// colour drawn, so it is the rules' "red" line by elimination. Each is drawn
// (and stored) as three separate strokes meeting at shared branch cells;
// encoded per drawn stroke with Whisper(6, ...).
//
// Red cherry ("if digits are separated by a red cherry, one is double the
// other"): the three red (#f00f) edge-circle overlays, encoded as BlackDot
// (2:1 ratio) on the two cells straddling each marked edge.

// Cell lists below are transcribed from the puzzle's drawn lines and edge
// circle marks.
const blueLoops = [
  // Loop A: box3 (1 cell) + box6 (3 cells). The drawn order's wrap edge
  // (R4C9 -> R3C8) already crosses the box boundary, so no rotation needed.
  ['R3C8', 'R4C7', 'R5C8', 'R4C9'],
  // Loop B: box4 (1) + box8 (1) + box5 (2). The drawn order splits the box5
  // pair across the start/end (R5C4 ... R6C5); rotated to start at R6C3 so
  // the box5 pair (R6C5, R5C4) stays contiguous.
  ['R6C3', 'R7C4', 'R6C5', 'R5C4'],
  // Loop C: box1 (1) + box2 (3). The drawn order splits the box2 run across
  // the start/end (R1C4 ... R3C4, R2C5); rotated to start at R2C3 so the
  // box2 run (R3C4, R2C5, R1C4) stays contiguous.
  ['R2C3', 'R3C4', 'R2C5', 'R1C4'],
];

const redStars = [
  // Star 1 (three strokes sharing branch cells R4C2 and R3C3).
  ['R3C1', 'R4C2', 'R5C3'],
  ['R4C2', 'R3C3', 'R4C4'],
  ['R3C3', 'R2C2'],
  // Star 2 (three strokes sharing branch cells R5C7 and R6C6).
  ['R4C6', 'R5C7', 'R6C8'],
  ['R5C7', 'R6C6', 'R7C7'],
  ['R6C6', 'R5C5'],
  // Star 3 (three strokes sharing branch cells R7C3 and R8C2).
  ['R6C2', 'R7C3', 'R8C4'],
  ['R7C3', 'R8C2', 'R9C3'],
  ['R8C2', 'R7C1'],
];

const cherryDots = [
  ['R7C7', 'R8C7'],
  ['R6C9', 'R7C9'],
  ['R4C7', 'R5C7'],
];

return [
  new Shape('9x9'),
  ...blueLoops.map(cells => new RegionSumLine(...cells)),
  ...redStars.map(cells => new Whisper(6, ...cells)),
  ...cherryDots.map(cells => new BlackDot(...cells)),
];
