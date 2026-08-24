// Title: Archers and Knights
// Author: SudokuExplorer
// Video: https://www.youtube.com/watch?v=yy5Lo6O99CE
// Source: https://app.crackingthecryptic.com/sudoku/bmdBJH28jb

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no jigsaw).
// Cells a chess knight's move apart cannot share a digit (global anti-knight).
// Digits along an arrow sum to the digit in its circle; digits may repeat
// along an arrow.

// Arrow(bulb, ...arms): bulb is the circled cell, arms sum to it. Cell
// order taken from the drawn waypoints (grid cell centres snapped from the
// path coordinates). Each bulb cell is confirmed by a matching grey circle
// underlay drawn at the same cell -- all 6 underlays land exactly on these
// 6 bulb cells, one each. A 7th `arrows[]` entry carries styling but no
// waypoints, so it renders nothing and is not a drawn clue.
const arrows = [
  new Arrow('R3C2', 'R4C1', 'R5C1', 'R6C1'),
  new Arrow('R3C5', 'R4C6', 'R5C6', 'R6C6'),
  new Arrow('R6C4', 'R5C3', 'R4C3', 'R3C3'),
  new Arrow('R6C3', 'R5C4', 'R4C4', 'R3C4'),
  new Arrow('R4C8', 'R5C8', 'R4C9'),
  new Arrow('R9C6', 'R8C5', 'R7C4'),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...arrows,
];
