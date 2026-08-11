// Title: Where Now?
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=NdIvQIlACnY
// Source: https://app.crackingthecryptic.com/sudoku/GTfhDgd738

// Normal sudoku rules apply. Digits along an arrow must sum to the digit in
// that arrow's circle. A digit cannot repeat on a main diagonal (each
// marked in blue). The cell containing the opaque grey circle contains an
// odd digit.
//
// No parity class exists; the odd-digit clue is encoded as a Given
// restricted to the odd values.
//
// Two bulbs (R4C4, R8C4) each anchor two separate arrows that fan out in
// different directions -- confirmed by matching every arrow's first
// (bulb) cell against the drawn circle-underlay centres, which yielded
// exactly the 7 distinct bulb cells the underlays show.

return [
  new Shape('9x9'),

  // Arrows: bulb cell first, then arm cells (Arrow permits repeats on the arm).
  new Arrow('R2C5', 'R3C4', 'R4C3'),
  new Arrow('R4C4', 'R3C5', 'R3C6'),
  new Arrow('R4C4', 'R5C3', 'R5C2', 'R5C1'),
  new Arrow('R6C3', 'R7C4'),
  new Arrow('R5C7', 'R4C8', 'R3C8', 'R3C9'),
  new Arrow('R6C7', 'R5C8', 'R5C9'),
  new Arrow('R8C4', 'R7C3'),
  new Arrow('R8C4', 'R9C5', 'R9C6'),
  new Arrow('R9C4', 'R9C3', 'R9C2', 'R8C3'),

  // Both main diagonals, no-repeat only (not a sum or full 1-9 requirement
  // beyond what no-repeat over 9 cells implies).
  new Diagonal(1),
  new Diagonal(-1),

  // Opaque grey-filled circle at R7C1: odd digit.
  new Given('R7C1', 1, 3, 5, 7, 9),
];
