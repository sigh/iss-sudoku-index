// Title: X-Square Whispers
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=bXQMNRMHmRw
// Source: https://app.crackingthecryptic.com/sudoku/DJ23rnDBPh

// Normal sudoku on standard 3x3 boxes (the drawn `regions` match the default
// layout, so no explicit Regions/NoBoxes is needed).
//
// Green lines are German whisper lines (Whisper, difference omitted so it
// defaults to 5, matching "difference of at least 5").
//
// Each drawn X badge sits on the shared edge between two orthogonally
// adjacent cells and constrains that pair to sum to 10 (X class, "adjacent
// cells only"). "Not all possible Xs are shown" cancels the usual negative
// XV-style reading: only the drawn marks are enforced, and an unmarked
// adjacent pair is left free.
//
// A fifth drawn green-line stroke has no cells at all and is omitted.

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C9', 8),
  new Given('R2C4', 4),

  // Green whisper lines.
  new Whisper('R3C7', 'R4C7', 'R3C8', 'R4C8', 'R3C9', 'R4C9'),
  new Whisper('R5C7', 'R6C6'),
  new Whisper('R8C6', 'R8C7', 'R8C8', 'R8C9', 'R9C9'),
  new Whisper('R7C2', 'R8C3', 'R9C4', 'R9C5'),

  // X marks.
  new X('R1C1', 'R2C1'),
  new X('R1C2', 'R2C2'),
  new X('R1C5', 'R2C5'),
  new X('R1C6', 'R2C6'),
  new X('R5C1', 'R6C1'),
  new X('R5C2', 'R6C2'),
  new X('R7C1', 'R7C2'),
  new X('R9C5', 'R9C6'),
  new X('R5C5', 'R6C5'),
  new X('R5C6', 'R6C6'),
];
