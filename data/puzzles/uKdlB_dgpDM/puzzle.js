// Title: Magic Chess Sudoku
// Author: Jamie Cavallo
// Video: https://www.youtube.com/watch?v=uKdlB_dgpDM
// Source: https://cracking-the-cryptic.web.app/sudoku/PThGMg47p6
//
// Standard sudoku (rows/columns/boxes) plus:
// - The centre box (R4-R6,C4-C6) is a magic square: EqualSum over its rows,
//   columns and diagonals -- the box's own AllDifferent then forces the
//   common sum to 15.
// - Two outside clues sum the 3-cell diagonal their arrow enters (drawn
//   arrow direction): R1C3+R2C2+R3C1=11 (down-left from R1C3),
//   R1C7+R2C8+R3C9=17 (down-right from R1C7).
// - Omitted: the three chess-move rules (three digits avoid repeats a
//   knight's move apart, three a king's move apart, three a queen's move
//   apart), each rule's three digits being whichever digits land in one of
//   the magic square's three drawn colour groups. Not encoded.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Givens (drawn cell values).
  new Given('R3C4', 2), new Given('R3C6', 1),
  new Given('R4C3', 6), new Given('R4C7', 7),
  new Given('R5C2', 9), new Given('R5C8', 1),
  new Given('R6C3', 4), new Given('R6C7', 5),
  new Given('R7C4', 5), new Given('R7C6', 4),

  // Centre-box magic square: 3 rows, 3 columns, 2 diagonals of box 5.
  new EqualSum(
    ['R4C4', 'R4C5', 'R4C6'], ['R5C4', 'R5C5', 'R5C6'], ['R6C4', 'R6C5', 'R6C6'],
    ['R4C4', 'R5C4', 'R6C4'], ['R4C5', 'R5C5', 'R6C5'], ['R4C6', 'R5C6', 'R6C6'],
    ['R4C4', 'R5C5', 'R6C6'], ['R4C6', 'R5C5', 'R6C4']),

  // Outside diagonal-sum clues (arrow direction fixes which 3-cell diagonal).
  LittleKiller.fromCells(11, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(17, graph.ray('R1C7', 1, 1), geometry),
];
