// Title: Heat Stroke
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=zccFAC8kfTY
// Source: https://sudokupad.app/bnq909vwgm

// Rules: Fill the grid with the numbers 1-7 such that no number repeats in a
// row or column. The grid is completely covered by thermometer lines. You
// cannot see them because they are invisible. Nevertheless, numbers increase
// along thermometers starting from their bulb end. Thermometer lines move
// orthogonally and diagonally, and do not cross themselves or other
// thermometers, except at the white diamonds, where they must cross
// themselves or another thermometer. Thermometer lines do not pass through
// Xs. Thermometer bulbs do not touch each other, even diagonally. All
// thermometers have the same length.
//
// Arithmetic forced by the rules text plus the grid size: digits 1-7
// strictly increasing caps a thermometer at 7 cells; 49 cells split evenly
// among equal-length thermometers only at length 1, 7 or 49, and length 1
// is excluded by the bulb-adjacency rule (49 mutually non-touching cells do
// not fit a 7x7 board). So every thermometer is exactly 7 cells long and
// reads 1,2,3,4,5,6,7 from bulb to tip: a cell's own digit already IS its
// position along its thermometer, a bulb is exactly a 1 and a tip is
// exactly a 7, and no separate "same length" bookkeeping or cycle-exclusion
// device is needed -- a strictly increasing chain bounded at 7 cannot close
// a loop.
//
// Model. Two overlays hold the invisible network: each cell's PRED and SUCC
// name the direction (of eight: N,S,E,W,NE,NW,SE,SW, coded 1-8; 0 = none) to
// its predecessor/successor along its thermometer. A cell is a bulb (PRED=0)
// iff its digit is 1, and a tip (SUCC=0) iff its digit is 7; every other
// cell has both, pointing at a neighbour one digit lower/higher. Per-cell
// domains already exclude the eight blocked steps the X marks draw: four
// ordinary edges, plus two lattice points where the drawn mark blocks both
// diagonal steps that cross that point (a corner-anchored X, read the same
// way as the edge ones -- a thermometer does not pass through it).

const DIMS = '7x7';
const shape = new Shape(DIMS, '0-8');
const graph = cellGraph(shape);
const cells = graph.cells();
const [NUM_ROWS, NUM_COLS] = DIMS.split('x').map(Number);

// The real Sudoku digits are 1-7; 0 and 8 exist only as PRED/SUCC direction
// codes (0 = none, 8 = SW) and never appear on the board itself.
const digitGivens = cells.map(cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7));

// --------------------------------------------------------------- directions
// idx 1-8; `back` is the direction a neighbour uses to point at this cell.
const DIRS = [
  { idx: 1, back: 2, dRow: -1, dCol: 0 },  // N
  { idx: 2, back: 1, dRow: 1, dCol: 0 },   // S
  { idx: 3, back: 4, dRow: 0, dCol: 1 },   // E
  { idx: 4, back: 3, dRow: 0, dCol: -1 },  // W
  { idx: 5, back: 8, dRow: -1, dCol: 1 },  // NE
  { idx: 6, back: 7, dRow: -1, dCol: -1 }, // NW
  { idx: 7, back: 6, dRow: 1, dCol: 1 },   // SE
  { idx: 8, back: 5, dRow: 1, dCol: -1 },  // SW
];
const DIR_BY_IDX = new Map(DIRS.map(d => [d.idx, d]));
// Each undirected pair counted once: canonical direction is S/E/SE/SW.
const isCanonical = dir => dir.dRow > 0 || (dir.dRow === 0 && dir.dCol > 0);

// Steps the eight X marks remove: four ordinary cell edges, plus two
// lattice-point marks each read as blocking both diagonals that cross that
// point (see the header for the reading).
const BLOCKED_ORTHOGONAL_EDGES = [
  // vertical, column 1
  ['R5C1', 'R6C1'], ['R6C1', 'R7C1'],
  // horizontal, rows 6-7
  ['R6C1', 'R6C2'], ['R7C1', 'R7C2'],
];
const BLOCKED_DIAGONAL_CORNERS = [
  // corner(R1C1,R1C2,R2C1,R2C2): both diagonals
  ['R1C1', 'R2C2'], ['R1C2', 'R2C1'],
  // corner(R1C2,R1C3,R2C2,R2C3): both diagonals
  ['R1C2', 'R2C3'], ['R1C3', 'R2C2'],
];

const dirBetween = (fromCell, toCell) => {
  const a = parseCellId(fromCell), b = parseCellId(toCell);
  return DIRS.find(d => a.row + d.dRow === b.row && a.col + d.dCol === b.col);
};

const blockedDirs = new Map(cells.map(cell => [cell, new Set()]));
for (const [a, b] of [...BLOCKED_ORTHOGONAL_EDGES, ...BLOCKED_DIAGONAL_CORNERS]) {
  blockedDirs.get(a).add(dirBetween(a, b).idx);
  blockedDirs.get(b).add(dirBetween(b, a).idx);
}

// Direction indices actually usable from each cell: on the grid, and not
// blocked by an X. 0 (no predecessor / no successor) is always allowed; the
// head/tail anchors below pin exactly when it applies.
const allowedDirs = new Map(cells.map(cell => {
  const blocked = blockedDirs.get(cell);
  const usable = DIRS
    .filter(d => graph.step(cell, d.dRow, d.dCol) && !blocked.has(d.idx))
    .map(d => d.idx);
  return [cell, usable];
}));

// ------------------------------------------------------------ link overlays
const pred = graph.makeOverlay('VP');
const succ = graph.makeOverlay('VQ');
const predVar = pred.toVar('predecessor direction (0 = bulb)');
const succVar = succ.toVar('successor direction (0 = tip)');

const linkDomains = cells.flatMap(cell => {
  const usable = allowedDirs.get(cell);
  return [
    new Given(pred.at(cell), 0, ...usable),
    new Given(succ.at(cell), 0, ...usable),
  ];
});

// ------------------------------------------------------------- head/tail
// A cell's digit already is its position along its thermometer (see the
// header), so the bulb/tip anchor is a direct digit check.
const headTailKey = Pair.fnToKey((digit, dir) => (digit === 1) === (dir === 0), shape);
const tipKey = Pair.fnToKey((digit, dir) => (digit === 7) === (dir === 0), shape);
const headTailRules = cells.flatMap(cell => [
  new Pair(headTailKey, 'bulb (digit 1) has no predecessor, every other cell does', cell, pred.at(cell)),
  new Pair(tipKey, 'tip (digit 7) has no successor, every other cell does', cell, succ.at(cell)),
]);

// -------------------------------------------------------- directed steps
// For every cell X and usable direction d to an on-grid neighbour Y (back
// direction d'): X's successor names Y iff Y's predecessor names X back
// (linkAgree), and when it does, Y's digit is exactly one more than X's
// (digitStep). Looping over every (X, d) pair covers both orientations of
// every edge; combined with the head/tail anchors above, this is what pins
// each cell to at most one predecessor and at most one successor, since
// PRED(Y) can name only one direction, so every other neighbour of Y is
// forced away from it by its own linkAgree check.
const linkAgreeKeys = new Map();
const linkAgreeKey = (d, dBack) => {
  const k = `${d}_${dBack}`;
  if (!linkAgreeKeys.has(k)) {
    linkAgreeKeys.set(k, Pair.fnToKey((s, p) => (s === d) === (p === dBack), shape));
  }
  return linkAgreeKeys.get(k);
};

const digitStepSpecs = new Map();
const digitStepSpec = d => {
  if (!digitStepSpecs.has(d)) {
    digitStepSpecs.set(d, NFA.encodeSpec({
      startState: { i: 0 },
      transition: (s, v) => {
        switch (s.i) {
          case 0: return { i: 1, linked: v === d };
          case 1: return { i: 2, linked: s.linked, dx: v };
          case 2: return (!s.linked || v === s.dx + 1) ? { i: 3 } : undefined;
          default: return undefined;
        }
      },
      accept: s => s.i === 3,
    }, shape));
  }
  return digitStepSpecs.get(d);
};

const directedStepRules = cells.flatMap(cell => allowedDirs.get(cell).flatMap(d => {
  const dir = DIR_BY_IDX.get(d);
  const other = graph.step(cell, dir.dRow, dir.dCol);
  return [
    new Pair(linkAgreeKey(d, dir.back), 'successor here iff predecessor there',
      succ.at(cell), pred.at(other)),
    new NFA(digitStepSpec(d), 'linked cells are consecutive digits',
      succ.at(cell), cell, other),
  ];
}));

// ------------------------------------------------------------- bulb no-touch
// Bulbs (digit 1) may not be king-move adjacent, independent of which steps
// are blocked -- this is about cell geometry, not thermometer passage.
const bulbNoTouchKey = Pair.fnToKey((a, b) => !(a === 1 && b === 1), shape);
const bulbNoTouchRules = cells.flatMap(cell => DIRS
  .filter(isCanonical)
  .flatMap(dir => {
    const other = graph.step(cell, dir.dRow, dir.dCol);
    return other ? [new Pair(bulbNoTouchKey, 'bulbs do not touch, even diagonally', cell, other)] : [];
  }));

// ---------------------------------------------------------------- crossing
// One 2x2 block's diagonals are R,C / R,C+1 / R+1,C / R+1,C+1. "Uses" a
// diagonal means either endpoint's successor points along it (the linkAgree
// rules above already tie the two endpoints together, so checking one
// direction from each suffices). Diamond blocks require both diagonals in
// use; every other block forbids both at once (a single diagonal, or
// neither, is fine).
const DIAMOND_BLOCKS = new Set(['4_2', '2_5', '6_6', '6_3']);

const crossingSpecs = new Map();
const crossingSpec = mustCross => {
  if (!crossingSpecs.has(mustCross)) {
    // Reads [succ(TL), succ(TR), succ(BL), succ(BR)].
    // Diagonal 1 (TL-BR) is direction SE (7) from TL, or NW (6) from BR.
    // Diagonal 2 (TR-BL) is direction SW (8) from TR, or NE (5) from BL.
    crossingSpecs.set(mustCross, NFA.encodeSpec({
      startState: { i: 0 },
      transition: (s, v) => {
        switch (s.i) {
          case 0: return { i: 1, d1: v === 7 };
          case 1: return { i: 2, d1: s.d1, d2: v === 8 };
          case 2: return { i: 3, d1: s.d1, d2: s.d2 || v === 5 };
          case 3: {
            const diag1 = s.d1 || v === 6;
            const both = diag1 && s.d2;
            return (mustCross ? both : !both) ? { i: 4 } : undefined;
          }
          default: return undefined;
        }
      },
      accept: s => s.i === 4,
    }, shape));
  }
  return crossingSpecs.get(mustCross);
};

const crossingRules = [];
for (let r = 1; r < NUM_ROWS; r++) {
  for (let c = 1; c < NUM_COLS; c++) {
    const tl = makeCellId(r, c), tr = makeCellId(r, c + 1);
    const bl = makeCellId(r + 1, c), br = makeCellId(r + 1, c + 1);
    const mustCross = DIAMOND_BLOCKS.has(`${r}_${c}`);
    crossingRules.push(new NFA(
      crossingSpec(mustCross),
      mustCross ? 'diamond: both diagonals cross here' : 'no crossing diagonals here',
      succ.at(tl), succ.at(tr), succ.at(bl), succ.at(br)));
  }
}

return [
  shape,
  new NoBoxes(),
  predVar,
  succVar,
  ...digitGivens,
  ...linkDomains,
  ...headTailRules,
  ...directedStepRules,
  ...bulbNoTouchRules,
  ...crossingRules,
];
