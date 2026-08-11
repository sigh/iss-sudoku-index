// Title: Multiples Sudoku
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=44INUSVyMsw
// Source: https://app.crackingthecryptic.com/sudoku/QLhQ6B6HHb

// Normal sudoku rules apply -- Shape('9x9')'s default row/column/box
// all-different constraints already match this puzzle's drawn regions
// (nine standard 3x3 boxes), so nothing extra is needed for that clause.
//
// Edge clue: a number printed on the border between two orthogonally
// adjacent cells means the two-digit number formed by those two cells'
// digits -- read left-to-right for a horizontal edge, top-to-bottom
// ("downwards") for a vertical edge -- is a multiple of the printed clue.
// Each clue is encoded as a Pair over exactly its own two cells (not one
// multi-cell Pair) so unrelated clues never share a relation.

const keyForMultiple = new Map(
  [3, 5, 7, 8, 9].map(clue => [
    clue,
    // a is the left/top cell, b is the right/bottom cell; 10*a+b is the
    // two-digit number the rule describes.
    Pair.fnToKey((a, b) => (10 * a + b) % clue === 0, 9),
  ]));

const multipleOf = (clue, a, b) =>
  new Pair(keyForMultiple.get(clue), `${clue}`, a, b);

return [
  new Shape('9x9'),

  // Edge clue coordinates transcribed from the drawn edge markers: each is
  // listed left-then-right or top-then-bottom, matching the rule's required
  // reading direction.
  multipleOf(8, 'R1C1', 'R1C2'),
  multipleOf(8, 'R2C1', 'R2C2'),
  multipleOf(8, 'R3C2', 'R3C3'),
  multipleOf(8, 'R4C4', 'R5C4'),
  multipleOf(8, 'R5C2', 'R6C2'),
  multipleOf(8, 'R6C1', 'R6C2'),
  multipleOf(8, 'R5C1', 'R6C1'),
  multipleOf(8, 'R7C3', 'R8C3'),
  multipleOf(8, 'R8C4', 'R9C4'),
  multipleOf(8, 'R1C8', 'R1C9'),
  multipleOf(8, 'R2C8', 'R2C9'),
  multipleOf(8, 'R3C7', 'R3C8'),
  multipleOf(8, 'R4C7', 'R5C7'),
  multipleOf(8, 'R5C8', 'R6C8'),
  multipleOf(8, 'R5C9', 'R6C9'),
  multipleOf(8, 'R7C8', 'R8C8'),
  multipleOf(8, 'R7C7', 'R8C7'),
  multipleOf(9, 'R2C9', 'R3C9'),
  multipleOf(9, 'R4C3', 'R5C3'),
  multipleOf(9, 'R4C6', 'R5C6'),
  multipleOf(7, 'R2C6', 'R3C6'),
  multipleOf(7, 'R1C7', 'R2C7'),
  multipleOf(7, 'R6C8', 'R6C9'),
  multipleOf(7, 'R7C9', 'R8C9'),
  multipleOf(7, 'R9C7', 'R9C8'),
  multipleOf(7, 'R2C1', 'R3C1'),
  multipleOf(5, 'R1C3', 'R2C3'),
  multipleOf(5, 'R2C4', 'R3C4'),
  multipleOf(3, 'R8C6', 'R9C6'),
  multipleOf(3, 'R9C2', 'R9C3'),
  multipleOf(3, 'R7C2', 'R8C2'),
  multipleOf(3, 'R7C1', 'R8C1'),
];
