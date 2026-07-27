// Title: 2024-09-12:PB and Chip
// Author: Chip Sounder
// Video: https://www.youtube.com/watch?v=WFyd_OtuVI4
// Source: https://sudokupad.app/duy38j7tv8

// Standard 6x6 sudoku (rows, columns, and 2x3 boxes -- the default box tiling
// for a 6x6 Shape), plus:
// Little Killer: each off-grid diagonal arrow sums the digits along the
// indicated diagonal.
// Sandwich: each off-grid clue sums the digits strictly between the 1 and the
// 6 in its row/column.
// Kropki: black dots mark a 1:2 ratio, white dots mark consecutive digits;
// the rules state not all possible dots are given, so only the drawn dots
// are constrained (no StrictKropki).
// There are no given digits in this puzzle -- the clues above are the only
// constraints beyond standard sudoku.

const geometry = cellGeometry(6);
const graph = cellGraph(6);

// Diagonal rays walked from each drawn arrow's first in-grid cell to the
// grid edge, matching the drawn arrows' cells.
const littleKillers = [
  LittleKiller.fromCells(15, graph.ray('R2C1', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(14, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R4C6', 1, -1), geometry),
];

// Off-grid clue at R2C7 sits to the right of row 2; off-grid clue at R7C3
// sits below column 3.
const sandwiches = [
  Sandwich.fromCells(0, graph.row(2), geometry),
  Sandwich.fromCells(7, graph.column(3), geometry),
];

const whiteDots = [
  new WhiteDot('R6C3', 'R6C2'),
  new WhiteDot('R6C2', 'R6C1'),
];

const blackDots = [
  new BlackDot('R3C6', 'R4C6'),
  new BlackDot('R3C4', 'R4C4'),
];

return [
  new Shape('6x6'),
  ...littleKillers,
  ...sandwiches,
  ...whiteDots,
  ...blackDots,
];
