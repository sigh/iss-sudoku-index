// Title: Magic Knights
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=_2YHEIrJ-cg
// Source: https://app.crackingthecryptic.com/sudoku/NRTGGTJhn8

// Normal sudoku (default row/col/box AllDifferent) plus:
// - AntiKnight: identical digits cannot be a knight's move apart.
// - Six LittleKiller diagonals for the outside sum clues. Each arrow's own
//   drawn path exactly matches LittleKiller's canonical edge-to-edge
//   diagonal for its starting (corner) cell, so no direction ambiguity.
// - Each colored line forces its cells to share one value (SameValues), and
//   a Given candidate restriction on those same cells fixes the shared
//   value's parity: orange lines are odd, blue lines are even.
// - The central box is a magic square: EqualSum over its 3 rows, 3 columns,
//   and 2 diagonals. The box's own (default) AllDifferent then forces the
//   common sum to 45/3 = 15 on its own.

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

// Orange lines: cells drawn #eb7532 in the payload (source-assets geometry).
const orangeLines = [
  ['R2C4', 'R3C3', 'R4C2'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R6C8', 'R7C7', 'R8C6'],
  ['R8C4', 'R7C3', 'R6C2'],
];

// Blue lines: cells drawn #34bbe6 in the payload (source-assets geometry).
const blueLines = [
  ['R7C4', 'R6C3'],
  ['R7C5', 'R6C4'],
  ['R3C4', 'R4C3'],
  ['R4C4', 'R5C3'],
  ['R3C5', 'R4C6'],
  ['R3C6', 'R4C7'],
  ['R6C7', 'R7C6'],
  ['R6C6', 'R5C7'],
];

const sameValueLines = [...orangeLines, ...blueLines].map(
  cells => new SameValues(cells.length, ...cells));

const parityGivens = [
  ...orangeLines.flatMap(cells => cells.map(c => new Given(c, ...ODD))),
  ...blueLines.flatMap(cells => cells.map(c => new Given(c, ...EVEN))),
];

// Outside diagonal sums (little-killer arrows). Each ray starts at the
// arrow's own bulb cell and follows the arrow's own drawn direction
// (down-left / down-right / up-right / up-left, per the payload's arrow
// geometry) to the grid edge, so the cell list comes from the drawn arrow,
// not a hand-picked corner.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');
const littleKillers = [
  LittleKiller.fromCells(14, graph.ray('R1C2', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C5', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(35, graph.ray('R9C5', -1, 1), geometry),
  LittleKiller.fromCells(6, graph.ray('R9C8', -1, 1), geometry),
  LittleKiller.fromCells(35, graph.ray('R5C9', -1, -1), geometry),
];

// Central box (R4-R6, C4-C6) magic square: 3 rows + 3 cols + 2 diagonals.
const magicSquare = new EqualSum(
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
);

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...littleKillers,
  ...sameValueLines,
  ...parityGivens,
  magicSquare,
];
