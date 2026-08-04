// Title: Online Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=wq0uqMK6c34
// Source: https://tinyurl.com/5n8jcnun

// Normal sudoku: standard row, column and box all-different (the ISS
// default), no given digits.
//
// "Digits in the top left of cells containing lines must appear on those
// lines, but not necessarily in the order presented." The payload's 45
// single-cell, borderless `cage` entries are the corner-digit clues named by
// that sentence (transparent outlineC -> no cage border drawn, only the
// numeral); its 15 plain (unstyled) `line` entries are the lines. Every
// corner-digit cell lies on exactly one line, every line covers exactly 3
// corner-digit cells, and the two sets coincide exactly (verified against
// the payload). Each line's 3 corner digits are distinct, so "must appear,
// not necessarily in order" pins the line's 3 cells to a permutation of
// that digit set: ContainExact enforces each named digit present exactly
// once among the line's 3 cells, which -- with exactly 3 cells and 3
// required digits -- forces the bijection. Cell/digit table transcribed
// from the payload's `cage` (values) and `line` (paths) arrays.
return [
  new Shape('9x9'),

  new ContainExact('1_2_3', 'R3C1', 'R2C2', 'R1C3'),
  new ContainExact('4_5_6', 'R3C4', 'R2C5', 'R1C6'),
  new ContainExact('7_8_9', 'R3C7', 'R2C8', 'R1C9'),
  new ContainExact('7_4_1', 'R4C1', 'R3C2', 'R2C3'),
  new ContainExact('8_5_2', 'R4C4', 'R3C5', 'R2C6'),
  new ContainExact('9_6_3', 'R4C7', 'R3C8', 'R2C9'),
  new ContainExact('5_4_3', 'R3C3', 'R4C3', 'R5C3'),
  new ContainExact('6_7_8', 'R9C1', 'R8C2', 'R7C3'),
  new ContainExact('4_5_6', 'R8C1', 'R7C2', 'R6C3'),
  new ContainExact('3_4_5', 'R9C4', 'R8C5', 'R7C6'),
  new ContainExact('1_3_9', 'R8C4', 'R7C5', 'R6C6'),
  new ContainExact('9_1_2', 'R9C7', 'R8C8', 'R7C9'),
  new ContainExact('2_7_8', 'R8C7', 'R7C8', 'R6C9'),
  new ContainExact('1_3_6', 'R5C7', 'R6C7', 'R7C7'),
  new ContainExact('1_7_8', 'R5C4', 'R5C5', 'R5C6'),
];
