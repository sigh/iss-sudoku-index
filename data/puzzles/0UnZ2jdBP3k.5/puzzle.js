// Title: Clock Face Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=0UnZ2jdBP3k
// Source: https://app.crackingthecryptic.com/sudoku/hdDrHHQM6B

// Normal sudoku rules apply (standard 3x3 boxes). Six white dots and six
// black dots are drawn at 2x2 cell intersections as rounded quad markers
// with a white or black fill. Rules: "Around a white dot digits ascend clockwise from a
// point to be determined. Around a black dot digits similarly ascend
// anti-clockwise." The starting cell of each dot's 4-cell ring is not
// marked in the art, so it is encoded as a disjunction over all four
// possible starting cells (per the "point to be determined" wording).
//
// For a dot's four cells listed in clockwise order [c0,c1,c2,c3] (top-left,
// top-right, bottom-right, bottom-left -- these four are exactly the pairs
// GreaterThan treats as adjacent, since diagonal cells are not grid-adjacent
// and so never get an inequality between them), GreaterThan(a,b,c,d) forces
// a>b>c>d (strictly descending along that 3-step path, no wrap edge back to
// a). So:
//   - ascend clockwise from start s  ==  descend counter-clockwise from s
//     == GreaterThan(ccw-order starting at s)
//   - ascend counter-clockwise from start s == GreaterThan(cw-order
//     starting at s)
// Each dot becomes an Or of the 4 rotations of the relevant direction.

function rotations(order) {
  // All 4 cyclic rotations of a 4-element list.
  return [0, 1, 2, 3].map(s =>
    [0, 1, 2, 3].map(i => order[(s + i) % 4]));
}

function whiteDot(tl, tr, br, bl) {
  // Ascend clockwise from an unknown start: GreaterThan over each rotation
  // of the counter-clockwise order (see header comment).
  const ccw = [tl, bl, br, tr];
  return new Or(rotations(ccw).map(cells => new GreaterThan(...cells)));
}

function blackDot(tl, tr, br, bl) {
  // Ascend anti-clockwise from an unknown start: GreaterThan over each
  // rotation of the clockwise order (see header comment).
  const cw = [tl, tr, br, bl];
  return new Or(rotations(cw).map(cells => new GreaterThan(...cells)));
}

// Dot corner cells, transcribed from the drawn quad markers, each as
// TL,TR,BL,BR.
const whiteDots = [
  ['R1C1', 'R1C2', 'R2C2', 'R2C1'],
  ['R2C2', 'R2C3', 'R3C3', 'R3C2'],
  ['R2C7', 'R2C8', 'R3C8', 'R3C7'],
  ['R8C5', 'R8C6', 'R9C6', 'R9C5'],
  ['R7C4', 'R7C5', 'R8C5', 'R8C4'],
  ['R7C1', 'R7C2', 'R8C2', 'R8C1'],
  ['R5C2', 'R5C3', 'R6C3', 'R6C2'],
];

const blackDots = [
  ['R3C6', 'R3C7', 'R4C7', 'R4C6'],
  ['R8C8', 'R8C9', 'R9C9', 'R9C8'],
  ['R6C3', 'R6C4', 'R7C4', 'R7C3'],
  ['R4C2', 'R4C3', 'R5C3', 'R5C2'],
  ['R3C1', 'R3C2', 'R4C2', 'R4C1'],
];

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C1', 3),
  new Given('R2C2', 1),
  new Given('R2C5', 8),
  new Given('R2C7', 3),
  new Given('R3C3', 5),
  new Given('R3C8', 9),
  new Given('R4C2', 9),
  new Given('R5C3', 6),
  new Given('R5C8', 2),
  new Given('R6C4', 1),
  new Given('R7C2', 5),
  new Given('R7C5', 3),
  new Given('R7C7', 7),
  new Given('R8C3', 1),
  new Given('R8C6', 2),
  new Given('R8C8', 5),
  new Given('R9C9', 9),

  ...whiteDots.map(([tl, tr, br, bl]) => whiteDot(tl, tr, br, bl)),
  ...blackDots.map(([tl, tr, br, bl]) => blackDot(tl, tr, br, bl)),
];
