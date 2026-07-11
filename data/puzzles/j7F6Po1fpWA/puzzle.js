// Title: Entropic islands
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=j7F6Po1fpWA
// Source: https://sudokupad.app/1l8hcd2k4v

// Normal sudoku rules apply.
//
// White dots: digits separated by a white dot are consecutive.
// Black dots: digits separated by a black dot have a 2:1 ratio.
//
// Omitted: digits are grouped into entropic sets (Low 1-3, Mid 4-6,
// High 7-9). A digit placed in a circle gives the size of the orthogonally
// connected group of cells, all sharing its entropic set, that contains it
// (14 circled cells, no digits given). This is a global "clue equals the
// size of its own discovered connected component" rule over an unknown
// partition of the grid into same-entropic-set islands; ISS has no
// primitive for discovering such a partition and tying an island's size
// back to a member cell's own digit, so it is left unencoded here.

return [
  new Shape('9x9'),

  new BlackDot('R2C1', 'R3C1'),
  new BlackDot('R5C8', 'R6C8'),
  new BlackDot('R5C3', 'R5C4'),
  new WhiteDot('R2C5', 'R3C5'),
];
