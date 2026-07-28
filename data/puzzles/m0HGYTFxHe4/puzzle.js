// Title: Renban Snakes
// Author: Chad
// Video: https://www.youtube.com/watch?v=m0HGYTFxHe4
// Source: https://sudokupad.app/kb9l12ce0e

// Normal Sudoku and the drawn white dot are encoded. The undisclosed Renban
// Snake routes, their digit-defined lengths, non-overlap, and Renban sets are
// omitted; fog and FOGLIGHT markings are UI-only reveal mechanics.
return [
  new Shape('9x9'),
  // The single drawn white dot joins R8C9 and R9C9.
  new WhiteDot('R8C9', 'R9C9'),
];
