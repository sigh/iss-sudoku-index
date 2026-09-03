// Title: Country Road
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=1wnnT6DJmrY
// Source: https://tinyurl.com/y58nj7b7

// Rules. Draw a closed loop that consists of horizontal and vertical lines
// between cells (from cell centre to cell centre), and that doesn't cross or
// touch itself. The loop visits each boldly outlined area exactly once. Clues
// indicate how many cells within an area are used by the loop. Non-loop cells
// are not allowed to touch orthogonally if they are in different areas.
// Nothing is omitted.
//
// The puzzle holds no digits, so the board is a Raw 10x10 grid (no rows,
// columns or boxes) whose values are *directed* shape codes: either OFF, or the
// side the loop enters a cell from paired with the side it leaves by. A code
// therefore uses exactly two of a cell's four edges and can neither branch nor
// pass through a cell twice, which is what "doesn't cross or touch itself"
// forbids for a line drawn centre to centre: the only place such a line can
// meet itself is a cell it uses twice. Two loop cells that are side by side
// without being consecutive are a cell width apart and never touch, so they
// stay legal.
//
// Edge-agreement Pairs orient each used edge the same way from both ends, so
// every on-loop cell has in-degree and out-degree one and the used edges form a
// disjoint union of directed cycles. Two position counters, modulo the coprime
// MOD_A and MOD_B, cut that down to the single closed loop the rules ask for.
// The alphabet is widened to hold the codes and the counters.

const NV = 13;
const MOD_A = 10, MOD_B = 11;  // coprime; lcm 110 > the 100 cells a cycle could occupy
const OFF = 1;                 // shape code, and counter value, of a cell the loop misses
const POS0 = 2;                // counter value of the seam cell (position 0)
const SIZE = 10;

const SIDES = ['U', 'D', 'L', 'R'];
const STEP = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
const OPPOSITE = { U: 'D', D: 'U', L: 'R', R: 'L' };

// Shape codes: OFF, then one code per ordered (entry side, exit side) pair.
const CODES = [null, null];
for (const entry of SIDES) {
  for (const exit of SIDES) {
    if (entry !== exit) CODES.push({ entry, exit });
  }
}
const ALL_CODES = CODES.map((_, code) => code).slice(OFF);
const codeFor = (entry, exit) =>
  CODES.findIndex(c => c !== null && c.entry === entry && c.exit === exit);

const isOnLoop = code => code !== OFF;
const entersFrom = (code, side) => isOnLoop(code) && CODES[code].entry === side;
const exitsTo = (code, side) => isOnLoop(code) && CODES[code].exit === side;
const usesSide = (code, side) => entersFrom(code, side) || exitsTo(code, side);

const shape = new Shape('10x10', NV, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// The drawn board: bold area borders and the four area clues, transcribed from
// the puzzle art. Line 2*r of the picture carries the horizontal borders above
// row r+1, line 2*r+1 carries row r+1's vertical borders and clue digits, and
// column c occupies characters 4*(c-1) to 4*c.
const ART = [
  '+---+---+---+---+---+---+---+---+---+---+',
  '|   |           |       |   |           |',
  '+   +   +---+---+---+---+---+---+---+   +',
  '|   |   | 2     | 5     |   |       |   |',
  '+   +---+   +   +   +   +   +   +---+   +',
  '|       |       |       |   |   |       |',
  '+---+---+---+---+---+   +---+   +---+---+',
  '|                   |   |   |       |   |',
  '+---+---+---+   +---+   +   +---+---+   +',
  '|           |   |       |       |       |',
  '+---+---+---+---+---+---+   +---+---+   +',
  '|           | 3     |       |       |   |',
  '+   +---+   +   +   +---+---+   +---+   +',
  '|   |   |   |           |       |       |',
  '+---+---+---+---+---+---+---+---+---+---+',
  '|           |           | 1     |       |',
  '+---+   +---+   +   +   +   +---+   +---+',
  '|   |   |   |           |   |       |   |',
  '+   +---+   +   +---+---+---+---+---+   +',
  '|           |   |       |               |',
  '+---+---+---+---+---+---+---+---+---+---+',
];
const hasBorderAbove = (row, col) => ART[2 * (row - 1)][4 * (col - 1) + 1] === '-';
const hasBorderLeft = (row, col) => ART[2 * row - 1][4 * (col - 1)] === '|';
const clueAt = (row, col) => ART[2 * row - 1][4 * (col - 1) + 2];

// Every bold border between two in-grid cells, as the [cellA, cellB] pair it
// separates. The outer frame is not a border between two cells.
const borderPairs = [];
for (let row = 1; row <= SIZE; row++) {
  for (let col = 1; col <= SIZE; col++) {
    if (row > 1 && hasBorderAbove(row, col)) {
      borderPairs.push([makeCellId(row - 1, col), makeCellId(row, col)]);
    }
    if (col > 1 && hasBorderLeft(row, col)) {
      borderPairs.push([makeCellId(row, col - 1), makeCellId(row, col)]);
    }
  }
}

// The areas are the connected components left when the bold borders are cut.
const borderKeys = new Set(
  borderPairs.flatMap(([a, b]) => [a + ':' + b, b + ':' + a]));
const areaIndex = new Map();
const areas = [];
for (const start of gridCells) {
  if (areaIndex.has(start)) continue;
  const area = [];
  const queue = [start];
  areaIndex.set(start, areas.length);
  while (queue.length) {
    const cell = queue.pop();
    area.push(cell);
    for (const neighbour of graph.neighbours(cell)) {
      if (areaIndex.has(neighbour)) continue;
      if (borderKeys.has(cell + ':' + neighbour)) continue;
      areaIndex.set(neighbour, areas.length);
      queue.push(neighbour);
    }
  }
  areas.push(area);
}

// Each area's own border edges, collected per cell as the sides that point out
// of the area, so an area's border can be scanned one cell at a time.
const sideBetween = (a, b) => SIDES.find(side => graph.step(a, ...STEP[side]) === b);
const areaBorderSides = areas.map(() => new Map());
const addBorderSide = (cell, side) => {
  const sides = areaBorderSides[areaIndex.get(cell)];
  if (!sides.has(cell)) sides.set(cell, []);
  sides.get(cell).push(side);
};
for (const [a, b] of borderPairs) {
  const side = sideBetween(a, b);
  addBorderSide(a, side);
  addBorderSide(b, OPPOSITE[side]);
}

// Each orthogonal edge once, as (a, b) with `side` the direction a -> b.
const edges = gridCells.flatMap(cell => ['D', 'R'].flatMap(side => {
  const other = graph.step(cell, ...STEP[side]);
  return other ? [{ a: cell, b: other, side }] : [];
}));

const cache = new Map();
const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

// --- The loop stays on the board: a code is available only where every side it
// uses leads to an in-grid cell. Cells away from the edge take every code.
const availableCodes = cell => ALL_CODES.filter(code => SIDES.every(
  side => !usesSide(code, side) || graph.step(cell, ...STEP[side]) !== null));
const codeDomains = gridCells
  .filter(cell => availableCodes(cell).length < ALL_CODES.length)
  .map(cell => new Given(cell, ...availableCodes(cell)));

// --- Edge agreement across the shared border of a cell and its neighbour on
// `side`: a's exit that way is b's entry back, and a's entry that way is b's
// exit back. Applied to every edge, this orients each used edge consistently.
const agreementKey = side => Pair.fnToKey(
  (codeA, codeB) => exitsTo(codeA, side) === entersFrom(codeB, OPPOSITE[side])
    && entersFrom(codeA, side) === exitsTo(codeB, OPPOSITE[side]),
  geometry);
const agreement = [
  graph.makeReplicate(
    new Pair(agreementKey('R'), 'edge-h', gridCells[0], graph.step(gridCells[0], 0, 1)),
    gridCells.filter(cell => graph.step(cell, 0, 1))),
  graph.makeReplicate(
    new Pair(agreementKey('D'), 'edge-v', gridCells[0], graph.step(gridCells[0], 1, 0)),
    gridCells.filter(cell => graph.step(cell, 1, 0))),
];

// --- One closed loop rather than several. R1C7 is an area all by itself, and
// the loop visits every area, so it is on the loop whatever the answer is: it
// serves as the seam. Both counters advance by one along every used edge except
// the one running into the seam, so a cycle that avoided the seam would have to
// close after a number of steps divisible by both moduli, i.e. by lcm(10, 11) =
// 110, while occupying at most 100 cells. Only the cycle through the seam can
// close. ISS has no single-loop primitive, and ConnectedValues cannot supply
// this: it sees only cell adjacency, and two loops running alongside each other
// are one connected set of cells while sharing no used edge.
const SEAM = 'R1C7';

// Counter values run POS0, POS0+1, ... POS0+mod-1 and wrap.
const nextPos = (value, mod) => POS0 + ((value - POS0 + 1) % mod);

// Reads a cell's shape code, then that cell's counter and its `side`
// neighbour's counter. If the loop leaves the first cell towards the second the
// second counter is one further on, and vice versa; an unused edge says
// nothing. `intoBSeam` / `intoASeam` mark the edge whose target is the seam,
// which is the one edge exempted so that the loop through the seam can close.
const counterSpec = (side, mod, intoBSeam, intoASeam) => cached(
  ['cnt', side, mod, intoBSeam, intoASeam].join('|'), () => NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) return { k: 1, code: value };
      if (state.k === 1) return { k: 2, code: state.code, a: value };
      if (state.k !== 2) return undefined;
      const forward = exitsTo(state.code, side);
      const backward = entersFrom(state.code, side);
      if (!forward && !backward) return { done: true };
      if (state.a === OFF || value === OFF) return undefined;
      if (forward) {
        return intoBSeam || value === nextPos(state.a, mod)
          ? { done: true } : undefined;
      }
      return intoASeam || state.a === nextPos(value, mod)
        ? { done: true } : undefined;
    },
    accept: state => state.done === true,
  }, geometry));

const counters = edges.flatMap(({ a, b, side }) => [
  new NFA(counterSpec(side, MOD_A, b === SEAM, a === SEAM), 'loop-order',
    a, posA.at(a), posA.at(b)),
  new NFA(counterSpec(side, MOD_B, b === SEAM, a === SEAM), 'loop-order',
    a, posB.at(a), posB.at(b)),
]);

// A cell is numbered exactly when it is on the loop, so the counters carry no
// choice of their own on cells the loop misses.
const numberedKey = Pair.fnToKey(
  (code, pos) => isOnLoop(code) === (pos !== OFF), geometry);
const numbered = gridCells.flatMap(cell => [
  new Pair(numberedKey, 'loop-cell', cell, posA.at(cell)),
  new Pair(numberedKey, 'loop-cell', cell, posB.at(cell)),
]);

// The seam's two used sides can only be left, right and down, since it sits in
// the top row. Keeping the three codes whose entry side precedes their exit
// side in the fixed order (L, R, D) keeps exactly one of the two directions in
// which any given loop can be traversed; pinning the counters there fixes only
// where the numbering starts. Without both pins every loop would be returned
// once per direction and once per starting offset.
const seam = [
  new Given(SEAM, codeFor('L', 'R'), codeFor('L', 'D'), codeFor('R', 'D')),
  new Given(posA.at(SEAM), POS0),
  new Given(posB.at(SEAM), POS0),
];

// --- Non-loop cells in different areas may not touch orthogonally.
// One Replicate per border direction: the template is the relation between the
// grid's first cell and its neighbour that way, stamped onto the first cell of
// every border edge running the same way.
const gapKey = Pair.fnToKey(
  (codeA, codeB) => isOnLoop(codeA) || isOnLoop(codeB), geometry);
const areaGaps = [[0, 1], [1, 0]].map(([dRow, dCol]) => graph.makeReplicate(
  [new Pair(gapKey, 'area-gap', gridCells[0], graph.step(gridCells[0], dRow, dCol))],
  borderPairs
    .filter(([a, b]) => graph.step(a, dRow, dCol) === b)
    .map(([a]) => a)));

// --- The loop visits each area exactly once, i.e. it crosses that area's bold
// border exactly twice. One machine per area, reading the area's border cells
// in a fixed order and adding, at each, how many of that cell's outward border
// sides the loop uses.
const crossingsAt = (code, sides) => sides.filter(
  side => usesSide(code, side)).length;
const visitSpec = (sidesPerCell) => NFA.encodeSpec({
  startState: { i: 0, count: 0 },
  transition: ({ i, count }, code) => {
    // The compiler explores states past the end of the cell list; nothing there
    // is a border side, so those runs are rejected rather than read off it.
    if (i >= sidesPerCell.length) return undefined;
    const next = count + crossingsAt(code, sidesPerCell[i]);
    return next > 2 ? undefined : { i: i + 1, count: next };
  },
  accept: ({ i, count }) => i === sidesPerCell.length && count === 2,
}, geometry);
const visits = areaBorderSides.map(sides => {
  const cells = [...sides.keys()];
  const sidesPerCell = [...sides.values()];
  // An area whose border touches just two of its cells is a two-cell relation.
  if (cells.length !== 2) {
    return new NFA(visitSpec(sidesPerCell), 'area-visit', ...cells);
  }
  const key = Pair.fnToKey(
    (codeA, codeB) => crossingsAt(codeA, sidesPerCell[0])
      + crossingsAt(codeB, sidesPerCell[1]) === 2,
    geometry);
  return new Pair(key, 'area-visit', ...cells);
});

// --- A clue counts the loop cells within its area. Clue digits are drawn in
// the top-left cell of the area they belong to.
const clueSpec = (target) => cached('clue|' + target, () => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, code) => {
    const next = count + (isOnLoop(code) ? 1 : 0);
    return next > target ? undefined : { count: next };
  },
  accept: ({ count }) => count === target,
}, geometry));
const clues = [];
for (let row = 1; row <= SIZE; row++) {
  for (let col = 1; col <= SIZE; col++) {
    const digit = clueAt(row, col);
    if (digit === ' ') continue;
    const area = areas[areaIndex.get(makeCellId(row, col))];
    clues.push(new NFA(clueSpec(Number(digit)), 'area-count', ...area));
  }
}

const counterDomains = [
  posA.makeReplicate(new Given(posA.at(gridCells[0]),
    ...Array.from({ length: MOD_A + 1 }, (_, n) => n + 1))),
  posB.makeReplicate(new Given(posB.at(gridCells[0]),
    ...Array.from({ length: MOD_B + 1 }, (_, n) => n + 1))),
];

return [
  shape,
  posA.toVar('loop position mod ' + MOD_A),
  posB.toVar('loop position mod ' + MOD_B),
  ...counterDomains,
  ...codeDomains,
  ...seam,
  ...agreement,
  ...numbered,
  ...counters,
  ...areaGaps,
  ...visits,
  ...clues,
];
