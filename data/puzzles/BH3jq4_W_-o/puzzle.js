// Title: ThermArrow Sudoku
// Author: Jonathan Bost
// Video: https://www.youtube.com/watch?v=BH3jq4_W_-o
// Source: https://app.crackingthecryptic.com/sudoku/tmH7BfRPpd

// Normal sudoku rules apply (default row/col/box all-different; the payload's
// `regions` are exactly the nine 3x3 boxes, so no explicit Regions is needed).
// No given digits.
//
// 13 arrows, each with a round bulb at one end (drawn over a real grid cell)
// and an arrowhead at the other (the tip). Rules: "Digits along arrows sum to
// the number in the circle, AND ascend from the arrow tip." Every drawn
// circle is blank (no printed number), so the circled cell carries no given
// digit -- its own solved digit is the arrow's sum target, per the standard
// sum-arrow reading (Arrow's bulb/control cell is the target, arm cells are
// summed).
//
// "Ascend from the arrow tip" is read as applying only to "digits along the
// arrow" (the arm cells), not the bulb/circle cell, since the rule names the
// circle separately as the sum target rather than as part of "the arrow"'s
// digits. This is encoded as Thermo over the arm cells ordered tip-first
// (Thermo's first argument is its minimum, ascending along the rest), which
// is the reverse of the bulb-first order the arm is transcribed in below.
// (Consequence, not an added assumption: since each arm has >=2 distinct
// positive digits, the bulb digit -- their sum -- is necessarily greater than
// every arm digit, so the solved grid is also consistent with the bulb being
// the chain's maximum either way.)
//
// Bulb + arm cells transcribed bulb-first, tip-last, from the drawn arrow
// paths (each path's bulb end matched against its coincident blank circle;
// two arrows share the bulb at R1C4).
const arrows = [
  { bulb: 'R1C8', arm: ['R1C7', 'R1C6', 'R1C5'] },
  { bulb: 'R1C4', arm: ['R2C5', 'R3C6', 'R4C7'] },
  { bulb: 'R1C4', arm: ['R1C3', 'R2C3'] },
  { bulb: 'R1C1', arm: ['R1C2', 'R2C1'] },
  { bulb: 'R3C3', arm: ['R4C2', 'R5C3', 'R6C2'] },
  { bulb: 'R8C2', arm: ['R7C2', 'R6C3', 'R6C2'] },
  { bulb: 'R1C9', arm: ['R2C8', 'R3C7', 'R3C8'] },
  { bulb: 'R2C9', arm: ['R3C9', 'R4C9', 'R3C8'] },
  { bulb: 'R8C7', arm: ['R7C8', 'R8C9'] },
  { bulb: 'R9C8', arm: ['R9C7', 'R8C8', 'R8C9'] },
  { bulb: 'R9C5', arm: ['R8C4', 'R7C4', 'R7C5'] },
  { bulb: 'R4C4', arm: ['R5C5', 'R5C6'] },
  { bulb: 'R4C8', arm: ['R5C8', 'R6C9'] },
];

const arrowSums = arrows.map(({ bulb, arm }) => new Arrow(bulb, ...arm));
const arrowAscends = arrows.map(({ arm }) => new Thermo(...[...arm].reverse()));

return [
  new Shape('9x9'),
  ...arrowSums,
  ...arrowAscends,
];
