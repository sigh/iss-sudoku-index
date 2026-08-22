// Title: The Chip
// Author: rdndnt
// Video: https://www.youtube.com/watch?v=8upd0TFEo7c
// Source: https://app.crackingthecryptic.com/sudoku/b6qdJfmLb2

// Normal sudoku rules apply (standard rows/cols/boxes, no givens).
// Grey lines are palindromes: the values along each line read the same
// forwards and backwards.
// Black dots join digits in a 1:2 ratio; white dots join consecutive
// digits. "Not all dots are shown" means the drawn dots are the complete
// and only claim: an unmarked adjacent pair carries no information, so no
// negative/exhaustive Kropki constraint is encoded for unmarked pairs.
// The grey circle marks an odd digit; encoded as a restriction on which
// digits the cell may hold.

return [
  new Shape('9x9'),

  // Palindrome lines (grey), cell paths as drawn (grey polylines).
  new Palindrome('R1C6', 'R2C5', 'R3C4', 'R4C3', 'R4C2', 'R5C1'),
  new Palindrome('R6C1', 'R7C2', 'R8C3'),
  new Palindrome('R6C2', 'R6C3', 'R5C4'),
  new Palindrome('R5C2', 'R5C3', 'R4C4', 'R3C5'),
  new Palindrome('R2C7', 'R3C8', 'R4C9'),
  new Palindrome('R5C9', 'R6C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'),
  new Palindrome('R6C4', 'R7C5', 'R6C6', 'R5C7', 'R5C8'),
  new Palindrome('R4C8', 'R4C7', 'R3C6'),

  // White dots (consecutive), from the white edge marks drawn between cells.
  new WhiteDot('R3C5', 'R3C6'),
  new WhiteDot('R4C9', 'R5C9'),
  new WhiteDot('R4C8', 'R5C8'),
  new WhiteDot('R6C7', 'R7C7'),
  new WhiteDot('R5C4', 'R6C4'),
  new WhiteDot('R5C2', 'R6C2'),
  new WhiteDot('R5C1', 'R6C1'),
  new WhiteDot('R7C3', 'R8C3'),

  // Black dots (1:2 ratio), from the black edge marks drawn between cells.
  new BlackDot('R8C3', 'R9C3'),
  new BlackDot('R9C3', 'R9C4'),
  new BlackDot('R3C6', 'R4C6'),
  new BlackDot('R1C6', 'R1C7'),
  new BlackDot('R1C7', 'R2C7'),

  // Grey circle: odd digit.
  new Given('R1C7', 1, 3, 5, 7, 9),
];
