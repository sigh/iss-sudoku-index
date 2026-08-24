// Title: Octopus
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=npAyDz4ypUM
// Source: https://app.crackingthecryptic.com/sudoku/rpd3h3nrp2
//
// Normal sudoku rules apply (default 3x3 boxes; regions in the payload are
// the ordinary nine boxes, not a jigsaw partition). Digits in diagonally
// adjacent cells (corner-touching only) must differ -- this is a subset of
// AntiKing (which also forbids orthogonal repeats), so it is encoded as an
// explicit inequality over every diagonal cell pair rather than AntiKing.
// Digits along an arrow sum to the digit(s) shown in its circle/pill; pills
// are read left-to-right (horizontal) or downwards (vertical), matching
// PillArrow's own reading-order requirement.

const at = (r, c) => makeCellId(r, c);

const givens = [
  new Given(at(2, 9), 3),
  new Given(at(3, 3), 4),
  new Given(at(4, 8), 3),
  new Given(at(6, 2), 3),
  new Given(at(7, 7), 4),
  new Given(at(8, 1), 3),
];

// Diagonal (corner-touching) non-repeat: every diagonal pair, both
// orientations, as a two-cell AllDifferent rather than AntiKing because the
// rule excludes orthogonal king-move neighbours.
const diagonalPairs = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    diagonalPairs.push(new AllDifferent(at(r, c), at(r + 1, c + 1)));
    diagonalPairs.push(new AllDifferent(at(r, c + 1), at(r + 1, c)));
  }
}

// Four pill arrows converge on the centre cell R5C5 from the middle of each
// edge ("octopus" arms). Pill cells given first, in reading order, per
// PillArrow's own requirement (right/down/down-right adjacency).
const pillArrows = [
  new PillArrow(2, at(5, 1), at(5, 2), at(5, 3), at(5, 4), at(5, 5)),
  new PillArrow(2, at(5, 8), at(5, 9), at(5, 7), at(5, 6), at(5, 5)),
  new PillArrow(2, at(1, 5), at(2, 5), at(3, 5), at(4, 5), at(5, 5)),
  new PillArrow(2, at(8, 5), at(9, 5), at(7, 5), at(6, 5), at(5, 5)),
];

// Four single-cell circle arrows reach in diagonally from each corner
// region toward the centre; the circle cell itself is the sum (bulb first).
const circleArrows = [
  new Arrow(at(2, 2), at(3, 3), at(4, 4)),
  new Arrow(at(2, 8), at(3, 7), at(4, 6)),
  new Arrow(at(8, 8), at(7, 7), at(6, 6)),
  new Arrow(at(8, 2), at(7, 3), at(6, 4)),
];

return [
  new Shape('9x9'),
  ...givens,
  ...diagonalPairs,
  ...pillArrows,
  ...circleArrows,
];
