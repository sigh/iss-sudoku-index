// Title: Chained Killer Sudoku
// Author: Shinya
// Video: https://www.youtube.com/watch?v=TS7Ogev2i34
// Source: https://cracking-the-cryptic.web.app/sudoku/drTGfJmMQm

// Standard 9x9 sudoku (default row/column/box all-different). Twenty-three
// cages partition the whole grid; none carries a printed total, so each is
// encoded with Cage(0, ...) -- total 0 emits the cage's all-different
// requirement only, no sum.
//
// Omitted: six short two-cell arrows and eighteen border-straddling ovals
// drawn on the grid carry no legend and no accompanying rules text in the
// source, so their meaning could not be determined.

return [
  new Shape('9x9'),

  new Cage(0, 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'),
  new Cage(0, 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Cage(0, 'R2C8', 'R3C8', 'R4C8', 'R5C8'),
  new Cage(0, 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8'),
  new Cage(0, 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'),
  new Cage(0, 'R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1'),
  new Cage(0, 'R2C2', 'R3C2', 'R4C2', 'R5C2'),
  new Cage(0, 'R6C2', 'R7C2'),
  new Cage(0, 'R8C2'),
  new Cage(0, 'R8C3', 'R8C4', 'R8C5'),
  new Cage(0, 'R8C6', 'R8C7', 'R8C8'),
  new Cage(0, 'R6C8', 'R7C8', 'R7C7'),
  new Cage(0, 'R7C6', 'R7C5', 'R7C4'),
  new Cage(0, 'R7C3', 'R6C3', 'R5C3'),
  new Cage(0, 'R4C3', 'R3C3'),
  new Cage(0, 'R2C3'),
  new Cage(0, 'R2C4', 'R3C4'),
  new Cage(0, 'R2C5', 'R2C6', 'R2C7'),
  new Cage(0, 'R3C5', 'R3C6'),
  new Cage(0, 'R3C7', 'R4C7', 'R5C7', 'R6C7'),
  new Cage(0, 'R4C4', 'R4C5', 'R4C6', 'R5C6'),
  new Cage(0, 'R5C4', 'R5C5'),
  new Cage(0, 'R6C4', 'R6C5', 'R6C6'),
];
