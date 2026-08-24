// Title: Numberpad Kropki
// Author: Wesley Murphy
// Video: https://www.youtube.com/watch?v=w6jTIwd0LZ4
// Source: https://app.crackingthecryptic.com/sudoku/mNHTpjPjLB

// Normal sudoku rules apply. Eight drawn cages have no printed total, so
// digits cannot repeat within a cage (AllDifferent). White dots require a
// difference of 1; black dots require a 1:2 ratio. The rules state that not
// all dots are given, so an undrawn edge carries no negative information and
// gets no constraint.

// Cage cell lists are transcribed from the eight drawn no-total cages.
const cages = [
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R3C3', 'R2C3', 'R3C2', 'R4C1'],
  ['R1C5', 'R1C4', 'R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R4C5', 'R4C6'],
  ['R1C6', 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9', 'R1C9', 'R1C8'],
  ['R4C2', 'R4C3', 'R4C4', 'R5C4', 'R5C3', 'R6C3', 'R6C2', 'R6C1', 'R5C1'],
  ['R7C3', 'R7C1', 'R7C2', 'R8C1', 'R9C1', 'R9C2', 'R8C3', 'R9C3', 'R9C4'],
  ['R8C4', 'R7C4', 'R6C4', 'R6C5', 'R7C5', 'R7C6', 'R8C6', 'R9C6', 'R9C5'],
  ['R5C6', 'R6C6', 'R6C7', 'R5C7', 'R6C8', 'R4C7', 'R4C8', 'R4C9', 'R5C9'],
  ['R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R8C7', 'R7C7', 'R7C8'],
];

// White (difference 1) dot edges, transcribed from the drawn white overlays.
const whiteDots = [
  ['R3C2', 'R4C2'],
  ['R4C1', 'R4C2'],
  ['R1C3', 'R1C4'],
  ['R8C3', 'R9C3'],
  ['R7C4', 'R8C4'],
  ['R9C4', 'R9C5'],
  ['R3C7', 'R4C7'],
  ['R3C7', 'R3C8'],
  ['R3C9', 'R4C9'],
];

// Black (1:2 ratio) dot edges, transcribed from the drawn black overlays.
const blackDots = [
  ['R4C4', 'R5C4'],
  ['R4C5', 'R4C6'],
  ['R8C5', 'R9C5'],
  ['R5C9', 'R6C9'],
  ['R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...cages.map((cells) => new AllDifferent(...cells)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
