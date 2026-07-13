// Title: Douro
// Author: Xenonetix
// Video: https://www.youtube.com/watch?v=eZi4pISOrBQ
// Source: https://sudokupad.app/kbrkvktac9

// Normal sudoku rules apply. There is a one-cell-wide "river" of
// orthogonally-connected cells snaking from R9C9 to R1C2, without branching
// or touching itself orthogonally (it may touch diagonally). Digits along
// the river differ by at least 5. Every other cell is "land".
//
// River membership is modelled as a whole-grid ON/OFF Var overlay (VR): a
// degree NFA over orthogonal cell adjacency (graph.neighbours) gives the two
// stated endpoints exactly
// one on-river neighbour and every other on-river cell exactly two, and a
// ConnectedValues over the ON cells forces the whole layer into a single
// connected component. A connected graph whose degree sequence is exactly
// two degree-1 vertices and all-degree-2 otherwise is necessarily one
// simple path between those two vertices -- branching would push some
// cell's degree above 2, and a second disjoint fragment would break
// connectivity. Because the degree count is over genuine orthogonal
// cell-adjacency, this also already forbids orthogonal self-touching (a
// touching, non-consecutive on cell would push degree past 2); diagonal
// touching is untouched by an orthogonal-neighbour count and is allowed by
// the rules, so no separate no-diagonal-touch machine is added (contrast
// with loop/path puzzles that forbid diagonal touch too).
//
// Six drawn "bridges" cross the river at fixed grid positions and join two
// land cells on opposite sides of the crossed cell; the bridge value is the
// sum of the two land digits. Those six crossed cells are necessarily river
// cells (a bridge only crosses a river cell), so they are pinned ON
// directly; the rules call the two joined cells "land cells" by name, so
// they are pinned OFF directly too. Their sum relations are encoded as
// Arrow constraints (river cell = circle, the two land cells = shaft):
//   - horizontal bridge over R5C4, joining R5C3 and R5C5
//   - horizontal bridge over R5C2, joining R5C1 and R5C3
//   - vertical bridge over R6C5, joining R5C5 and R7C5
//   - vertical bridge over R6C6, joining R5C6 and R7C6
//   - diagonal bridge over the corner cell R3C8, joining R2C9 and R4C7
//   - diagonal bridge over the corner cell R8C7, joining R7C6 and R9C8
//
// "Diagonal bridges only cross river corners": R3C8 and R8C7 are not just
// on-river but must be a turn of the path, not a straight pass-through. A
// small NFA reads the four orthogonal neighbours in the fixed LEFT, RIGHT,
// UP, DOWN order (env.js graph.neighbours) and rejects the straight-through
// shapes (LEFT&RIGHT on, or UP&DOWN on); combined with the degree-2 rule
// (exactly two on-neighbours), this leaves only the four turn shapes.
//
// Digit rule: with the membership overlay and its degree/connectivity proof
// above, any two orthogonally-adjacent grid cells that are BOTH river cells
// are necessarily path-consecutive (a non-consecutive touch would itself be
// the forbidden self-touch, which the degree model already excludes). So
// the "digits along the river differ by at least 5" rule is enforced over
// every orthogonal grid edge, conditioned on both endpoints being river
// cells: an NFA reads (membership, digit) for each of the two cells and
// only restricts the digits when both memberships are ON.
//
// Fog/reveal wiring (foglight, triggereffect) is solving presentation, not
// a final-grid rule, and is not encoded.

const ON = 1;   // river-membership values, stored in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// The river-membership Var cell paired with each grid cell (VR1..VR81).
const river = graph.makeOverlay('VR');
const riverCell = cell => river.at(cell);

const gridCells = graph.cells();

const START = 'R9C9';
const END = 'R1C2';
const endpoints = [START, END];

// The six bridge-crossed cells: forced river cells by "bridges only cross
// river cells", independent of the rest of the unknown path.
const bridgeCells = ['R5C4', 'R5C2', 'R6C5', 'R6C6', 'R3C8', 'R8C7'];

// --- River membership: every cell is on (1) or off (2). The two stated
// endpoints and the six bridge-forced cells are pinned ON; everything else
// is left for the solver.
const originCell = river.cells()[0];

// The bridge shafts: the rules name these "land cells" explicitly, so they
// are pinned OFF (deduplicated -- some cells are shared between bridges).
const bridgeLandCells = [...new Set([
  'R5C3', 'R5C5', 'R5C1', 'R7C5', 'R5C6', 'R7C6', 'R2C9', 'R4C7', 'R9C8',
])];

// --- Single connected river path: the on-river cells form one connected
// region. Combined with the degree rules below (degree 1 at the two stated
// endpoints, degree 2 elsewhere on-river), this forces the on-river cells
// to form exactly one simple path from R9C9 to R1C2.

// --- Degree: endpoints have exactly one on-river orthogonal neighbour;
// every other on cell has exactly two; off cells are free. Reads the
// membership of the cell, then of each orthogonal neighbour.
const makeDegreeMachine = requiredDegree => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > requiredDegree ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === requiredDegree,
}, geometry.numValues);
const degree1Machine = makeDegreeMachine(1);
const degree2Machine = makeDegreeMachine(2);

// --- Diagonal-bridge corners: R3C8 and R8C7 must be a path turn, not a
// straight pass-through, so the on-river neighbour pair may not be the
// opposite LEFT/RIGHT or UP/DOWN pair.
const cornerMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen }, value) => {
    if (seen === null) return { seen: null };
    const next = [...seen, value === ON];
    if (next.length < 4) return { seen: next };
    const [l, r, u, d] = next;
    return (l && r) || (u && d) ? undefined : { seen: null };
  },
  accept: ({ seen }) => seen === null,
}, geometry.numValues);

// --- Bridges: river-cell value = sum of the two land cells at its ends.

// --- River digit rule: for every orthogonally-adjacent cell pair, if both
// are river cells (necessarily path-consecutive, per the header proof)
// their digits differ by at least 5. Reads membership then digit for each
// of the two cells in turn; vacuous unless both memberships are ON.
const riverDiffMachine = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    const { phase } = state;
    if (phase === 0) return { phase: 1, mA: value };
    if (phase === 1) return { phase: 2, mA: state.mA, dA: value };
    if (phase === 2) return { phase: 3, mA: state.mA, dA: state.dA, mB: value };
    const { mA, dA, mB } = state;
    if (mA === ON && mB === ON) {
      return Math.abs(dA - value) >= 5 ? { phase: 'done' } : undefined;
    }
    return { phase: 'done' };
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const seenEdges = new Set();

return [
  new Shape('9x9'),
  river.toVar('river'),
  new Replicate([new Given(originCell, ON, OFF)],
    Replicate.encodeTargetCells(river.cells(), originCell, river), originCell),
  ...endpoints.map(cell => new Given(riverCell(cell), ON)),
  ...bridgeCells.map(cell => new Given(riverCell(cell), ON)),
  ...bridgeLandCells.map(cell => new Given(riverCell(cell), OFF)),
  new ConnectedValues('VR', ON),
  ...gridCells.map(cell => {
    const machine = endpoints.includes(cell) ? degree1Machine : degree2Machine;
    return new NFA(machine, 'degree', riverCell(cell), ...graph.neighbours(cell).map(riverCell));
  }),
  ...['R3C8', 'R8C7'].map(cell => new NFA(cornerMachine, 'corner', ...graph.neighbours(cell).map(riverCell))),
  new Arrow('R5C4', 'R5C3', 'R5C5'),
  new Arrow('R5C2', 'R5C1', 'R5C3'),
  new Arrow('R6C5', 'R5C5', 'R7C5'),
  new Arrow('R6C6', 'R5C6', 'R7C6'),
  new Arrow('R3C8', 'R2C9', 'R4C7'),
  new Arrow('R8C7', 'R7C6', 'R9C8'),
  ...gridCells.flatMap(a =>
    graph.neighbours(a).flatMap(b => {
      const key = [a, b].sort().join('-');
      if (seenEdges.has(key)) return [];
      seenEdges.add(key);
      return [new NFA(riverDiffMachine, 'river-diff', riverCell(a), a, riverCell(b), b)];
    })
  ),
];
