// Title: Pairdoku Killer
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=fagsBZ_CXr8
// Source: https://app.crackingthecryptic.com/sudoku/dbG6M636hG

// Rules encoded: normal sudoku (Shape supplies rows, columns and the nine
// ordinary boxes), and killer cages whose digits cannot repeat and must sum
// to the clue in the cage's top-left corner. There are no givens.
//
// Omitted: "Must be solved with Pairdoku Arrow." That sentence points at a
// separate companion puzzle, Pairdoku Arrow, whose grid and arrow clues are
// not part of this source; this puzzle's rules also never state how the two
// grids relate. Nothing about the companion is encoded here, so this script
// is only the killer half of the pair and does not resolve to one grid.
//
// The fog is not encoded: it governs which cells are revealed while solving
// and places no restriction on the finished grid.

// Cage cells and totals transcribed from the eight drawn cages.
const cages = [
  new Cage(7, 'R2C2', 'R2C3', 'R3C2'),
  new Cage(6, 'R3C3', 'R4C3', 'R4C4'),
  new Cage(9, 'R1C6', 'R2C6', 'R2C7'),
  new Cage(16, 'R4C6', 'R4C7', 'R5C7'),
  new Cage(10, 'R5C5', 'R5C6', 'R6C6'),
  new Cage(12, 'R6C4', 'R7C4'),
  new Cage(18, 'R7C2', 'R7C3', 'R8C3'),
  new Cage(12, 'R7C6', 'R7C7', 'R8C7'),
];

return [
  new Shape('9x9'),
  ...cages,
];
