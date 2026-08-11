// Title: DisArray
// Author: FullDeck and Missing A Few Cards
// Video: https://www.youtube.com/watch?v=tM8t1K6nH4E
// Source: https://app.crackingthecryptic.com/sudoku/Rmn2HpM9p8

// Normal sudoku rules apply (9x9, standard boxes, digits 1-9, no givens).
// Digits along an arrow sum to the digit in that arrow's circle: encoded
// with Arrow(circleCell, ...armCells). Two arrows share the circle at R4C4,
// each with its own arm (two underlays coincide with two distinct drawn
// arrow bulbs at that cell).
// Cells separated by a white dot are consecutive; the rules state not all
// dots are given, so only the two drawn dots are encoded and no negative
// (non-consecutive) inference is made for undotted adjacent pairs.
// Digits in a cage sum to its top-left small clue; each of the four cages
// here is a 2-cell domino confined to a single box, so box all-different
// already forbids the repeat within the cage (Cage's built-in uniqueness is
// redundant with, not additional to, base sudoku for these).
// Cells sharing the same position across boxes may not repeat a digit: this
// is exactly ISS's DisjointSets.

return [
  new Shape('9x9'),

  new DisjointSets(),

  new Arrow('R3C3', 'R2C2', 'R1C2', 'R1C1'),
  new Arrow('R2C5', 'R3C4', 'R3C5', 'R3C6'),
  new Arrow('R3C7', 'R2C8', 'R2C9', 'R1C9'),
  new Arrow('R4C4', 'R5C4', 'R6C5', 'R6C6'),
  new Arrow('R4C4', 'R4C5', 'R5C6', 'R6C6'),
  new Arrow('R5C8', 'R4C7', 'R5C7', 'R6C7'),
  new Arrow('R5C2', 'R6C3', 'R5C3', 'R4C3'),
  new Arrow('R7C3', 'R8C2', 'R8C1', 'R9C1'),
  new Arrow('R8C5', 'R7C6', 'R7C5', 'R7C4'),
  new Arrow('R7C7', 'R8C8', 'R9C8', 'R9C9'),

  new WhiteDot('R5C7', 'R6C7'),
  new WhiteDot('R4C3', 'R5C3'),

  new Cage(14, 'R1C3', 'R2C3'),
  new Cage(17, 'R3C8', 'R3C9'),
  new Cage(16, 'R8C7', 'R9C7'),
  new Cage(13, 'R7C1', 'R7C2'),
];
