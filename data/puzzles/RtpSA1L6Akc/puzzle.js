// Title: A Knight's Archery
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=RtpSA1L6Akc
// Source: https://app.crackingthecryptic.com/sudoku/Hh7BP9jBBG
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Identical digits cannot be a knight's move apart -> AntiKnight.
// Digits along an arrow sum to the number in the circle, and can include
// repeats -> one Arrow(bulb, ...arm) per arrow (Arrow already permits
// repeats on the arm).
//
// Arrow cells were read off the drawn geometry (arrows[].wayPoints, snapped
// to cell centres): each arrow starts at its bulb cell and runs through the
// remaining cells drawn along the bent line.
const arrows = [
  ['R6C9', 'R7C8', 'R8C8'],
  ['R2C8', 'R3C8', 'R4C7', 'R5C7', 'R6C7'],
  ['R4C6', 'R3C6', 'R2C5'],
  ['R6C5', 'R5C5', 'R4C4', 'R3C3', 'R2C2'],
  ['R8C4', 'R7C4', 'R6C3', 'R5C2', 'R4C1'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...arrows.map(cells => new Arrow(...cells)),
];
