// Title: Cross Total
// Author: Wuschel
// Video: https://www.youtube.com/watch?v=oBTw_8hhoJw
// Source: https://app.crackingthecryptic.com/sudoku/f382RtF2Rd

// Normal sudoku rules apply (standard 3x3 boxes, default row/column/box
// all-different from Shape('9x9')).
//
// Digits along an arrow must sum to the digit in that arrow's circle, and
// the arrow's digits (without the circle) form a palindrome, reading the
// same forwards and backwards.
//
// Eight bent arrows are drawn, each starting at a circled cell. Every drawn
// circle coincides with exactly one arrow's start cell, so bulb-to-arm
// assignment is unambiguous. A ninth drawn element carries no path and
// renders nothing -- it is styling only and is not encoded.
//
// Each [bulb, ...arm] row below is one drawn arrow: bulb is the circled
// cell, the remaining cells are the arm in path order (bulb-to-tip).
const arrows = [
  ['R1C2', 'R2C2', 'R3C2', 'R4C1'],
  ['R1C3', 'R2C3', 'R3C3', 'R4C4'],
  ['R7C1', 'R7C2', 'R7C3', 'R6C4'],
  ['R9C2', 'R9C3', 'R9C4', 'R8C5'],
  ['R9C7', 'R8C7', 'R7C7', 'R6C6'],
  ['R9C8', 'R8C8', 'R7C8', 'R6C9'],
  ['R5C8', 'R5C7', 'R4C6'],
  ['R3C9', 'R3C8', 'R3C7', 'R4C6'],
];

return [
  new Shape('9x9'),
  // Arm sums to the circled bulb.
  ...arrows.map(([bulb, ...arm]) => new Arrow(bulb, ...arm)),
  // The arm alone (bulb excluded) reads the same forwards and backwards.
  ...arrows.map(([, ...arm]) => new Palindrome(...arm)),
];
