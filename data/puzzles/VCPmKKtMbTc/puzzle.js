// Title: Modular Masyu
// Author: yttrio
// Video: https://www.youtube.com/watch?v=VCPmKKtMbTc
// Source: https://sudokupad.app/6me9411h8m

// Normal sudoku. Draw a single non-crossing Masyu loop through some cell
// centres, moving orthogonally: black circles are turns with a straight cell
// on each side; white circles are straights with a turn on at least one side.
// The loop also acts as a modular line: every 3 consecutive loop digits
// contain one each of {1,4,7}, {2,5,8}, {3,6,9}. Each circled cell's own
// digit counts every loop cell in the straight run(s) leaving that cell
// (both directions merge into one run at a straight cell; a turn cell's two
// perpendicular runs are counted separately, with the turn cell itself
// counted once).
//
// Loop model: a "shape" Var per cell records which two (or zero) of its four
// edges the loop uses -- OFF, a straight HORIZ/VERT, or one of four turn
// corners UL/UR/DL/DR. Edge agreement between neighbours joins matching
// shapes into loops. ConnectedValues over the on-loop codes gives a partial
// single-loop closure only: it rejects a fully separate loop fragment, but
// not a second loop that runs cell-adjacent to the first without sharing an
// edge (the loop is allowed to touch itself, so this residual case is not
// excluded here).

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const ON_CODES = [HORIZ, VERT, UL, UR, DL, DR];
const ALL_SHAPES = [OFF, ...ON_CODES];
const TURN_CODES = [UL, UR, DL, DR];
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const isTurn = s => TURN_CODES.includes(s);
const residue = d => (d - 1) % 3;   // 1/4/7 -> 0, 2/5/8 -> 1, 3/6/9 -> 2

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shape = graph.makeOverlay('VS');
const shapeCell = cell => shape.at(cell);

// Circle positions, from the drawn underlays.
const WHITE = ['R2C2', 'R3C2', 'R1C6', 'R2C9', 'R8C3'];
const BLACK = ['R2C5', 'R3C1', 'R6C9', 'R6C6'];

const DIRS = ['up', 'down', 'left', 'right'];
const usesDir = { up: usesUp, down: usesDown, left: usesLeft, right: usesRight };
const dirStep = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const presentDirs = cell => DIRS.filter(d => graph.step(cell, ...dirStep[d]));
function ray(cell, dRow, dCol) {
  return graph.ray(cell, dRow, dCol).slice(1);   // exclude the anchor itself
}

// --- Shape domains: an edge code may only be used where the neighbour exists.
const shapeDomains = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
  return new Given(shapeCell(cell), ...allowed);
});

// Every circle is on the loop: white circles are straight, black circles turn.
// (Given merges by intersection, so this narrows shapeDomains above.)
const circleDomains = [
  ...WHITE.map(cell => new Given(shapeCell(cell), HORIZ, VERT)),
  ...BLACK.map(cell => new Given(shapeCell(cell), ...TURN_CODES)),
];

// --- Edge agreement: neighbours must agree on the shared edge -- A uses the
// edge to B iff B uses the edge back. A plain 2-cell relation, so Pair
// rather than NFA.
const edgeAgreeKey = (toB, toA) =>
  Pair.fnToKey((a, b) => toB(a) === toA(b), geometry.numValues);

// --- Modular edge rule: two cells joined by a loop edge must have different
// residues mod 3. Reads [shapeA, digitA, digitB]; unconstrained when unjoined.
const diffEdge = (toB) => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'digitA', joined: toB(value) };
    if (state.phase === 'digitA') return { phase: 'digitB', joined: state.joined, digitA: value };
    if (!state.joined) return { done: true };
    return residue(state.digitA) === residue(value) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

const edgeAgreeRightKey = edgeAgreeKey(usesRight, usesLeft);
const edgeAgreeDownKey = edgeAgreeKey(usesDown, usesUp);
const diffRight = diffEdge(usesRight), diffDown = diffEdge(usesDown);
const edgeRules = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [
    ...(right ? [
      new NFA(diffRight, 'modular-edge-h', shapeCell(cell), cell, right),
    ] : []),
    ...(down ? [
      new NFA(diffDown, 'modular-edge-v', shapeCell(cell), cell, down),
    ] : []),
  ];
});

const edgeAgreementConstraints = [
  shape.makeReplicate(
    [new Pair(edgeAgreeRightKey, 'edge-h', shapeCell('R1C1'), shapeCell('R1C2'))],
    shape.at(gridCells.filter(cell => graph.step(cell, 0, 1)))),
  shape.makeReplicate(
    [new Pair(edgeAgreeDownKey, 'edge-v', shapeCell('R1C1'), shapeCell('R2C1'))],
    shape.at(gridCells.filter(cell => graph.step(cell, 1, 0)))),
];

// --- Modular cross rule: an on-loop cell's own two loop-neighbours must also
// differ from each other (residue), not just each from the cell itself, so
// every window of 3 consecutive loop digits is a full {0,1,2} permutation --
// adjacent-pair-only differences would not rule out e.g. residues 0,1,0.
// Reads [shape, neighbour digits in a fixed direction order]; collects the
// (up to two) residues the shape actually uses and compares them.
function crossMachine(dirs) {
  return NFA.encodeSpec({
    startState: { phase: 'shape' },
    transition: (state, value) => {
      if (state.phase === 'done') return { phase: 'done' };   // absorb extra symbols
      if (state.phase === 'shape') {
        return { phase: 'dir', idx: 0, shapeVal: value, picked: [] };
      }
      const dir = dirs[state.idx];
      const used = usesDir[dir](state.shapeVal);
      const picked = used ? [...state.picked, residue(value)] : state.picked;
      const idx = state.idx + 1;
      if (idx < dirs.length) return { phase: 'dir', idx, shapeVal: state.shapeVal, picked };
      if (picked.length === 0) return { phase: 'done' };   // off-loop cell
      const [a, b] = picked;
      return a === b ? undefined : { phase: 'done' };
    },
    accept: (state) => state.phase === 'done',
  }, geometry.numValues);
}
const crossRules = gridCells.map(cell => {
  const dirs = presentDirs(cell);
  const neighbours = dirs.map(d => graph.step(cell, ...dirStep[d]));
  return new NFA(crossMachine(dirs), 'modular-cross', shapeCell(cell), ...neighbours);
});

// --- Black circle: must turn, and go straight through the cell on each side
// (the neighbour in each used direction continues in the same axis).
function blackMachine(dirs) {
  return NFA.encodeSpec({
    startState: { phase: 'shape' },
    transition: (state, value) => {
      if (state.phase === 'done') return { phase: 'done' };   // absorb extra symbols
      if (state.phase === 'shape') {
        if (!isTurn(value)) return undefined;
        return { phase: 'dir', idx: 0, shapeVal: value };
      }
      const dir = dirs[state.idx];
      if (usesDir[dir](state.shapeVal)) {
        const axis = (dir === 'up' || dir === 'down') ? VERT : HORIZ;
        if (value !== axis) return undefined;
      }
      const idx = state.idx + 1;
      return idx < dirs.length ? { phase: 'dir', idx, shapeVal: state.shapeVal } : { phase: 'done' };
    },
    accept: (state) => state.phase === 'done',
  }, geometry.numValues);
}
const blackRules = BLACK.map(cell => {
  const dirs = presentDirs(cell);
  const neighbourShapes = dirs.map(d => shapeCell(graph.step(cell, ...dirStep[d])));
  return new NFA(blackMachine(dirs), 'black-straight-sides', shapeCell(cell), ...neighbourShapes);
});

// --- White circle: must go straight, and turn on at least one side.
function whiteMachine(dirs) {
  return NFA.encodeSpec({
    startState: { phase: 'shape' },
    transition: (state, value) => {
      if (state.phase === 'done') return { phase: 'done' };   // absorb extra symbols
      if (state.phase === 'shape') {
        if (value !== HORIZ && value !== VERT) return undefined;
        return { phase: 'dir', idx: 0, shapeVal: value, sawTurn: false };
      }
      const dir = dirs[state.idx];
      const used = usesDir[dir](state.shapeVal);
      const sawTurn = state.sawTurn || (used && isTurn(value));
      const idx = state.idx + 1;
      if (idx < dirs.length) return { phase: 'dir', idx, shapeVal: state.shapeVal, sawTurn };
      return sawTurn ? { phase: 'done' } : undefined;
    },
    accept: (state) => state.phase === 'done',
  }, geometry.numValues);
}
const whiteRules = WHITE.map(cell => {
  const dirs = presentDirs(cell);
  const neighbourShapes = dirs.map(d => shapeCell(graph.step(cell, ...dirStep[d])));
  return new NFA(whiteMachine(dirs), 'white-turn-side', shapeCell(cell), ...neighbourShapes);
});

// --- Circle digit = run length. Enumerated as an Or of And branches (a
// running-sum NFA blows the state limit): each branch pins a candidate length
// on each side, with the far end of each ray excluded from the straight code
// so the run cannot overshoot. Length quota = nearCells + farCells + 1 (the
// anchor itself, counted once even for a turn's two perpendicular runs).
function boundaryGivens(branch, rayCells, len, straightCode) {
  for (let i = 0; i < len - 1; i++) branch.push(new Given(shapeCell(rayCells[i]), straightCode));
  if (len >= 1) {
    branch.push(new Given(shapeCell(rayCells[len - 1]), ...ALL_SHAPES.filter(s => s !== straightCode)));
  }
}

function whiteCountBranches(anchor) {
  const branches = [];
  for (const [rayA, rayB, code] of [
    [ray(anchor, 0, -1), ray(anchor, 0, 1), HORIZ],
    [ray(anchor, -1, 0), ray(anchor, 1, 0), VERT],
  ]) {
    for (let k = 1; k <= Math.min(rayA.length, 8); k++) {
      for (let j = 1; j <= Math.min(rayB.length, 8); j++) {
        const quota = k + j + 1;
        if (quota > 9) continue;
        const branch = [new Given(anchor, quota), new Given(shapeCell(anchor), code)];
        boundaryGivens(branch, rayA, k, code);
        boundaryGivens(branch, rayB, j, code);
        branches.push(new And(branch));
      }
    }
  }
  return branches;
}

const TURN_DIRS = { [UL]: ['up', 'left'], [UR]: ['up', 'right'], [DL]: ['down', 'left'], [DR]: ['down', 'right'] };
function blackCountBranches(anchor) {
  const branches = [];
  for (const code of TURN_CODES) {
    const [d1, d2] = TURN_DIRS[code];
    const ray1 = ray(anchor, ...dirStep[d1]);
    const ray2 = ray(anchor, ...dirStep[d2]);
    const code1 = (d1 === 'up' || d1 === 'down') ? VERT : HORIZ;
    const code2 = (d2 === 'up' || d2 === 'down') ? VERT : HORIZ;
    for (let k = 1; k <= Math.min(ray1.length, 8); k++) {
      for (let j = 1; j <= Math.min(ray2.length, 8); j++) {
        const quota = k + j + 1;
        if (quota > 9) continue;
        const branch = [new Given(anchor, quota), new Given(shapeCell(anchor), code)];
        boundaryGivens(branch, ray1, k, code1);
        boundaryGivens(branch, ray2, j, code2);
        branches.push(new And(branch));
      }
    }
  }
  return branches;
}

const countConstraints = [
  ...WHITE.map(cell => new Or(whiteCountBranches(cell))),
  ...BLACK.map(cell => new Or(blackCountBranches(cell))),
];

return [
  new Shape('9x9'),
  new Given('R4C2', 9),
  shape.toVar('shape'),
  ...shapeDomains,
  ...circleDomains,
  ...edgeAgreementConstraints,
  ...edgeRules,
  ...crossRules,
  ...blackRules,
  ...whiteRules,
  // Partial single-loop closure -- see the header comment for the residual gap.
  new ConnectedValues('VS', ON_CODES),
  ...countConstraints,
];
