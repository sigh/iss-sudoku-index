// Title: Grouping All but Two
// Author: Sneppix
// Video: https://www.youtube.com/watch?v=ktjNaziMZIg
// Source: https://sudokupad.app/28d8kmh1jf

// Normal sudoku rules apply.
//
// White dots: digits separated by a white dot are consecutive
// (not all dots are given).
//
// Omitted: the grid is divided (except for R9C7 and R9C9) into orthogonally
// connected groups, each containing exactly one white-circle cell whose
// digit N is both the group's size and the shared parity of every cell in
// the group. This is a global "component size/parity equals a discovered
// component's own clue cell" rule with unknown group shapes and unknown
// group count per cell; ISS has no primitive for discovering an unknown
// connected-component partition and tying each component's size/parity back
// to one of its own member cells, so it is left unencoded here.

return [
  new Shape('9x9'),

  new WhiteDot('R1C1', 'R1C2'),
  new WhiteDot('R1C8', 'R1C9'),
  new WhiteDot('R2C2', 'R3C2'),
  new WhiteDot('R2C8', 'R3C8'),
  new WhiteDot('R4C4', 'R4C5'),
  new WhiteDot('R6C7', 'R7C7'),
  new WhiteDot('R8C2', 'R8C3'),
];
