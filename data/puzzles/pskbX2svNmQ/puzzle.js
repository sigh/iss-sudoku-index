// Title: Equal Sum Arrows
// Author: Sumanta (ANU)
// Video: https://www.youtube.com/watch?v=pskbX2svNmQ
// Source: https://app.crackingthecryptic.com/sudoku/JFgdrLjrdQ
//
// Normal sudoku rules apply (standard rows/columns/boxes). Where arrows point
// from the same cell, the sum of the digits along the two indicated diagonals
// (from that cell to the edge of the grid) is the same.
//
// The payload's `arrows` array draws small diagonal arrowheads in pairs: each
// pair shares one origin cell and points away from it along two of its four
// possible corner-to-corner diagonal directions. Reading each arrow's tail
// waypoint against its nearest cell and extending its drawn direction cell by
// cell to the grid edge recovers, for each origin, the two full diagonal rays
// whose digit sums the rule equates. Each ray is encoded as one EqualSum
// segment (a same-sum pair per origin, ten pairs total).

return [
  new Shape('9x9'),

  // R2C5: up-left ray to R1C4 vs down-left ray to R6C1.
  new EqualSum(
    ['R2C5', 'R1C4'],
    ['R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'],
  ),
  // R5C2: up-left ray to R4C1 vs up-right ray to R1C6.
  new EqualSum(
    ['R5C2', 'R4C1'],
    ['R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'],
  ),
  // R4C7: down-left ray to R9C2 vs down-right ray to R6C9.
  new EqualSum(
    ['R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2'],
    ['R4C7', 'R5C8', 'R6C9'],
  ),
  // R8C6: up-left ray to R3C1 vs up-right ray to R5C9.
  new EqualSum(
    ['R8C6', 'R7C5', 'R6C4', 'R5C3', 'R4C2', 'R3C1'],
    ['R8C6', 'R7C7', 'R6C8', 'R5C9'],
  ),
  // R3C6: up-right ray to R1C8 vs down-right ray to R6C9.
  new EqualSum(
    ['R3C6', 'R2C7', 'R1C8'],
    ['R3C6', 'R4C7', 'R5C8', 'R6C9'],
  ),
  // R7C4: up-left ray to R4C1 vs down-left ray to R9C2.
  new EqualSum(
    ['R7C4', 'R6C3', 'R5C2', 'R4C1'],
    ['R7C4', 'R8C3', 'R9C2'],
  ),
  // R7C3: down-right ray to R9C5 vs down-left ray to R9C1.
  new EqualSum(
    ['R7C3', 'R8C4', 'R9C5'],
    ['R7C3', 'R8C2', 'R9C1'],
  ),
  // R6C7: down-left ray to R9C4 vs up-right ray to R4C9.
  new EqualSum(
    ['R6C7', 'R7C6', 'R8C5', 'R9C4'],
    ['R6C7', 'R5C8', 'R4C9'],
  ),
  // R5C7: down-left ray to R9C3 vs down-right ray to R7C9.
  new EqualSum(
    ['R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3'],
    ['R5C7', 'R6C8', 'R7C9'],
  ),
  // R6C4: up-left ray to R3C1 vs up-right ray to R1C9.
  new EqualSum(
    ['R6C4', 'R5C3', 'R4C2', 'R3C1'],
    ['R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ),
];
