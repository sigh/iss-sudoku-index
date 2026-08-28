// Title: Teaser
// Author: Unknown
// Video: https://www.youtube.com/watch?v=h-O1WkcKjIY
// Source: https://cracking-the-cryptic.web.app/sudoku/TFfmNNQRpb

// Normal sudoku rules apply on the 9x9 grid: default rows, columns and the
// standard 3x3 boxes, which are the source's own nine regions.
//
// Omitted: the board tints two concentric square rings -- red over the outer
// border (row 1, row 9, column 1, column 9) and purple over the border of the
// rows 2-8 x columns 2-8 square. No text supplied with the puzzle says what
// the tinting constrains, and the board draws neither cages nor rectangular
// outline boxes, so the ring clauses stated for this video's main puzzle have
// nothing here to refer to. Nothing is encoded for the two rings.

// Givens, transcribed from the drawn grid: the 2x2 block in each corner.
return [
  new Shape('9x9'),
  new Given('R1C1', 9),
  new Given('R1C2', 5),
  new Given('R1C8', 1),
  new Given('R1C9', 8),
  new Given('R2C1', 1),
  new Given('R2C2', 3),
  new Given('R2C8', 2),
  new Given('R2C9', 5),
  new Given('R8C1', 5),
  new Given('R8C2', 2),
  new Given('R8C8', 3),
  new Given('R8C9', 1),
  new Given('R9C1', 8),
  new Given('R9C2', 1),
  new Given('R9C8', 5),
  new Given('R9C9', 9),
];
