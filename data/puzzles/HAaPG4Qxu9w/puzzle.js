// Title: Allegory
// Author: Dumediat and Piatato
// Video: https://www.youtube.com/watch?v=HAaPG4Qxu9w
// Source: https://sudokupad.app/x5qynmcg31

// No sudoku digits. Draw a single non-intersecting loop through the centres of
// some cells, moving orthogonally, passing through every circle. Black circles
// are turns with a straight cell on each side; white circles are straights with
// a turn on at least one side. Every orthogonally-connected group of cells the
// loop does not visit must be connected to the edge of the grid.
//
// The board holds the puzzle's own solution-check convention: 1 in every
// non-turning cell (off the loop, or a straight loop cell) and 2 in every
// turning cell.
//
// Loop model: a per-cell "shape" Var (OFF, straight HORIZ/VERT, or one of four
// turn corners UL/UR/DL/DR) records which two (or zero) of a cell's four edges
// the loop uses -- same technique as VCPmKKtMbTc ("Modular Masyu"). Edge
// agreement between neighbours (Pair) joins matching shapes into loops.
// ConnectedValues over the on-loop codes gives a *partial* single-loop closure
// only: sound but incomplete for a loop that is allowed to touch itself. It
// rejects a fully separate loop fragment, but not a second loop running
// cell-adjacent to the first without a shared edge.
//
// Border connectivity ("every non-loop group reaches the grid edge") reuses
// the Euler-characteristic corner-weight identity from Ne8IBsQVnjM/Dvu3m3GMM0w
// ("Killer Cave" / "Fogrotto"): with on-loop cells held to one connected
// region by the same ConnectedValues above, a non-loop pocket sealed away from
// the border would be a second enclosed component, so the corner sum -- +1 for
// a single on-loop cell at a lattice corner, -1 for three, -2 for an on-loop
// diagonal pair, 0 otherwise (off-grid counted as non-loop) -- must equal
// exactly 4 (one hole: the outside).

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const ON_CODES = [HORIZ, VERT, UL, UR, DL, DR];
const ALL_SHAPES = [OFF, ...ON_CODES];
const TURN_CODES = [UL, UR, DL, DR];
const NONTURN_CODES = [OFF, HORIZ, VERT];
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const isTurn = s => TURN_CODES.includes(s);

const SIDE = 12;
// Widened alphabet: shape codes need 1-7, the corner-weight identity below
// needs 0-3, and the board only ever holds 1 or 2. 0-7 covers all three on
// one shared value range. Pass the Shape constraint itself to cellGraph --
// a bare "12x12" dims string would default back to a 12-value Sudoku-style
// geometry and silently drop this widened range.
const shapeConstraint = new Shape(SIDE + 'x' + SIDE, '0-7', 'Raw');
const graph = cellGraph(shapeConstraint);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shape = graph.makeOverlay('VS');
const shapeCell = cell => shape.at(cell);
const shapeVar = shape.toVar('shape');

// Black (turn) and white (straight) circle positions, from the drawn filled
// circles (black-filled vs white-filled-with-black-border). Rows/columns
// above 9 need makeCellId (the grid is 12 wide, so plain R#C# text would
// misparse columns/rows 10-12).
const BLACK = [
  [2, 2], [2, 4], [2, 8], [2, 10], [6, 2], [8, 3], [10, 9], [11, 6], [11, 8],
].map(([r, c]) => makeCellId(r, c));
const WHITE = [
  [4, 7], [5, 6], [5, 11], [7, 11], [8, 9], [10, 3], [10, 11],
].map(([r, c]) => makeCellId(r, c));

const DIRS = ['up', 'down', 'left', 'right'];
const usesDir = { up: usesUp, down: usesDown, left: usesLeft, right: usesRight };
const dirStep = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const presentDirs = cell => DIRS.filter(d => graph.step(cell, ...dirStep[d]));

// --- Shape domains: an edge code may only be used where the neighbour exists.
// A uniform Replicate excludes the corner-weight sentinel value 0 from every
// shape cell; only the perimeter (44 cells) then needs a further, narrower
// Given for the edge(s) it has no neighbour across.
const shapeBaseDomain = shape.makeReplicate(new Given(shape.cells()[0], ...ALL_SHAPES));
const shapeBoundaryDomains = gridCells.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  const disallowed = ALL_SHAPES.filter(s =>
    (row === 1 && usesUp(s)) || (row === SIDE && usesDown(s)) ||
    (col === 1 && usesLeft(s)) || (col === SIDE && usesRight(s)));
  if (!disallowed.length) return [];
  return [new Given(shapeCell(cell), ...ALL_SHAPES.filter(s => !disallowed.includes(s)))];
});

// Every circle is on the loop: white circles are straight, black circles turn.
const circleDomains = [
  ...WHITE.map(cell => new Given(shapeCell(cell), HORIZ, VERT)),
  ...BLACK.map(cell => new Given(shapeCell(cell), ...TURN_CODES)),
];

// --- Edge agreement: neighbours must agree on the shared edge -- one cell
// uses the edge towards the other iff the other uses it back.
const edgeAgreeKey = (toB, toA) =>
  Pair.fnToKey((a, b) => toB(a) === toA(b), geometry);
const edgeAgreeRightKey = edgeAgreeKey(usesRight, usesLeft);
const edgeAgreeDownKey = edgeAgreeKey(usesDown, usesUp);
const edgeAgreementConstraints = [
  shape.makeReplicate(
    [new Pair(edgeAgreeRightKey, 'edge-h', shapeCell('R1C1'), shapeCell('R1C2'))],
    shape.at(gridCells.filter(cell => graph.step(cell, 0, 1)))),
  shape.makeReplicate(
    [new Pair(edgeAgreeDownKey, 'edge-v', shapeCell('R1C1'), shapeCell('R2C1'))],
    shape.at(gridCells.filter(cell => graph.step(cell, 1, 0)))),
];

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
  }, geometry);
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
  }, geometry);
}
const whiteRules = WHITE.map(cell => {
  const dirs = presentDirs(cell);
  const neighbourShapes = dirs.map(d => shapeCell(graph.step(cell, ...dirStep[d])));
  return new NFA(whiteMachine(dirs), 'white-turn-side', shapeCell(cell), ...neighbourShapes);
});

// Single connected on-loop region -- see the header comment for what this
// does and does not close.
const loopConnected = new ConnectedValues('VS', ON_CODES);

// --- Board = solution-check convention: 1 for a non-turning cell (off-loop or
// straight), 2 for a turning cell.
const boardDomains = graph.makeReplicate(new Given(gridCells[0], 1, 2));
const boardTurnLink = gridCells.map(cell => new Or([
  new And([new Given(shapeCell(cell), ...NONTURN_CODES), new Given(cell, 1)]),
  new And([new Given(shapeCell(cell), ...TURN_CODES), new Given(cell, 2)]),
]));

// --- Border connectivity: every non-loop group reaches the grid edge -------
// Euler-characteristic corner-weight identity (Ne8IBsQVnjM / Dvu3m3GMM0w),
// reused unchanged in structure: a lattice corner's weight comes from the
// on-loop/non-loop pattern of its four surrounding cells (off-grid counted as
// non-loop). With the on-loop cells already held to one connected region
// (loopConnected above), summing every corner's weight to exactly 4 forces
// zero enclosed non-loop components -- i.e. every non-loop group reaches the
// border.
const CORNER_OFFSET = 2;    // weights are -2..+1; cells hold weight + offset
const corners = new Var('E', 'border corner weight', (SIDE + 1) + 'x' + (SIDE + 1));
const outside = new Var('O', 'off-grid cell', 1);
const outsideCell = outside.cell(1);

const cornerWeightMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: (state, value) => {
    if (state.done === true) return undefined;   // the weight cell is last
    if (state.seen.length < 4) {
      if (!ALL_SHAPES.includes(value)) return undefined;
      return { seen: [...state.seen, value] };
    }
    const [tl, tr, bl, br] = state.seen.map(v => v === OFF ? 0 : 1);
    const count = tl + tr + bl + br;
    const diagonal = (tl && br) || (tr && bl);
    const weight = count === 1 ? 1
      : count === 3 ? -1
        : (count === 2 && diagonal) ? -2 : 0;
    return value === weight + CORNER_OFFSET ? { done: true } : undefined;
  },
  accept: (state) => state.done === true,
}, geometry);

// Lattice corner (r, c) for r, c in 1..SIDE+1 sits above-left of grid cell RrCc.
const latticeIndices = Array.from({ length: SIDE + 1 }, (_, i) => i + 1);
const cornerAt = (r, c) => {
  const inGrid = (row, col) => row >= 1 && row <= SIDE && col >= 1 && col <= SIDE;
  const window = [[r - 1, c - 1], [r - 1, c], [r, c - 1], [r, c]].map(
    ([row, col]) => inGrid(row, col)
      ? shapeVar.cell(row, col) : outsideCell);
  return {
    cell: corners.cell(r, c),
    rule: new NFA(cornerWeightMachine, 'border-corner-weight',
      ...window, corners.cell(r, c)),
  };
};
const cornerRules = latticeIndices.flatMap(
  r => latticeIndices.map(c => cornerAt(r, c)));
const noEnclosedNonLoop = new Sum(
  4 + CORNER_OFFSET * cornerRules.length, ...cornerRules.map(c => c.cell));

return [
  shapeConstraint,
  boardDomains,
  shapeVar,
  shapeBaseDomain,
  ...shapeBoundaryDomains,
  ...circleDomains,
  ...edgeAgreementConstraints,
  ...blackRules,
  ...whiteRules,
  loopConnected,
  ...boardTurnLink,
  corners,
  outside,
  new Given(outsideCell, OFF),
  ...cornerRules.map(c => c.rule),
  noEnclosedNonLoop,
];
