// Title: Castle Wall
// Author: Murat Can Tonta
// Video: https://www.youtube.com/watch?v=cfn1gXSf7fg
// Source: https://tinyurl.com/qlwrvlx

// Rules: draw a single closed loop, without intersections or crossings,
// through the centres of some empty cells (orthogonal steps). Black cells
// are not on the loop and lie outside it; white bordered cells are not on
// the loop and lie inside it. A number with an arrow counts the loop
// segments in the clue's own row or column on the arrowed side of the clue,
// i.e. the cell borders in that ray the loop passes through.
// Every rule is encoded; nothing is omitted.
//
// Model. A loop through cell centres that never reuses a cell is exactly the
// boundary of a subset of the 12x12 "dual" cells -- the interior lattice
// corners of the 13x13 grid -- provided no primal cell has the IN dual cells
// on one diagonal and OUT on the other (that would be the loop crossing
// itself there). The dual layer is padded to 14x14 with a ring fixed OUT so
// every grid cell sees four dual cells. Each grid cell holds a loop code
// determined by its four surrounding dual cells: empty-outside (all four
// OUT), empty-inside (all four IN), a straight through the cell (the two
// IN cells side by side), or a turn (one dual cell differs from the other
// three; the turn wraps around that corner). Requiring the IN cells to be
// connected and the OUT cells (ring included) to be connected leaves one
// hole-free region, whose boundary is a single loop.
//
// iss_solution is the 13x13 grid of loop codes.

const OUTSIDE = 1;  // empty cell outside the loop
const INSIDE = 2;   // empty cell inside the loop
const NS = 3;       // loop runs straight through, vertically
const EW = 4;       // loop runs straight through, horizontally
const NE = 5;       // loop turns, arms to the north and east
const NW = 6;
const SE = 7;
const SW = 8;

const SIZE = 13;
const shape = new Shape(`${SIZE}x${SIZE}`, 8, 'Raw');
const graph = cellGraph(shape);
const numValues = graph.gridGeometry().numValues;

// Dual cells: 14x14, index (r, c) with r, c in 0..13; the ring (r or c in
// {0, 13}) is outside the grid and pinned OUT. Grid cell RrCc is surrounded
// by dual cells (r-1, c-1), (r-1, c), (r, c-1), (r, c).
const D_OUT = 1;
const D_IN = 2;
const DUAL = SIZE + 1;
const dual = cellGraph(`${DUAL}x${DUAL}`).makeOverlay('VD');
const dualAt = (r, c) => dual.cells()[r * DUAL + c];
const isRing = (r, c) => r === 0 || r === SIZE || c === 0 || c === SIZE;
const ringCells = [];
const innerCells = [];
for (let r = 0; r <= SIZE; r++) {
  for (let c = 0; c <= SIZE; c++) {
    (isRing(r, c) ? ringCells : innerCells).push(dualAt(r, c));
  }
}
const dualDomain = [
  dual.makeReplicate(new Given(ringCells[0], D_OUT), ringCells),
  dual.makeReplicate(new Given(innerCells[0], D_OUT, D_IN), innerCells),
];

// The loop code a cell must hold given whether its four surrounding dual
// cells (nw, ne, sw, se) are IN; null for the forbidden diagonal split.
const codeFor = (nw, ne, sw, se) => {
  const flags = [nw, ne, sw, se];
  const inCount = flags.filter(Boolean).length;
  if (inCount === 0) return OUTSIDE;
  if (inCount === 4) return INSIDE;
  if (inCount === 2) {
    if (nw === ne) return EW;  // top pair vs bottom pair
    if (nw === sw) return NS;  // left pair vs right pair
    return null;               // diagonal pair: loop would cross itself
  }
  const odd = flags.indexOf(inCount === 1);  // the corner the loop wraps
  return [NW, NE, SW, SE][odd];
};

// Reads [code, nw, ne, sw, se] and accepts iff code === codeFor(flags).
const cellMachine = NFA.encodeSpec({
  startState: { phase: 'code', code: 0, flags: [] },
  transition: ({ phase, code, flags }, value) => {
    if (phase === 'code') return { phase: 'flags', code: value, flags: [] };
    if (phase !== 'flags') return undefined;
    if (value !== D_IN && value !== D_OUT) return undefined;
    const next = [...flags, value === D_IN];
    if (next.length < 4) return { phase, code, flags: next };
    return codeFor(...next) === code ? { phase: 'done', code: 0, flags: [] } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);

const cellCodes = graph.cells().map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(cellMachine, 'loop code', cell,
    dualAt(row - 1, col - 1), dualAt(row - 1, col),
    dualAt(row, col - 1), dualAt(row, col));
});

const singleLoop = [
  new ConnectedValues('VD', D_IN),
  new ConnectedValues('VD', D_OUT),
];

// Clue table, transcribed from the drawn cells: fill (black/white), number
// and arrow. Every clue cell carries a number.
const clues = [
  { row: 2, col: 2, black: false, target: 1, dir: 'down' },
  { row: 2, col: 10, black: false, target: 3, dir: 'down' },
  { row: 2, col: 11, black: false, target: 6, dir: 'down' },
  { row: 3, col: 3, black: false, target: 4, dir: 'right' },
  { row: 4, col: 8, black: true, target: 5, dir: 'left' },
  { row: 4, col: 9, black: true, target: 7, dir: 'down' },
  { row: 6, col: 1, black: true, target: 7, dir: 'right' },
  { row: 7, col: 6, black: true, target: 2, dir: 'up' },
  { row: 8, col: 3, black: false, target: 3, dir: 'down' },
  { row: 8, col: 4, black: false, target: 5, dir: 'up' },
  { row: 9, col: 4, black: false, target: 7, dir: 'right' },
  { row: 11, col: 6, black: false, target: 3, dir: 'left' },
  { row: 12, col: 7, black: false, target: 0, dir: 'left' },
  { row: 12, col: 12, black: false, target: 6, dir: 'up' },
].map(c => ({ ...c, cell: makeCellId(c.row, c.col) }));

const clueCells = clues.map(c => new Given(c.cell, c.black ? OUTSIDE : INSIDE));

// A segment between two consecutive ray cells is the arm of the nearer one
// pointing along the ray, so a clue counts, over the cells beyond it in its
// direction, the codes carrying that arm.
const DIRECTIONS = {
  up: { dR: -1, dC: 0, arms: [NS, NE, NW] },
  down: { dR: 1, dC: 0, arms: [NS, SE, SW] },
  left: { dR: 0, dC: -1, arms: [EW, NW, SW] },
  right: { dR: 0, dC: 1, arms: [EW, NE, SE] },
};

// Counts ray cells whose code is in `arms`; the count saturates at
// target + 1, a sink meaning "already too many".
const segmentCounter = (target, arms) => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => ({
    count: Math.min(count + (arms.includes(value) ? 1 : 0), target + 1),
  }),
  accept: ({ count }) => count === target,
}, numValues);

const segmentCounts = clues.map(c => {
  const { dR, dC, arms } = DIRECTIONS[c.dir];
  const ray = graph.ray(c.cell, dR, dC).slice(1);  // beyond the clue cell
  return new NFA(segmentCounter(c.target, arms), 'segment count', ...ray);
});

return [
  shape,
  dual.toVar('loop side'),
  ...dualDomain,
  ...cellCodes,
  ...singleLoop,
  ...clueCells,
  ...segmentCounts,
];
