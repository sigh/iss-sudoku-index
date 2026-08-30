// Title: Multiples of 7 - a fun variant
// Author: Unknown
// Video: https://www.youtube.com/watch?v=-ss5o7lilfQ
// Source: https://cracking-the-cryptic.web.app/sudoku/NbNQjn8mfh

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes;
// the payload's `regions` array lists exactly the nine 3x3 blocks).
// Givens transcribed from the source's drawn grid.
//
// Omitted: the payload draws 28 identical small rounded markers on
// cell-adjacent edges (no digit, no colour distinction), forming 11
// disconnected components of orthogonally-connected cells. The source's
// rules text is empty for this ctc-app payload, and no other available
// evidence states what these markers mean or whether the relation is
// pairwise or chain-wide.

return [
  new Shape('9x9'),
  new Given('R2C8', 6),
  new Given('R3C7', 5),
  new Given('R5C5', 3),
  new Given('R7C3', 2),
  new Given('R8C2', 1),
];
