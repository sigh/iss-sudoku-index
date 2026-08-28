// Title: Kropki Cube
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=046TBtvAc3E
// Source: https://cracking-the-cryptic.web.app/sudoku/DNtBq8Pfqn

// Fold the grid into a cube, then fill each row with 1-8. White dot =
// consecutive, black dot = 2:1 ratio, and every possible dot is drawn
// (including across the fold), so every other adjacent pair is neither.
//
// The drawn 6x8 net (black-underlay cells are not part of the cube) is six
// 2x2 faces: a horizontal belt Left-Front-Right-Back at R3-4/C1-8, with Top
// at R1-2/C3-4 attached above Front and Bottom at R5-6/C3-4 attached below
// it. Folding wraps the belt into a loop around a vertical axis (so Back's
// far edge, C8, meets Left's far edge, C1 -- a seam the flat net doesn't
// show) and folds Top/Bottom down onto the belt's open ends.
//
// Giving each face a fixed axis (Left/Right vary in y,z; Front/Back in x,z;
// Top/Bottom in x,y) and each cell a 3D corner coordinate along that face,
// two cells share a physical cube edge exactly when: they're on the same
// face and differ in one coordinate (an on-face edge, already adjacent in
// the flat net), or they're on different faces and land on the very same
// corner, i.e. agree on all 3 coordinates (a fold seam -- 10 of these are
// also flat-net-adjacent already; 14 are not, including the C8/C1 wrap and
// every Top/Bottom edge except the one drawn touching Front).
//
// "Each row" is then one of the 6 bands running around the 4 faces whose
// fixed axis isn't the row's axis, at one of its two coordinate values (2
// per axis x 3 axes) -- e.g. the x=0/x=1 bands run Front-Top-Back-Bottom
// and Front-Bottom-Back-Top respectively, skipping Left/Right. Two of the
// six (z=0, z=1) come out as the belt's own two flat rows, R3 and R4.

const faces = {
  L: ['R3C1', 'R3C2', 'R4C1', 'R4C2'],
  F: ['R3C3', 'R3C4', 'R4C3', 'R4C4'],
  R: ['R3C5', 'R3C6', 'R4C5', 'R4C6'],
  B: ['R3C7', 'R3C8', 'R4C7', 'R4C8'],
  T: ['R1C3', 'R1C4', 'R2C3', 'R2C4'],
  D: ['R5C3', 'R5C4', 'R6C3', 'R6C4'], // Bottom (Down), 'B' taken by Back
};
// Fixed (face-normal) axis per face: 0=x (Left/Right), 1=y (Front/Back),
// 2=z (Top/Bottom).
const normalAxis = { L: 0, R: 0, F: 1, B: 1, T: 2, D: 2 };

// Per-cell 3D corner coordinates, derived from the fold above: within each
// face the 4 cells occupy the 4 combinations of its two free coordinates,
// oriented so that adjoining faces agree at their shared seam.
const coords = {
  R3C1: [0, 1, 1], R3C2: [0, 0, 1], R4C1: [0, 1, 0], R4C2: [0, 0, 0], // L (x=0)
  R3C3: [0, 0, 1], R3C4: [1, 0, 1], R4C3: [0, 0, 0], R4C4: [1, 0, 0], // F (y=0)
  R3C5: [1, 0, 1], R3C6: [1, 1, 1], R4C5: [1, 0, 0], R4C6: [1, 1, 0], // R (x=1)
  R3C7: [1, 1, 1], R3C8: [0, 1, 1], R4C7: [1, 1, 0], R4C8: [0, 1, 0], // B (y=1)
  R1C3: [0, 1, 1], R1C4: [1, 1, 1], R2C3: [0, 0, 1], R2C4: [1, 0, 1], // T (z=1)
  R5C3: [0, 0, 0], R5C4: [1, 0, 0], R6C3: [0, 1, 0], R6C4: [1, 1, 0], // D (z=0)
};

const faceOf = {};
for (const [name, cells] of Object.entries(faces)) {
  for (const cell of cells) faceOf[cell] = name;
}
const whiteCells = Object.values(faces).flat();

// Rows: for axis A and value v, every cell whose face is not normal to A
// and whose A-coordinate is v. 3 axes x 2 values = 6 rows of 8 cells.
const rows = [];
for (let axis = 0; axis < 3; axis++) {
  for (const v of [0, 1]) {
    const cells = whiteCells.filter(
      (cell) => normalAxis[faceOf[cell]] !== axis && coords[cell][axis] === v
    );
    if (cells.length !== 8) throw new Error('bad row derivation');
    rows.push(cells);
  }
}

// Adjacent pairs: on-face (same face, coordinates differ in exactly one
// axis) plus fold seams (different faces, identical coordinates -- i.e.
// the two cells sit at the same cube corner, so a corner's 3 faces give 3
// seam pairs).
const pairKey = (a, b) => [a, b].sort().join('-');
const pairs = new Map();
for (const cells of Object.values(faces)) {
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const [ca, cb] = [coords[cells[i]], coords[cells[j]]];
      const diffs = ca.filter((v, k) => v !== cb[k]).length;
      if (diffs === 1) pairs.set(pairKey(cells[i], cells[j]), [cells[i], cells[j]]);
    }
  }
}
const byCorner = new Map();
for (const cell of whiteCells) {
  const key = coords[cell].join(',');
  if (!byCorner.has(key)) byCorner.set(key, []);
  byCorner.get(key).push(cell);
}
for (const cornerCells of byCorner.values()) {
  if (cornerCells.length !== 3) throw new Error('bad corner derivation');
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      pairs.set(
        pairKey(cornerCells[i], cornerCells[j]),
        [cornerCells[i], cornerCells[j]]
      );
    }
  }
}
if (pairs.size !== 48) throw new Error('expected 48 candidate dot pairs');

// Provenance: the 7 drawn edge-sized rounded dot marks.
const whiteDots = [['R2C4', 'R3C4'], ['R3C1', 'R4C1']];
const blackDots = [
  ['R1C3', 'R1C4'], ['R2C3', 'R2C4'],
  ['R3C3', 'R3C4'], ['R4C3', 'R4C4'], ['R4C6', 'R4C7'],
];
const dotted = new Set(
  [...whiteDots, ...blackDots].map(([a, b]) => pairKey(a, b))
);

// "All possible dots are given": every other candidate pair is neither
// consecutive nor 2:1 -- one negated-predicate Pair per undrawn edge.
const notDotKey = Pair.fnToKey(
  (a, b) => a !== b + 1 && a !== b - 1 && a !== 2 * b && b !== 2 * a,
  8
);
const noDotPairs = [...pairs.entries()]
  .filter(([key]) => !dotted.has(key))
  .map(([, cells]) => cells);
if (noDotPairs.length !== 41) throw new Error('expected 41 no-dot pairs');

// Black-underlay cells are decorative masking, not part of the cube; pin
// them to an arbitrary fixed digit so they don't inflate the search.
const blackCells = [];
for (let r = 1; r <= 6; r++) {
  for (let c = 1; c <= 8; c++) {
    const cell = makeCellId(r, c);
    if (!faceOf[cell]) blackCells.push(cell);
  }
}
if (blackCells.length !== 24) throw new Error('expected 24 masked cells');

return [
  new Shape('6x8', 8, 'Raw'),

  ...blackCells.map((cell) => new Given(cell, 1)),

  ...rows.map((cells) => new AllDifferent(...cells)),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...noDotPairs.map(([a, b]) => new Pair(notDotKey, 'no dot', a, b)),
];
