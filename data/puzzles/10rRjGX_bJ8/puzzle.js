// Title: Drunkard's Walk
// Author: FullDeck and Missing A Few Cards
// Video: https://www.youtube.com/watch?v=10rRjGX_bJ8
// Source: https://beta.sudokupad.app/Gnb2TrBHnF
//
// Standard 9x9 sudoku, ordinary 3x3 boxes. An unknown single path runs from
// R1C1 to R9C9, stepping to an orthogonal neighbour each move; it need not
// cover every cell. Every 3 consecutive path cells hold one digit each from
// {1,4,7}, {2,5,8}, {3,6,9} (a base-3 "modular line", the built-in
// Modular(3) relation -- but the line itself is solver-discovered, so it is
// encoded directly against the path model below rather than via that class,
// which needs a fixed cell order). The 15 drawn streetlamp cells are exactly
// the on-path cells whose digit belongs to one single one of those three
// sets; which set is not given by the rules, so it is an Or over the 3
// choices. Killer cages: distinct digits, printed total when given; if the
// path enters a cage it must finish every one of its cells before leaving
// (no partial visit, no later return) -- a cage may also be avoided
// outright. Fog is solving UI only and is not itself encoded here.
//
// --- Path model ---
// A 'VS' Var overlay holds one shape code per grid cell, saying which of its
// up-to-4 grid edges the path uses there:
//   OFF (not on path); HORIZ/VERT (straight through); UL/UR/DL/DR (turns,
//   named by the two edges used); EP_UP/EP_DOWN/EP_LEFT/EP_RIGHT (a single
//   used edge -- only valid at the path's own two endpoints).
// Restricting the endpoint-only codes to R1C1 and R9C9's domains, and every
// other cell's domain to OFF plus the 2-edge codes, forces degree exactly 1
// at the two endpoints and 0 or 2 everywhere else with no separate degree
// check. Edge-agreement NFAs between every neighbour pair tie the codes
// together; ConnectedValues makes the on-path cells one connected blob.
// This is the same shape-code technique as wendezaune.js: sound for a path
// that may run alongside itself, since only cell adjacency (not used-edge
// connectivity) is asserted, so it narrows towards "one path" without fully
// closing that a same-adjacent but disconnected fragment is impossible.
//
// --- Cage traversal completeness ---
// Encoded as two necessary conditions per cage: (a) every cage cell shares
// one on/off-path status (a Pair chain over the cage's own cell list --
// bound by that list's array position, not grid adjacency); (b) the count
// of path edges crossing the cage's boundary is exactly 0 (avoided) or the
// count a single contiguous visit produces -- 2 normally, 1 for the two
// cages that contain a path endpoint (R1C1 in the R1C1/R1C2 cage, R9C9 in
// the R9C9/R9C8 cage), since an endpoint contributes only one crossing.
// Together these force one unbroken entry-to-exit visit, which is what
// "must completely traverse before exiting" requires.

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const CODE_COUNT = 11; // widened alphabet: 9 digits + the 2 path codes above 9

const START = 'R1C1', END = 'R9C9';

// --- Path shape codes ---
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7,
  EP_UP = 8, EP_DOWN = 9, EP_LEFT = 10, EP_RIGHT = 11;
const THROUGH_CODES = [HORIZ, VERT, UL, UR, DL, DR];
const ON_CODES = [HORIZ, VERT, UL, UR, DL, DR, EP_UP, EP_DOWN, EP_LEFT, EP_RIGHT];

const usesUp = c => c === VERT || c === UL || c === UR || c === EP_UP;
const usesDown = c => c === VERT || c === DL || c === DR || c === EP_DOWN;
const usesLeft = c => c === HORIZ || c === UL || c === DL || c === EP_LEFT;
const usesRight = c => c === HORIZ || c === UR || c === DR || c === EP_RIGHT;
const isThrough = c => THROUGH_CODES.includes(c);

const DIR_DEFS = [
  { name: 'up', dR: -1, dC: 0, pred: usesUp },
  { name: 'down', dR: 1, dC: 0, pred: usesDown },
  { name: 'left', dR: 0, dC: -1, pred: usesLeft },
  { name: 'right', dR: 0, dC: 1, pred: usesRight },
];

const shape = graph.makeOverlay('VS');

// Every grid cell keeps the ordinary 1-9 digit range despite the widened Shape.
const digitDomains = graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Path-shape domains: OFF plus the geometrically valid 2-edge codes everywhere
// except the two endpoints, which take only their geometrically valid 1-edge
// (degree-1) codes -- this alone forces the degree profile of a simple path.
const shapeDomains = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  if (cell === START || cell === END) {
    const dirs = [];
    if (row > 1) dirs.push(EP_UP);
    if (row < 9) dirs.push(EP_DOWN);
    if (col > 1) dirs.push(EP_LEFT);
    if (col < 9) dirs.push(EP_RIGHT);
    return new Given(shape.at(cell), ...dirs);
  }
  const through = THROUGH_CODES.filter(c =>
    !(row === 1 && usesUp(c)) && !(row === 9 && usesDown(c)) &&
    !(col === 1 && usesLeft(c)) && !(col === 9 && usesRight(c)));
  return new Given(shape.at(cell), OFF, ...through);
});

// Edge agreement: neighbours must agree on whether their shared edge is used
// -- a plain 2-cell relation (Pair, not a scanning NFA), replicated by
// translation across every cell that has the given neighbour.
const edgeRightKey = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), CODE_COUNT);
const edgeDownKey = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), CODE_COUNT);
const shapeOrigin = shape.cells()[0];
const edgeAgreements = [
  shape.makeReplicate(
    new Pair(edgeRightKey, 'edge-h', shapeOrigin, shape.step(shapeOrigin, 0, 1)),
    shape.at(gridCells.filter(c => parseCellId(c).col < 9))),
  shape.makeReplicate(
    new Pair(edgeDownKey, 'edge-v', shapeOrigin, shape.step(shapeOrigin, 1, 0)),
    shape.at(gridCells.filter(c => parseCellId(c).row < 9))),
];

// One connected on-path blob (narrows towards a single path -- see header).
const connectivity = new ConnectedValues('VS', ON_CODES);

// --- Modular line: every through-cell's own digit and its two used
// neighbours' digits must be pairwise distinct mod 3 (equivalent to "every
// window of 3 consecutive path cells covers all three classes", since a
// window's middle cell is always some interior path cell's own check).
// Non-through cells (OFF or an endpoint) are
// unconstrained. One NFA per cell, reading [ownCode, ownDigit, ...neighbour
// digits in a fixed order], built once per distinct existing-neighbour
// pattern and reused.
function modularSpec(preds) {
  return NFA.encodeSpec({
    startState: { stage: 'code' },
    transition: (state, value) => {
      if (state.stage === 'code') return { stage: 'digit', code: value };
      if (state.stage === 'digit') {
        return {
          stage: 'nbr', code: state.code, through: isThrough(state.code),
          ownClass: value % 3, seen: [], idx: 0,
        };
      }
      const { code, through, ownClass, seen, idx } = state;
      // Compiling the NFA table explores a few symbols past this cell's own
      // argument count; once every real neighbour slot is read, absorb
      // anything further unchanged instead of indexing past `preds`.
      if (idx >= preds.length) return state;
      if (!through) return { stage: 'nbr', code, through, ownClass, seen, idx: idx + 1 };
      if (!preds[idx](code)) return { stage: 'nbr', code, through, ownClass, seen, idx: idx + 1 };
      const cls = value % 3;
      if (cls === ownClass || seen.includes(cls)) return undefined;
      return { stage: 'nbr', code, through, ownClass, seen: [...seen, cls], idx: idx + 1 };
    },
    accept: (state) => state.stage === 'nbr' && (state.idx >= preds.length),
    maxDepth: 2 + preds.length,
  }, CODE_COUNT);
}
const modularSpecCache = new Map();
function modularSpecFor(dirs) {
  const key = dirs.map(d => d.name).join(',');
  if (!modularSpecCache.has(key)) modularSpecCache.set(key, modularSpec(dirs.map(d => d.pred)));
  return modularSpecCache.get(key);
}
const modularChecks = gridCells.map(cell => {
  const dirs = DIR_DEFS
    .map(d => ({ ...d, nb: graph.step(cell, d.dR, d.dC) }))
    .filter(d => d.nb);
  const spec = modularSpecFor(dirs);
  return new NFA(spec, 'modular', shape.at(cell), cell, ...dirs.map(d => d.nb));
});

// --- Cages (drawn killer cages, in reading order) ---
const CAGES = [
  { cells: ['R1C1', 'R1C2'], total: 8 },
  { cells: ['R2C3', 'R3C3', 'R3C2', 'R4C2', 'R4C3'], total: 17 },
  { cells: ['R2C2', 'R2C1'], total: 12 },
  { cells: ['R2C5', 'R3C5', 'R3C6'], total: 21 },
  { cells: ['R2C4', 'R3C4'], total: null },
  { cells: ['R1C5', 'R1C6'], total: 8 },
  { cells: ['R1C8', 'R2C8', 'R3C8', 'R3C7'], total: 26 },
  { cells: ['R1C9', 'R2C9'], total: 12 },
  { cells: ['R4C7', 'R5C7'], total: null },
  { cells: ['R4C8', 'R5C8', 'R4C9'], total: 14 },
  { cells: ['R6C6', 'R6C7', 'R6C8'], total: null },
  { cells: ['R7C6', 'R8C6', 'R8C7', 'R7C7'], total: 20 },
  { cells: ['R7C8', 'R8C8', 'R8C9'], total: 19 },
  { cells: ['R9C9', 'R9C8'], total: 3 },
  { cells: ['R7C4', 'R8C4', 'R8C5', 'R7C5'], total: null },
  { cells: ['R7C2', 'R8C2', 'R8C3'], total: null },
  { cells: ['R9C2', 'R9C3', 'R9C4'], total: null },
  { cells: ['R5C3', 'R5C4'], total: null },
  { cells: ['R4C5', 'R5C5', 'R5C6', 'R4C6'], total: 23 },
];
const cageConstraints = CAGES.map(({ cells, total }) =>
  total === null ? new AllDifferent(...cells) : new Cage(total, ...cells));

// All-or-nothing membership: a Pair chain over each cage's own cell order
// (array-position binding, not grid adjacency) transitively forces every
// cell in a cage to share one on/off-path status.
const sameOnOffKey = Pair.fnToKey((a, b) => (a === OFF) === (b === OFF), CODE_COUNT);
const cageMembership = CAGES.map(({ cells }) =>
  new Pair(sameOnOffKey, 'cage-onoff', ...shape.at(cells)));

// Boundary-crossing count: for each cage, the shape codes of its own cells
// that face an outside cell, in order, checked against that specific
// direction's predicate. Accepting count 0 (avoided) or the expected count
// (a full, single, contiguous visit) forbids leaving and later returning.
function boundaryEdges(cageCells) {
  const inSet = new Set(cageCells);
  const edges = [];
  for (const cell of cageCells) {
    for (const d of DIR_DEFS) {
      const nb = graph.step(cell, d.dR, d.dC);
      if (nb && !inSet.has(nb)) edges.push({ cell, pred: d.pred });
    }
  }
  return edges;
}
function boundarySpec(preds, expected) {
  return NFA.encodeSpec({
    startState: { idx: 0, count: 0 },
    transition: (state, code) => {
      // As in modularSpec: absorb any exploration past this cage's own
      // boundary-edge count unchanged, rather than indexing past `preds`.
      if (state.idx >= preds.length) return state;
      return { idx: state.idx + 1, count: state.count + (preds[state.idx](code) ? 1 : 0) };
    },
    accept: ({ count, idx }) => idx >= preds.length && (count === 0 || count === expected),
    maxDepth: preds.length + 2,
  }, CODE_COUNT);
}
const cageBoundaryChecks = CAGES.map(({ cells }) => {
  const edges = boundaryEdges(cells);
  const expected = (cells.includes(START) || cells.includes(END)) ? 1 : 2;
  const spec = boundarySpec(edges.map(e => e.pred), expected);
  return new NFA(spec, 'cage-boundary', ...shape.at(edges.map(e => e.cell)));
});

// --- Streetlamps (the drawn gold-filled circles) ---
const LAMP_CELLS = [
  'R1C1', 'R2C3', 'R1C5', 'R1C8', 'R3C7', 'R3C4', 'R4C2', 'R5C5',
  'R5C6', 'R6C3', 'R7C4', 'R8C2', 'R8C6', 'R8C7', 'R9C9',
];
const LAMP_SET = new Set(LAMP_CELLS);
const NON_LAMP_CELLS = gridCells.filter(c => !LAMP_SET.has(c));

// Every streetlamp is on the path, unconditionally (true regardless of which
// modular set turns out to be "the" streetlamp set below).
const lampsOnPath = LAMP_CELLS.map(cell => new Given(shape.at(cell), ...ON_CODES));

// Which modular set (digit mod 3) the streetlamps share is not given by the
// rules -- Or over the 3 choices. In each branch: every streetlamp holds a
// digit of that class, and every non-streetlamp cell is barred from holding
// that class while on the path (an off-path cell may hold it freely).
function classDigits(m) {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d % 3 === m);
}
const lampModularBranches = [0, 1, 2].map(m => {
  const gateKey = Pair.fnToKey((code, digit) => code === OFF || digit % 3 !== m, CODE_COUNT);
  return new And([
    ...LAMP_CELLS.map(cell => new Given(cell, ...classDigits(m))),
    ...NON_LAMP_CELLS.map(cell => new Pair(gateKey, 'lamp-gate', shape.at(cell), cell)),
  ]);
});
const lampModular = new Or(lampModularBranches);

return [
  new Shape('9x9', 11),
  shape.toVar('path shape'),
  digitDomains,
  ...shapeDomains,
  ...edgeAgreements,
  connectivity,
  ...modularChecks,
  ...cageConstraints,
  ...cageMembership,
  ...cageBoundaryChecks,
  ...lampsOnPath,
  lampModular,
];
