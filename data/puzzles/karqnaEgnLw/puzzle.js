// Title: Three Hearts
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=karqnaEgnLw
// Source: https://app.crackingthecryptic.com/sudoku/mgrb2BqHqr
//
// Rules encoded:
// - Normal sudoku rules (rows/cols/boxes all-different) -> default for
//   Shape('9x9') with the payload's plain 3x3-box regions.
// - One given: R9C9 = 4.
// - Two arrows: digits along the arrow sum to the (unprinted) circled digit
//   -> Arrow(circle, ...arm), one per arrow.
// - Three "heart" shapes, each a 10-cell loop made of
//   two 5-edge arms that share a top vertex (an orange dot) and a bottom
//   vertex (that heart's base: R5C3, R9C3, R7C7). Per the rules, two of the
//   three dots are thermometer bulbs (values increase along both arms, dot
//   to base) and the third dot starts a 10-digit palindrome around its
//   whole heart loop. Which heart plays which role is undetermined by the
//   rules text ("Which dot is which is to be determined") and is left to
//   the solver: encoded as an outer Or over the 3 choices of which heart is
//   the palindrome one (the other two are always thermometers in that
//   branch).
// - The palindrome's reading direction (which arm is traversed first, right
//   after the dot) is likewise not stated by the rules or drawn, so for
//   whichever heart is chosen as the palindrome, both traversal directions
//   are offered via an inner Or -- see buildPalindromeOr below.

// Heart geometry, transcribed from the payload's `lines` (each is two
// yellow-green polylines sharing both endpoints; one interpolated diagonal
// jump per polyline joins the last drawn corner to the shared vertex).
const hearts = [
  { // Heart 1: lines #0/#1
    dot: 'R2C3',
    leftArm: ['R2C3', 'R1C2', 'R2C1', 'R3C1', 'R4C2', 'R5C3'],
    rightArm: ['R2C3', 'R1C4', 'R2C5', 'R3C5', 'R4C4', 'R5C3'],
  },
  { // Heart 2: lines #2/#3
    dot: 'R6C3',
    leftArm: ['R6C3', 'R5C2', 'R6C1', 'R7C1', 'R8C2', 'R9C3'],
    rightArm: ['R6C3', 'R5C4', 'R6C5', 'R7C5', 'R8C4', 'R9C3'],
  },
  { // Heart 3: lines #4/#5
    dot: 'R4C7',
    leftArm: ['R4C7', 'R3C6', 'R4C5', 'R5C5', 'R6C6', 'R7C7'],
    rightArm: ['R4C7', 'R3C8', 'R4C9', 'R5C9', 'R6C8', 'R7C7'],
  },
];

// Both arms of a heart, each increasing from the shared dot to the shared
// base (Thermo increases from its first cell).
function thermoConstraints(heart) {
  return [new Thermo(...heart.leftArm), new Thermo(...heart.rightArm)];
}

// The heart's whole 10-cell loop, read as a palindrome starting at the dot.
// Direction is ambiguous (see header), so both traversals are offered:
// loopA reads the left arm first, then the base, then the right arm back
// to (but excluding) the dot; loopB is the mirror image. These give
// genuinely different cell-pairings (e.g. loopA pairs dot with rightArm[1],
// loopB pairs dot with leftArm[1]), not two labellings of the same pairing.
function palindromeOr(heart) {
  const base = heart.leftArm[5];
  const loopA = [
    heart.dot,
    heart.leftArm[1], heart.leftArm[2], heart.leftArm[3], heart.leftArm[4],
    base,
    heart.rightArm[4], heart.rightArm[3], heart.rightArm[2], heart.rightArm[1],
  ];
  const loopB = [
    heart.dot,
    heart.rightArm[1], heart.rightArm[2], heart.rightArm[3], heart.rightArm[4],
    base,
    heart.leftArm[4], heart.leftArm[3], heart.leftArm[2], heart.leftArm[1],
  ];
  return new Or([new Palindrome(...loopA), new Palindrome(...loopB)]);
}

// One branch per choice of which heart is the palindrome; the other two
// hearts are thermometers in that branch.
const heartBranches = hearts.map((chosen, i) => new And([
  palindromeOr(chosen),
  ...hearts.filter((_, j) => j !== i).flatMap(thermoConstraints),
]));

return [
  new Shape('9x9'),
  new Given('R9C9', 4),
  new Arrow('R1C3', 'R2C3', 'R3C3', 'R4C3'),
  new Arrow('R3C7', 'R4C7', 'R5C7'),
  new Or(heartBranches),
];
