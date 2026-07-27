// Title: 2B pencil
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=bGDYzxYvrrA
// Source: https://sudokupad.app/6z3zy41pm6
//
// Standard 9x9 sudoku (rows, columns, boxes). No printed givens.
// German whispers: adjacent cells along the drawn line differ by >= 5
// (the rule text omits the difference, so Whisper's default of 5 applies).
// Oval: the two cells the oval covers hold the same digit.
// "The cell with the 2 contains a 2": a drawn "2" (part of a rotated "2B"
// mark, the pencil-grade pun in the title) is centred on R3C6.

return [
  new Shape('9x9'),

  // The drawn German-whisper line is one connected, branching network (a
  // tree plus one short cycle), not a single simple path. It has four 3-way
  // junctions (R3C2, R3C4, R5C6, R7C6); each run below is a maximal chain
  // between junctions/endpoints, and Whisper enforces its rule on every
  // consecutive pair within a run, so every drawn edge is covered exactly
  // once.
  new Whisper('R1C4', 'R2C3', 'R3C2'),
  new Whisper('R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2', 'R8C3', 'R8C4', 'R8C5', 'R7C6'),
  new Whisper('R7C6', 'R6C7', 'R5C8', 'R4C9'),
  new Whisper('R3C2', 'R3C3', 'R3C4'),
  new Whisper('R3C4', 'R4C5', 'R5C6'),
  new Whisper('R5C6', 'R6C6', 'R7C6'),
  new Whisper('R3C4', 'R2C5', 'R1C6'),
  new Whisper('R5C6', 'R4C7', 'R3C8', 'R2C9'),

  // Oval: a grey rounded pill centred on the shared corner of R5C3/R5C4/
  // R6C3/R6C4, oriented along the R5C3-R6C4 diagonal (its long axis reaches
  // into those two cells; its short axis only touches the other diagonal's
  // corner without covering R5C4 or R6C3). SameValues(2, ...) with 2 cells
  // makes each its own 1-cell set that must hold the same value.
  new SameValues(2, 'R5C3', 'R6C4'),

  // The drawn "2" (from the rotated "2B" mark) is centred on R3C6.
  new Given('R3C6', 2),
];
