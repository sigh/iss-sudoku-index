// Title: Coloured Circles Sudoku
// Author: Andrew Taylor
// Video: https://www.youtube.com/watch?v=h-P1VUEDdyc
// Source: https://cracking-the-cryptic.web.app/sudoku/8jGtfQgjNG

// Standard sudoku rules apply: 1-9 once each per row, column and 3x3 box. The
// nine regions the board draws are the nine standard boxes, which the default
// 9x9 shape already supplies.
//
// The board also shades 60 of its 81 cells in five visible colours, laid out as
// concentric diamond rings around R5C5 (see the description). The source states
// no rule about those colours - it carries no rules text at all - so no
// colour-keyed rule is encoded here. That omission is why six givens are left to
// pin the grid on their own, and they do not.
//
// Givens, transcribed from the six cells the board prints a digit in.
return [
  new Shape('9x9'),

  new Given('R3C2', 4),
  new Given('R5C5', 5),
  new Given('R5C6', 8),
  new Given('R6C5', 1),
  new Given('R6C6', 6),
  new Given('R8C2', 7),
];
