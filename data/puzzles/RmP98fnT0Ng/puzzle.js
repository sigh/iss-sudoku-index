// Title: Lumos Maxima
// Author: Chameleon
// Video: https://www.youtube.com/watch?v=RmP98fnT0Ng
// Source: https://yusitnikov.github.io/puzzletv/#lumos-maxima

// Normal sudoku (standard rows/cols/boxes, from the default Shape), with no
// given digits. Digits along an arrow sum to the digit in its circle; every
// circle is a single cell, and digits may repeat along an arrow. Cages sum to
// their printed total and are all-different; one cage is drawn with no total,
// so it carries all-different only.
//
// The fog, its two starting light sources, and the 5-lives limit reveal the
// grid as it is solved and place no constraint on the finished grid, so they
// are not encoded.

// Arrows, from the drawn circle-and-arm figures: circle cell first, then the
// arm in drawn order. The arm lists every cell the arrow passes through, so
// the two arrows that bend around a corner (R6C7 and R8C8) include the cell
// between their bends -- R6C6 and R7C7 respectively -- which the figure draws
// through but does not mark.
const ARROWS = [
  ['R6C1', 'R5C2', 'R6C2'],
  ['R4C2', 'R4C3', 'R4C4'],
  ['R6C7', 'R6C6', 'R6C5', 'R5C6'],
  ['R3C6', 'R4C6', 'R4C7'],
  ['R8C3', 'R7C4'],
  ['R8C8', 'R7C8', 'R7C7', 'R7C6', 'R8C6', 'R8C5'],
  ['R4C9', 'R3C9', 'R2C8'],
];

// Cages carrying a printed total (small clue in the cage's top-left cell).
const SUM_CAGES = [
  [8, 'R1C1', 'R1C2', 'R2C1'],
  [8, 'R3C1', 'R3C2', 'R4C1'],
  [23, 'R1C3', 'R2C3', 'R2C4', 'R3C3'],
  [45, 'R1C4', 'R1C5', 'R2C5', 'R3C4', 'R3C5', 'R4C5', 'R5C4', 'R5C5', 'R5C6'],
  [38, 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
];

// The one cage drawn without a printed total.
const NO_TOTAL_CAGE = ['R2C8', 'R3C8', 'R4C7', 'R4C8', 'R4C9'];

return [
  ...ARROWS.map(([circle, ...arm]) => new Arrow(circle, ...arm)),
  ...SUM_CAGES.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new AllDifferent(...NO_TOTAL_CAGE),
];
