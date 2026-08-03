// Title: Shuriken
// Author: XeonRisq
// Video: https://www.youtube.com/watch?v=p6n2Zub7mcM
// Source: https://app.crackingthecryptic.com/sudoku/LFMR2HQNJP

// Normal sudoku rules apply (default row/column/box AllDifferent, no givens).
// Gray lines: "the sequence of digits on a gray line reads the same from
// both directions" -> Palindrome.
// Circles: "Circles are either quadruples or anti-quadruples ... Which
// circle is which must be deduced by the solver." Each circle's digit set
// therefore applies as a whole under one of two readings, chosen freely per
// circle: a normal quadruple (every listed digit appears at least once among
// the 4 surrounding cells) or an anti-quadruple (every listed digit appears
// in none of the 4 surrounding cells). Encoded below as an Or between a
// Quad and the complementary candidate restriction on all 4 cells, built by
// quadOrAntiQuad().

const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// One circle: `cells` is the 2x2 block starting with its top-left cell (as
// Quad's anchor requires); `digits` is the circle's labelled digit set.
// The Or's first branch is a literal Quad(topLeft, ...digits). The second
// branch bans every listed digit from every one of the 4 cells by giving
// each cell the complementary candidate list -- the direct expression of
// "must NOT appear in any of its four surrounding cells".
function quadOrAntiQuad(cells, digits) {
  const complement = ALL_DIGITS.filter(d => !digits.includes(d));
  return new Or([
    new Quad(cells[0], ...digits),
    new And(cells.map(c => new Given(c, ...complement))),
  ]);
}

// Circle cell blocks, topLeft cell first: the drawn 2x2 corner circles. The
// four centre circles all touch R5C5, forming the four-bladed "shuriken";
// the other eight sit at the ends of the gray lines. Digit sets for the four
// circles drawn with an empty label come from their split top/bottom edge
// text (e.g. "1 2" over "6" -> {1,2,6}).
const CIRCLES = [
  // Centre pinwheel.
  [['R4C4', 'R4C5', 'R5C4', 'R5C5'], [5, 7]],
  [['R4C5', 'R4C6', 'R5C5', 'R5C6'], [5, 7]],
  [['R5C4', 'R5C5', 'R6C4', 'R6C5'], [5, 7]],
  [['R5C5', 'R5C6', 'R6C5', 'R6C6'], [2, 4]],
  // Outer, plain two-digit label.
  [['R4C1', 'R4C2', 'R5C1', 'R5C2'], [1, 9]],
  [['R7C6', 'R7C7', 'R8C6', 'R8C7'], [5, 7]],
  [['R3C7', 'R3C8', 'R4C7', 'R4C8'], [3, 7]],
  // Outer, split-label three-digit set.
  [['R1C4', 'R1C5', 'R2C4', 'R2C5'], [1, 2, 6]],
  [['R2C3', 'R2C4', 'R3C3', 'R3C4'], [4, 5, 7]],
  [['R6C2', 'R6C3', 'R7C2', 'R7C3'], [2, 4, 7]],
  [['R8C4', 'R8C5', 'R9C4', 'R9C5'], [1, 3, 5]],
  [['R4C8', 'R4C9', 'R5C8', 'R5C9'], [3, 6, 8]],
];

return [
  new Shape('9x9'),

  new Palindrome('R2C4', 'R3C4', 'R4C5', 'R4C6', 'R3C7', 'R3C8', 'R4C9', 'R5C9'),
  new Palindrome('R1C5', 'R1C4', 'R2C3', 'R3C3', 'R4C4', 'R5C4', 'R6C3', 'R6C2'),
  new Palindrome('R5C1', 'R6C1', 'R7C2', 'R7C3', 'R6C4', 'R6C5', 'R7C6', 'R8C6'),
  new Palindrome('R9C5', 'R9C6', 'R8C7', 'R7C7', 'R6C6', 'R5C6', 'R4C7', 'R4C8'),

  ...CIRCLES.map(([cells, digits]) => quadOrAntiQuad(cells, digits)),
];
