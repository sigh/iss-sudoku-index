// Title: Oct 13, 2021: Kropki Pairs
// Author: Sam. In disguise.
// Video: https://www.youtube.com/watch?v=B1GJadtsIRg
// Source: https://tinyurl.com/35kat8h4

// Standard 9x9 sudoku. White dots mark adjacent-cell pairs that must be
// consecutive; black dots mark adjacent-cell pairs in a 1:2 ratio. Unmarked
// pairs are unconstrained -- the rules text says not all dots are given --
// so no exhaustiveness (StrictKropki) constraint is added.
// Each dot is an independent edge, not a chain, so each gets its own
// WhiteDot/BlackDot pair.

const whiteDotEdges = [
  ['R7C2', 'R8C2'], ['R8C2', 'R9C2'], ['R1C8', 'R2C8'], ['R2C8', 'R3C8'],
  ['R4C5', 'R5C5'], ['R5C5', 'R6C5'], ['R6C7', 'R7C7'], ['R7C7', 'R8C7'],
  ['R2C3', 'R3C3'], ['R3C3', 'R4C3'], ['R3C1', 'R4C1'], ['R9C3', 'R9C4'],
  ['R1C6', 'R1C7'], ['R1C5', 'R2C5'], ['R8C5', 'R9C5'], ['R9C8', 'R9C9'],
  ['R1C1', 'R1C2'], ['R6C3', 'R6C4'],
];

const blackDotEdges = [
  ['R2C7', 'R2C8'], ['R2C8', 'R2C9'], ['R8C1', 'R8C2'], ['R8C2', 'R8C3'],
  ['R5C5', 'R5C6'], ['R5C4', 'R5C5'], ['R7C6', 'R7C7'], ['R7C7', 'R7C8'],
  ['R3C2', 'R3C3'], ['R3C3', 'R3C4'], ['R6C9', 'R7C9'], ['R4C6', 'R4C7'],
  ['R1C4', 'R1C5'], ['R9C5', 'R9C6'], ['R6C1', 'R6C2'], ['R4C8', 'R4C9'],
];

return [
  new Shape('9x9'),

  ...whiteDotEdges.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),

  new Given('R1C1', 2),
  new Given('R9C9', 8),
];
