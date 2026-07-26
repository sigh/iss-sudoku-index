// Title: Recounting the counting
// Author: pdyxs
// Video: https://www.youtube.com/watch?v=Bjb7JxsRCsc
// Source: https://sudokupad.app/tc5dhvo13g

// Normal sudoku (default 3x3 boxes; the payload's `regions` also list the
// same nine boxes, so no override is needed).
// Kropki: black dot pairs are 2:1 ratio (BlackDot), white dot pairs are
// consecutive (WhiteDot); not all such pairs are marked, so no negative
// constraint is added for unmarked adjacencies.
// Counting Circles: if a digit appears in a Circle cell, exactly that many
// Circle cells hold that digit. CountingCircles is that rule verbatim, over
// all 31 drawn Circle cells.
// "Stable Digits" and "Dynamic fog" describe the multi-pass solving process
// (which cells get filled in which recompute pass) -- not a final-grid rule.
// Fog/reveal state is solving UI and is not encoded.

// Black-dot edges, from the payload's 7 black-background edge overlays.
const blackDots = [
  ['R1C2', 'R1C3'],
  ['R2C4', 'R3C4'],
  ['R7C6', 'R7C7'],
  ['R7C6', 'R8C6'],
  ['R3C3', 'R4C3'],
  ['R5C5', 'R6C5'],
  ['R9C8', 'R9C9'],
];

// White-dot edges, from the payload's 19 white-background/black-border edge
// overlays.
const whiteDots = [
  ['R1C1', 'R1C2'],
  ['R4C1', 'R4C2'],
  ['R3C1', 'R4C1'],
  ['R2C1', 'R3C1'],
  ['R3C4', 'R4C4'],
  ['R4C4', 'R5C4'],
  ['R6C6', 'R6C7'],
  ['R6C7', 'R7C7'],
  ['R8C6', 'R8C7'],
  ['R7C2', 'R7C3'],
  ['R6C2', 'R7C2'],
  ['R2C7', 'R2C8'],
  ['R1C8', 'R2C8'],
  ['R4C5', 'R5C5'],
  ['R9C7', 'R9C8'],
  ['R1C9', 'R2C9'],
  ['R2C9', 'R3C9'],
  ['R3C6', 'R3C7'],
  ['R8C4', 'R8C5'],
];

// Circle cells, from the payload's 31 white-fill/black-border underlay
// markers.
const circles = [
  'R1C1', 'R1C4', 'R1C5', 'R1C8', 'R1C9',
  'R2C2', 'R2C4', 'R2C5', 'R2C6',
  'R3C3', 'R3C6', 'R3C8', 'R3C9',
  'R4C2', 'R4C5', 'R4C8',
  'R5C2', 'R5C7', 'R5C8',
  'R6C1', 'R6C2', 'R6C6', 'R6C8',
  'R7C3', 'R7C4', 'R7C5',
  'R8C2', 'R8C3',
  'R9C3', 'R9C4', 'R9C7',
];

return [
  new Shape('9x9'),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  new CountingCircles(...circles),
];
