// Title: Fishtomefel
// Author: Skeptical Mario
// Video: https://www.youtube.com/watch?v=tdliPnN3L3g
// Source: https://sudokupad.app/iugptjcutc

// Normal sudoku rules apply. Each cage sums to the total shown in its
// top-left cell, with no repeated digit inside a cage. Black dots mark a
// double relationship, white dots mark a difference of 1. The teal line
// carries a "Fishtomefel" rule: every three cells adjacent along the line
// contain one digit from {1,4,7}, one from {2,5,8}, and one from {3,6,9} --
// exactly ISS's Modular(3, ...) semantics.

const tealLine = [
  'R6C4', 'R7C4', 'R7C5', 'R8C4', 'R8C5', 'R7C6', 'R7C7', 'R6C7', 'R6C6',
  'R5C5', 'R5C6', 'R5C7', 'R4C7', 'R3C7', 'R3C6', 'R3C5', 'R2C4', 'R2C3',
  'R3C4', 'R4C4', 'R3C3', 'R3C2', 'R4C3', 'R5C4', 'R6C3', 'R7C2', 'R7C3',
];
// 27 cells (divisible by 3): Modular(3, ...) enforces every window of 3
// consecutive cells in this open list is a complete residue system mod 3,
// which forces period-3 repetition of the mod-3 class along the whole
// sequence. Because 27 % 3 === 0, that periodicity also makes the two
// windows that wrap across the closing edge (R7C2,R7C3,R6C4) and
// (R7C3,R6C4,R7C4) complete residue systems automatically, so the loop's
// closure needs no extra constraint.

return [
  new Shape('9x9'),

  new Given('R6C9', 8),

  // Cages: top-left cell carries the sum; cage digits are all-different.
  new Cage(12, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(23, 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Cage(26, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(16, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),

  new Modular(3, ...tealLine),

  // Black dots: fill/background colour #000000 in the payload.
  new BlackDot('R4C5', 'R4C6'),
  new BlackDot('R4C6', 'R4C7'),

  // White dots: fill/background colour #FFFFFF in the payload.
  new WhiteDot('R2C7', 'R2C8'),
  new WhiteDot('R7C9', 'R8C9'),
  new WhiteDot('R7C1', 'R8C1'),
];
