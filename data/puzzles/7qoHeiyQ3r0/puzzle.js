// Title: Balance Loop Sudoku
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=7qoHeiyQ3r0
// Source: https://app.crackingthecryptic.com/sudoku/LdgRt8ddjQ

// Normal sudoku, no given digits. Draw a single closed loop through the
// centres of some cells (never repeating a cell). The loop must pass through
// every drawn dot; the puzzle states all possible dots are given, but that
// meta-rule (no unmarked location may qualify as a dot) is not encoded -- see
// the note above `dotConstraints` below. A dot -- either a single cell, or
// the midpoint of an edge joining two orthogonally adjacent cells -- splits
// the loop into two arcs, one leaving in each direction. Each arc's sum runs
// from its own start up to and including the digit of that arc's first turn;
// the two arcs of one dot must sum equal.
//
// Path model: every cell gets a "shape" Var holding one of 7 codes: OFF, or
// one of the two-direction codes NS/EW (straight) and NE/NW/SE/SW (turn).
// There are no path endpoints (the loop is closed), so no single-direction
// codes are needed. Each grid edge gets one agreement check (as in other
// loop scripts): the two cells sharing it must agree on whether that edge is
// used. This pins each cell's exact degree and direction locally without
// assuming that any two adjacent on-loop cells are path-connected, i.e. it
// allows the loop to touch itself at non-consecutive cells (the rules do not
// forbid this). `ConnectedValues` over the non-OFF codes rules out a second,
// fully disconnected loop fragment, but does not by itself prove there is
// exactly one loop when self-touching is allowed -- a documented, deliberate
// omission (the same gap as other loop scripts in this codebase, e.g.
// 00lxcgSGLBg).

const CODE = { OFF: 1, NS: 2, EW: 3, NE: 4, NW: 5, SE: 6, SW: 7 };
const ALL_CODES = Object.values(CODE);
const TURN_CODES = [CODE.NE, CODE.NW, CODE.SE, CODE.SW];
const STRAIGHT_OF_AXIS = { vert: CODE.NS, horiz: CODE.EW };

function usesDir(code) {
  switch (code) {
    case CODE.OFF: return { N: false, S: false, E: false, W: false };
    case CODE.NS: return { N: true, S: true, E: false, W: false };
    case CODE.EW: return { N: false, S: false, E: true, W: true };
    case CODE.NE: return { N: true, S: false, E: true, W: false };
    case CODE.NW: return { N: true, S: false, E: false, W: true };
    case CODE.SE: return { N: false, S: true, E: true, W: false };
    case CODE.SW: return { N: false, S: true, E: false, W: true };
    // Codes 8-9 are unused (the Shape's default 1-9 range exceeds the 7
    // shape codes actually needed); Pair.fnToKey still enumerates the full
    // range when building its lookup table, so give them an inert default.
    default: return { N: false, S: false, E: false, W: false };
  }
}

const puzzleShape = new Shape('9x9');
const graph = cellGraph(puzzleShape);
const gridCells = graph.cells();

const shape = graph.makeOverlay('VS');
const shapeCell = cell => shape.at(cell);

// The directions that physically exist at a cell (false at the grid edge).
function existingDirs(cell) {
  return {
    N: !!graph.step(cell, -1, 0),
    S: !!graph.step(cell, 1, 0),
    E: !!graph.step(cell, 0, 1),
    W: !!graph.step(cell, 0, -1),
  };
}
function codeFits(code, exists) {
  const need = usesDir(code);
  return (!need.N || exists.N) && (!need.S || exists.S) &&
    (!need.E || exists.E) && (!need.W || exists.W);
}

// --- Shape domain per cell: only codes whose directions actually exist. No
// endpoint codes exist at all -- the loop is closed.
const shapeDomains = gridCells.map(cell => {
  const exists = existingDirs(cell);
  const candidates = ALL_CODES.filter(code => codeFits(code, exists));
  return new Given(shapeCell(cell), ...candidates);
});

// --- Edge agreement: the cells sharing a grid edge must agree on whether
// that edge is used (part of the loop) or not.
const eastAgree = Pair.fnToKey((a, b) => usesDir(a).E === usesDir(b).W, puzzleShape);
const southAgree = Pair.fnToKey((a, b) => usesDir(a).S === usesDir(b).N, puzzleShape);
const horizontalEdgeOrigins = gridCells.filter(cell => graph.step(cell, 0, 1));
const verticalEdgeOrigins = gridCells.filter(cell => graph.step(cell, 1, 0));
const edgeAgreement = [
  shape.makeReplicate(
    new Pair(eastAgree, 'edge-h', shapeCell('R1C1'), shapeCell('R1C2')),
    shape.at(horizontalEdgeOrigins)),
  shape.makeReplicate(
    new Pair(southAgree, 'edge-v', shapeCell('R1C1'), shapeCell('R2C1')),
    shape.at(verticalEdgeOrigins)),
];

// --- Partial loop closure (see header note): rules out a fully disconnected
// second loop fragment, but not self-touching subtours.
const loopConnectivity = new ConnectedValues('VS', ALL_CODES.filter(c => c !== CODE.OFF));

// --- Dots, transcribed from the drawn overlays (payload `overlays`, each a
// rounded mark centred either on one cell or on the boundary between two).
// Cell dots: rounded mark centred in a single cell.
const CELL_DOTS = [
  'R1C1', 'R2C5', 'R3C9', 'R4C2', 'R5C5',
  'R6C1', 'R6C3', 'R8C2', 'R9C1', 'R9C8',
];
// Edge dots: rounded mark centred on the shared border of two cells, given
// as [nearer-to-start cell, other cell]; direction between them is read from
// their coordinates below.
const EDGE_DOTS = [
  ['R1C2', 'R2C2'],
  ['R1C3', 'R2C3'],
  ['R1C5', 'R1C6'],
  ['R5C8', 'R5C9'],
  ['R8C4', 'R8C5'],
  ['R8C7', 'R9C7'],
];

// Marks the len-1 cells of `rayCells` (nearest split first) as continuing
// straight along `straightCode`'s axis, and the len'th cell as the arc's
// first turn (any code but that straight one -- OFF is excluded by the
// global edge-agreement check above, and the wrong turn orientation is
// excluded by edge agreement with the preceding straight cell, or, for
// len===1, by the domain already narrowed by the dot's own fixed direction).
function boundaryGivens(branch, rayCells, len, straightCode) {
  for (let i = 0; i < len - 1; i++) branch.push(new Given(shapeCell(rayCells[i]), straightCode));
  branch.push(new Given(shapeCell(rayCells[len - 1]), ...ALL_CODES.filter(c => c !== straightCode)));
}

const DIR = { N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] };
const AXIS_OF_DIR = { N: 'vert', S: 'vert', E: 'horiz', W: 'horiz' };
function activeDirNames(code) {
  const d = usesDir(code);
  return ['N', 'S', 'E', 'W'].filter(k => d[k]);
}

// A cell dot: the loop's two arcs both leave `anchor`, in whichever two
// directions its own code uses (the code itself is not known in advance, so
// it is enumerated). Each arc's sum starts at the first cell past `anchor`
// (the anchor's own digit would appear identically in both arcs and cancels,
// so it is left out of the Sum below) and runs to that side's first turn.
function cellDotConstraint(anchor) {
  const exists = existingDirs(anchor);
  const branches = [];
  for (const code of ALL_CODES) {
    if (code === CODE.OFF || !codeFits(code, exists)) continue;
    const [dirA, dirB] = activeDirNames(code);
    const rayA = graph.ray(anchor, ...DIR[dirA]).slice(1);
    const rayB = graph.ray(anchor, ...DIR[dirB]).slice(1);
    const maxA = Math.min(rayA.length, 9);
    const maxB = Math.min(rayB.length, 9);
    for (let a = 1; a <= maxA; a++) {
      for (let b = 1; b <= maxB; b++) {
        const branch = [new Given(shapeCell(anchor), code)];
        boundaryGivens(branch, rayA, a, STRAIGHT_OF_AXIS[AXIS_OF_DIR[dirA]]);
        boundaryGivens(branch, rayB, b, STRAIGHT_OF_AXIS[AXIS_OF_DIR[dirB]]);
        branch.push(new EqualSum(rayA.slice(0, a), rayB.slice(0, b)));
        branches.push(new And(branch));
      }
    }
  }
  return new Or(branches);
}

// An edge dot forces the connecting edge on (both named cells use the
// direction toward each other); each arc then starts at its own named cell
// (included in its sum, since that is the first cell reached leaving the
// dot) and runs away from the other cell to its side's first turn.
function edgeDotConstraint(nearCell, farCell) {
  let dRow = 0, dCol = 0;
  const nearGeom = parseCellId(nearCell), farGeom = parseCellId(farCell);
  if (nearGeom.row !== farGeom.row) dRow = farGeom.row > nearGeom.row ? 1 : -1;
  else dCol = farGeom.col > nearGeom.col ? 1 : -1;
  const axis = dRow !== 0 ? 'vert' : 'horiz';
  const straightCode = STRAIGHT_OF_AXIS[axis];

  // Direction names for "toward the other cell" at each end.
  const nearToFar = dRow === 1 ? 'S' : dRow === -1 ? 'N' : dCol === 1 ? 'E' : 'W';
  const farToNear = dRow === 1 ? 'N' : dRow === -1 ? 'S' : dCol === 1 ? 'W' : 'E';
  const codesUsing = dirName => ALL_CODES.filter(c => c !== CODE.OFF && usesDir(c)[dirName]);

  // Each ray runs AWAY from the other cell (the arc leaves the dot and never
  // doubles back over it), so it uses the *opposite* named direction from
  // the one that points at the other cell.
  const rayNear = graph.ray(nearCell, ...DIR[farToNear]);
  const rayFar = graph.ray(farCell, ...DIR[nearToFar]);
  const maxN = Math.min(rayNear.length, 9);
  const maxF = Math.min(rayFar.length, 9);

  const forceEdge = [
    new Given(shapeCell(nearCell), ...codesUsing(nearToFar)),
    new Given(shapeCell(farCell), ...codesUsing(farToNear)),
  ];

  const branches = [];
  for (let n = 1; n <= maxN; n++) {
    for (let f = 1; f <= maxF; f++) {
      const branch = [];
      boundaryGivens(branch, rayNear, n, straightCode);
      boundaryGivens(branch, rayFar, f, straightCode);
      branch.push(new EqualSum(rayNear.slice(0, n), rayFar.slice(0, f)));
      branches.push(new And(branch));
    }
  }
  return [...forceEdge, new Or(branches)];
}

const dotConstraints = [
  ...CELL_DOTS.map(cellDotConstraint),
  ...EDGE_DOTS.flatMap(([a, b]) => edgeDotConstraint(a, b)),
];
// Omission: "all possible dots are given" -- i.e. no unmarked cell or edge
// may be the midpoint of an arc split the way a dot marks -- is not encoded.
// Encoding it would require asserting, for every one of the 81 cells and
// ~144 internal edges not in CELL_DOTS/EDGE_DOTS, that the loop (if it uses
// that location at all) is *not* balanced there; that is a relaxation
// (omission), not a tightening, and is left out.

return [
  puzzleShape,
  shape.toVar('shape'),
  ...shapeDomains,
  ...edgeAgreement,
  loopConnectivity,
  ...dotConstraints,
];
