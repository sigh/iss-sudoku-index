// Title: Consecutive Rings
// Author: Qinlux
// Video: https://www.youtube.com/watch?v=duIl0zO4Q00
// Source: https://app.crackingthecryptic.com/sudoku/Dpfp2Jt3tF

// Normal sudoku rules apply. There are three rings (increasingly larger
// squares) with breaks in them, drawn as yellow lines. Along a ring, every
// digit must touch at least one other consecutive digit on the ring, except
// across a break (where there is no line), where the two digits must NOT be
// consecutive.
//
// A ring is the closed loop of cells at one Chebyshev distance from the
// centre R5C5 (distance 2, 3, or 4; distance 1, the 8 cells immediately
// around the centre, is not one of the puzzle's three rings). The loop is
// generated here from that distance-from-centre definition, which is the
// rules text's own description ("increasingly larger squares"), not
// discovered by search.
function ringLoop(k) {
  const lo = 5 - k, hi = 5 + k;
  const coords = [];
  for (let c = lo; c < hi; c++) coords.push([lo, c]);   // top edge, L->R
  for (let r = lo; r < hi; r++) coords.push([r, hi]);   // right edge, T->B
  for (let c = hi; c > lo; c--) coords.push([hi, c]);   // bottom edge, R->L
  for (let r = hi; r > lo; r--) coords.push([r, lo]);   // left edge, B->T
  return coords.map(([r, c]) => makeCellId(r, c));
}

// The yellow line segments, transcribed from the payload's drawn geometry
// (each entry a maximal run of ring cells joined by a drawn line).
const ringSegments = {
  4: [
    ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1',
      'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
    ['R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9'],
    ['R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5'],
  ],
  3: [
    ['R4C8', 'R3C8', 'R2C8', 'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2',
      'R3C2', 'R4C2', 'R5C2', 'R6C2'],
    ['R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R7C8', 'R6C8'],
  ],
  2: [
    ['R6C7', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R6C3', 'R5C3', 'R4C3',
      'R3C3'],
    ['R3C5', 'R3C6', 'R3C7', 'R4C7'],
  ],
};

const cellPairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

const lineEdges = new Set();
for (const segments of Object.values(ringSegments)) {
  for (const cells of segments) {
    for (let i = 0; i + 1 < cells.length; i++) {
      lineEdges.add(cellPairKey(cells[i], cells[i + 1]));
    }
  }
}

// Per-ring: the cyclic loop edges not covered by a drawn line are the
// breaks; the cyclic loop edges that are covered give each cell its set of
// "on the ring" neighbours for the touch rule.
const breakEdges = [];
const ringNeighbours = new Map();
for (const k of [2, 3, 4]) {
  const loop = ringLoop(k);
  const n = loop.length;
  for (let i = 0; i < n; i++) {
    const a = loop[i], b = loop[(i + 1) % n];
    if (lineEdges.has(cellPairKey(a, b))) {
      if (!ringNeighbours.has(a)) ringNeighbours.set(a, []);
      if (!ringNeighbours.has(b)) ringNeighbours.set(b, []);
      ringNeighbours.get(a).push(b);
      ringNeighbours.get(b).push(a);
    } else {
      breakEdges.push([a, b]);
    }
  }
}

const nonConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

// Every ring cell that has at least one line-neighbour must be consecutive
// with at least one of them; WhiteDot is the native adjacent-consecutive
// relation (all ring-adjacent pairs are grid-orthogonally-adjacent by the
// loop construction above), reused here for its exact pairwise semantics.
const touchConstraints = [...ringNeighbours.entries()].map(([cell, neighbours]) => {
  const options = neighbours.map(n => new WhiteDot(cell, n));
  return options.length === 1 ? options[0] : new Or(options);
});

const breakConstraints = breakEdges.map(
  ([a, b]) => new Pair(nonConsecutiveKey, 'ring-break', a, b));

return [
  new Shape('9x9'),

  ...touchConstraints,
  ...breakConstraints,

  // Black dots: 1:2 ratio, drawn edge overlays. Not all such pairs are
  // marked, so no negative (StrictKropki) reading applies.
  new BlackDot('R2C8', 'R3C8'),
  new BlackDot('R2C6', 'R2C7'),
  new BlackDot('R2C2', 'R2C3'),
  new BlackDot('R2C2', 'R3C2'),
  new BlackDot('R4C2', 'R5C2'),
  new BlackDot('R4C1', 'R5C1'),
  new BlackDot('R8C2', 'R8C3'),
  new BlackDot('R7C8', 'R8C8'),
];
