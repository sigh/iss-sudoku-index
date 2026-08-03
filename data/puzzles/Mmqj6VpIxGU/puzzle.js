// Title: Squeeze Play
// Author: Darth Paradox
// Video: https://www.youtube.com/watch?v=Mmqj6VpIxGU
// Source: https://sudokupad.app/sn2nojv4os?setting-nogrid=1

// Normal sudoku rules apply: standard rows, columns, and 3x3 boxes.
//
// The source draws a plain 9x9 sudoku rotated 45 degrees inside a 17x17
// canvas with the built-in grid hidden. Givens and the whisper below use
// plain, unrotated row/column coordinates recovered from that rotation.
//
// Green line: German whisper -- adjacent cells on the line differ by at
// least 5.
//
// Outside clues: sandwich sums, one per plain row/column, drawn diagonally
// on the rotated display.
//
// OMITTED: "The base paths are double arrows: the digits on each path have
// the same sum as the bases at the ends of the path. The bases contain four
// different digits." Every other drawn line in the source is a redraw of
// the box/cell grid borders, not clue geometry; no base-and-path shape for
// this rule is present in the source.

const geometry = cellGeometry('9x9');

const row = (r) => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const col = (c) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

return [
  new Shape('9x9'),

  new Given('R2C2', 8),
  new Given('R2C8', 7),
  new Given('R4C6', 6),
  new Given('R4C8', 5),
  new Given('R6C4', 4),
  new Given('R7C7', 1),
  new Given('R8C2', 9),
  new Given('R8C4', 3),
  new Given('R9C9', 2),

  new Whisper(5,
    'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1'),

  Sandwich.fromCells(18, row(2), geometry),
  Sandwich.fromCells(18, row(5), geometry),
  Sandwich.fromCells(11, col(2), geometry),
  Sandwich.fromCells(23, col(5), geometry),
];
