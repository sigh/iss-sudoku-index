// Title: The Serpent's Stone
// Author: Barrels
// Video: https://www.youtube.com/watch?v=w10o1ZwoPn0
// Source: https://app.crackingthecryptic.com/sudoku/B2NJqj7HrL

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Purple lines: digits form a non-repeating consecutive set, any order
// -> Renban(...cells). 21 lines; some legs bend through a diagonally
// adjacent cell.
// White dots: the two digits differ by exactly 1 -> WhiteDot(a, b).
// Black dots: one digit is exactly double the other -> BlackDot(a, b).
// The rules never claim every dot is shown, so no negative ("no dot here")
// constraint is added.

const renbanLines = [
  new Renban('R1C3', 'R1C2', 'R1C1', 'R2C1'),
  new Renban('R2C2', 'R2C3', 'R1C4', 'R1C5'),
  new Renban('R2C4', 'R2C5', 'R1C6', 'R2C6'),
  new Renban('R2C7', 'R3C6'),
  new Renban('R4C4', 'R3C3'),
  new Renban('R3C2', 'R3C1'),
  new Renban('R4C2', 'R5C1'),
  new Renban('R5C2', 'R5C3'),
  new Renban('R6C2', 'R6C1', 'R7C2', 'R8C3'),
  new Renban('R8C1', 'R9C1', 'R8C2', 'R9C3'),
  new Renban('R7C4', 'R7C5'),
  new Renban('R7C6', 'R6C6'),
  new Renban('R1C8', 'R2C9'),
  new Renban('R3C9', 'R4C9'),
  new Renban('R3C8', 'R3C7'),
  new Renban('R4C7', 'R4C8'),
  new Renban('R5C7', 'R5C8', 'R5C9'),
  new Renban('R6C9', 'R6C8'),
  new Renban('R6C7', 'R7C7'),
  new Renban('R7C8', 'R7C9'),
  new Renban('R8C7', 'R9C8', 'R9C9'),
];

const whiteDots = [
  new WhiteDot('R5C5', 'R5C6'),
  new WhiteDot('R6C5', 'R6C6'),
  new WhiteDot('R5C5', 'R6C5'),
];

const blackDots = [
  new BlackDot('R5C4', 'R5C5'),
  new BlackDot('R6C4', 'R6C5'),
];

return [
  new Shape('9x9'),
  ...renbanLines,
  ...whiteDots,
  ...blackDots,
];
