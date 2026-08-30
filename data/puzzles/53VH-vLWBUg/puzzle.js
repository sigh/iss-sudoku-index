// Title: Untitled
// Author: Seungjae Kwak
// Video: https://www.youtube.com/watch?v=53VH-vLWBUg
// Source: https://cracking-the-cryptic.web.app/sudoku/7TLmFJFf4R

// Normal sudoku rules apply (rows, columns and 3x3 boxes each 1-9 once).
// The source publishes no rules text, and only one given digit is drawn on
// the board; the rest of the puzzle is sixteen outside diagonal clues whose
// meaning cannot be determined (a plain digit-sum reading is contradicted by
// one of the sixteen printed numbers, which exceeds the maximum possible sum
// for its diagonal). They are not encoded below.
return [
  new Shape('9x9'),
  new Given('R5C4', 9),
];
