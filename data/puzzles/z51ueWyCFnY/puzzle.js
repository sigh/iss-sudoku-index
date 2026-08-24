// Title: Knight Time
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=z51ueWyCFnY
// Source: https://app.crackingthecryptic.com/sudoku/88mBm8N4JN

// Normal sudoku. Identical digits cannot be a chess knight's move apart
// (global AntiKnight). Killer cages show sums (distinct digits). Digits
// increase along each thermometer from its bulb to its end(s).
//
// Omitted: the video description states "the rule about red dots is missed
// off the ruleset in the video." Two small red edge marks are drawn, at
// R4C4|R5C4 and R5C6|R6C6, but no rules text anywhere in the captured
// description or payload gives their meaning, so no constraint is encoded
// for them here.
//
// Two of the thermometers occupy the same cells as a killer cage
// (R5C1-R5C3 and R5C7-R5C9): both the Cage and the Thermo are encoded, since
// the rules text states both clue types independently and nothing says one
// supersedes the other.

return [
  new Shape('9x9'),

  new Given('R3C3', 6),
  new Given('R3C7', 4),
  new Given('R7C3', 5),
  new Given('R7C7', 7),

  new AntiKnight(),

  new Cage(15, 'R5C1', 'R5C2', 'R5C3'),
  new Cage(15, 'R5C7', 'R5C8', 'R5C9'),
  new Cage(14, 'R1C5', 'R2C5', 'R3C5'),
  new Cage(14, 'R7C5', 'R8C5', 'R9C5'),

  // Bulb is the drawn tip; each thermo lists cells bulb-first.
  new Thermo('R1C4', 'R1C3'),
  new Thermo('R3C5', 'R2C5', 'R1C5'),
  new Thermo('R5C7', 'R5C8', 'R5C9'),
  new Thermo('R5C3', 'R5C2', 'R5C1'),
  new Thermo('R7C5', 'R8C5', 'R9C5'),
  new Thermo('R9C6', 'R9C7'),
  new Thermo('R5C5', 'R4C4'),
  new Thermo('R5C5', 'R4C6'),
  new Thermo('R5C5', 'R6C4'),
  new Thermo('R5C5', 'R6C6'),
];
