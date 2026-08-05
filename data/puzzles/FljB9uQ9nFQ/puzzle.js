// Title: Subtle advertisement
// Author: sunnyjum
// Video: https://www.youtube.com/watch?v=FljB9uQ9nFQ
// Source: https://app.crackingthecryptic.com/sudoku/gp8DLMT7Qt

// Standard 6x6 Sudoku; cages, arrows, thermometer, dots, X, palindrome,
// odd circles, indicated diagonals, X-Sum, and the white quadruple circle.
const geometry = cellGeometry('6x6');
const graph = cellGraph(geometry);

// Cage cell lists and totals are transcribed from the drawn cage outlines.
const cages = [
  new Cage(12, 'R1C2', 'R2C2', 'R2C1'),
  new Cage(15, 'R4C2', 'R4C4', 'R4C6', 'R4C3', 'R4C5'),
  new Cage(9, 'R5C1', 'R5C2'),
  new AllDifferent('R5C3', 'R5C4'),
];

return [
  new Shape('6x6'),
  new Given('R1C2', 3),
  ...cages,
  new Arrow('R4C6', 'R3C5', 'R2C4'),
  new Thermo('R5C4', 'R6C5', 'R5C6'),
  new Palindrome('R4C4', 'R3C5', 'R2C6'),
  new Given('R2C1', 1, 3, 5),
  new Given('R3C6', 1, 3, 5),
  LittleKiller.fromCells(10, graph.ray('R5C1', 1, 1), geometry),
  XSum.fromCells(6, graph.ray('R6C1', -1, 0), geometry),
  new WhiteDot('R2C1', 'R2C2'),
  new BlackDot('R3C2', 'R3C3'),
  new X('R2C2', 'R2C3'),
  // The drawn white circle gives these four digits for its surrounding 2x2.
  new Quad('R5C3', 1, 2, 3, 4),
];
