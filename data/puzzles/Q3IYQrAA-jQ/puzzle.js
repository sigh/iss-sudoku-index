// Title: Spiral Galaxy
// Author: Malrog
// Video: https://www.youtube.com/watch?v=Q3IYQrAA-jQ
// Source: https://app.crackingthecryptic.com/sudoku/Hb4Tb8tgRQ

// Normal sudoku rules apply (standard 3x3 boxes, so the default Shape
// regions apply unmodified). No given digits.
//
// Digits along the marked diagonal must not repeat: Diagonal(-1) is ISS's
// top-left-to-bottom-right diagonal (R1C1..R9C9), matching the drawn blue
// line's corner-to-corner waypoints [[0,0],[9,9]].
//
// Digits along grey lines increase starting from the bulb end: Thermo's own
// DESCRIPTION ("Values must be in increasing order starting at the bulb")
// is a verbatim match, first cell = bulb. Both grey lines' raw waypoints
// contain diagonal jumps of 2 cells; each such jump's midpoint lands
// exactly on another cell centre, so the line bends through it rather than
// running straight -- resolved below to the full cell path. Both lines
// start at R5C5, where the filled grey circle overlay (the bulb) sits.
//
// Coloured lines are palindromes: Palindrome's cell order only needs to
// trace the path (it pairs cells symmetrically from both ends), so
// direction doesn't matter. Both bend the same way the grey lines do; paths
// resolved the same way from the raw waypoints.
//
// Digits along an arrow sum to the number in the circled cell: each arrow's
// first cell is its circle (Arrow's semantics), rest of the path is the
// summed shaft. R2C2 is the shared circle of two independent arrows (two
// separate white-circle overlays sit at R2C2 and R8C8, apart from the
// grey-line bulb's own filled circle at R5C5) -- encoded as two separate
// Arrow constraints, not one line through R2C2.

return [
  new Shape('9x9'),

  new Diagonal(-1),

  new Thermo('R5C5', 'R4C5', 'R5C4', 'R6C3', 'R7C4', 'R8C5', 'R7C6'),
  new Thermo('R5C5', 'R6C5', 'R5C6', 'R4C7', 'R3C6', 'R2C5', 'R3C4'),

  new Palindrome('R5C5', 'R4C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C3'),
  new Palindrome('R5C5', 'R6C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C7'),

  new Arrow('R2C2', 'R2C3', 'R3C2'),
  new Arrow('R2C2', 'R2C1', 'R1C2'),
  new Arrow('R8C8', 'R9C9', 'R9C8'),
];
