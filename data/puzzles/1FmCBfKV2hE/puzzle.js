// Title: Dutch-pelganger
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=1FmCBfKV2hE
// Source: https://sudokupad.app/t4fevoplnv

// DOPPELGANGER SUDOKU
// - Fill each cell of the main 9x9 grid such that every row, column and 3x3
//   box contains a 0 and eight different digits from 1-9.
// - No two rows, no two columns and no two boxes may be missing the same
//   digit.
// - For each 0 in the grid, the digits missing in its row, column and region
//   must be three different digits.
// - The cells outside the grid must be filled in with the digits that are
//   missing from the corresponding row/column/box.
//
// The Doppelganger constraint below implements all four bullets natively:
// it requires values 0-9, forces a 0 into every row/column/box, keeps the
// missing non-zero digit distinct across rows (and across columns, and
// across boxes), and enforces the three-way distinctness at every 0 cell.
// Its auxiliary DGC/DGR/DGB cells hold each row's/column's/box's missing
// digit -- exactly the "cells outside the grid" from the rules -- so the
// Dutch whisper lines drawn across those outside cells are written using
// those same cells below.
//
// DUTCH WHISPER LINES
// - Adjacent digits on an orange dutch whisper line must differ by at
//   least 4.

return [
  new Shape('9x9', '0-9'),
  new Doppelganger(),

  // Lines entirely inside the main grid.
  new Whisper(4, 'R9C4', 'R8C5', 'R7C6'),
  new Whisper(4, 'R1C3', 'R2C2', 'R3C1'),
  new Whisper(4, 'R7C2', 'R8C2', 'R7C3', 'R7C2'),
  new Whisper(4, 'R8C7', 'R9C7', 'R8C8', 'R7C7', 'R8C7'),
  new Whisper(4, 'R5C9', 'R6C8', 'R5C8', 'R5C9'),
  new Whisper(4, 'R5C1', 'R6C1', 'R6C2', 'R5C1'),
  new Whisper(4, 'R2C5', 'R2C6', 'R3C6', 'R2C5'),
  new Whisper(4, 'R2C9', 'R3C9', 'R3C8', 'R2C9'),
  new Whisper(4, 'R1C8', 'R2C7', 'R1C7', 'R1C8'),
  new Whisper(4, 'R7C5', 'R8C4', 'R7C4', 'R7C5'),
  new Whisper(4, 'R8C6', 'R9C6', 'R9C5', 'R8C6'),
  new Whisper(4, 'R3C2', 'R3C3', 'R2C3', 'R3C2'),
  new Whisper(4, 'R1C2', 'R2C1', 'R1C1', 'R1C2'),
  new Whisper(4, 'R5C6', 'R6C6', 'R5C5', 'R5C6'),
  new Whisper(4, 'R5C5', 'R4C4', 'R5C4', 'R5C5'),

  // Lines drawn across the outside (missing-digit) cells: DGC holds each
  // row's missing digit, DGR holds each column's missing digit, DGB holds
  // each box's missing digit.
  new Whisper(4, 'DGC2', 'DGC3', 'DGC4'),
  new Whisper(4, 'DGR6', 'DGR7', 'DGR8'),
  new Whisper(4, 'DGR5', 'DGR4', 'DGR3'),
  new Whisper(4, 'DGB2', 'DGB5', 'DGB4', 'DGB2'),
];
