// Title: Castle Wall by Serkan Yurekli
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=cfn1gXSf7fg
// Source: https://tinyurl.com/uo2wdru

// Draw a single closed loop along grid edges, with no self-touch or
// crossing. Each cell is IN (enclosed by the loop) or OUT; the space beyond
// the grid's border is OUT. There are no sudoku digits: the grid carries
// only this IN/OUT side per cell, so it is built on a Raw shape.
// iss_solution is the 100-cell (10x10) IN/OUT grid, not a digit grid.
//
// Twelve cells carry a printed clue: a digit plus a direction, both baked
// into the payload's own compound value ("value_direction"; no separate
// arrow layer is drawn). Six of the twelve are shaded -- black, forced OUT
// of the loop. The other six carry no shading and no heavy border (the
// payload draws neither a second shading colour nor any border marks), so
// per the rules' own three-way black/white/grey split they are the
// remaining case, grey: free to be IN or OUT.
//
// Direction codes: each clue's drawn value is a "<count>_<direction>" pair
// with direction in {0,1,2,3}, one of the four codes per clue and each code
// naming a distinct compass direction (no two clues' codes can name the
// same direction). A target can only be read in a direction whose lane --
// clue cell to board edge -- has at least that many possible crossings
// (lane length minus one); checking every clue's target against all four of
// its own lane lengths and intersecting per code (four clues share code 1,
// four share code 2, two share code 3, two share code 0) leaves code 1 with
// only "left" surviving every one of its four clues (R7C9's target 5 alone
// rules out its right/down lanes, which only hold 1/3 crossings) and forces
// code 3 to "down" by elimination (the only direction left that no other
// code can take, since R2C2's target 4 rules "up"/"left" out of code 3 and
// rules code 0/2 off "down" entirely). That leaves codes 0 and 2 sharing
// {up, right}: the border-clue variant of this same Castle Wall genre --
// Ken Endo's puzzle, https://www.youtube.com/watch?v=lA1_IXku-ts -- reads a
// column-1 clue as "right along the row", which is this payload's code 2,
// fixing code 0 as "up". Direction codes: 0=up, 1=left, 2=right, 3=down.
//
// Each clue counts border crossings starting at its own cell and scanning
// in its own direction to the far edge of the grid (clue cell included as
// the first lane cell). A "border crossed" is a boundary between two
// orthogonally adjacent, same-lane cells whose IN/OUT sides differ -- that
// boundary is exactly where the loop runs.

const IN = 1;
const OUT = 2;
// CONCAVE (below) is a third code the 100 grid cells never take; corner
// cells need it, so the shape is widened to 3 values and every grid cell is
// restricted back to {IN, OUT}.

const shape = new Shape('10x10', 3, 'Raw');
const graph = cellGraph(shape);
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();

const sideDomain = graph.makeReplicate(new Given(gridCells[0], IN, OUT));

// Clue table, transcribed from the drawn digits and shading. `black` clues
// are the shaded six; the other six are unshaded.
const clues = [
  { cell: 'R2C2', target: 4, dir: 'down', black: true },
  { cell: 'R2C8', target: 2, dir: 'left', black: false },
  { cell: 'R3C5', target: 2, dir: 'left', black: true },
  { cell: 'R4C7', target: 1, dir: 'right', black: false },
  { cell: 'R5C3', target: 0, dir: 'left', black: true },
  { cell: 'R5C9', target: 1, dir: 'up', black: false },
  { cell: 'R6C4', target: 1, dir: 'right', black: true },
  { cell: 'R6C7', target: 1, dir: 'down', black: false },
  { cell: 'R7C9', target: 5, dir: 'left', black: false },
  { cell: 'R8C2', target: 3, dir: 'right', black: true },
  { cell: 'R9C5', target: 2, dir: 'up', black: true },
  { cell: 'R9C8', target: 1, dir: 'right', black: false },
];

const blackGivens = clues.filter(c => c.black)
  .map(c => new Given(c.cell, OUT));

// --- Single loop: connected IN region, no hole, no self-touch --------------
// Standard corner-classification trick: a lattice corner is convex/plain/
// concave by how many of its (up to 4) cells are IN -- treating an off-grid
// cell as OUT -- and forbidding the diagonal 2-2 split at a true 2x2 corner
// rules out the loop crossing/touching itself. With the IN region connected,
// (convex - concave) = 4 forces exactly one hole-free loop; that sum is
// realised as 2*(corner count) - 4 over corner codes 1/2/3 -- see the Sum
// below.
const CONVEX = 1, PLAIN = 2, CONCAVE = 3;
const corner = cellGraph('11x11').makeOverlay('VC');
const cornerAt = (row, col) => corner.cells()[row * 11 + col];

const cornerClass = inCount => (inCount === 1 ? CONVEX : inCount === 3 ? CONCAVE : PLAIN);

const cornerMachine = (arity, checkDiagonal) => NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    if (state.i === -1) return undefined;
    if (state.i === 0) return { i: 1, code: value, seen: [] };
    const seen = [...state.seen, value === IN];
    if (seen.length < arity) return { i: state.i + 1, code: state.code, seen };
    if (checkDiagonal) {
      const [topLeft, topRight, bottomLeft, bottomRight] = seen;
      if ((topLeft && bottomRight && !topRight && !bottomLeft)
        || (topRight && bottomLeft && !topLeft && !bottomRight)) return undefined;
    }
    return state.code === cornerClass(seen.filter(Boolean).length)
      ? { i: -1 } : undefined;
  },
  accept: ({ i }) => i === -1,
}, numValues);
const cornerMachines = new Map([2, 4].map(
  arity => [arity, cornerMachine(arity, arity === 4)]));
const gridCornerKey = Pair.fnToKey(
  (code, sv) => code === cornerClass(sv === IN ? 1 : 0), numValues);

const cornerCells = [];
const cornerCodes = [];
for (let row = 0; row <= 10; row++) {
  for (let col = 0; col <= 10; col++) {
    const around = [[row, col], [row, col + 1], [row + 1, col], [row + 1, col + 1]]
      .filter(([r, c]) => r >= 1 && r <= 10 && c >= 1 && c <= 10)
      .map(([r, c]) => makeCellId(r, c));
    cornerCells.push(cornerAt(row, col));
    cornerCodes.push(around.length === 1
      ? new Pair(gridCornerKey, 'corner', cornerAt(row, col), around[0])
      : new NFA(cornerMachines.get(around.length), 'corner',
        cornerAt(row, col), ...around));
  }
}

const singleLoop = [
  new ConnectedValues('', IN),
  new Sum(2 * cornerCells.length - 4, ...cornerCells),
];

// --- Border-crossing count clues: reads a lane starting at the clue's own
// cell and running to the far edge in its own direction, counting a
// crossing each time two consecutively-read cells differ. The target is
// baked into the machine per clue, clamped at target+1 so the state stays
// bounded.
const makeCrossingMachine = target => NFA.encodeSpec({
  startState: { started: false, prev: null, count: 0 },
  transition: ({ started, prev, count }, value) => {
    if (!started) return { started: true, prev: value, count: 0 };
    const hit = value !== prev ? 1 : 0;
    return { started: true, prev: value, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ started, count }) => started && count === target,
}, numValues);

// Builds the ordered lane of cell ids from a clue's own cell to the far
// edge of the grid in its direction, clue cell first.
const laneFrom = (cell, dir) => {
  const { row, col } = parseCellId(cell);
  const lane = [];
  if (dir === 'up') for (let r = row; r >= 1; r--) lane.push(makeCellId(r, col));
  else if (dir === 'down') for (let r = row; r <= 10; r++) lane.push(makeCellId(r, col));
  else if (dir === 'left') for (let c = col; c >= 1; c--) lane.push(makeCellId(row, c));
  else if (dir === 'right') for (let c = col; c <= 10; c++) lane.push(makeCellId(row, c));
  return lane;
};

const crossingCounts = clues.map(c =>
  new NFA(makeCrossingMachine(c.target), 'border crossing count', ...laneFrom(c.cell, c.dir)));

return [
  shape,
  sideDomain,
  ...blackGivens,
  corner.toVar('loop corner type'),
  corner.makeReplicate(new Given(cornerCells[0], CONVEX, PLAIN, CONCAVE)),
  ...cornerCodes,
  ...singleLoop,
  ...crossingCounts,
];
