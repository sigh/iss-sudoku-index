// Title: RAT RUN 39: Together Apart
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=JXd8YgWYFFw
// Source: https://sudokupad.app/pja7uaxak9

// Partial encoding. ISS can faithfully model the normal sudoku grid and the
// local fruit edge clues below. The two unknown rat paths, thick maze walls,
// diagonal movement rule, button distance clues, and path-adjacent
// non-consecutive rule are omitted.

const grapeKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9);

const constraints = [
  new Shape('9x9'),

  // Blackcurrants: one digit is double the other.
  new BlackDot('R2C7', 'R2C8'),
  new BlackDot('R4C4', 'R4C5'),
  new BlackDot('R4C6', 'R5C6'),
  new BlackDot('R8C2', 'R9C2'),

  // Grapes: digits differ by at least 5.
  new Pair(grapeKey, 'grape', 'R1C1', 'R1C2'),
  new Pair(grapeKey, 'grape', 'R3C5', 'R3C6'),
  new Pair(grapeKey, 'grape', 'R4C2', 'R5C2'),
  new Pair(grapeKey, 'grape', 'R7C5', 'R7C6'),
  new Pair(grapeKey, 'grape', 'R9C7', 'R9C8'),

  // Starfruit: every marked domino has the same sum.
  new EqualSum(
    ['R2C2', 'R3C2'],
    ['R5C3', 'R6C3'],
    ['R5C4', 'R6C4'],
    ['R6C3', 'R6C4'],
    ['R6C7', 'R7C7'],
    ['R7C3', 'R8C3'],
  ),
];

return constraints;
