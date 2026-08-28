// Title: Palindrome Sudoku
// Author: Stephen Jones
// Video: https://www.youtube.com/watch?v=G7fU0VwqTTE
// Source: https://cracking-the-cryptic.web.app/sudoku/np6qN636Gr

// Normal sudoku rules (default 9x9, standard boxes; the payload's regions
// array is exactly the nine ordinary boxes, so no NoBoxes/RegionSize
// override is needed).
//
// All drawn lines are palindromes (digits read the same from either end).
// There are two colours, blue and red/brown (drawn as #34BBE6 and #EB7532;
// the video description calls the warm colour "red"). Where a blue and a
// red/brown line overlap (drawn in purple), the two overlapping digits are
// consecutive and ascend from left to right, per the rules text: "In both
// cases where red and blue palindromes overlap (shown in purple), the two
// digits are consecutive and ascend from left to right." The purple strokes
// (#D23BE7) carry no separate geometry -- they exactly retrace the shared
// tail cells of one blue and one red/brown line each, so they are encoded
// as the ordering constraint on that shared pair, not as extra lines.

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C1', 8),
  new Given('R1C6', 6),
  new Given('R1C9', 9),
  new Given('R3C2', 3),
  new Given('R3C9', 4),
  new Given('R4C1', 2),
  new Given('R5C8', 8),
  new Given('R7C4', 5),
  new Given('R8C2', 1),
  new Given('R9C9', 7),

  // Blue palindrome lines (drawn color #34BBE6).
  new Palindrome('R1C2', 'R1C3', 'R1C4', 'R2C4', 'R3C4'),
  new Palindrome('R3C6', 'R2C6', 'R1C6', 'R1C7', 'R1C8'),
  new Palindrome('R5C3', 'R6C3', 'R7C3', 'R7C2', 'R7C1'),
  new Palindrome('R7C5', 'R7C6', 'R7C7', 'R8C7', 'R9C7'),

  // Red/brown palindrome lines (drawn color #EB7532).
  new Palindrome('R1C5', 'R2C5', 'R3C5', 'R4C5', 'R4C4', 'R4C3', 'R4C2'),
  new Palindrome('R2C7', 'R3C7', 'R4C7', 'R4C8', 'R4C9'),
  new Palindrome('R9C6', 'R8C6', 'R7C6', 'R7C7', 'R7C8'),
  new Palindrome('R9C4', 'R8C4', 'R7C4', 'R7C3', 'R7C2'),

  // Purple overlap cells: consecutive, ascending left to right (right cell
  // is left cell + 1). R7C2/R7C3 is the shared tail of the R7C1-line blue
  // palindrome and the R9C4-line red palindrome; R7C6/R7C7 is the shared
  // tail of the R7C5-line blue palindrome and the R9C6-line red palindrome.
  new Pair(Pair.fnToKey((a, b) => b === a + 1, 9), 'overlap-ascend', 'R7C2', 'R7C3'),
  new Pair(Pair.fnToKey((a, b) => b === a + 1, 9), 'overlap-ascend', 'R7C6', 'R7C7'),
];
