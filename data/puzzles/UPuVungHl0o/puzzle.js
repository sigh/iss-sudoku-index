// Title: The Composite Thread
// Author: palpot
// Video: https://www.youtube.com/watch?v=UPuVungHl0o
// Source: https://sudokupad.app/15rywuvxz9

// Rules encoded, in full:
//   Normal sudoku rules apply (place 1-9 once each in every row, column and
//   3x3 box). The 3x3 box borders divide each blue line into segments. The
//   digits on each segment of the same line must sum to the same total. The
//   digits along each line must sum to a unique number, and the sums of these
//   lines must form a set of consecutive numbers.
// The grid has no given digits, and the five blue lines are its only clues.

// The five blue lines, transcribed from the drawn strokes in waypoint order.
// No line re-enters a box, so each box segment is a run of consecutive cells.
const lines = [
  ['R2C6', 'R3C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R7C8', 'R7C7', 'R7C6', 'R7C5', 'R6C5', 'R6C4', 'R5C3', 'R6C2', 'R6C1',
    'R7C1', 'R7C2'],
  ['R9C1', 'R8C2', 'R7C3', 'R8C4', 'R8C5', 'R8C6', 'R9C7', 'R8C8'],
  ['R8C9', 'R7C9', 'R6C9', 'R5C8', 'R5C7', 'R5C6', 'R4C5', 'R3C5', 'R2C5'],
  ['R3C2', 'R2C2', 'R2C3', 'R1C3', 'R2C4', 'R1C5', 'R1C6', 'R2C7', 'R1C8',
    'R1C9'],
];

// One rank cell per line, restricted to 1-5 and all different below, so the
// five ranks are a permutation of 1-5.
const rank = new Var('L', 'Line total rank', lines.length);

return [
  new Shape('9x9'),
  rank,
  ...rank.cells().map((cell) => new Given(cell, 1, 2, 3, 4, 5)),
  new AllDifferent(...rank.cells()),

  ...lines.map((cells) => new RegionSumLine(...cells)),

  // "the sums of these lines must form a set of consecutive numbers", and each
  // line's sum is unique: appending its rank to a line makes all five totals
  // equal, so total(i) = K - rank(i). With the ranks a permutation of 1-5 the
  // five line totals are K-5 .. K-1, each line taking a different one (rank 1
  // is the largest total). K itself is never held in a cell: it lies past 9,
  // the grid's value range.
  new EqualSum(...lines.map((cells, i) => [...cells, rank.cell(i + 1)])),
];
