// Title: Relax, You're Two Tents
// Author: Jessica (subtitle) Shaham
// Video: https://www.youtube.com/watch?v=16HqAuwB8a4
// Source: https://app.crackingthecryptic.com/sudoku/MM3mMQGJn2

// Normal sudoku rules apply.
// Grey thermometers: digits increase from the bulb (round end) to the tip.
// Two bulbs (R1C5 and R5C5) each carry three arms; every arm increases from
// that shared bulb independently.
// Green lines: neighbouring digits along the line differ by at least 5
// (Whisper).
// White dot: the two digits are consecutive. Black dot: the two digits are
// in a 1:2 ratio. The rules state "not all dots are given", so no negative
// constraint is encoded for unmarked adjacent pairs.

return [
  new Shape('9x9'),

  // Thermometers (grey, thickness 12). Bulb cell listed first in each.
  // Shared bulb R1C5 (three arms):
  new Thermo('R1C5', 'R2C4', 'R3C3', 'R4C2'),
  new Thermo('R1C5', 'R2C6', 'R3C7', 'R4C8'),
  new Thermo('R1C5', 'R2C5', 'R3C5'),
  // Single-arm thermometers:
  new Thermo('R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3'),
  new Thermo('R7C2', 'R6C3', 'R5C4'),
  new Thermo('R5C6', 'R6C7', 'R7C8'),
  new Thermo('R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'),
  // Shared bulb R5C5 (three arms):
  new Thermo('R5C5', 'R6C4', 'R7C3', 'R8C2'),
  new Thermo('R5C5', 'R6C5', 'R7C5'),
  new Thermo('R5C5', 'R6C6', 'R7C7', 'R8C8'),

  // Green lines (yellowgreen, thickness 5): adjacent digits differ by >= 5.
  new Whisper(5, 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'),
  new Whisper(5, 'R5C2', 'R5C3', 'R5C4'),
  new Whisper(5, 'R5C6', 'R5C7', 'R5C8'),
  new Whisper(5, 'R4C4', 'R3C4'),
  new Whisper(5, 'R4C6', 'R3C6'),
  new Whisper(5, 'R2C4', 'R3C5', 'R2C6'),

  // Dots (edge overlays; not thermometer-bulb markers -- those are
  // rendered as separate grey circles matching each thermo's bulb cell).
  new WhiteDot('R1C1', 'R1C2'),
  new BlackDot('R2C9', 'R3C9'),
];
