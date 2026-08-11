// Title: Blank Slate
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=YaMKLc8OBD4
// Source: https://app.crackingthecryptic.com/sudoku/T24NfjGNNf

// Normal 9x9 sudoku, no given digits. Rule: "For each pair of arrows outside
// the grid, the digits along the two indicated diagonals have equal sums.
// Digits can repeat along these diagonals if allowed by other rules." ->
// EqualSum (repeats allowed, no fixed total) per pair of diagonals.
//
// The source's 14 outside arrows are drawn as 7 tight back-to-back clusters
// of two: each cluster's two tails sit ~0.6 grid units apart just outside
// one boundary cell, separated from the next cluster by a ~1.4-unit gap
// (e.g. top-edge tail columns 3.2/3.8, then 5.2/5.8, then 7.2/7.8). Each
// cluster's two arrowheads splay into two different diagonals as they cross
// the border, so a cluster is one drawn pair indicating one equal-sum rule
// between those two diagonals; this pairing is read from tail proximity in
// the drawn art, not from the solution. Each diagonal's cell list is walked
// from its marked end to the far grid edge.

return [
  new Shape('9x9'),

  // Pair 1 (top edge, cluster at columns 3.2/3.8): R1C3-down-left vs
  // R1C5-down-right.
  new EqualSum(
    ['R1C3', 'R2C2', 'R3C1'],
    ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ),

  // Pair 2 (top edge, cluster at columns 5.2/5.8): R1C5-down-left vs
  // R1C7-down-right.
  new EqualSum(
    ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'],
    ['R1C7', 'R2C8', 'R3C9'],
  ),

  // Pair 3 (top edge, cluster at columns 7.2/7.8): R1C7-down-left vs
  // R1C9-down-right (single cell, since R1C9 is the grid's top-right cell).
  new EqualSum(
    ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1'],
    ['R1C9'],
  ),

  // Pair 4 (right edge, cluster at rows 2.2/2.8): R2C9-up-left vs
  // R4C9-down-left.
  new EqualSum(
    ['R2C9', 'R1C8'],
    ['R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'],
  ),

  // Pair 5 (right edge, cluster at rows 4.2/4.8): R4C9-up-left vs
  // R6C9-down-left.
  new EqualSum(
    ['R4C9', 'R3C8', 'R2C7', 'R1C6'],
    ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ),

  // Pair 6 (left edge, cluster at rows 5.2/5.8): R5C1-up-right vs
  // R7C1-down-right.
  new EqualSum(
    ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
    ['R7C1', 'R8C2', 'R9C3'],
  ),

  // Pair 7 (left edge, cluster at rows 7.2/7.8): R7C1-up-right vs
  // R9C1-down-right (single cell, since R9C1 is the grid's bottom-left cell).
  new EqualSum(
    ['R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7'],
    ['R9C1'],
  ),
];
