// Title: Zodiac Project: Kyklos
// Author: Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=Z5UtK2VKuWg
// Source: https://sudokupad.app/yvxj355qfi
//
// Yajilin-style loop-and-shade puzzle on an 11x11 canvas: no Sudoku rows,
// columns or boxes at all. Every cell is one of three kinds: nine fixed
// "clue" cells, "shaded" cells (which may touch each other, unlike ordinary
// Yajilin), and "loop" cells. The solver places the digits 0-8 once each in
// the clue cells, decides which non-clue cells are shaded (two are given),
// and draws one non-branching, non-crossing loop through every remaining
// cell. Clue cells can never be shaded.
//
// The rules state their own answer-check convention: every shaded cell holds
// 0 and every loop cell holds 9. That convention doubles as this script's
// main grid, so a Raw 0-9 board with each non-clue cell restricted to {0, 9}
// already encodes "loop cells are everywhere that isn't shaded or a clue".
//
// Each clue cell's own digit must equal two independent counts of shaded (0)
// cells: among its up-to-eight king neighbours, and summed across every one
// of its drawn arrow rays (each running to the board edge, "not obstructed by
// any other cell-types" per the rules). A neighbour or ray cell that is
// itself one of the nine clue cells is excluded from both counts, since a
// clue cell's own digit (0-8, a count) is never a shading state.
//
// The rules say only "may not branch or cross itself", not "touch itself":
// two loop cells may be orthogonally adjacent without the drawn line actually
// joining them there (confirmed against the stored solution -- many loop
// cells have 3-4 orthogonal loop-valued neighbours), so a raw degree-2-by-
// cell-adjacency model (as in nordschleife.js) is unsound here and rejects
// the real answer. A route that may touch itself instead needs a shape code
// per cell (which of its four edges the loop actually uses -- off, straight,
// or one of four turns) plus edge-agreement between neighbours, exactly as
// wendezaune.js encodes for the same "may run alongside itself" loop family.
// Degree, no-branch and no-crossing then all come from each cell's own code
// (never more than two used edges), so touching is legal, and each non-clue
// cell's shape is linked back to its main-grid digit (off iff shaded).
//
// As in wendezaune.js, ConnectedValues over the loop-valued cells is kept as
// a sound but incomplete check: proving the loop is a single cycle (rather
// than several disjoint touching-or-separate cycles that together still
// cover every loop cell) needs connectivity over the used-edge graph, which
// ISS has no primitive for; this omission is declared in the result.

const SHADE = 0;
const LOOP = 9;

const shape = new Shape('11x11', '0-9', 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();

// Clue-cell positions -- underlay fill #c7885c (peru/brown), one per digit 0-8
// -- each with its drawn arrow directions as (dRow, dCol) steps, read from the
// payload's arrow waypoints; graph.ray walks each one to the board edge.
// Row/col given numerically (not as literal R#C# strings) since column 10
// (R4C10) is not valid ISS cell-id syntax -- makeCellId encodes it correctly.
const clueSpecs = [
  { pos: [2, 9], rays: [[1, -1]] },                          // R2C9: down-left
  { pos: [4, 10], rays: [[-1, -1], [-1, 1]] },                // R4C10: up-left, up-right
  { pos: [5, 8], rays: [[-1, -1], [1, -1]] },                 // R5C8: up-left, down-left
  { pos: [8, 6], rays: [[1, 1], [0, 1]] },                    // R8C6: down-right, right
  { pos: [5, 2], rays: [[-1, 1], [1, 1]] },                   // R5C2: up-right, down-right
  { pos: [3, 4], rays: [[-1, -1], [-1, 1]] },                 // R3C4: up-left, up-right
  { pos: [7, 7], rays: [[0, -1], [0, 1], [1, 0], [1, 1]] },   // R7C7: left, right, down, down-right
  { pos: [10, 5], rays: [[0, 1], [1, 0]] },                   // R10C5: right, down
  { pos: [9, 3], rays: [[-1, 1]] },                           // R9C3: up-right
];
const clues = clueSpecs.map(c => makeCellId(...c.pos));
const clueSet = new Set(clues);
const clueRayDirections = new Map(clueSpecs.map((c, i) => [clues[i], c.rays]));

// The two given shaded cells -- underlay fill #666f (grey).
const givenShaded = [[5, 4], [9, 11]].map(pos => makeCellId(...pos));
const givenShadedSet = new Set(givenShaded);

// --- Domains. The 112 non-clue cells all share one {SHADE, LOOP} value set,
// so it is stamped via Replicate (a shared domain over a group); the two
// given-shaded cells (already inside that group) then narrow further to just
// SHADE with their own Given, which intersects with the wider stamp. The nine
// clue cells are individually Given their own 0-8 range -- too few to be a
// stamped-copy group, and NOT wrapped in a Replicate of their own, since a
// Replicate's domain is cross-checked against every other narrower Given in
// its cell group: the SHADE givens' value {0} is coincidentally a subset of
// the clue digit range 0-8 (0 is a valid clue count), which would otherwise
// read as a bogus "narrower Given the stamp skips" even though shaded cells
// and clue cells are disjoint, unrelated groups.
const nonClueCells = graph.cells().filter(cell => !clueSet.has(cell));
const domains = [
  new Replicate(
    [new Given(nonClueCells[0], SHADE, LOOP)],
    Replicate.encodeTargetCells(nonClueCells, nonClueCells[0], graph),
    nonClueCells[0]),
  ...clues.map(cell => new Given(cell, 0, 1, 2, 3, 4, 5, 6, 7, 8)),
  ...givenShaded.map(cell => new Given(cell, SHADE)),
];

// --- Clue digits: 0-8 once each ("Disjoint clues").
const clueAllDifferent = new AllDifferent(...clues);

// --- Loop closure (sound but partial -- see the header note above).
const loopConnected = new ConnectedValues('', LOOP);

// Shape codes for the loop layer: which of a cell's four edges the loop uses.
// OFF cells are clue or shaded cells; the six others are on-loop. Matches
// wendezaune.js's own shape-code family.
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];

const shapeVar = graph.makeOverlay('VS');

// --- Shape domains: stamp the full 7-shape
// range over the whole shapeVar group via Replicate, then let narrower
// per-cell Givens intersect it -- OFF for clue and given-shaded cells, and a
// board-edge-restricted list for the cells on the grid's own border (a shape
// can't use an edge that would point off the grid). Every narrower value set
// here is a subset of the stamped range, so the intersection just narrows.
const allShapeCells = shapeVar.at(graph.cells());
const shapeDomains = [
  new Replicate(
    [new Given(allShapeCells[0], ...ALL_SHAPES)],
    Replicate.encodeTargetCells(allShapeCells, allShapeCells[0], shapeVar),
    allShapeCells[0]),
  ...clues.map(cell => new Given(shapeVar.at(cell), OFF)),
  ...givenShaded.map(cell => new Given(shapeVar.at(cell), OFF)),
  ...graph.cells()
    .filter(cell => {
      const { row, col } = parseCellId(cell);
      return row === 1 || row === geometry.numRows || col === 1 || col === geometry.numCols;
    })
    .map(cell => {
      const { row, col } = parseCellId(cell);
      const allowed = ALL_SHAPES.filter(s =>
        !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
        !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
      return new Given(shapeVar.at(cell), ...allowed);
    }),
];

// --- Edge agreement: neighbours must agree on the shared edge (the cell on
// one side uses it towards the other iff that other uses it back). A 2-cell
// relation is a Pair, not an NFA. Every right-neighbour pair shares the same
// relative offset (and likewise every down-neighbour pair), so each direction
// is one more-than-threshold stamped-copy group -- Replicate it.
const edgeRightKey = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), geometry);
const edgeDownKey = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), geometry);
const rightPairCells = graph.cells().filter(cell => graph.step(cell, 0, 1) !== null);
const downPairCells = graph.cells().filter(cell => graph.step(cell, 1, 0) !== null);
const [rightOriginA, downOriginA] = [rightPairCells[0], downPairCells[0]];
const [rightOriginB, downOriginB] =
  [graph.step(rightOriginA, 0, 1), graph.step(downOriginA, 1, 0)];
const edgeRules = [
  new Replicate(
    [new Pair(edgeRightKey, 'edge-h', shapeVar.at(rightOriginA), shapeVar.at(rightOriginB))],
    Replicate.encodeTargetCells(shapeVar.at(rightPairCells), shapeVar.at(rightOriginA), shapeVar),
    shapeVar.at(rightOriginA)),
  new Replicate(
    [new Pair(edgeDownKey, 'edge-v', shapeVar.at(downOriginA), shapeVar.at(downOriginB))],
    Replicate.encodeTargetCells(shapeVar.at(downPairCells), shapeVar.at(downOriginA), shapeVar),
    shapeVar.at(downOriginA)),
];

// --- Link each non-clue cell's own main-grid digit to its shape: the
// answer-check convention (SHADE/LOOP) and the shape code must agree on
// whether the cell is on the loop.
const linkKey = Pair.fnToKey(
  (digit, s) => (digit === SHADE) === (s === OFF), geometry);
const digitShapeLinks = nonClueCells.map(cell =>
  new Pair(linkKey, 'digit-shape', cell, shapeVar.at(cell)));

// --- Count machine: reads a target digit (a clue's own value), then counts
// SHADE-valued cells among the rest, and must land on the target exactly.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === SHADE ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry);

// --- Neighbour count: shaded cells among the clue's king neighbours, skipping
// any neighbour that is itself a clue cell (R7C7 and R8C6 are king-adjacent).
const neighbourCounts = clues.map(cell => new NFA(countMachine, 'king-count',
  cell, ...graph.kingNeighbours(cell).filter(c => !clueSet.has(c))));

// --- Ray count: shaded cells summed across every one of the clue's rays,
// skipping any ray cell that is itself a clue cell (R5C2's up-right ray
// crosses R3C4).
const rayCounts = clues.map(cell => new NFA(countMachine, 'ray-count',
  cell,
  ...clueRayDirections.get(cell)
    .flatMap(([dRow, dCol]) => graph.ray(cell, dRow, dCol).slice(1))
    .filter(c => !clueSet.has(c))));

return [
  shape,
  ...domains,
  clueAllDifferent,
  loopConnected,
  shapeVar.toVar('shape'),
  ...shapeDomains,
  ...edgeRules,
  ...digitShapeLinks,
  ...neighbourCounts,
  ...rayCounts,
];
