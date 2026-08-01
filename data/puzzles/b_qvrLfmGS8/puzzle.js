// Title: Leap Day
// Author: arctan
// Video: https://www.youtube.com/watch?v=b_qvrLfmGS8
// Source: https://sudokupad.app/36fnN33h7L

// Normal Sudoku applies. In each drawn 29-cage and 29-diagonal, 2 and 9
// contribute zero; other digits contribute their value. Repeats are allowed.
const grid = cellGraph('9x9');
const leap = grid.makeOverlay('VL');
const leapKey = Pair.fnToKey(
  (digit, contribution) => contribution === (digit === 2 || digit === 9 ? 1 : digit + 1),
  9,
);

// The VL overlay stores each contribution plus one, so a 29 total over n
// cells becomes a Sum of 29+n. The pair predicate maps 2 and 9 to one.
const leapPairs = grid.cells().map(cell =>
  new Pair(leapKey, '', cell, leap.at(cell)));

// These cell lists are transcribed from the two drawn cages and four labelled
// diagonal rays, respectively.
const sums = [
  new Sum(43, ...leap.at([
    'R5C1', 'R6C1', 'R6C2', 'R7C1', 'R7C2', 'R7C3', 'R8C1',
    'R8C2', 'R8C3', 'R8C4', 'R9C2', 'R9C3', 'R9C4', 'R9C5',
  ])),
  new Sum(44, ...leap.at([
    'R3C2', 'R3C3', 'R3C4', 'R4C3', 'R4C4', 'R4C5', 'R5C4',
    'R5C5', 'R5C6', 'R6C5', 'R6C6', 'R6C7', 'R7C6', 'R7C7', 'R7C8',
  ])),
  new Sum(36, ...leap.at(['R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9'])),
  new Sum(37, ...leap.at(['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8'])),
  new Sum(37, ...leap.at(['R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'])),
  new Sum(37, ...leap.at(['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'])),
];

return [
  new Shape('9x9'),
  new Given('R2C2', 2),
  new Given('R2C3', 9),
  new Var('L', 'Leap-day contribution plus one', '9x9'),
  ...leapPairs,
  ...sums,
];
