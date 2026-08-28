// Title: Surplus
// Author: Unknown
// Video: https://www.youtube.com/watch?v=fu7zJExacac
// Source: https://cracking-the-cryptic.web.app/sudoku/j3Nq9B6Nfp

// 1-7 in each row and column (standard Latin square; no box all-different --
// NoBoxes drops the default box groups since this puzzle's regions are not
// standard boxes). Each of the six 8-cell pinwheel regions must contain each
// of 1-7 at least once, encoded with ContainAtLeast: 8 cells holding all 7
// values at least once forces exactly one repeated ("surplus") value per
// region -- ContainAtLeast('1_2_3_4_5_6_7', ...) states exactly that.
//
// The single centre cell R4C4 is its own region in the payload's region
// partition, but a 1-cell region can never hold all of 1-7 at least once --
// that reading is arithmetically unsatisfiable for any digit placed there,
// regardless of the rest of the grid. So the "each region" rule is applied
// only to the six 8-cell regions; R4C4 is still bound by its row and
// column, just not by any region-content rule.

return [
  new Shape('7x7'),
  new NoBoxes(),

  // Givens -- from the payload's cell array.
  new Given('R1C1', 1),
  new Given('R1C4', 7),
  new Given('R2C2', 2),
  new Given('R2C5', 6),
  new Given('R3C3', 3),
  new Given('R3C6', 1),
  new Given('R4C1', 7),
  new Given('R4C7', 5),
  new Given('R5C2', 6),
  new Given('R5C5', 5),
  new Given('R6C3', 4),
  new Given('R6C6', 6),
  new Given('R7C4', 1),
  new Given('R7C7', 7),

  // Region A.
  new ContainAtLeast(
    '1_2_3_4_5_6_7',
    'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C6', 'R2C7', 'R3C7', 'R4C7'),
  // Region B.
  new ContainAtLeast(
    '1_2_3_4_5_6_7',
    'R1C2', 'R1C3', 'R2C3', 'R2C4', 'R2C5', 'R3C4', 'R3C5', 'R3C6'),
  // Region C.
  new ContainAtLeast(
    '1_2_3_4_5_6_7',
    'R1C1', 'R2C1', 'R2C2', 'R3C1', 'R3C2', 'R3C3', 'R4C2', 'R4C3'),
  // Region E.
  new ContainAtLeast(
    '1_2_3_4_5_6_7',
    'R4C5', 'R4C6', 'R5C5', 'R5C6', 'R5C7', 'R6C6', 'R6C7', 'R7C7'),
  // Region F.
  new ContainAtLeast(
    '1_2_3_4_5_6_7',
    'R5C2', 'R5C3', 'R5C4', 'R6C3', 'R6C4', 'R6C5', 'R7C5', 'R7C6'),
  // Region G.
  new ContainAtLeast(
    '1_2_3_4_5_6_7',
    'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R7C1', 'R7C2', 'R7C3', 'R7C4'),
];
