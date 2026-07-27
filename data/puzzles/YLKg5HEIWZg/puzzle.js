// Title: Thirty-Five
// Author: Scott Williams
// Video: https://www.youtube.com/watch?v=YLKg5HEIWZg
// Source: https://sudokupad.app/1zta3rkwrq

// Normal Sudoku rules apply (standard 9x9 with 9 boxes, from Shape below).
//
// Each outside diagonal clue gives the sum of the digits along the indicated
// diagonal (LittleKiller, walked with cellGraph().ray() from the drawn
// entry cell and direction).
//
// The middle box is a magic square: its 3 rows, 3 columns, and 2 diagonals
// all sum to one common (unstated) total (EqualSum). The middle box's own
// all-different (it is one of the 9 standard boxes) already forces that
// total to 15, so no separate total is asserted. A no-total cage is drawn
// over exactly these same 9 cells in the source; it only outlines the magic
// square and adds no constraint beyond the box's own all-different, so it is
// not separately encoded.
//
// Digits along an arrow sum to the digit in the arrow's bulb (Arrow, bulb
// cell first).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Diagonal entry cell / direction / sum read off the drawn arrowhead
// position and heading, paired with its badge by nearest spatial distance.
const littleKillers = [
  LittleKiller.fromCells(42, graph.ray('R9C2', -1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(30, graph.ray('R8C1', -1, 1), geometry),
  LittleKiller.fromCells(40, graph.ray('R9C1', -1, 1), geometry), // anti-diagonal
  LittleKiller.fromCells(10, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(41, graph.ray('R1C1', 1, 1), geometry), // main diagonal
];

// Middle box's 3 rows, 3 columns, and 2 diagonals, derived from the box
// itself (row-major) rather than hand-typed cell ids.
const magicBox = graph.box(5);
const magicSegments = [
  magicBox.slice(0, 3), magicBox.slice(3, 6), magicBox.slice(6, 9),
  ...[0, 1, 2].map(c => [magicBox[c], magicBox[c + 3], magicBox[c + 6]]),
  [magicBox[0], magicBox[4], magicBox[8]],
  [magicBox[2], magicBox[4], magicBox[6]],
];

return [
  new Shape('9x9'),

  ...littleKillers,

  new EqualSum(...magicSegments),

  // Bulb R9C5; shaft bends up-left into R8C4, then right through R8C5 to
  // R8C6.
  new Arrow('R9C5', 'R8C4', 'R8C5', 'R8C6'),
  // Bulb R4C8; shaft runs down through R5C8 to R6C8, then diagonally
  // up-right to R5C9.
  new Arrow('R4C8', 'R5C8', 'R6C8', 'R5C9'),
];
