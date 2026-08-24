// Title: Broken Arrows
// Author: RobK
// Video: https://www.youtube.com/watch?v=d4OxH2XyzrE
// Source: https://app.crackingthecryptic.com/sudoku/PDfjrfN9pF

// Normal sudoku rules (default 3x3 boxes). Digits on an arrow sum to the
// digit in its connected circle (Arrow: bulb cell first, arm cells after).
// Seven arrows are attached -- their circle sits on their own bulb cell, so
// the bulb's digit is the arm's sum. The other nine arrows are disconnected:
// their bulb carries no circle, so only the arm cells are summed, and that
// sum must equal one of the nine unattached circles elsewhere on the grid
// (plain cells with no arrow bulb). The rules give no pairing between a
// disconnected arrow and an unattached circle, only that, for every digit,
// the count of arrows summing to it equals the count of circles holding it.
// That is exactly "these nine arrow sums and these nine circle digits are the
// same multiset", so it is one SameValues(2, ...) over both groups rather
// than any hand-picked pairing.

const attachedArrows = [
  ['R2C8', 'R3C7', 'R2C6'],
  ['R2C2', 'R3C3', 'R3C4'],
  ['R4C3', 'R3C3', 'R3C4'], // shares its arm with the arrow above
  ['R5C5', 'R4C5', 'R3C5'],
  ['R6C4', 'R5C3', 'R4C4'],
  ['R8C3', 'R7C3', 'R6C3'],
  ['R7C9', 'R6C9', 'R5C8'],
];

// Disconnected arrows: only the arm (post-bulb) cells are drawn as summed.
const disconnectedArrowArms = [
  ['R3C8'],
  ['R1C6'],
  ['R1C4'],
  ['R3C2'],
  ['R8C2'],
  ['R8C1', 'R7C2'],
  ['R6C7', 'R5C7'],
  ['R8C9', 'R7C8'],
  ['R8C8'],
];

// Circles with no arrow bulb at their cell.
const unattachedCircles = [
  'R9C4', 'R8C4', 'R7C4', 'R6C5', 'R7C5', 'R9C5', 'R9C6', 'R8C6', 'R7C6',
];

const arrows = attachedArrows.map(([bulb, ...arm]) => new Arrow(bulb, ...arm));

// One aux Var per disconnected arrow, holding its arm's sum.
const armSum = new Var('DS', 'disconnected arrow sum', disconnectedArrowArms.length);

const armSumLinks = disconnectedArrowArms.map(
  (arm, i) => new EqualSum(arm, [armSum.cell(i + 1)]));

// The multiset-matching rule itself: the 9 unattached-circle digits and the 9
// disconnected-arrow sums must be the same multiset, digit for digit.
const countsMatch = new SameValues(2, ...unattachedCircles, ...armSum.cells());

return [
  new Shape('9x9'),
  ...arrows,
  armSum,
  ...armSumLinks,
  countsMatch,
];
