// Title: Hariyama
// Author: Justalilguy & Chefofdeath
// Video: https://www.youtube.com/watch?v=AugLh4Y8XdA
// Source: https://sudokupad.app/d9fq0ll77a

// Normal sudoku rules apply.
//
// Region Sum Lines: box borders divide each line into segments with equal
// sums; different lines may have different sums.
//
// Killer cages: digits in a cage do not repeat and sum to the given total.
// Two cages are marked "A" instead of a numeric total: they still forbid
// repeats, and their (unstated) totals must be equal to each other.

const givens = [];

// Killer cages with an explicit total.
const numberedCages = [
  new Cage(10, 'R1C5', 'R1C6'),
  new Cage(10, 'R5C1', 'R6C1'),
  new Cage(10, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(9, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(29, 'R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Cage(11, 'R4C4', 'R4C5', 'R5C4'),
];

// The two "A" cages: no stated total, but digits are still all-different
// (killer rule), and their totals must match each other.
const cageA1 = ['R3C6', 'R3C7'];
const cageA2 = ['R6C3', 'R7C3'];
const markedCages = [
  new AllDifferent(...cageA1),
  new AllDifferent(...cageA2),
  new EqualSum(cageA1, cageA2),
];

// Region Sum Lines, read off the drawn geometry (row-major, .5-offset
// waypoints converted to cell paths). Each is one continuous stroke.
const regionSumLines = [
  new RegionSumLine(
    'R2C1', 'R3C1', 'R4C2', 'R4C3', 'R4C4', 'R3C4', 'R2C4', 'R1C3', 'R1C2'),
  new RegionSumLine(
    'R4C9', 'R4C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C4', 'R9C4'),
  new RegionSumLine(
    'R5C8', 'R6C9', 'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R9C6', 'R8C5'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...numberedCages,
  ...markedCages,
  ...regionSumLines,
];
