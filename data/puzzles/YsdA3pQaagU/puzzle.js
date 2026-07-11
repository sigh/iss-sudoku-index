// Title: Snarky Puppy - Xavi
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=YsdA3pQaagU
// Source: https://sudokupad.app/qhcougnkg6

// Normal sudoku rules (default 3x3 boxes).
//
// German whispers: a closed diagonal loop where neighbouring digits along the
// line differ by at least 5.
//
// XV: digits joined by X sum to 10; digits joined by V sum to 5.
//
// Cipher: each named letter (S, N, A, R, K, Y, P, U, I) corresponds to a
// unique digit; every cell containing a given letter holds that letter's
// digit. Letters repeated in multiple cells (A, Y, P) must hold the same
// digit in every occurrence, and the nine letters are pairwise distinct.
//
// Fog of war (progressive reveal) is a UI/solve-order feature, not a
// constraint on the final grid, so it is not encoded here.

return [
  new Shape('9x9'),

  new Given('R1C2', 6),

  // German whisper loop.
  new Whisper(
    5,
    'R9C2', 'R9C3', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8',
    'R3C9', 'R2C9', 'R2C8', 'R1C8', 'R1C7', 'R2C7', 'R3C6', 'R4C5',
    'R5C4', 'R6C3', 'R7C2', 'R7C1', 'R8C1', 'R8C2', 'R9C2'),

  // XV clue.
  new X('R4C1', 'R4C2'),
  new V('R4C2', 'R4C3'),

  // Cipher letters: repeated letters share a digit.
  new SameValues(2, 'R5C4', 'R4C2'),   // A
  new SameValues(2, 'R2C7', 'R4C8'),   // Y
  new SameValues(3, 'R8C4', 'R6C6', 'R5C7'), // P

  // The nine cipher letters are pairwise distinct digits.
  new AllDifferent(
    'R7C2', // S
    'R6C3', // N
    'R5C4', // A
    'R4C5', // R
    'R3C6', // K
    'R2C7', // Y
    'R8C4', // P
    'R7C5', // U
    'R4C3'  // I
  ),
];
