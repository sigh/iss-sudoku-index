// Title: Polychrome
// Author: StartUp
// Video: https://www.youtube.com/watch?v=hUbT36CSWVg
// Source: https://app.crackingthecryptic.com/ouqwb0efmh

// Normal Sudoku rules apply. Grey-circle cells hold odd digits, drawn Kropki
// dots hold consecutive (white) or 2:1 (black) pairs and not all dots are
// given (no adjacent-cell negative inference). Killer cages: digits in a cage
// are non-repeating and sum to the cage's total; "Polychromatic Killers" only
// says cages of different colours may overlap (no extra constraint beyond each
// cage's own AllDifferent+sum); "Dizzy Killers" only means the total's printed
// cell within the cage carries no meaning, so cage membership alone is
// encoded. Fog is UI-only and omitted.
//
// The 13 cage cell sets below were recovered from the payload's freehand
// dashed cage outlines (`lines`, one dash per short stroke) by grouping dashes
// by their `color` field (3 colours used) and reconstructing each colour's
// outline separately; each colour's total-label underlays were matched by the
// same `color` field. The resulting per-colour cages overlap only across
// colours, never within one colour, matching "Polychromatic Killers", and the
// wall set implied by all 13 cages together exactly reproduces the payload's
// own combined dashed-outline reconstruction (same 32 atomic cell groups) --
// cross-checked independently of colour grouping.
return [
  new Shape('9x9'),
  new Given('R7C5', 1, 3, 5, 7, 9), new Given('R9C9', 1, 3, 5, 7, 9),
  new WhiteDot('R7C4', 'R7C5'), new WhiteDot('R2C2', 'R2C3'),
  new WhiteDot('R1C2', 'R2C2'), new WhiteDot('R1C7', 'R1C8'), new WhiteDot('R7C1', 'R8C1'),
  new BlackDot('R6C5', 'R7C5'), new BlackDot('R3C3', 'R3C4'),
  new BlackDot('R2C3', 'R3C3'), new BlackDot('R1C1', 'R1C2'), new BlackDot('R2C8', 'R2C9'),

  // Green (#1bba1a) cages.
  new Cage(15, 'R1C3', 'R1C4', 'R1C5', 'R1C6'),
  new Cage(45, 'R2C9', 'R3C8', 'R3C9', 'R4C8', 'R5C8', 'R6C6', 'R6C7', 'R6C8', 'R7C8'),
  new Cage(15, 'R3C4', 'R3C5', 'R3C6'),
  new Cage(22, 'R5C2', 'R6C1', 'R6C2', 'R7C1'),
  new Cage(16, 'R8C9', 'R9C9'),

  // Blue (#196cca) cages.
  new Cage(20, 'R5C3', 'R5C4', 'R5C5'),
  new Cage(45, 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R7C7', 'R7C8', 'R8C8', 'R8C9', 'R9C9'),
  // Drawn total is "<10": non-repeating digits summing to less than 10, i.e.
  // one of 3..9 (2-cell cage minimum distinct sum is 1+2=3).
  new AllDifferent('R9C2', 'R9C3'),
  new Or([3, 4, 5, 6, 7, 8, 9].map(k => new Sum(k, 'R9C2', 'R9C3'))),

  // Red (#bc0b0b) cages.
  new Cage(10, 'R1C5', 'R2C5', 'R2C6', 'R3C5'),
  new Cage(15, 'R2C8', 'R3C8', 'R3C9', 'R4C9'),
  new Cage(44, 'R4C3', 'R5C2', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C2', 'R9C3'),
  new Cage(6, 'R6C6', 'R7C5', 'R7C6'),
  new Cage(10, 'R9C8', 'R9C9'),
];
