// Title: Irregular Flags
// Author: Mathguymike
// Video: https://www.youtube.com/watch?v=EoxYWK23VH0
// Source: https://app.crackingthecryptic.com/sudoku/48GGDrFGJm
//
// Normal sudoku rules apply (standard 3x3 boxes; the puzzle's "Irregular"
// title refers to the odd polyomino shapes of the killer cages below, not
// to jigsaw regions -- the source draws the ordinary nine boxes). Each cage
// sums to its total with no repeated digit. The two off-grid arrows mark the
// full main and anti-diagonals, each summing to its outside total. The white
// dot forces its two cells consecutive; the black dot forces a 1:2 ratio.
// Only these two dots are drawn, so no other adjacent pair is constrained.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Killer cages, cells and totals transcribed from the source's drawn cage
// array.
const cages = [
  new Cage(17, 'R1C1', 'R1C2'),                                   // A
  new Cage(15, 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R4C3'),           // B
  new Cage(12, 'R1C7', 'R1C8', 'R1C9'),                           // C
  new Cage(20, 'R2C8', 'R2C9', 'R3C8', 'R3C9'),                   // D
  new Cage(15, 'R5C3', 'R6C3', 'R7C3'),                           // E
  new Cage(15, 'R7C4', 'R7C5', 'R8C4', 'R8C5', 'R9C5'),           // F
  new Cage(15, 'R4C7', 'R5C7', 'R6C7'),                           // G
  new Cage(15, 'R7C6', 'R7C7'),                                   // H
  new Cage(15, 'R8C6', 'R8C7'),                                   // I
  new Cage(3, 'R9C8', 'R9C9'),                                    // J
  new Cage(9, 'R7C1', 'R8C1', 'R9C1'),                            // K
  new Cage(21, 'R7C2', 'R8C2', 'R9C2'),                           // L
  new Cage(15, 'R2C3', 'R2C4'),                                   // M
  new Cage(15, 'R2C5', 'R2C6'),                                   // N
];

return [
  new Shape('9x9'),

  ...cages,

  // Diagonal sum clues, from the off-grid arrows plus their outside sum
  // badges (48, 50): each walks a full corner-to-corner diagonal.
  LittleKiller.fromCells(48, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(50, graph.ray('R1C9', 1, -1), geometry),

  // Kropki-style dots: only these two are drawn (fill/background colour
  // carries white/black, per the payload's overlay fields).
  new WhiteDot('R6C2', 'R7C2'),
  new BlackDot('R6C8', 'R7C8'),
];
