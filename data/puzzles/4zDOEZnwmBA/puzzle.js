// Title: Hitlines
// Author: Marty Sears & Ratfinkz
// Video: https://www.youtube.com/watch?v=4zDOEZnwmBA
// Source: https://sudokupad.app/x75we00sgg

// Normal sudoku rules apply (default row/column/box all-different).
//
// Digits along each beige "hitline" do not repeat -- encoded below as one
// AllDifferent per line, from the cells the line is drawn over.
//
// PARTIAL: each hitline also carries a blue-circle/two-digit-pill clue
// whose number is the sum of the digits that land on their own position
// number, counted from the line's marked "position 1" cell (comment below
// each line). That clue number is not present anywhere in the source
// payload, so the position/total half of the rule cannot be encoded; only
// the plain "no repeats" half is expressed here.

const hitlines = [
  // h0, position 1 = R1C3 (pill on R1C1/R1C2 points here)
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  // h1, position 1 = R7C1 (pill on R8C1/R9C1 points here)
  ['R7C1', 'R6C1', 'R5C2', 'R4C1', 'R3C1', 'R3C2', 'R3C3', 'R4C3'],
  // h2, position 1 = R7C3 (circle on R6C2 points here)
  ['R7C3', 'R8C4', 'R9C3'],
  // p3, position 1 = R1C8 (circle on R1C9 points here)
  ['R1C8', 'R2C8', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9'],
  // p4, position 1 = R6C7 (circle on R6C8 points here)
  ['R6C7', 'R6C6', 'R6C5'],
  // h5, position 1 = R4C6 (circle on R3C5 points here)
  ['R4C6', 'R5C6', 'R5C5', 'R4C5', 'R3C4', 'R2C4', 'R2C5', 'R2C6', 'R3C6'],
  // h6, position 1 = R8C5 (circle on R7C6 points here)
  ['R8C5', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C8', 'R7C9'],
];

return [
  new Shape('9x9'),
  ...hitlines.map(cells => new AllDifferent(...cells)),
];
