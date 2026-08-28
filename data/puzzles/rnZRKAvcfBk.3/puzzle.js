// Title: September 22, 2021: Zone
// Author: clover!
// Video: https://www.youtube.com/watch?v=rnZRKAvcfBk
// Source: https://tinyurl.com/2rj6vmzk

// Normal sudoku rules apply. Text in the top left corner of a cage shows the
// digits that appear in that cage: each cage's printed digit string has one
// character per cage cell, and (sorted ascending) names the exact multiset of
// values that fill those cells -- a repeated character means that digit fills
// two cells of the cage, not merely that it is present once. Cages are not
// killer cages: repeated digits within a cage are allowed (several strings
// below repeat a character), so no AllDifferent is added over cage cells --
// only ordinary row/column/box sudoku restricts them.
//
// ContainExact(values, ...cells) requires the underscore-separated `values`
// multiset to occur in `cells` with exactly those multiplicities. Every cage
// here has cell count equal to its digit-string length, so pinning the exact
// multiplicities of all listed digits leaves no room for any other value in
// any cell: the cage's cells are exactly a permutation of the printed digits.

return [
  new Shape('9x9'),

  // Cages, cells and digit strings transcribed from the source's cage list
  // (top-left-anchored digit string per cage, cell order as drawn).
  new ContainExact('1_2_2_3', 'R2C2', 'R2C3', 'R3C2', 'R4C2'),
  new ContainExact('3_4_4_5', 'R7C2', 'R8C2', 'R8C3', 'R8C4'),
  new ContainExact('5_6_6_7', 'R6C8', 'R7C8', 'R8C7', 'R8C8'),
  new ContainExact('1_7_8_8', 'R2C6', 'R2C7', 'R2C8', 'R3C8'),
  new ContainExact('4_9', 'R4C7', 'R5C7'),
  new ContainExact('8_9', 'R5C3', 'R6C3'),
  new ContainExact('4_9', 'R3C4', 'R3C5'),
  new ContainExact('8_9', 'R7C5', 'R7C6'),
  new ContainExact('2_3', 'R1C6', 'R1C7'),
  new ContainExact('6_7', 'R9C3', 'R9C4'),
  new ContainExact('5_8', 'R5C9', 'R6C9'),
  new ContainExact('1_5', 'R4C1', 'R5C1'),
  new ContainExact('1_2_6', 'R3C6', 'R4C5', 'R4C6'),
  new ContainExact('2_5_6', 'R6C4', 'R6C5', 'R7C4'),
];
