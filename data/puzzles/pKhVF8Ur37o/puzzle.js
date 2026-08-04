// Title: Turquoise
// Author: bellsita
// Video: https://www.youtube.com/watch?v=pKhVF8Ur37o
// Source: https://app.crackingthecryptic.com/sudoku/F4rth2r3mP

// Normal sudoku rules apply (default row/column/box all-different, digits 1-9).
// Rule: "Digits along a blue line sum to the same value in each 3x3 box the
// line passes through. Different lines may have different sums." This is
// RegionSumLine's exact semantics (equal sum per box segment, split by
// walking the line in list order), applied once per distinct blue line.
// Rule: a black dot means the two digits are in a 1:2 ratio; a white dot
// means the two digits are consecutive. "Not all dots are given" -- so no
// negative constraint is added for cell pairs without a drawn dot.

return [
  new Shape('9x9'),

  new Given('R2C5', 4),
  new Given('R8C5', 3),

  // Blue region-sum lines, transcribed from the drawn line geometry.
  // The source draws each of these 7 strokes twice (duplicate layer); only
  // one instance of each is encoded here.
  new RegionSumLine('R1C2', 'R2C2', 'R3C2', 'R4C3', 'R5C3', 'R6C3', 'R7C2', 'R8C2', 'R9C2'),
  new RegionSumLine('R1C1', 'R2C1', 'R3C1', 'R4C2', 'R5C2', 'R6C2'),
  new RegionSumLine('R1C8', 'R2C8', 'R3C8', 'R4C7', 'R5C7', 'R6C7', 'R7C8', 'R8C8', 'R9C8'),
  new RegionSumLine('R1C9', 'R2C9', 'R3C9', 'R4C8', 'R5C8', 'R6C8'),
  new RegionSumLine('R4C4', 'R3C4', 'R2C5', 'R2C6'),
  new RegionSumLine('R6C6', 'R7C5', 'R8C5', 'R8C4'),
  new RegionSumLine('R3C5', 'R4C5', 'R5C6'),

  // White dots (consecutive), transcribed from the drawn edge marks (fill
  // #FFFFFF). Each of these 6 distinct marks is likewise drawn twice.
  new WhiteDot('R7C3', 'R8C3'),
  new WhiteDot('R8C3', 'R9C3'),
  new WhiteDot('R6C2', 'R7C2'),
  new WhiteDot('R6C8', 'R7C8'),
  new WhiteDot('R4C5', 'R5C5'),
  new WhiteDot('R5C5', 'R6C5'),

  // Black dots (1:2 ratio), transcribed from the drawn edge marks (fill
  // #000000). Each of these 4 distinct marks is likewise drawn twice.
  new BlackDot('R3C2', 'R4C2'),
  new BlackDot('R3C8', 'R4C8'),
  new BlackDot('R7C7', 'R8C7'),
  new BlackDot('R8C7', 'R9C7'),
];
