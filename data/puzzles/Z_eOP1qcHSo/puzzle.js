// Title: Nine Is The Key
// Author: Jodawo
// Video: https://www.youtube.com/watch?v=Z_eOP1qcHSo
// Source: https://app.crackingthecryptic.com/sudoku/rTBnqH2N7f

// Normal sudoku rules apply (default row/col/box all-different, standard
// 3x3 boxes -- the puzzle's own `regions` are the standard boxes). Digits
// along an arrow sum to the bulb (Arrow). Digits joined by a black dot are
// in a 1:2 ratio (BlackDot); the rules do not claim every such pair is
// marked, so absence of a dot is not a constraint. Digits on a Between Line
// are strictly between the values in its two circles (Between).

const arrows = [
  new Arrow('R1C8', 'R1C9', 'R2C9'),
  new Arrow('R9C2', 'R9C1', 'R8C1'),
  new Arrow('R6C8', 'R5C8', 'R5C9'),
  new Arrow('R2C4', 'R2C5', 'R2C6'),
  new Arrow('R5C5', 'R5C4', 'R6C4', 'R6C5'),
  new Arrow('R8C6', 'R8C5', 'R8C4'),
];

const blackDots = [
  new BlackDot('R3C3', 'R4C3'),
  new BlackDot('R7C3', 'R7C4'),
  new BlackDot('R6C7', 'R7C7'),
  new BlackDot('R3C6', 'R3C7'),
  new BlackDot('R6C3', 'R7C3'),
  new BlackDot('R1C3', 'R2C3'),
  new BlackDot('R8C7', 'R9C7'),
];

const betweenLines = [
  new Between('R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Between('R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'),
  new Between('R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'),
  new Between('R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'),
  new Between('R4C3', 'R5C3', 'R6C3', 'R7C3'),
  new Between('R3C3', 'R3C4', 'R3C5', 'R3C6'),
  new Between('R3C7', 'R4C7', 'R5C7', 'R6C7'),
  new Between('R7C4', 'R7C5', 'R7C6', 'R7C7'),
  new Between('R1C4', 'R2C3', 'R3C2'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...blackDots,
  ...betweenLines,
];
