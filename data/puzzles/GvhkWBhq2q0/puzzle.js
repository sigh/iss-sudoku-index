// Title: Difference Fences
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=GvhkWBhq2q0
// Source: https://app.crackingthecryptic.com/17rhp0owyb

// Normal sudoku (standard 3x3 boxes, no givens).
//
// Rule 1 ("Digits in the circles must appear in the surrounding four cells"):
// each of the 6 labelled circles is a `Quad`. The drawn circles are empty;
// the printed digits are two separate single-digit marks placed just
// west/east of the circle, on the row/col line through it (e.g. "2" just
// west and "1" just east of the circle centred at grid corner [2, 2]).
//
// Rule 2 (Difference Fences): the drawn fence outlines are the two parallel
// border rails of thick "fence" walls lying on top of grid edges (not
// through cell centres); several rails are split across drawing entries and
// clipped short where they pass under a circle. Reconstructing the rails
// (pairing offset parallel runs, snapping circle-clipped ends back to the
// circle's own grid vertex, and following shared vertices) recovers 8
// connected wall-chains, one touching each circle, of 3 unit segments each
// -- except the fence at the (5,5)-cornered blank circle, which is 6
// segments. Each unit segment is one sudoku-cell edge; "the difference
// between the cells they separate" is |a-b| across that edge.
//
// A 3-segment fence needs 3 pairwise-distinct positive differences, whose
// minimum possible sum is 1+2+3=6. A single printed digit (1-9) can't reach
// that floor, and splitting a 3-edge chain into a 1-segment + 2-segment pair
// fails arithmetically for the (2,2)- and (7,2)-cornered circles specifically
// -- a 2-segment sub-fence needs sum >= 1+2 = 3, but those two circles' digit
// pairs are {2,1} and {1,2}, and neither split leaves >=3 for the 2-segment
// side. Reading the two digits as one two-digit total instead (west digit as
// tens, east as units, matching their left-to-right drawing order) clears
// that floor for every labelled circle at once, so the same reading is used
// uniformly rather than only where the split fails.
//
// The two circles with no printed digits (corner (7,7) and corner (5,5)) are
// the fences whose totals the rules say still need to be deduced; only the
// distinct-segment-values part of the rule is encoded for them.
//
// Difference values are carried in Var cells VD1..VD27 (one per fence
// segment, in fence order below), holding |a-b|+1 so the value fits the
// grid's own 1-9 range (VD==1 would mean a difference of 0). AllDifferent
// over a fence's own VDs enforces "no two segments on a fence share a
// value"; Sum(total+segmentCount, ...VDs) enforces the shifted total.

const fences = [
  // Corner R2C2/R2C3/R3C2/R3C3, digits west=2 east=1 -> total 21.
  {
    quad: { topLeft: 'R2C2', values: [2, 1] },
    total: 21,
    edges: [['R2C2', 'R3C2'], ['R2C1', 'R2C2'], ['R1C2', 'R2C2']],
  },
  // Corner R4C1/R4C2/R5C1/R5C2, digits west=1 east=9 -> total 19.
  {
    quad: { topLeft: 'R4C1', values: [1, 9] },
    total: 19,
    edges: [['R5C2', 'R6C2'], ['R5C2', 'R5C3'], ['R5C1', 'R5C2']],
  },
  // Corner R1C5/R1C6/R2C5/R2C6, digits west=1 east=7 -> total 17.
  {
    quad: { topLeft: 'R1C5', values: [1, 7] },
    total: 17,
    edges: [['R2C5', 'R3C5'], ['R2C4', 'R2C5'], ['R2C5', 'R2C6']],
  },
  // Corner R2C8/R2C9/R3C8/R3C9, digits west=1 east=5 -> total 15.
  {
    quad: { topLeft: 'R2C8', values: [1, 5] },
    total: 15,
    edges: [['R2C8', 'R3C8'], ['R1C8', 'R2C8'], ['R2C7', 'R2C8']],
  },
  // Corner R4C8/R4C9/R5C8/R5C9, digits west=1 east=8 -> total 18.
  {
    quad: { topLeft: 'R4C8', values: [1, 8] },
    total: 18,
    edges: [['R7C8', 'R7C9'], ['R5C8', 'R5C9'], ['R6C8', 'R6C9']],
  },
  // Corner R7C7/R7C8/R8C7/R8C8, blank circle -- total to be deduced.
  {
    quad: null,
    total: null,
    edges: [['R7C7', 'R7C8'], ['R6C7', 'R6C8'], ['R5C7', 'R6C7']],
  },
  // Corner R7C2/R7C3/R8C2/R8C3, digits west=1 east=2 -> total 12.
  {
    quad: { topLeft: 'R7C2', values: [1, 2] },
    total: 12,
    edges: [['R8C2', 'R9C2'], ['R7C2', 'R8C2'], ['R8C1', 'R8C2']],
  },
  // Corner R5C5/R5C6/R6C5/R6C6, blank circle -- total to be deduced.
  // 6-segment fence (longer than the other 7).
  {
    quad: null,
    total: null,
    edges: [
      ['R8C5', 'R8C6'], ['R5C5', 'R6C5'], ['R8C5', 'R9C5'],
      ['R6C4', 'R6C5'], ['R7C4', 'R7C5'], ['R8C4', 'R8C5'],
    ],
  },
];

const segmentCount = fences.reduce((n, f) => n + f.edges.length, 0);
const diffVars = new Var('D', 'fence segment |difference|+1', String(segmentCount));

// VD_i == |a-b|+1: exactly one of (a-b-VD_i=-1) or (b-a-VD_i=-1) must hold.
function diffLink(v, a, b) {
  return new Or([
    new Sum(-1, a, [b, -1], [v, -1]),
    new Sum(-1, b, [a, -1], [v, -1]),
  ]);
}

let cursor = 0;
const fenceConstraints = fences.flatMap(fence => {
  const vars = fence.edges.map(() => diffVars.cell(++cursor));
  const links = fence.edges.map(([a, b], i) => diffLink(vars[i], a, b));
  const parts = [
    ...links,
    new AllDifferent(...vars),
  ];
  if (fence.total !== null) {
    parts.push(new Sum(fence.total + fence.edges.length, ...vars));
  }
  if (fence.quad) {
    parts.push(new Quad(fence.quad.topLeft, ...fence.quad.values));
  }
  return parts;
});

return [
  new Shape('9x9'),
  diffVars,
  ...fenceConstraints,
];
