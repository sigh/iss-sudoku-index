// Title: Love Letter from Canada
// Author: SUDOOOOOKUfan87
// Video: https://www.youtube.com/watch?v=dr7Hh2Xxg_k
// Source: https://sudokupad.app/esjz6meusc

// Normal sudoku, no given digits. Two variant systems apply:
//
// (1) Path: draw an orthogonal path from R1C9 to R9C1 that visits every
//     3x3 box; adjacent digits along the path differ by >=4.
// (2) Terrain: every cell is "island" or "water". Nine lavender cells are
//     island anchors (the digit placed there is that island's cell count);
//     R1C9 and R9C1 are two more (non-lavender) islands and the only island
//     cells the path may touch; different islands may not touch each other
//     orthogonally; water is one connected region with no all-water 2x2
//     block; four lavender islands also carry a killer-style digit-sum
//     total (r6c8's total, while not printed, is stated to be prime); the
//     two flag islands' digit products must be equal.
//
// What's encoded: the path's shape/degree/box-visit/difference rules, and
// the terrain partition's local rules (anchors, water connectivity, no
// mono-water 2x2, "only the two flag cells are island-on-path"). What's
// omitted: every rule that is a predicate over an unknown island's
// *discovered* cell membership -- size-equals-clue-digit, killer
// sum/primality, the two islands' product equality, and "different islands
// don't touch" (island identity itself is never labelled, only the binary
// island/water split). These are unknown-partition component predicates
// with no ISS primitive today.

const CANADA = 'R1C9';   // path endpoint, non-lavender island
const JAPAN = 'R9C1';    // path endpoint, non-lavender island
const LAVENDER = ['R3C1', 'R2C2', 'R7C9', 'R8C8', 'R4C2', 'R6C8', 'R4C6', 'R7C5', 'R2C6'];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// --- Path-shape overlay: what edges each cell uses. -----------------------
// Regular cells (everything but the two named endpoints) use one of 7 codes;
// OFF/HORIZ/VERT/turns give degree 0 or 2 by construction, so no separate
// degree count is needed for them. The two endpoints get their own 2-value
// domain (END_A/END_B) meaning "use this one of my two available edges" --
// each is a grid corner with exactly two neighbours, so 2 codes suffice and
// there is no need to widen Shape past 9 values (see shapes.md).
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const END_A = 8, END_B = 9;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

const path = graph.makeOverlay('VP');
const pathCell = cell => path.at(cell);
const isEndpoint = cell => cell === CANADA || cell === JAPAN;
const regularCells = gridCells.filter(cell => !isEndpoint(cell));

// Regular-cell domains: exclude codes that would point off the grid.
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const shapeDomains = regularCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
  return new Given(pathCell(cell), ...allowed);
});
// Lavender cells are islands, never on the path.
const lavenderOffPath = LAVENDER.map(cell => new Given(pathCell(cell), OFF));
// Endpoints: R1C9's two neighbours are down (R2C9) and left (R1C8);
// R9C1's are up (R8C1) and right (R9C2). END_A/END_B mean different things
// at each endpoint -- only ever compared against that endpoint's own edge
// checks below, never against each other.
const endpointDomains = [
  new Given(pathCell(CANADA), END_A, END_B),
  new Given(pathCell(JAPAN), END_A, END_B),
];

// --- Edge agreement, regular <-> regular pairs. ---------------------------
// A row/column of shape codes is exactly a chain of horizontal/vertical
// neighbour pairs, so one Pair per whole row (or column) covers every edge
// in it -- dropping the one endpoint cell a row/column may contain is safe
// here because both endpoints sit at a row/column end (R1C9 is the last
// cell of row 1 and of column 9; R9C1 the last of column 1, first of row 9),
// never in the interior, so removing it never joins two cells that were not
// really adjacent.
const edgeRightKey = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), geometry.numValues);
const edgeDownKey = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), geometry.numValues);
const edgeAgreements = [
  ...graph.rows().map(row =>
    new Pair(edgeRightKey, 'edge-h', ...row.filter(c => !isEndpoint(c)).map(pathCell))),
  ...graph.columns().map(col =>
    new Pair(edgeDownKey, 'edge-v', ...col.filter(c => !isEndpoint(c)).map(pathCell))),
];

// --- Digit difference along a used regular <-> regular edge. -------------
// Reads [shapeA, digitA, digitB]; `toB` says whether A uses the edge to B
// (edge agreement above guarantees B agrees), so only joined pairs are
// constrained. Kept as one NFA per edge (not a chain Pair): the relation
// needs the two digit cells together with the shape cell, not the shape
// codes alone.
const diffEdge = (toB) => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'digitA', joined: toB(value) };
    if (state.phase === 'digitA') return { phase: 'digitB', joined: state.joined, digitA: value };
    if (!state.joined) return { done: true };
    return Math.abs(state.digitA - value) >= 4 ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const diffRight = diffEdge(usesRight), diffDown = diffEdge(usesDown);
const diffRules = regularCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [
    ...(right && !isEndpoint(right) ? [new NFA(diffRight, 'diff-h', pathCell(cell), cell, right)] : []),
    ...(down && !isEndpoint(down) ? [new NFA(diffDown, 'diff-v', pathCell(cell), cell, down)] : []),
  ];
});

// --- Edge agreement + digit difference, the 4 endpoint <-> neighbour pairs.
// Each endpoint always uses exactly one of its two edges; `epTarget` is the
// code meaning "use the edge to this particular neighbour", and
// `neighbourUses` reads the ordinary neighbour's own shape code for its
// matching edge back.
function endpointEdge(epCell, epTarget, neighbourCell, neighbourUses) {
  const agreeKey = Pair.fnToKey(
    (epVal, neighbourVal) => (epVal === epTarget) === neighbourUses(neighbourVal),
    geometry.numValues);
  const diff = NFA.encodeSpec({
    startState: { phase: 'ep' },
    transition: (state, value) => {
      if (state.phase === 'ep') return { phase: 'digitEp', used: value === epTarget };
      if (state.phase === 'digitEp') return { phase: 'digitOther', used: state.used, digitEp: value };
      if (!state.used) return { done: true };
      return Math.abs(state.digitEp - value) >= 4 ? { done: true } : undefined;
    },
    accept: ({ done }) => done === true,
  }, geometry.numValues);
  return [
    new Pair(agreeKey, 'edge-ep', pathCell(epCell), pathCell(neighbourCell)),
    new NFA(diff, 'diff-ep', pathCell(epCell), epCell, neighbourCell),
  ];
}
const endpointRules = [
  ...endpointEdge(CANADA, END_A, 'R2C9', usesUp),    // down edge
  ...endpointEdge(CANADA, END_B, 'R1C8', usesRight), // left edge
  ...endpointEdge(JAPAN, END_A, 'R8C1', usesDown),    // up edge
  ...endpointEdge(JAPAN, END_B, 'R9C2', usesLeft),    // right edge
];

// --- Path must visit every 3x3 box: at least one non-OFF code per box. ----
const existsOnPathMachine = NFA.encodeSpec({
  startState: { found: false },
  transition: ({ found }, value) => ({ found: found || value !== OFF }),
  accept: ({ found }) => found,
}, geometry.numValues);
const boxesVisited = graph.boxes()
  .map(box => new NFA(existsOnPathMachine, 'box-visited', ...box.map(pathCell)));

// --- Terrain overlay: ISLAND or WATER per cell. ---------------------------
const ISLAND = 1, WATER = 2;
const terrain = graph.makeOverlay('VT');
const terrainCell = cell => terrain.at(cell);
const firstTerrain = terrain.cells()[0];
// Every terrain Var is island or water; all 81 cells share one template.
const terrainDomain = terrain.makeReplicate(
  new Given(firstTerrain, ISLAND, WATER));
const islandAnchors = [...LAVENDER, CANADA, JAPAN]
  .map(cell => new Given(terrainCell(cell), ISLAND));

// Only R1C9/R9C1 may be island cells that are also on the path: every other
// on-path cell must be water. (Endpoints are excluded -- they are always
// on-path and always island, by the givens above.)
const terrainLinkKey = Pair.fnToKey(
  (code, terr) => !(code !== OFF && terr === ISLAND), geometry.numValues);
const terrainLinks = regularCells.map(cell =>
  new Pair(terrainLinkKey, 'terrain-link', pathCell(cell), terrainCell(cell)));

// No 2x2 block of all-water cells: one NFA on the top-left block, replicated
// to every block origin (same idiom as xin_yang_v2.js's noMono2x2).
const noMonoWaterMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value];
    if (next.length < 4) return { block: next };
    return next.every(v => v === WATER) ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMonoWaterBlocks = terrain.makeReplicate(
  new NFA(noMonoWaterMachine, 'no-mono-water',
    ...graph.block(gridCells[0], 2, 2).map(terrainCell)),
  blockOrigins.map(terrainCell));

return [
  new Shape('9x9'),
  path.toVar('path shape'),
  terrain.toVar('terrain'),
  ...shapeDomains,
  ...lavenderOffPath,
  ...endpointDomains,
  ...edgeAgreements,
  ...diffRules,
  ...endpointRules,
  ...boxesVisited,
  terrainDomain,
  ...islandAnchors,
  ...terrainLinks,
  noMonoWaterBlocks,
  // All water cells form one connected region. Not used for the island
  // class: islands are several disjoint components, and ConnectedValues
  // forces exactly one region (unsound if applied there).
  new ConnectedValues('VT', WATER),
  // The on-path cells (every code but OFF, across both overlays) form one
  // connected region: rules out a wholly separate extra loop/path fragment
  // elsewhere. It does NOT prove a single route on its own -- a second
  // path-shaped structure could sit cell-adjacent to the real one without
  // sharing a used edge and still read as "connected" (same caveat as
  // wendezaune.js); that residual is recorded as an omission.
  new ConnectedValues('VP', [HORIZ, VERT, UL, UR, DL, DR, END_A, END_B]),
];
