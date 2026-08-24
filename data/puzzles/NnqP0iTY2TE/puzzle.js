// Title: Halloween Crab
// Author: DiMono
// Video: https://www.youtube.com/watch?v=NnqP0iTY2TE
// Source: https://app.crackingthecryptic.com/sudoku/qN79DqMtBT

// Normal sudoku rules apply. The payload's `regions` array draws the default
// 3x3 boxes explicitly (verified cell-for-cell against Shape('9x9')'s
// defaults), so no custom region constraint is needed.
//
// Two killer cages: digits sum to the corner clue and cannot repeat within
// the cage.
//
// Twelve arrows: digits along the arm sum to the bulb digit, and strictly
// increase towards the bulb (circle). Every arrow here has exactly two arm
// cells, so "strictly increase towards the circle" is exactly one ordering
// fact per arrow: the arm cell nearer the bulb is greater than the one
// farther away. Arrow() only states the sum, so that ordering is added
// separately. Two of the twelve arrow bulbs (source-order arrows whose arm
// runs diagonally) have arm cells that are diagonally, not orthogonally,
// adjacent, so GreaterThan (which only binds grid-adjacent pairs) cannot
// express all twelve; Pair with a plain ">" predicate is used uniformly
// instead so every arrow gets the same treatment.
const greaterKey = Pair.fnToKey((a, b) => a > b, 9);

const arrows = [
  // [bulb, cell nearest the bulb, cell farthest from the bulb]
  ['R3C2', 'R4C3', 'R5C3'],
  ['R3C4', 'R2C3', 'R1C3'],
  ['R3C6', 'R2C7', 'R1C7'],
  ['R1C9', 'R2C8', 'R3C7'],
  ['R4C7', 'R3C8', 'R3C9'],
  ['R4C6', 'R5C5', 'R6C4'],
  ['R5C1', 'R4C1', 'R3C1'],
  ['R6C3', 'R7C2', 'R7C1'],
  ['R7C4', 'R8C3', 'R9C3'],
  ['R8C7', 'R7C6', 'R7C5'],
  ['R9C7', 'R9C6', 'R9C5'],
  ['R6C7', 'R7C8', 'R7C9'],
];

return [
  new Shape('9x9'),

  new Cage(27, 'R3C2', 'R3C3', 'R3C4', 'R3C5'),
  new Cage(20, 'R5C7', 'R6C7', 'R7C7', 'R8C7'),

  ...arrows.map(([bulb, near, far]) => new Arrow(bulb, near, far)),
  ...arrows.map(([, near, far]) =>
    new Pair(greaterKey, 'increasing towards bulb', near, far)),
];
