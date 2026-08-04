// Title: Stare Directly At The Sum
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=UdrSsA2sg8M
// Source: https://app.crackingthecryptic.com/sudoku/4fhh3ngL9G

// Normal sudoku rules apply (standard 3x3 boxes, no jigsaw).
//
// Arrows: digits along each arrow's arm sum to the digit in its circle
// (Arrow class, control cell first). Cell pairs transcribed from the raw
// arrow wayPoints; circle cells cross-checked against the drawn circle
// underlays. Two circle cells (R3C4, R7C6) each host two separate arrows
// that share the same total.
//
// Odd/Even mirror: a purple line runs the full main diagonal R1C1-R9C9 (a
// white line drawn underneath along the identical path is a rendering
// outline, not a second clue). The rules' own worked example
// ("if r6c2 is odd, r2c6 must also be odd") shows the mirror maps each cell
// (r,c) to its transpose (c,r): both must share parity. Encoded as a
// same-parity Pair for every off-diagonal cell and its mirror image;
// diagonal cells map to themselves and need no constraint.

const sameParityKey = Pair.fnToKey((a, b) => (a % 2) === (b % 2), 9);

const mirrorPairs = [];
for (let r = 1; r <= 9; r++) {
  for (let c = r + 1; c <= 9; c++) {
    mirrorPairs.push([makeCellId(r, c), makeCellId(c, r)]);
  }
}

return [
  new Shape('9x9'),

  new Arrow('R1C4', 'R1C3', 'R1C2'),
  new Arrow('R1C8', 'R2C9', 'R3C9'),
  new Arrow('R4C6', 'R3C7', 'R4C8'),
  new Arrow('R6C4', 'R7C3', 'R7C2'),
  new Arrow('R4C3', 'R5C2', 'R5C1'),
  new Arrow('R3C4', 'R2C3', 'R3C2'),
  new Arrow('R3C4', 'R4C5', 'R5C6'),
  new Arrow('R6C7', 'R7C8', 'R7C9'),
  new Arrow('R7C6', 'R8C5', 'R9C5'),
  new Arrow('R7C6', 'R6C5', 'R5C4'),
  new Arrow('R8C1', 'R8C2', 'R9C3'),

  ...mirrorPairs.map(([a, b]) => new Pair(sameParityKey, '', a, b)),
];
