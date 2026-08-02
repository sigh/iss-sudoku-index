// Title: Tannenbaumino
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=NwolFUby8Z8
// Source: https://sudokupad.app/omtjde4f3k

// Normal Sudoku rules apply. The two candles increase from their bulbs.
// Omitted: the solver-discovered pentomino tiling of the green tree, its
// shape-uniqueness and in-pentomino digit rules, and all ornament rules whose
// meaning depends on that tiling.
return [
  new Shape('9x9'),
  new Thermo('R3C1', 'R2C1', 'R1C1'),
  new Thermo('R3C9', 'R2C9', 'R1C9'),
];
