// Title: Pentominoku for Layla
// Author: ibn Muhyiddin
// Video: https://www.youtube.com/watch?v=xcq7-hwNfEw
// Source: https://app.crackingthecryptic.com/5nyl31krz4

// Rules encoded here:
//   Normal sudoku rules apply.
// Omitted: the hidden pentomino tiling, each pentomino's associated-number
// count, and the star-cell values, which depend on that tiling.

return [
  new Shape('9x9'),
  // Standard 3x3 regions, named explicitly because this is the serializable
  // part of the normal-Sudoku rule.
  new RegionSize(9),
];
