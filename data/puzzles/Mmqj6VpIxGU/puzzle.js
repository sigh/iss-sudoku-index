// Title: Squeeze Play
// Author: Darth Paradox
// Video: https://www.youtube.com/watch?v=Mmqj6VpIxGU
// Source: https://sudokupad.app/sn2nojv4os?setting-nogrid=1

// Normal sudoku rules apply: standard rows, columns, and 3x3 boxes.
//
// The source draws a plain 9x9 sudoku rotated 45 degrees inside a 17x17
// SudokuPad canvas with the built-in grid hidden (setting-nogrid=1). Givens
// and lines below are converted back to plain, unrotated row/column
// coordinates.
//
// Green line: German whisper -- adjacent cells on the line differ by at
// least 5.
//
// Outside clues: sandwich sums. Each arrow+number is drawn at 45 degrees on
// the rotated display -- which is how a plain row or column of the
// underlying grid appears on screen, matching the rules' "indicated
// diagonal" -- and covers one full row or column.
//
// OMITTED: "The base paths are double arrows: the digits on each path have
// the same sum as the bases at the ends of the path. The bases contain four
// different digits." No drawn geometry in the source payload could be
// matched to a base-and-path shape for this rule.

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
