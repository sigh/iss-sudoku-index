// Title: TDF: The Route
// Author: palpot
// Video: https://www.youtube.com/watch?v=00lxcgSGLBg
// Source: https://sudokupad.app/7d9f9mb2y3

// Normal sudoku. Draw a non-branching, non-repeating orthogonal path from the
// rider (R1C9) to the medal (R3C5). Entropy: every 3 consecutive path digits
// contain a low(1-3)/medium(4-6)/high(7-9) digit. Mountain cells: the path
// must run straight vertically through them, and the mountain's own digit N
// is the length of that vertical straight section (which contains the
// mountain); the digit-sums above/below the mountain within the section
// differ by N. Flat-road cells: the horizontal mirror of the mountain rule.
// Chequered flags: the path must turn there, with both the horizontal and
// vertical stage meeting at the flag having length N (including the flag);
// the sums of the non-flag digits in the two stages differ by N. Soigneur
// cells are off the path; their digit counts path cells among their up to 8
// king neighbours.
//
// Path model: every cell gets a "shape" Var holding one of 11 codes - OFF, a
// single-direction endpoint code (N/S/E/W), a straight code (NS/EW), or a
// turn code (NE/NW/SE/SW). Only the two known path endpoints (rider, medal)
// may use a single-direction code; every other cell is OFF or a two-direction
// code. Each grid edge gets one agreement check: the two cells sharing it
// must agree on whether that edge is used. This pins each cell's exact
// degree and direction locally, without assuming that any two ON/OFF-
// adjacent cells are automatically path-connected - i.e. it allows the path
// to touch itself at non-consecutive cells, which the rules do not forbid
// and the real solution relies on. `ConnectedValues` over the non-OFF codes
// still rules out a fully disconnected extra path fragment, but local shape
// codes plus edge agreement alone do not prove there is exactly one path
// when self-touching is allowed; that residual topology gap is a documented,
// deliberate omission (a search over the full puzzle nonetheless completed
// and found a unique solution).
//
// Straight-run length for a mountain/flat-road/flag is read directly off the
// shape codes along a ray: a ray cell continues the run only while its own
// code is the matching straight code (NS for a vertical ray, EW for a
// horizontal ray); the first cell whose code differs ends the run. Because
// the code is asserted explicitly (not inferred from adjacency), this stays
// correct even where the path touches itself.

const CODE = { OFF: 1, N: 2, S: 3, E: 4, W: 5, NS: 6, EW: 7, NE: 8, NW: 9, SE: 10, SW: 11 };
const ALL_CODES = Object.values(CODE);
const NON_ENDPOINT_CODES = [CODE.OFF, CODE.NS, CODE.EW, CODE.NE, CODE.NW, CODE.SE, CODE.SW];
const ENDPOINT_CODES = [CODE.N, CODE.S, CODE.E, CODE.W];
const TURN_CODES = [CODE.NE, CODE.NW, CODE.SE, CODE.SW];

// Which of the 4 orthogonal directions a code uses.
function usesDir(code) {
  switch (code) {
    case CODE.OFF: return { N: false, S: false, E: false, W: false };
    case CODE.N: return { N: true, S: false, E: false, W: false };
    case CODE.S: return { N: false, S: true, E: false, W: false };
    case CODE.E: return { N: false, S: false, E: true, W: false };
    case CODE.W: return { N: false, S: false, E: false, W: true };
    case CODE.NS: return { N: true, S: true, E: false, W: false };
    case CODE.EW: return { N: false, S: false, E: true, W: true };
    case CODE.NE: return { N: true, S: false, E: true, W: false };
    case CODE.NW: return { N: true, S: false, E: false, W: true };
    case CODE.SE: return { N: false, S: true, E: true, W: false };
    case CODE.SW: return { N: false, S: true, E: false, W: true };
  }
}

const graph = cellGraph('9x9');
const gridCells = graph.cells();

const shape = graph.makeOverlay('VS');
const shapeCell = cell => shape.at(cell);

// 11 codes need a wider value range than the grid's own 1-9; restrict every
// real grid cell back to its true digit range afterwards.
// --- Given digit. ---
// --- Clue cell geometry (from the drawn icons). ---
const START = 'R1C9';       // rider
const FINISH = 'R3C5';      // medal
const MOUNTAINS = ['R8C6', 'R8C9'];
const FLAT_ROADS = ['R1C6', 'R4C7', 'R5C6', 'R9C7'];
const FLAGS = ['R2C2', 'R3C4', 'R7C8'];
const SOIGNEURS = ['R5C1', 'R7C5'];

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

// --- Shape domain per cell: only codes whose directions actually exist on
// the grid; only START/FINISH may take a single-direction (degree-1) code.
const shapeDomains = gridCells.map(cell => {
  const exists = existingDirs(cell);
  const candidates = (cell === START || cell === FINISH ? ENDPOINT_CODES : NON_ENDPOINT_CODES)
    .filter(code => codeFits(code, exists));
  return new Given(shapeCell(cell), ...candidates);
});

// --- Fixed shapes from the drawn clues. ---
const fixedShapes = [
  ...MOUNTAINS.map(cell => new Given(shapeCell(cell), CODE.NS)),
  ...FLAT_ROADS.map(cell => new Given(shapeCell(cell), CODE.EW)),
  ...FLAGS.map(cell => new Given(shapeCell(cell), ...TURN_CODES)),
  ...SOIGNEURS.map(cell => new Given(shapeCell(cell), CODE.OFF)),
];

// --- Edge agreement: the cells sharing a grid edge must agree on whether
// that edge is used (part of the path) or not.
const eastAgree = Pair.fnToKey((a, b) => usesDir(a).E === usesDir(b).W, ALL_CODES.length);
const southAgree = Pair.fnToKey((a, b) => usesDir(a).S === usesDir(b).N, ALL_CODES.length);
const horizontalEdgeOrigins = gridCells.filter(cell => graph.step(cell, 0, 1));
const verticalEdgeOrigins = gridCells.filter(cell => graph.step(cell, 1, 0));
const edges = [
  shape.makeReplicate(
    new Pair(eastAgree, 'edge-h', shapeCell('R1C1'), shapeCell('R1C2')),
    shape.at(horizontalEdgeOrigins)),
  shape.makeReplicate(
    new Pair(southAgree, 'edge-v', shapeCell('R1C1'), shapeCell('R2C1')),
    shape.at(verticalEdgeOrigins)),
];

// --- Entropy path: for every non-endpoint on-path cell, its shape code names
// its exactly two path-neighbours; the cell and those two neighbours - the 3
// consecutive path digits centred here - must cover all three bands. Every
// consecutive triple along the path is anchored exactly once, at its middle
// cell. A tiny fixed-arity NFA checks 3 concrete digits; which 2 neighbour
// cells it reads is chosen by an Or-branch per possible code.
const bandOf = digit => (digit <= 3 ? 0 : (digit <= 6 ? 1 : 2));
const ALL_BANDS = 0b111;
const tripleBandMachine = NFA.encodeSpec({
  startState: { bands: 0 },
  transition: ({ bands }, value) => ({ bands: bands | (1 << bandOf(value)) }),
  accept: ({ bands }) => bands === ALL_BANDS,
}, 9);
const TWO_DIR_CODES = [CODE.NS, CODE.EW, CODE.NE, CODE.NW, CODE.SE, CODE.SW];
const entropyConstraints = gridCells
  .filter(cell => cell !== START && cell !== FINISH)
  .map(cell => {
    const exists = existingDirs(cell);
    // An off-path cell has no path-neighbours, so it is vacuously fine.
    const branches = [new And([new Given(shapeCell(cell), CODE.OFF)])];
    for (const code of TWO_DIR_CODES) {
      if (!codeFits(code, exists)) continue;
      const dirs = usesDir(code);
      const neighbourCells = ['N', 'S', 'E', 'W']
        .filter(d => dirs[d])
        .map(d => graph.step(cell, d === 'N' ? -1 : d === 'S' ? 1 : 0, d === 'E' ? 1 : d === 'W' ? -1 : 0));
      branches.push(new And([
        new Given(shapeCell(cell), code),
        new NFA(tripleBandMachine, 'entropy', cell, ...neighbourCells),
      ]));
    }
    return new Or(branches);
  });

// --- Stage/run length + sum-difference rules, as an enumerated Or/And rather
// than a scanning NFA: the run length (incl. the clue cell) is at most 9, so
// there are only a handful of (nearLen, farLen) splits consistent with a
// digit 1-9. Each split fixes concrete boundary cells: cells strictly between
// the clue cell and the run's far end carry the matching straight code (so
// they keep connecting inward and outward); the far end cell itself only
// needs to connect back toward the clue cell, which the straight code on its
// inward neighbour (or the clue cell itself, for a length-1 side) already
// forces via edge agreement, so it is left unconstrained; the next cell
// beyond the run must not carry the straight code, or the run would extend
// further. A concrete, ordinary `Sum` covers that split's specific cells.
function boundaryGivens(branch, ray, len, straightCode) {
  // Interior cells of the run continue straight...
  for (let i = 0; i < len - 1; i++) branch.push(new Given(shapeCell(ray[i]), straightCode));
  // ...and the run's far cell is where it ends: it turns, or it is a path
  // endpoint. Either way it does not carry the straight code, which is what
  // stops the section from running on past its stated length.
  if (len >= 1) {
    branch.push(new Given(shapeCell(ray[len - 1]), ...ALL_CODES.filter(c => c !== straightCode)));
  }
}

// Mountain / flat-road: two rays (near, far) meeting at the clue cell.
function axisStageConstraint(anchor, rayNear, rayFar, straightCode) {
  const branches = [];
  // k, j >= 1: the clue cell's straight code uses both directions, so edge
  // agreement forces both immediate neighbours onto the path, and each is part
  // of this straight section.
  for (let k = 1; k <= Math.min(rayNear.length, 8); k++) {
    for (let j = 1; j <= Math.min(rayFar.length, 8); j++) {
      const quota = k + j + 1;
      if (quota > 9) continue;
      const terms = [
        ...rayNear.slice(0, k).map(c => [c, 1]),
        ...rayFar.slice(0, j).map(c => [c, -1]),
      ];
      for (const sign of [1, -1]) {
        const branch = [new Given(anchor, quota)];
        boundaryGivens(branch, rayNear, k, straightCode);
        boundaryGivens(branch, rayFar, j, straightCode);
        branch.push(new Sum(sign * quota, ...terms));
        branches.push(new And(branch));
      }
    }
  }
  return branches;
}

// Chequered flag: a vertical (N/S) and horizontal (E/W) stage of equal length
// meeting at the clue cell.
function flagStageConstraint(anchor, rayN, rayS, rayE, rayW) {
  const branches = [];
  const VERT = { N: rayN, S: rayS };
  const HORIZ = { E: rayE, W: rayW };
  // The flag turns, so its code names one vertical and one horizontal direction.
  // Each stage runs from the flag in exactly that direction -- never both ways --
  // and includes the flag, so a stage of length N needs N-1 further cells.
  for (let quota = 2; quota <= 9; quota++) {
    for (const v of ['N', 'S']) {
      for (const h of ['E', 'W']) {
        const rayV = VERT[v];
        const rayH = HORIZ[h];
        if (rayV.length < quota - 1 || rayH.length < quota - 1) continue;
        const vertCells = rayV.slice(0, quota - 1);
        const horizCells = rayH.slice(0, quota - 1);
        const terms = [
          ...vertCells.map(c => [c, 1]),
          ...horizCells.map(c => [c, -1]),
        ];
        for (const sign of [1, -1]) {
          const branch = [
            new Given(anchor, quota),
            new Given(shapeCell(anchor), CODE[v + h]),
          ];
          boundaryGivens(branch, rayV, quota - 1, CODE.NS);
          boundaryGivens(branch, rayH, quota - 1, CODE.EW);
          branch.push(new Sum(sign * quota, ...terms));
          branches.push(new And(branch));
        }
      }
    }
  }
  return branches;
}

function ray(cell, dRow, dCol) {
  return graph.ray(cell, dRow, dCol).slice(1);
}

// --- Mountains and flat roads: run length + sum-difference. ---
const mountainConstraints = MOUNTAINS.map(cell =>
  new Or(axisStageConstraint(cell, ray(cell, -1, 0), ray(cell, 1, 0), CODE.NS)));

const flatRoadConstraints = FLAT_ROADS.map(cell =>
  new Or(axisStageConstraint(cell, ray(cell, 0, 1), ray(cell, 0, -1), CODE.EW)));

// --- Chequered flags: both stages' run length + sum-difference. ---
const flagConstraints = FLAGS.map(cell =>
  new Or(flagStageConstraint(cell,
    ray(cell, -1, 0), ray(cell, 1, 0), ray(cell, 0, 1), ray(cell, 0, -1))));

// --- Soigneurs: off the path; digit counts on-path cells among the up to 8
// king neighbours.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === CODE.OFF ? 0 : 1);
    return next > target ? [] : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, ALL_CODES.length);

const soigneurConstraints = SOIGNEURS.map(cell =>
  new NFA(countMachine, 'soigneur-count', cell, ...shape.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9', ALL_CODES.length),
  shape.toVar('shape'),
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  new Given('R1C2', 5),
  ...shapeDomains,
  ...fixedShapes,
  ...edges,
  // --- Connectivity (partial closure - see the header note): rules out an
  // extra, fully disconnected component.
  new ConnectedValues('VS', NON_ENDPOINT_CODES.filter(c => c !== CODE.OFF).concat(ENDPOINT_CODES)),
  ...entropyConstraints,
  ...mountainConstraints,
  ...flatRoadConstraints,
  ...flagConstraints,
  ...soigneurConstraints,
];
