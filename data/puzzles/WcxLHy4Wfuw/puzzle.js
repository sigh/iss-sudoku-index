// Title: I just like colours
// Author: DarthSillious72
// Video: https://www.youtube.com/watch?v=WcxLHy4Wfuw
// Source: https://sudokupad.app/5vtqvi9v5y

// Cells separated by a chess king's or knight's move must contain different
// digits.
const antiKingKnight = [new AntiKing(), new AntiKnight()];

// Orthogonally adjacent cells cannot be consecutive. This applies to every
// orthogonally adjacent pair in the grid, including the black-dot pairs
// below (a black dot pair of (1,2) would also be consecutive, so this rule
// interacts with -- but does not contradict -- the ratio dots: it simply
// rules out the (1,2) reading of any dot).
const nonConsecutive = [new AntiConsecutive()];

// Black dots: cells separated by a black dot are in a 1:2 ratio.
const blackDotEdges = [
  ['R2C2', 'R2C3'],
  ['R3C5', 'R3C6'],
  ['R1C8', 'R1C9'],
  ['R2C7', 'R3C7'],
  ['R4C5', 'R5C5'],
  ['R5C3', 'R5C4'],
  ['R1C4', 'R2C4'],
  ['R6C1', 'R7C1'],
  ['R7C1', 'R7C2'],
  ['R8C4', 'R8C5'],
  ['R7C6', 'R8C6'],
  ['R6C6', 'R6C7'],
  ['R5C8', 'R6C8'],
  ['R3C9', 'R4C9'],
  ['R8C9', 'R9C9'],
  ['R9C7', 'R9C8'],
];
const blackDots = blackDotEdges.map(([a, b]) => new BlackDot(a, b));

// "All black dots are given": every other orthogonally adjacent pair in the
// grid is NOT in a 1:2 ratio (and not consecutive, already covered above).
// StrictKropki fills in the negative constraint on every orthogonally
// adjacent pair not covered by an explicit BlackDot/WhiteDot constraint --
// there are no white dots here, so it only ever excludes the black-dot pairs
// listed above.
const strictBlackDots = [new StrictKropki()];

return [
  new Shape('9x9'),
  ...antiKingKnight,
  ...nonConsecutive,
  ...blackDots,
  ...strictBlackDots,
];
