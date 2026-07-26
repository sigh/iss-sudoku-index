// Title: Sudokulike (Dynamic Fog Edition)
// Author: Nurator
// Video: https://www.youtube.com/watch?v=VpvUANzov8k
// Source: https://sudokupad.app/j22idv1qhe

// Standard sudoku (rows/cols/boxes) plus "rooms" (cages): digits in a room
// don't repeat, and sum to the room's total when one is given.
//
// Omitted: the Adventure Path (an orthogonal path, confined to room and
// checkpoint cells, that starts at checkpoint 1, visits checkpoints 2-5 in
// ascending order, and enters/exits every room exactly once) and the Dynamic
// Classes rule (the path's digits must additionally satisfy a different line
// rule -- Palindrome, then German Whisper, then Region Sum, then Dutch
// Whisper -- on each segment between consecutive checkpoints). The route
// itself is solver-discovered, not drawn, so both rules are omitted in full.

return [
  new Shape('9x9'),
  new Given('R2C9', 5),

  // Rooms with a stated total (killer-cage semantics: distinct + sum).
  new Cage(23, 'R6C6', 'R6C7', 'R6C8'),
  new Cage(23, 'R3C5', 'R4C5', 'R5C4', 'R5C5', 'R6C5'),
  new Cage(13, 'R2C2', 'R3C2', 'R3C3', 'R3C4'),
  new Cage(17, 'R2C3', 'R2C4'),
  new Cage(21, 'R7C5', 'R7C6', 'R7C7', 'R7C8'),
  new Cage(15, 'R5C1', 'R6C1', 'R7C1'),
  new Cage(21, 'R4C3', 'R5C2', 'R5C3'),
  new Cage(10, 'R1C2', 'R1C3'),

  // Rooms with no stated total: distinct-only.
  new AllDifferent('R8C6', 'R8C7', 'R9C5', 'R9C6'),
  new AllDifferent('R3C6', 'R3C7'),
  new AllDifferent('R8C2', 'R8C3', 'R9C3'),
  new AllDifferent('R8C8', 'R8C9'),
  new AllDifferent('R5C9', 'R6C9', 'R7C9'),
  new AllDifferent('R3C8', 'R4C8'),
  // R4C9 is a real single-cell room (no total) but adds no local constraint.
];
