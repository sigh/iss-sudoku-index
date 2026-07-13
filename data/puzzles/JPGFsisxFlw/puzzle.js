// Title: A Bouquet of Complements
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=JPGFsisxFlw
// Source: https://sudokupad.app/pzl2b5oua1

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
//
// Fog: "Entering enough correct digits in cells will reveal more of the
// puzzle" and "Each time the fog clears, another pair will appear" are
// fog/reveal presentation only - the puzzle's real content is the fixed set
// of 16 circled 2-digit numbers below, so fog is not modelled.
//
// Each circle covers 2 horizontally-adjacent cells and is read left-to-right
// as a 2-digit number (left cell = tens digit, right cell = units digit).
// The circles are drawn clustered two-per-box; each box's two circled
// numbers add to 90 - except box 3 (top-right) and box 6 (middle-right),
// which have only one circle apiece, so their two numbers pair with each
// other. That accounts for all 16 circles in 8 summing pairs.
function circledPairSum90(tensA, onesA, tensB, onesB) {
  return new Sum(90, [tensA, 10], onesA, [tensB, 10], onesB);
}

const circledPairs = [
  // Box 5
  ['R4C4', 'R4C5', 'R6C5', 'R6C6'],
  // Box 1
  ['R1C2', 'R1C3', 'R2C2', 'R2C3'],
  // Box 7
  ['R7C1', 'R7C2', 'R9C2', 'R9C3'],
  // Box 2
  ['R1C4', 'R1C5', 'R2C4', 'R2C5'],
  // Box 8
  ['R7C5', 'R7C6', 'R8C4', 'R8C5'],
  // Box 4
  ['R5C1', 'R5C2', 'R6C1', 'R6C2'],
  // Box 9
  ['R7C8', 'R7C9', 'R8C7', 'R8C8'],
  // Box 3 + Box 6 (only one circle in each box, so they pair together)
  ['R6C8', 'R6C9', 'R1C7', 'R1C8'],
];

return [
  new Shape('9x9'),

  // Killer cage, upper-left total 24, digits distinct.
  new Cage(24, 'R4C6', 'R5C4', 'R5C5', 'R5C6'),

  // Purple Renban line: consecutive digits, any order.
  new Renban('R1C1', 'R2C1', 'R3C1', 'R3C2'),

  // Green German Whisper line: adjacent difference >= 5.
  new Whisper(5, 'R9C1', 'R8C1', 'R8C2', 'R8C3', 'R7C3'),

  // Teal Modular line: every run of 3 adjacent cells has one digit from
  // each of {1,4,7}, {2,5,8}, {3,6,9}.
  new Modular(3, 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6'),

  // White dot: difference of 1 (Kropki white dot).
  new WhiteDot('R9C4', 'R9C5'),

  // Circled 2-digit-number pairs, each summing to 90.
  ...circledPairs.map(([tA, oA, tB, oB]) => circledPairSum90(tA, oA, tB, oB)),
];
