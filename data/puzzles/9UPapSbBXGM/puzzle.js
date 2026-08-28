// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=9UPapSbBXGM
// Source: https://cracking-the-cryptic.web.app/sudoku/T43rMR8FGj

// Normal sudoku rules apply. Four thermometers require digits to strictly
// increase from the bulb (drawn as a grey circle). Five little-killer style
// diagonal arrows give the sum of every cell along the indicated diagonal
// from the grid edge; the rules state digits can repeat along these
// diagonals, so no diagonal all-different is added.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Thermometers (bulb cell first). Bulb ends read from the drawn grey
  // circles; the remaining cells follow each line's drawn path.
  new Thermo('R2C4', 'R2C3'),
  new Thermo('R6C8', 'R6C7'),
  new Thermo('R7C4', 'R6C4', 'R5C4', 'R4C4'),
  new Thermo('R9C6', 'R9C7', 'R9C8', 'R9C9'),

  // Outside diagonal sums (little killers). Start cell and direction read
  // from each arrow's drawn ray; sum read from the outside number nearest
  // that arrow.
  LittleKiller.fromCells(28, graph.ray('R3C1', 1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(69, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(24, graph.ray('R4C9', 1, -1), geometry),
  LittleKiller.fromCells(39, graph.ray('R5C9', 1, -1), geometry),
];
