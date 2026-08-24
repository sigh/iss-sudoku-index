// Title: The Kropki's Gambit
// Author: Ben Harpe
// Video: https://www.youtube.com/watch?v=Oj6ADVvAwmg
// Source: https://app.crackingthecryptic.com/sudoku/NLNHBpGbBh

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, default).
// Cells with an identical digit may be neither a knight's move (AntiKnight)
// nor a king's move (AntiKing) apart.
// White dots (WhiteDot) are consecutive-digit pairs; black dots (BlackDot)
// are 1:2-ratio pairs. Both are read from the overlays' backgroundColor /
// borderColor (white fill/black border vs. black fill/black border), not
// from the mark's own `color` field. The rules state "not all dots are
// shown," so no StrictKropki/negative closure is added: absence of a dot
// elsewhere is not information.

// White dots: consecutive digits. One entry per drawn dot.
const whiteDotEdges = [
  ['R1C1', 'R1C2'], ['R1C1', 'R2C1'], ['R4C1', 'R5C1'], ['R5C1', 'R6C1'],
  ['R4C2', 'R4C3'], ['R4C3', 'R4C4'], ['R4C4', 'R4C5'], ['R5C4', 'R6C4'],
  ['R6C4', 'R7C4'], ['R2C4', 'R3C4'], ['R2C4', 'R2C5'], ['R3C7', 'R3C8'],
  ['R3C7', 'R4C7'], ['R5C6', 'R5C7'], ['R5C7', 'R5C8'], ['R6C8', 'R6C9'],
  ['R6C8', 'R7C8'],
];
const whiteDots = whiteDotEdges.map(([a, b]) => new WhiteDot(a, b));

// Black dots: one digit is double the other. One entry per drawn dot.
const blackDotEdges = [
  ['R8C7', 'R9C7'], ['R9C5', 'R9C6'],
];
const blackDots = blackDotEdges.map(([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),
  new AntiKnight(),
  new AntiKing(),
  ...whiteDots,
  ...blackDots,
];
