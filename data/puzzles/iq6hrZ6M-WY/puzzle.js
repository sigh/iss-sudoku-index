// Title: XV ballpit
// Author: Wypman
// Video: https://www.youtube.com/watch?v=iq6hrZ6M-WY
// Source: https://sudokupad.app/hb3fq3jqP2

// Normal sudoku and killer cages: cage digits do not repeat and sum to the
// shown total. Each labelled 2x2 ball contains the stated number of
// orthogonally adjacent digit-pairs summing to 5 or 10; pairs selected for
// one ball are disjoint. Other pairs are unrestricted.

// Killer cage cells and totals transcribed from the drawn dashed cages.
const cages = [
  [25, 'R3C5', 'R3C6', 'R3C7', 'R4C6', 'R4C7'],
  [16, 'R6C3', 'R6C4', 'R6C5', 'R7C4', 'R7C5'],
  [7, 'R6C8', 'R7C7', 'R7C8'],
  [10, 'R3C2', 'R4C1', 'R4C2', 'R5C2'],
  [18, 'R8C2', 'R8C3', 'R8C4'],
  [6, 'R2C2', 'R2C3', 'R2C4'],
  [11, 'R1C2', 'R1C3'],
  [4, 'R9C3', 'R9C4'],
  [5, 'R5C6', 'R6C6'],
];

// A ball is written [top-left, top-right, bottom-left, bottom-right], read
// from its drawn 2x2 circle. The two perfect matchings are its horizontal
// edges and its vertical edges; those are the only two disjoint pairings.
const balls = {
  A: [
    ['R1C3', 'R1C4', 'R2C3', 'R2C4'],
    ['R2C8', 'R2C9', 'R3C8', 'R3C9'],
    ['R8C2', 'R8C3', 'R9C2', 'R9C3'],
  ],
  B: [
    ['R3C6', 'R3C7', 'R4C6', 'R4C7'],
    ['R5C2', 'R5C3', 'R6C2', 'R6C3'],
  ],
  C: [
    ['R4C2', 'R4C3', 'R5C2', 'R5C3'],
    ['R4C8', 'R4C9', 'R5C8', 'R5C9'],
    ['R8C4', 'R8C5', 'R9C4', 'R9C5'],
  ],
  D: [
    ['R6C4', 'R6C5', 'R7C4', 'R7C5'],
    ['R7C7', 'R7C8', 'R8C7', 'R8C8'],
  ],
  E: [
    ['R6C7', 'R6C8', 'R7C7', 'R7C8'],
    ['R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ],
};

const edges = ([tl, tr, bl, br]) => [[tl, tr], [tl, bl], [tr, br], [bl, br]];
const onePair = (BallConstraint, ball) => new Or(edges(ball).map(([a, b]) => new BallConstraint(a, b)));
const twoPairs = (BallConstraint, [tl, tr, bl, br]) => new Or([
  new And([new BallConstraint(tl, tr), new BallConstraint(bl, br)]),
  new And([new BallConstraint(tl, bl), new BallConstraint(tr, br)]),
]);
// E's two selected sets have different totals, so all four orientations of
// the two disjoint edges are listed rather than choosing one from the answer.
const mixedPairs = ([tl, tr, bl, br]) => new Or([
  new And([new V(tl, tr), new X(bl, br)]),
  new And([new V(bl, br), new X(tl, tr)]),
  new And([new V(tl, bl), new X(tr, br)]),
  new And([new V(tr, br), new X(tl, bl)]),
]);

const ballConstraints = [
  ...balls.A.map(ball => onePair(X, ball)),
  ...balls.B.map(ball => twoPairs(X, ball)),
  ...balls.C.map(ball => onePair(V, ball)),
  ...balls.D.map(ball => twoPairs(V, ball)),
  ...balls.E.map(mixedPairs),
];

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...ballConstraints,
];
