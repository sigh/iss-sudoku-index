// Title: Weird Arrows
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=-U3WJt4ks_o
// Source: https://sudokupad.app/ur11o44tv3

// Normal sudoku (default 3x3 boxes) plus BULBOUS ARROWS: the sum of the
// digits in a white bulb shape equals the sum of the digits on each arrow
// attached to it. A bulb shape is every cell its heavy white stroke touches
// (one cell for a plain circle, several for the bulging shapes); an attached
// arrow is the digits along one thin stroke leaving that shape. EqualSum
// enforces "all these cell groups share the same sum", which is exactly
// bulb-sum == each-arrow-sum when the bulb is one segment and each attached
// arrow is another segment of the same EqualSum. One further drawn stroke,
// a bulging shape near R4C7-R4C9 with thin strokes toward R3C8 and R5C6, is
// omitted: no bulb/arrow split of those cells reproduces the rule.

return [
  new Shape('9x9'),

  // Bulb 1: R1C3,R1C4,R1C5,R2C3,R2C4 (heavy white outline+diagonal around
  // that 2x2 block of cell-centres, plus its extension to R1C5) -> R1C6.
  new EqualSum(
    ['R1C3', 'R1C4', 'R1C5', 'R2C3', 'R2C4'],
    ['R1C6']),

  // Bulb 2: plain circle at R3C5 -> its thin stroke, which runs diagonally
  // across R2C4 and R1C3 (both already part of bulb 1's shape above).
  new EqualSum(
    ['R3C5'],
    ['R2C4', 'R1C3']),

  // Bulb 3: heavy white outline+diagonal around the R1C8/R1C9/R2C8/R2C9
  // block -> its thin stroke, which runs through R3C9 into R4C8 (R4C8 is
  // also part of the omitted shape mentioned above).
  new EqualSum(
    ['R1C8', 'R1C9', 'R2C8', 'R2C9'],
    ['R3C9', 'R4C8']),

  // Bulb 4: heavy white stroke R4C3-R4C4-R5C4-R6C4 -> its own extension
  // R4C5-R4C6 (drawn arrowhead at R4C6).
  new EqualSum(
    ['R4C3', 'R4C4', 'R5C4', 'R6C4'],
    ['R4C5', 'R4C6']),

  // Bulb 5: heavy white stroke R5C2-R6C2 -> its thin stroke, which runs
  // through R5C3 into R5C4 (R5C4 is also part of bulb 4's shape above).
  new EqualSum(
    ['R5C2', 'R6C2'],
    ['R5C3', 'R5C4']),

  // Bulb 6: heavy white stroke R7C2-R7C3-R8C3 -> its thin diagonal stroke,
  // which runs through R6C4 (bulb 4's shape) into R5C5 (drawn arrowhead).
  new EqualSum(
    ['R7C2', 'R7C3', 'R8C3'],
    ['R6C4', 'R5C5']),

  // Bulb 7: heavy white stroke R7C6-R8C6, with two separately attached
  // arrows (each attached arrow independently equals the bulb, per rules):
  // one through R6C6 to R6C5 (drawn arrowhead), one through R8C7 to R7C7
  // (drawn arrowhead).
  new EqualSum(
    ['R7C6', 'R8C6'],
    ['R6C6', 'R6C5'],
    ['R8C7', 'R7C7']),

  // Bulb 8: heavy white stroke R3C1-R4C1-R5C1 -> its own extension R4C2
  // (drawn arrowhead).
  new EqualSum(
    ['R3C1', 'R4C1', 'R5C1'],
    ['R4C2']),

  // Bulb 9: heavy white stroke R8C4-R9C4-R9C5 -> its own extension
  // R7C4-R7C5-R8C5 (drawn arrowhead at R8C5).
  new EqualSum(
    ['R8C4', 'R9C4', 'R9C5'],
    ['R7C4', 'R7C5', 'R8C5']),

  // Bulb 10: plain circle at R6C7 -> its thin stroke R7C8 (drawn arrowhead).
  new EqualSum(
    ['R6C7'],
    ['R7C8']),
];
