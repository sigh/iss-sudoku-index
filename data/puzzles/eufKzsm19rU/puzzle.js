// Title: Hearts and Flowers
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=eufKzsm19rU
// Source: https://sudokupad.app/c5jnbcdxf1

// Normal sudoku rules apply: Shape gives the 9x9 grid plus row, column and
// box all-different groups.
//
// "Orthogonally adjacent cells do not sum to 5 or 10." No X/V dots are
// drawn anywhere in the puzzle, so StrictXV's usual "only marked pairs obey
// XV" behaviour degenerates to its negative half for every adjacent pair in
// the grid: with zero X/V constraints supplied, every orthogonally adjacent
// cell pair gets the sum != 5 and sum != 10 constraint.
const noFiveOrTen = new StrictXV();

// "Adjacent digits along a green line have a difference of at least five."
// Two closed heart-shaped loops; each is drawn as one continuous stroke
// returning to its start cell, so the cell list repeats the first cell at
// the end to cover the wrap-around edge.
const heartTopLeft = new Whisper(
  5,
  'R3C1', 'R4C1', 'R5C2', 'R6C3', 'R5C4', 'R4C5', 'R3C5', 'R2C4',
  'R3C3', 'R2C2', 'R3C1');
const heartBottomRight = new Whisper(
  5,
  'R6C5', 'R7C5', 'R8C6', 'R9C7', 'R8C8', 'R7C9', 'R6C9', 'R5C8',
  'R6C7', 'R5C6', 'R6C5');

// "Cells separated by a flower sum to 13." Eleven flower markers, each on
// the shared edge of one orthogonally adjacent cell pair. "Not all possible
// flowers are necessarily given" means this is a positive-only clue list:
// no negative implication for unmarked pairs that happen to sum to 13.
const flowerPairs = [
  ['R2C1', 'R3C1'],
  ['R3C2', 'R3C3'],
  ['R1C7', 'R2C7'],
  ['R2C8', 'R3C8'],
  ['R1C8', 'R1C9'],
  ['R5C2', 'R5C3'],
  ['R5C5', 'R6C5'],
  ['R4C7', 'R5C7'],
  ['R6C7', 'R7C7'],
  ['R7C8', 'R8C8'],
  ['R8C2', 'R9C2'],
];
const flowers = flowerPairs.map(([a, b]) => new Sum(13, a, b));

return [
  new Shape('9x9'),
  noFiveOrTen,
  heartTopLeft,
  heartBottomRight,
  ...flowers,
];
