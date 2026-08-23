// Title: The Greedy Cup's Whispers
// Author: Pixel Strength
// Video: https://www.youtube.com/watch?v=_GiEDLRu1Ug
// Source: https://app.crackingthecryptic.com/sudoku/rd77HGPmBP
//
// Normal sudoku rules apply (default 9x9 boxes, unmodified). Given: R6C5=1.
// Green lines: adjacent cells on the line differ by at least 5 -> Whisper(5).
// Orange lines: a consecutive, non-repeating set of digits in any order ->
// Renban.
// Cages: sum, no repeated digit -> Cage (default semantics).
// White dot: the two cells hold consecutive digits -> WhiteDot.
//
// Green line 3 and orange line 1 share the cell R6C3 (drawn as two distinct
// colored strokes that meet there, not one merged line); each is encoded as
// its own constraint over its own cell list.

return [
  new Shape('9x9'),

  new Given('R6C5', 1),

  // Green lines: difference >= 5.
  new Whisper('R1C9', 'R2C8', 'R3C8'),
  new Whisper('R3C6', 'R2C6', 'R2C5', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4'),
  new Whisper('R6C3', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C1'),
  new Whisper('R7C6', 'R8C6', 'R9C7', 'R9C8'),
  new Whisper('R9C6', 'R9C5', 'R9C4'),

  // Orange lines: consecutive set, no repeats, any order.
  new Renban('R5C1', 'R6C1', 'R6C2', 'R6C3'),
  new Renban('R3C5', 'R4C5', 'R5C5', 'R6C5', 'R6C6', 'R6C7', 'R5C8', 'R4C8'),
  new Renban('R7C4', 'R8C4', 'R9C3', 'R9C2'),

  // White dot: consecutive digits.
  new WhiteDot('R9C6', 'R9C7'),

  // Cages: sum, no repeated digit.
  new Cage(14, 'R2C5', 'R2C6', 'R3C6'),
  new Cage(14, 'R3C7', 'R4C7', 'R4C6'),
  new Cage(8, 'R4C8', 'R5C8'),
  new Cage(10, 'R5C9', 'R6C9'),
  new Cage(15, 'R7C1', 'R7C2'),
  new Cage(12, 'R5C1', 'R6C1', 'R6C2'),
  new Cage(13, 'R7C6', 'R8C6'),
];
