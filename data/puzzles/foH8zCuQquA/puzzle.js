// Title: 5 Years CTC
// Author: Jodawo
// Video: https://www.youtube.com/watch?v=foH8zCuQquA
// Source: https://app.crackingthecryptic.com/sudoku/RHFM28PFPj

// Standard sudoku (default boxes, no givens). Digits along a thermometer
// increase from the bulb. Neighbouring digits along a green line differ by
// at least 5. Digits on the orange line sum to 26.

// Six grey bulbs are drawn; three feed a single straight thermometer, three
// feed a Y-shaped one whose two arms share a common stem before splitting at
// an interior cell (not a bulb). Each drawn arm, stem included, is encoded as
// its own Thermo starting at the bulb, so the shared stem's ordering is
// stated once per arm and the split is exactly the two arms agreeing on it.
const thermos = [
  new Thermo('R1C2', 'R1C1', 'R2C1', 'R2C2', 'R3C2', 'R3C1'),
  new Thermo('R3C5', 'R2C5', 'R1C4'),
  new Thermo('R3C5', 'R2C5', 'R1C6'),
  new Thermo('R6C7', 'R6C8', 'R5C9', 'R5C8', 'R5C7', 'R4C8', 'R4C9'),
  new Thermo('R4C4', 'R4C5', 'R4C6', 'R5C6', 'R5C5', 'R5C4', 'R6C4'),
  new Thermo('R5C5', 'R6C6'),
  new Thermo('R7C4', 'R7C5', 'R7C6'),
  new Thermo('R7C4', 'R7C5', 'R8C5', 'R9C5'),
  new Thermo('R7C3', 'R7C2', 'R8C1', 'R9C2', 'R9C3'),
];

// The two green stroke groups are each drawn as two entries sharing cells
// (a meeting point, or a shared pair of endpoints). Encode each drawn entry
// as its own Whisper(5) so every adjacent pair the ink actually covers gets
// the difference rule.
const whispers = [
  new Whisper(5, 'R3C8', 'R3C7', 'R2C7', 'R1C7', 'R1C8'),
  new Whisper(5, 'R2C8', 'R2C7'),
  new Whisper(5, 'R6C1', 'R5C1', 'R4C2', 'R5C3', 'R6C3'),
  new Whisper(5, 'R5C1', 'R5C2', 'R5C3'),
];

return [
  new Shape('9x9'),
  ...thermos,
  ...whispers,
  new Sum(26, 'R7C9', 'R7C8', 'R8C7', 'R9C8', 'R9C9'),
  // Drawn cage outline with no printed total, coinciding with the orange
  // line's last two cells; already implied by the row-9 all-different but
  // stated for faithfulness. A second, single-cell cage outline at R7C9 (the
  // orange line's first cell) is omitted: a one-cell cage adds no constraint.
  new AllDifferent('R9C8', 'R9C9'),
];
