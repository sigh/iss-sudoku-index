// Title: Pencil Puzzle Sudoku Hybrid Series #2 - Hashiwokakero Sudoku
// Author: Aron Lide
// Video: https://www.youtube.com/watch?v=_NusPF_EuBc
// Source: https://git.io/JThsd
//
// Rules: normal sudoku. Hashiwokakero rules apply to the circled cells: draw
// horizontal/vertical lines between circles, at most two lines per pair, no
// line crosses another line or another circle, every circle's own (unknown)
// sudoku digit is its required line count, and all circles end up connected
// by the drawn lines. The white-dot consecutive rule from the source text has
// no drawn instance on this board (see below) and adds no constraint here.
//
// The circled cells (islands) below are transcribed from the payload's
// circle markers on the board (two further circle markers decode to points
// outside the 9x9 board and are stray, not drawn circles).
const islandCoords = [
  [1, 4], [1, 6], [1, 8],
  [2, 2], [2, 3], [2, 5], [2, 7],
  [3, 2], [3, 4], [3, 6], [3, 8],
  [4, 1], [4, 7],
  [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9],
  [6, 1], [6, 6], [6, 7],
  [7, 3],
  [8, 4], [8, 6], [8, 7], [8, 8],
  [9, 4], [9, 6], [9, 7],
];

// A candidate bridge exists between two islands that are adjacent in row or
// column order once the islands are sorted along that line -- i.e. no other
// island lies between them. This also keeps a bridge from ever passing
// through a third circle, per the rules. Derived from islandCoords, not
// hand-listed.
const byRow = new Map(), byCol = new Map();
for (const [r, c] of islandCoords) {
  (byRow.get(r) || byRow.set(r, []).get(r)).push(c);
  (byCol.get(c) || byCol.set(c, []).get(c)).push(r);
}
const edges = []; // {r1,c1,r2,c2,orient}
for (const [r, cs] of byRow) {
  const sorted = [...cs].sort((a, b) => a - b);
  for (let i = 0; i + 1 < sorted.length; i++) {
    edges.push({ r1: r, c1: sorted[i], r2: r, c2: sorted[i + 1], orient: 'H' });
  }
}
for (const [c, rs] of byCol) {
  const sorted = [...rs].sort((a, b) => a - b);
  for (let i = 0; i + 1 < sorted.length; i++) {
    edges.push({ r1: sorted[i], c1: c, r2: sorted[i + 1], c2: c, orient: 'V' });
  }
}

// One Var per candidate bridge, value 1/2/3 standing for 0/1/2 actual lines
// (shifted so the domain fits the solver's [1,9] cell range with no widened
// Shape). "Bridges" below always means the shifted-back count (value - 1).
const bridgeVar = new Var('VE', 'hashi bridge count + 1 per candidate edge', edges.length);
const edgeCells = edges.map((_, i) => bridgeVar.cell(i + 1));

// Crossing pairs: an H edge spanning row r, cols [c1,c2] and a V edge
// spanning col c, rows [r1,r2] cross when each interior contains the other's
// line, i.e. r is strictly between the V edge's rows and c is strictly
// between the H edge's columns. Computed from the edge list, not enumerated
// by hand.
const crossingPairs = [];
edges.forEach((h, i) => {
  if (h.orient !== 'H') return;
  const [c1, c2] = [h.c1, h.c2];
  edges.forEach((v, j) => {
    if (v.orient !== 'V') return;
    const [r1, r2] = [v.r1, v.r2];
    if (r1 < h.r1 && h.r1 < r2 && c1 < v.c1 && v.c1 < c2) {
      crossingPairs.push([i, j]);
    }
  });
});

const noCrossKey = Pair.fnToKey((a, b) => !(a >= 2 && b >= 2), 9);

// Each island's digit (normal sudoku, 1-9: no 0 in range) equals the total
// bridge count over its incident candidate edges -- this is what "the number
// of lines connected to each circle must match the digit on that circle"
// means here, since no fixed clue digit is drawn on any circle (0 givens in
// the payload): the digit is read off the solved sudoku grid itself. Because
// the grid range excludes 0, this already forces every island to carry at
// least one bridge, without a separate rule for it.
const degreeSums = islandCoords.map(([r, c]) => {
  const incident = [];
  edges.forEach((e, i) => {
    if ((e.r1 === r && e.c1 === c) || (e.r2 === r && e.c2 === c)) {
      incident.push(edgeCells[i]);
    }
  });
  return new Sum(
    incident.length,
    ...incident,
    [makeCellId(r, c), -1]);
});

return [
  new Shape('9x9'),

  bridgeVar,
  ...edgeCells.map(cell => new Given(cell, 1, 2, 3)),

  ...crossingPairs.map(([i, j]) =>
    new Pair(noCrossKey, 'hashi lines do not cross', edgeCells[i], edgeCells[j])),

  ...degreeSums,
];
