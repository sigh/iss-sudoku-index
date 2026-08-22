// Title: Keep Talking And No-one Explodes
// Author: zetamath
// Video: https://www.youtube.com/watch?v=ZcsU1zHF1_0
// Source: https://app.crackingthecryptic.com/sudoku/Lt8N8ThFTM

// Rules encoded:
// - Standard row/column all-different (1-9 each); no fixed boxes.
// - Nine regions are discovered by the solver: each is a set of nine
//   orthogonally-connected cells containing every digit once, replacing the
//   usual boxes ("nine regions to be discovered, each containing nine
//   orthogonally connected cells").
// - Three unknown "bomb" digits are fixed for the whole grid; every instance
//   of any of the three is a bomb. Modelled as three aux Vars (VBOMB1..3)
//   pinned into ascending order to remove the 3!-way labelling symmetry that
//   is an artifact of the encoding, not a puzzle freedom.
// - Each arrow starts at a cell whose own digit is the number of cells to
//   travel in the drawn direction; the landing cell must hold a bomb digit
//   and share the arrow cell's region (rules' worked example: R6C2=3 means
//   R3C2, three cells up, is a bomb in R6C2's region). Distances that would
//   travel off the grid are simply absent from the per-arrow disjunction, so
//   they become impossible values for that arrow cell. Not every arrow that
//   could exist is drawn ("Not all arrows are necessarily given"), so only
//   the drawn ones are encoded.
// - Black dots mark every adjacent pair with a 1:2 ratio that lies in
//   different regions; "all such black dots are given" is exhaustive, so
//   every other adjacent pair is forbidden from being both ratio-1:2 and
//   cross-region.

const cc = cellGraph('9x9').makeOverlay('CC');

// Arrow clues: [origin cell, travel direction], transcribed from the drawn
// arrows (each is a short directional stub drawn inside its origin cell; two
// further entries in the source render nothing and are not encoded).
const ARROWS = [
  ['R1C1', 'right'], ['R1C3', 'left'], ['R1C4', 'right'],
  ['R5C2', 'up'], ['R6C2', 'up'], ['R7C2', 'up'],
  ['R7C3', 'right'], ['R8C3', 'right'], ['R8C4', 'right'],
  ['R9C4', 'left'], ['R9C5', 'right'], ['R9C9', 'left'],
  ['R7C8', 'down'], ['R7C9', 'down'],
  ['R4C8', 'down'], ['R4C9', 'down'],
  ['R1C6', 'left'],
];

// Black-dot edges, transcribed from the drawn overlay marks.
const DOT_EDGES = [
  ['R4C3', 'R4C4'], ['R5C5', 'R6C5'], ['R6C5', 'R7C5'], ['R8C3', 'R8C4'],
  ['R4C6', 'R5C6'], ['R8C6', 'R9C6'], ['R6C7', 'R7C7'], ['R2C7', 'R3C7'],
  ['R4C8', 'R4C9'], ['R5C8', 'R6C8'],
];

const STEP = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};

const eqKey = Pair.fnToKey((a, b) => a === b, 9);
const notRatioKey = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const ltKey = Pair.fnToKey((a, b) => a < b, 9);

// The three bomb digits, canonically ordered ascending (VBOMB1 < VBOMB2 <
// VBOMB3) so the solver cannot re-permute one labelling into three.
const bombVar = new Var('BOMB', 'bomb digits', 3);
const [B1, B2, B3] = bombVar.cells();

const isBomb = (cell) => new Or([
  new Pair(eqKey, 'isBomb', cell, B1),
  new Pair(eqKey, 'isBomb', cell, B2),
  new Pair(eqKey, 'isBomb', cell, B3),
]);

const sameRegion = (a, b) => new SameValues(2, ...cc.at([a, b]));
const differentRegion = (a, b) => new AllDifferent(...cc.at([a, b]));

const arrowConstraints = ARROWS.map(([origin, dir]) => {
  const { row, col } = parseCellId(origin);
  const { dr, dc } = STEP[dir];
  const branches = [];
  for (let d = 1; d <= 9; d++) {
    const r = row + dr * d;
    const c = col + dc * d;
    if (r < 1 || r > 9 || c < 1 || c > 9) continue;
    const target = makeCellId(r, c);
    branches.push(new And([
      new Given(origin, d),
      isBomb(target),
      sameRegion(origin, target),
    ]));
  }
  return new Or(branches);
});

// Every adjacent pair in the grid gets one of the two dot rules: the drawn
// dots enforce ratio-1:2 + cross-region; every undrawn pair forbids that
// combination (the "all such dots are given" exhaustiveness clause).
const dotSet = new Set(DOT_EDGES.map(([a, b]) => [a, b].sort().join('-')));
const allEdges = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const here = makeCellId(r, c);
    if (c < 9) allEdges.push([here, makeCellId(r, c + 1)]);
    if (r < 9) allEdges.push([here, makeCellId(r + 1, c)]);
  }
}

const dotConstraints = allEdges.flatMap(([a, b]) => {
  if (dotSet.has([a, b].sort().join('-'))) {
    return [new BlackDot(a, b), differentRegion(a, b)];
  }
  return [new Or([
    new Pair(notRatioKey, 'notRatio12', a, b),
    sameRegion(a, b),
  ])];
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  bombVar,
  new AllDifferent(B1, B2, B3),
  new Pair(ltKey, 'bombOrder', B1, B2),
  new Pair(ltKey, 'bombOrder', B2, B3),
  ...arrowConstraints,
  ...dotConstraints,
];
