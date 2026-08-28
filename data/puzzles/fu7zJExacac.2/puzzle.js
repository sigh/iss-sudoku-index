// Title: Deficit
// Author: Unknown
// Video: https://www.youtube.com/watch?v=fu7zJExacac
// Source: https://cracking-the-cryptic.web.app/sudoku/2RgdM3hFmb

// 7x7 grid, digits 1-7. `Shape('7x7')` gives the default Sudoku-grid row and
// column all-different groups; it adds no default box regions, since 7 has
// no factor pair that tiles a 7x7 grid.
//
// Rule (video description, naming this puzzle "Deficit"): "1-7 in each row
// and column; each region contains each number at most once." Regions come
// from the source's `regions` array: the corner cell R1C1 (a 1-cell region,
// no constraint possible), the rest of row 1, the rest of column 1, and the
// remaining 6x6 core split into six 2x3 boxes. Each 6-cell region gets
// AllDifferent only, not a full 1-7 house: "at most once" allows a region to
// omit one of the seven digits, which a 6-cell region always does.

return [
  new Shape('7x7'),

  // Givens, row-major.
  new Given('R2C4', 4),
  new Given('R2C7', 5),
  new Given('R3C3', 3),
  new Given('R3C5', 6),
  new Given('R4C2', 1),
  new Given('R4C6', 2),
  new Given('R5C3', 5),
  new Given('R5C7', 4),
  new Given('R6C4', 6),
  new Given('R6C6', 1),
  new Given('R7C2', 2),
  new Given('R7C5', 5),

  // Rest of row 1 (source `regions[0]`).
  new AllDifferent('R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'),
  // Rest of column 1 (source `regions[7]`).
  new AllDifferent('R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'),
  // 6x6 core, six 2x3 boxes (source `regions[1..6]`).
  new AllDifferent('R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4'),
  new AllDifferent('R2C5', 'R2C6', 'R2C7', 'R3C5', 'R3C6', 'R3C7'),
  new AllDifferent('R4C2', 'R4C3', 'R4C4', 'R5C2', 'R5C3', 'R5C4'),
  new AllDifferent('R4C5', 'R4C6', 'R4C7', 'R5C5', 'R5C6', 'R5C7'),
  new AllDifferent('R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4'),
  new AllDifferent('R6C5', 'R6C6', 'R6C7', 'R7C5', 'R7C6', 'R7C7'),
];
