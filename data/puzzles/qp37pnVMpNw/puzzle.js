// Title: A Killer Skyscraper
// Author: Laura Soler
// Video: https://www.youtube.com/watch?v=qp37pnVMpNw
// Source: https://cracking-the-cryptic.web.app/sudoku/LjD3JbHLTF

// Standard 9x9 sudoku (rows, columns, boxes; the payload's `regions` are the
// ordinary nine 3x3 boxes) plus the 4 givens and the 12 killer cages (`Cage`:
// distinct digits summing to the shown total) whose drawn cells lie entirely
// within the 9x9 grid.
//
// The payload draws 13 further cages that each have one or more cells in a
// 1-cell margin surrounding the grid on every side. No clue value of any
// kind is drawn in that margin (no rules text exists for this puzzle at
// all), so what the margin cells are -- extra digit cells feeding those
// cages' totals, or purely decorative overflow forming the titular skyline
// shape -- cannot be told from the payload. Those 13 cages and whatever
// "skyscraper" mechanic the title implies are omitted.

const givens = [
  new Given('R3C3', 9),
  new Given('R3C7', 8),
  new Given('R7C3', 1),
  new Given('R7C7', 7),
];

// The 12 drawn killer cages whose cells lie entirely inside the 9x9 grid.
const cages = [
  new Cage(30, 'R2C3', 'R3C3', 'R3C4', 'R2C4'),
  new Cage(15, 'R1C5', 'R2C5', 'R3C5', 'R3C6', 'R2C6'),
  new Cage(31, 'R3C7', 'R4C7', 'R4C8', 'R3C8', 'R3C9', 'R4C9'),
  new Cage(28, 'R4C6', 'R5C6', 'R5C7', 'R6C7'),
  new Cage(14, 'R5C8', 'R6C8'),
  new Cage(13, 'R7C7', 'R7C8', 'R8C7', 'R8C8'),
  new Cage(15, 'R4C1', 'R4C2'),
  new Cage(18, 'R4C3', 'R4C4', 'R4C5', 'R5C4', 'R5C5'),
  new Cage(32, 'R6C5', 'R6C6', 'R7C5', 'R7C6', 'R8C5'),
  new Cage(21, 'R6C4', 'R7C4', 'R8C3', 'R8C4'),
  new Cage(22, 'R5C2', 'R5C3', 'R6C2', 'R6C3', 'R7C2', 'R7C3'),
  new Cage(25, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
];
