// Title: Three-Fingered Jack
// Author: The Barg
// Video: https://www.youtube.com/watch?v=1Jlg1377b1I
// Source: https://sudokupad.app/z17uly5rs6

// Normal sudoku rules apply. No given digits.
//
// Renban: digits along a purple line form a set of consecutive digits, in
//   any order.
// Antiknight: digits may not repeat within a knight's move of each other.
// Kropki: digits separated by a white dot are consecutive (difference of
//   one); digits separated by a black dot have a ratio of two. Only marked
//   pairs are constrained (no negative Kropki inference).
// V: digits separated by a V sum to 5.

return [
  new Shape('9x9'),

  new AntiKnight(),

  // Renban lines (purple, consecutive non-repeating set).
  new Renban('R5C7', 'R4C6', 'R3C5', 'R4C4'),
  new Renban('R2C5', 'R2C6', 'R3C6', 'R4C7', 'R4C8'),
  new Renban('R4C9', 'R3C8', 'R2C8', 'R2C7'),

  // Kropki white dots (consecutive).
  new WhiteDot('R6C8', 'R6C9'),
  new WhiteDot('R6C6', 'R7C6'),

  // Kropki black dots (1:2 ratio).
  new BlackDot('R6C4', 'R6C5'),
  new BlackDot('R7C6', 'R8C6'),
  new BlackDot('R7C7', 'R7C8'),

  // V marker (sum to 5).
  new V('R6C5', 'R6C6'),
];
