// Title: 159 Miracle
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=RoVKUjWRdnY
// Source: https://sudokupad.app/james-sinclair/159-miracle

// Normal Sudoku rules apply. The drawn Column Indexer clues cover C1, C5, and
// C9; shaded-square cells are even; and anti-knight rules apply. The combined
// no-total outline is the presentation layer for the three Column Indexer clues.
return [
  new Shape('9x9'),
  new Indexing('column',
    'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Indexing('column',
    'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new Indexing('column',
    'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  // Shaded-square cells from the source artwork.
  new Given('R3C5', 2, 4, 6, 8),
  new Given('R4C1', 2, 4, 6, 8),
  new Given('R4C5', 2, 4, 6, 8),
  new Given('R5C1', 2, 4, 6, 8),
  new Given('R5C5', 2, 4, 6, 8),
  new Given('R6C1', 2, 4, 6, 8),
  new Given('R6C5', 2, 4, 6, 8),
  new Given('R7C1', 2, 4, 6, 8),
  new AntiKnight(),
];
