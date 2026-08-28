// Title: April 15, 2022: Magic Square
// Author: clover!
// Video: https://www.youtube.com/watch?v=wnE1j-agx2Y
// Source: https://tinyurl.com/2p8ufymn
//
// Normal sudoku rules apply, plus: each blue 3x3 region is a magic square
// -- it holds 1-9 once each, and its 3 rows, 3 columns, and 2 diagonals
// (within the region) each sum to 15.
//
// Two of the four regions coincide with a standard sudoku box, so the
// engine's own box all-different already gives them "1-9 once each";
// AllDifferent is added only for the two that straddle two standard boxes
// and so have no implicit all-different. Every region still gets the
// EqualSum over its 3 rows, 3 columns, and 2 diagonals for the magic-sum
// clause; the common sum is forced to 15 by whichever all-different
// (box or explicit) applies to that region.

// Magic-square region cell tables, row-major (row1, row2, row3), each a
// literal transcription of one shaded region's cell list.
const magicSquares = [
  // A: R1C7-C9 / R2C7-C9 / R3C7-C9 -- coincides with a standard box
  {
    rows: [
      ['R1C7', 'R1C8', 'R1C9'],
      ['R2C7', 'R2C8', 'R2C9'],
      ['R3C7', 'R3C8', 'R3C9'],
    ],
    boxAligned: true,
  },
  // B: R2C2-C4 / R3C2-C4 / R4C2-C4 -- straddles two standard boxes
  {
    rows: [
      ['R2C2', 'R2C3', 'R2C4'],
      ['R3C2', 'R3C3', 'R3C4'],
      ['R4C2', 'R4C3', 'R4C4'],
    ],
    boxAligned: false,
  },
  // C: R6C6-C8 / R7C6-C8 / R8C6-C8 -- straddles two standard boxes
  {
    rows: [
      ['R6C6', 'R6C7', 'R6C8'],
      ['R7C6', 'R7C7', 'R7C8'],
      ['R8C6', 'R8C7', 'R8C8'],
    ],
    boxAligned: false,
  },
  // D: R7C1-C3 / R8C1-C3 / R9C1-C3 -- coincides with a standard box
  {
    rows: [
      ['R7C1', 'R7C2', 'R7C3'],
      ['R8C1', 'R8C2', 'R8C3'],
      ['R9C1', 'R9C2', 'R9C3'],
    ],
    boxAligned: true,
  },
];

// For one 3x3 region, return the EqualSum over its 3 rows, 3 columns, and 2
// diagonals, plus AllDifferent (1-9 once each) only when not already implied
// by a standard box.
const magicSquareConstraints = ({ rows, boxAligned }) => {
  const cols = [0, 1, 2].map((c) => rows.map((row) => row[c]));
  const diag1 = [rows[0][0], rows[1][1], rows[2][2]];
  const diag2 = [rows[0][2], rows[1][1], rows[2][0]];
  return [
    ...(boxAligned ? [] : [new AllDifferent(...rows.flat())]),
    new EqualSum(...rows, ...cols, diag1, diag2),
  ];
};

return [
  new Shape('9x9'),

  // Givens (13).
  new Given('R1C1', 7),
  new Given('R1C3', 4),
  new Given('R1C7', 8),
  new Given('R2C9', 7),
  new Given('R3C1', 6),
  new Given('R3C7', 4),
  new Given('R6C4', 5),
  new Given('R7C1', 4),
  new Given('R7C9', 8),
  new Given('R8C3', 7),
  new Given('R9C1', 8),
  new Given('R9C7', 2),
  new Given('R9C9', 4),

  ...magicSquares.flatMap(magicSquareConstraints),
];
