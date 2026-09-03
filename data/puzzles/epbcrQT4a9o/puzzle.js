// Title: FEEDING FRIENDSy: It's Not Pea-sy Being Green
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=epbcrQT4a9o
// Source: https://sudokupad.app/pdywima58n

// Encoded rules:
//  - Normal 9x9 sudoku. The drawn regions are the ordinary 3x3 boxes, so the
//    default Shape boxes are used. The puzzle has no given digits.
//  - "Digits separated by a brown, leafy twig sum to 5."
//  - "Digits separated by a large, green leaf have a difference of at least 5."
//  - "Digits separated by a round frog egg have a 1:2 ratio (one is double the
//    other)."
//  - "Not all possible twigs / leaves / frog eggs have been given", so an
//    unmarked cell border carries no restriction: no negative constraint
//    accompanies any of the three mark types.
//  - "No water lily may contain the same digit": the nine drawn water lilies
//    hold nine different digits.
//
// Omitted rules (each is stated in the rules text and is not encoded here):
//  - Croakz' path itself: a single self-avoiding, non-self-crossing route
//    starting on the frog's cell R7C2, stepping orthogonally or diagonally
//    (a diagonal step needing an open 2x2 space), blocked by the sharp-rock
//    walls and by the two rounded rocks on cell corners, and passing through
//    all nine water lilies in an order the solver chooses.
//  - The "split pea" segment sums: a segment of path cells between two water
//    lilies sums to a two-digit number formed by those two lilies' digits in
//    either order, and the opening segment from R7C2 up to the first lily
//    (including R7C2's own digit) sums to that lily's digit.

// Each mark is drawn straddling one cell border; the pairs below are the two
// cells the mark sits between.
const twigs = [
  ['R3C3', 'R3C4'],
  ['R8C1', 'R8C2'],
];
const leaves = [
  ['R5C3', 'R5C4'],
  ['R9C3', 'R9C4'],
];
const frogEggs = [
  ['R6C4', 'R6C5'],
];

// The nine cells carrying a water lily.
const waterLilies = [
  'R2C5', 'R3C9', 'R4C6', 'R5C3', 'R5C6',
  'R6C1', 'R6C9', 'R9C6', 'R9C9',
];

return [
  new Shape('9x9'),

  // V is the XV "sum to 5" relation.
  ...twigs.map((pair) => new V(...pair)),
  // Whisper's first argument is the minimum difference between adjacent cells;
  // on a two-cell line that is exactly "differ by at least 5".
  ...leaves.map((pair) => new Whisper(5, ...pair)),
  // BlackDot is the Kropki 1:2 relation.
  ...frogEggs.map((pair) => new BlackDot(...pair)),

  new AllDifferent(...waterLilies),
];
