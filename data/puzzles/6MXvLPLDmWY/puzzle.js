// Title: Push Me Pull You
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=6MXvLPLDmWY
// Source: https://app.crackingthecryptic.com/sudoku/mpphgLMpfg

// Standard 9x9 sudoku (default box regions). One killer cage (distinct +
// sum). Four grey palindrome lines. Eight arrows (circle + arm, arm sums to
// the circle's digit, repeats allowed on the arm per Arrow's semantics).
// Two pairs of arrows cross ink without sharing a cell (grey/blue only
// disambiguates which arrow is which there, per the rules' parenthetical);
// that crossing needs no constraint of its own. Arrows A1 and A7 do share
// cell R3C2 on their arms, which Arrow naturally handles since each is its
// own constraint over that cell.

return [
  new Shape('9x9'),

  new Cage(14, 'R5C4', 'R6C4'),

  // Grey palindrome lines: L2 and L3 each pass through another arrow's
  // circle cell (R3C7 = A5's circle, R7C3 = A4's circle) -- confirmed
  // coincidental from the unbroken line waypoints, not a split.
  new Palindrome('R1C6', 'R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1', 'R6C1'),
  new Palindrome('R9C4', 'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R4C9'),
  new Palindrome('R2C5', 'R2C6', 'R3C7', 'R4C8', 'R5C8'),
  new Palindrome('R5C2', 'R6C2', 'R7C3', 'R8C4', 'R8C5'),

  new Arrow('R7C1', 'R7C2', 'R8C3', 'R9C3'),
  new Arrow('R3C1', 'R3C2', 'R2C3', 'R1C3'),
  new Arrow('R3C9', 'R3C8', 'R2C7', 'R1C7'),
  new Arrow('R7C9', 'R7C8', 'R8C7', 'R9C7'),
  new Arrow('R7C3', 'R8C2', 'R9C1'),
  new Arrow('R3C7', 'R2C8', 'R1C9'),
  new Arrow('R7C5', 'R6C6', 'R5C5'),
  new Arrow('R4C3', 'R3C2', 'R2C1'),
];
