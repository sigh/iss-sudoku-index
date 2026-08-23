// Title: 400K
// Author: WombatBreath
// Video: https://www.youtube.com/watch?v=YGyQpvC14U8
// Source: https://app.crackingthecryptic.com/sudoku/J78HMmfg6b

// Normal sudoku rules apply. Digits on arrows sum to the total in the
// circle. Cells joined by a black dot have a ratio of 1:2; the rules say
// not all such pairs are marked, so BlackDot is applied only to the 9
// drawn edges below and no exhaustive negative is added elsewhere.
// The decorative row-5 text (letters spelling "KUDOS" / "CTC") is stated
// by the rules to be aesthetic only and carries no constraint.

// Arrows: first cell is the circle (sum total), remaining cells are the
// arm. Arrows #1 and #3 share circle R3C1 (one circle, two arms), matching
// the drawn geometry of two lines leaving the same bulb.
const arrows = [
  new Arrow('R3C1', 'R2C2', 'R1C3'),
  new Arrow('R4C3', 'R3C3', 'R2C3', 'R1C3'),
  new Arrow('R3C1', 'R3C2', 'R3C3', 'R3C4'),
  new Arrow('R2C6', 'R1C7', 'R1C8', 'R2C9'),
  new Arrow('R3C9', 'R4C8', 'R4C7', 'R3C6'),
  new Arrow('R7C1', 'R6C2', 'R6C3', 'R7C4'),
  new Arrow('R8C4', 'R9C3', 'R9C2', 'R8C1'),
  new Arrow('R6C6', 'R7C6', 'R8C6', 'R9C6'),
  new Arrow('R9C9', 'R8C8', 'R8C7', 'R7C8', 'R6C9'),
];

// Black dots: drawn edge marks (not exhaustive per the rules text).
const blackDots = [
  new BlackDot('R3C2', 'R3C3'),
  new BlackDot('R3C3', 'R4C3'),
  new BlackDot('R3C5', 'R4C5'),
  new BlackDot('R6C5', 'R7C5'),
  new BlackDot('R7C6', 'R8C6'),
  new BlackDot('R8C6', 'R9C6'),
  new BlackDot('R8C6', 'R8C7'),
  new BlackDot('R7C8', 'R7C9'),
  new BlackDot('R6C9', 'R7C9'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...blackDots,
];
