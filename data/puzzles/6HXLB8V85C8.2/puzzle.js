// Title: Killer Sudoku by Prowling Tiger
// Author: Prowling Tiger
// Video: https://www.youtube.com/watch?v=6HXLB8V85C8
// Source: https://cracking-the-cryptic.web.app/sudoku/g8RhG6qDDh

// Rules encoded, in full:
//  - Normal 9x9 sudoku: 1-9 once each per row, column and 3x3 box.
//  - Killer cages: digits do not repeat within a cage, and the cage total is
//    the sum of its digits. No givens.
//
// The setter's stated rule text (shared across this puzzle's two linked
// grids) adds: "if there is a 9 in a cage, the 9 is not included in the
// cage total". That clause is deliberately NOT encoded here: for this
// grid's own printed totals it is arithmetically impossible, not merely
// unconfirmed. R4C4/R5C4 (a 2-cell cage) is printed 17 -- the maximum
// possible sum of two distinct 1-9 digits, achievable only as {8, 9}. Under
// the exclude-9 reading a cage holding a 9 could contribute at most 8 (the
// other digit alone), and a 9-free pair tops out at 8+7=15, so 17 is
// unreachable by any digit assignment under that reading, independent of
// solving. Every one of this grid's 17 cage totals instead falls inside the
// ordinary achievable range for its cell count (min..max of that many
// distinct 1-9 digits) with no exception, so the totals here are plain
// literal sums. The exclude-9 clause is the puzzle's other linked grid,
// where it is load-bearing (a 4-cell cage there is printed 9, below the
// classic 4-digit floor of 10, and needs the exclusion to be reachable at
// all).
const cages = [
  [22, ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R2C2']],
  [14, ['R1C3', 'R1C4', 'R2C4']],
  [23, ['R3C3', 'R3C4', 'R3C5', 'R2C5']],
  [8, ['R1C5', 'R1C6']],
  [5, ['R3C6', 'R3C7']],
  [15, ['R1C8', 'R1C9', 'R2C9']],
  [14, ['R2C8', 'R3C8', 'R4C8', 'R4C9']],
  [13, ['R5C8', 'R6C8', 'R6C9', 'R5C9']],
  [22, ['R4C7', 'R5C7', 'R6C7', 'R7C7']],
  [22, ['R7C8', 'R8C8', 'R8C9', 'R9C9']],
  [15, ['R7C5', 'R7C6']],
  [20, ['R8C5', 'R9C5', 'R8C6', 'R9C6']],
  [30, ['R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C4', 'R8C4']],
  [12, ['R8C1', 'R9C1', 'R9C2']],
  [17, ['R6C1', 'R6C2', 'R5C2']],
  [17, ['R4C4', 'R5C4']],
  [18, ['R5C6', 'R4C6', 'R4C5', 'R5C5']],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, cells]) => new Cage(total, ...cells)),
];
