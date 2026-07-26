// Title: Cube Roots of Pi
// Author: Blobz
// Video: https://www.youtube.com/watch?v=l7Q-m-oiPeE
// Source: https://sudokupad.app/e0ry5e3pzy

// Normal sudoku rules apply (default row/column/box all-different).
//
// "Each cage's sum is a perfect cube": no cage shows a printed total, so the
// cube rule supplies it. A single-cell cage's sum is just its digit, so a
// cube in 1-9 (1 or 8) restricts that digit directly -- there is no local
// interaction to encode, only the candidate restriction below. The two
// 2-cell cages range 3-17; the only cube in that range is 8, so both must
// sum to exactly 8.
//
// "Box borders divide blue lines into segments with the same sum": each
// blue line's cells lying in one box form a segment, and every segment of
// that same line shares one common sum -- exactly RegionSumLine semantics.
//
// "Along pink lines, digits form a non-repeating consecutive sequence in
// any order": Renban.

return [
  new Shape('9x9'),

  new Given('R1C1', 3),
  new Given('R4C2', 3),
  new Given('R7C3', 3),

  // Single-cell no-total cages: sum-is-a-perfect-cube restricts the digit
  // itself to a cube in [1,9] (1 or 8).
  new Given('R9C7', 1, 8),
  new Given('R6C6', 1, 8),
  new Given('R9C2', 1, 8),
  new Given('R1C2', 1, 8),

  // 2-cell no-total, unique-flagged cages: distinct pair whose sum range
  // (3-17) contains exactly one perfect cube, 8.
  new Cage(8, 'R7C1', 'R8C1'),
  new Cage(8, 'R4C7', 'R4C8'),

  // Blue lines: box-border-divided equal-sum segments.
  ...[
    ['R2C1', 'R3C2', 'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
    ['R5C2', 'R6C3', 'R5C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8'],
    ['R8C3', 'R9C4', 'R8C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9'],
  ].map(cells => new RegionSumLine(...cells)),

  // Pink lines: renban.
  ...[
    ['R3C4', 'R2C4', 'R2C5', 'R2C6', 'R3C6'],
    ['R6C5', 'R5C5', 'R5C6', 'R5C7', 'R6C7'],
    ['R9C6', 'R8C6', 'R8C7', 'R8C8', 'R9C8'],
  ].map(cells => new Renban(...cells)),
];
