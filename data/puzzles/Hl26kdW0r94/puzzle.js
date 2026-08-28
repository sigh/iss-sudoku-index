// Title: (untitled)
// Author: Daoud ibn Muhiddyin
// Video: https://www.youtube.com/watch?v=Hl26kdW0r94
// Source: https://cracking-the-cryptic.web.app/sudoku/8JtJGRFt2D

// Rules: normal Sudoku, plus "pairs of adjacent numbers on a line must sum
// to a prime number." The rules state not all possible such pairs are
// marked, so only the drawn adjacent pairs are constrained; an unmarked
// adjacent pair (on or off any line) is unrestricted.
//
// The source draws nine separate grey strokes bearing this rule (listed
// below) plus two entries with no rule effect: one renders a single point
// at R5C5 (no second cell, so no pair to constrain) and one has no
// coordinates at all (renders nothing). Neither is encoded.

const PRIMES = [2, 3, 5, 7, 11, 13, 17];
const primeSumKey = Pair.fnToKey((a, b) => PRIMES.includes(a + b), 9);

// Each array is one drawn stroke's cell sequence, in stroke order; Pair
// applies the relation to each consecutive pair in the list, which is
// exactly the drawn adjacent-pair set. Closed loops repeat their first cell
// at the end to cover the wrap-around edge.
const primeLines = [
  // Loop around 8 of box 1's 9 cells (all but R3C3).
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R2C2', 'R2C3', 'R1C3', 'R1C2', 'R1C1'],
  // Diamond loop in box 2, around its centre cell R5C2.
  ['R4C2', 'R5C1', 'R6C2', 'R5C3', 'R4C2'],
  // Straight line across row 5.
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  // Straight line down column 5, rows 1-5.
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5'],
  // Bent line.
  ['R2C6', 'R2C5', 'R2C4', 'R3C3'],
  // Line with a tail closing into a loop, in box 3.
  ['R1C6', 'R1C7', 'R1C8', 'R2C9', 'R2C8', 'R3C7', 'R2C7', 'R1C7'],
  // Short straight line down column 9, rows 4-6.
  ['R4C9', 'R5C9', 'R6C9'],
  // Bent line touching R7C9 and bouncing back through R7C8.
  ['R6C7', 'R7C8', 'R7C9', 'R7C8', 'R8C7'],
  // Loop spanning boxes 7 and 8.
  ['R7C6', 'R8C6', 'R8C5', 'R8C4', 'R7C3', 'R6C4', 'R6C5', 'R7C6'],
];

return [
  new Shape('9x9'),
  new Given('R8C2', 3),
  ...primeLines.map(
    (cells, i) => new Pair(primeSumKey, `Prime line ${i + 1}`, ...cells)),
];
