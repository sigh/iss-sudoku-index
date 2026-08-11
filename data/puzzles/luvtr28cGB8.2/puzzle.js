// Title: June 15, 2022: XIVI
// Author: clover!
// Video: https://www.youtube.com/watch?v=luvtr28cGB8
// Source: https://tinyurl.com/5beuv8xa

// Standard Sudoku givens. Every marked border between two horizontally
// adjacent cells is a two-cell sum: an "XI" border sums to 11, a "VI"
// border sums to 6. The rules state "Not all XIs or VIs are necessarily
// given", so an unmarked pair summing to 11 or 6 is not forbidden -- no
// negative constraint is encoded. Sum (not Cage) is used since the rule
// gives no uniqueness requirement; the row all-different already forces
// the two cells apart since every pair below is horizontally adjacent.
const givens = [
  ['R1C4', 1], ['R2C5', 2], ['R3C6', 3], ['R4C8', 4],
  ['R6C2', 6], ['R7C6', 7], ['R8C5', 8], ['R9C4', 9],
];

// Left, right cell of each marked border, from the "text" overlays in the
// source payload (each duplicated by a decorative circle over the same
// two cells, confirmed 1:1 by pair, so the circles add no new clue).
const xiPairs = [
  ['R1C5', 'R1C6'], ['R2C1', 'R2C2'], ['R2C8', 'R2C9'], ['R3C4', 'R3C5'],
  ['R4C3', 'R4C4'], ['R4C6', 'R4C7'], ['R5C2', 'R5C3'], ['R5C7', 'R5C8'],
  ['R6C3', 'R6C4'], ['R6C6', 'R6C7'], ['R7C3', 'R7C4'], ['R8C8', 'R8C9'],
  ['R9C6', 'R9C7'],
];
const viPairs = [
  ['R1C6', 'R1C7'], ['R2C7', 'R2C8'], ['R3C3', 'R3C4'], ['R5C3', 'R5C4'],
  ['R5C6', 'R5C7'], ['R7C4', 'R7C5'], ['R7C8', 'R7C9'], ['R8C7', 'R8C8'],
  ['R9C5', 'R9C6'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xiPairs.map(([a, b]) => new Sum(11, a, b)),
  ...viPairs.map(([a, b]) => new Sum(6, a, b)),
];
