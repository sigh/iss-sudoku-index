// Title: Draw Your Own Thermo Sudoku
// Author: No-Feet Mcgee
// Video: https://www.youtube.com/watch?v=T3RWJ9KtaEE
// Source: https://app.crackingthecryptic.com/webapp/JFDJD8j4nf

// Normal sudoku rules. The big circles are thermometer bulbs, the small
// circles thermometer tips (six 0.8x0.8 filled circles, six 0.3x0.3 filled
// circles). No thermometer route is drawn: each is an orthogonally-connected
// string of cells, built by the solver, that cannot overlap another
// thermometer, with digits strictly increasing from its bulb to its tip. Six
// bulbs and six tips: each bulb pairs with exactly one tip (the encoding
// below derives this pairing, it is not asserted directly -- see the note
// before IDS).
//
// One Var overlay 'VS' holds, per cell, OFF or the id of the thermometer
// (i.e. the specific bulb) that owns it: a single value per cell is
// "thermometers cannot overlap"; nothing relates cells of different ids, so
// two thermometers may run alongside each other freely.
//
// Each id's cells are pinned to a simple orthogonal path from its bulb by:
// ConnectedValues (one connected region), a degree cap of 1 at bulb/tip
// cells and a degree restricted to {0, 2} (never 1) at every other cell, and
// an induction on "digits increase": the bulb has zero smaller same-id
// neighbours, every other same-id cell (interior or tip) has exactly one.
// A connected graph with these degree limits is a disjoint union of paths
// and cycles; a cycle is impossible here because the increase rule forbids
// a strict order from closing on itself, and only bulb/tip cells are
// allowed to be a path's degree-1 ends, so it is one simple path per id,
// starting at that id's bulb.
//
// Why this forces a one-to-one bulb/tip pairing without saying so directly:
// a tip's cell is never OFF (its domain below), so all six tips take some id;
// two tips cannot share an id (that id's connected region would then need
// three degree<=1 cells -- the bulb and both tips -- but a simple path has
// only two such ends); so the six ids are six distinct tips, and since a
// bulb's id cannot appear only at its own cell (that would leave a tip
// without a usable id among the remaining five, the same contradiction),
// every bulb's path really reaches a tip. No AllDifferent or bijection
// constraint is added because none of this needs to be asserted separately.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const thermo = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Bulbs (large circles), in reading order; tips (small circles). Drawn sizes
// 0.8 and 0.3 (of a cell) respectively distinguish the two circle kinds.
const BULBS = ['R2C9', 'R3C8', 'R5C8', 'R6C1', 'R8C2', 'R8C9'];
const TIPS = ['R1C1', 'R2C7', 'R4C1', 'R4C4', 'R7C3', 'R7C6'];

const OFF = 1;
const IDS = BULBS.map((_, i) => i + 2); // one id per bulb, values 2..7
const isBulb = (cell) => BULBS.includes(cell);
const isTip = (cell) => TIPS.includes(cell);

// Domain per cell: a bulb is fixed to its own id; a tip takes any id but
// never OFF (it must be some thermometer's end); every other cell takes OFF
// or any id. Values 8 and 9 are never given: an isolated or cyclic use of
// either is rejected by the increase rule below (a used cell with no
// same-id neighbour fails "exactly one smaller neighbour", and a same-id
// cycle cannot satisfy a strict order), so restricting the domain changes
// nothing about the solution set.
// A blanket OFF-or-any-id domain replicated over every VS cell (template
// anchored at the overlay's own first cell, as makeReplicate requires),
// narrowed at bulb and tip cells by a second Given, which the solver
// intersects with the first.
const domain = [
  thermo.makeReplicate(new Given(thermo.at(gridCells[0]), OFF, ...IDS)),
  ...BULBS.map((cell, i) => new Given(thermo.at(cell), IDS[i])),
  ...TIPS.map((cell) => new Given(thermo.at(cell), ...IDS)),
];

const connectivity = IDS.map((id) => new ConnectedValues('VS', id));

// Degree: counts same-id orthogonal neighbours of a cell already known (by
// its own value) not to be OFF. `cap` is a plain upper bound (any count from
// 0 up to cap); `exclude1` additionally rejects a count of exactly 1, so a
// non-bulb/tip cell can only be off-path (0 same-id neighbours) or interior
// to a path (2), never a spurious third path-end.
const degreeMachine = (cap, exclude1) => NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') {
      return value === OFF ? { ignore: true } : { id: value, count: 0 };
    }
    if (state.ignore) return state;
    const count = state.count + (value === state.id ? 1 : 0);
    return count > cap ? undefined : { id: state.id, count };
  },
  accept: (state) => state.ignore === true ||
    (exclude1 ? state.count !== 1 : true),
}, geometry.numValues);
const anchorDegree = degreeMachine(1, false);
const middleDegree = degreeMachine(2, true);
const degreeRules = gridCells.map((cell) => new NFA(
  (isBulb(cell) || isTip(cell)) ? anchorDegree : middleDegree,
  'thermo-degree', thermo.at(cell), ...thermo.at(graph.neighbours(cell))));

// Increase: reads [own id, own digit, then each neighbour's id and digit].
// `target` same-id neighbours must hold a strictly smaller digit than this
// cell: 0 at a bulb (the low end), 1 everywhere else a thermometer runs
// (its one predecessor, whether this cell is interior with two same-id
// neighbours or a tip with only one).
const increaseMachine = (target) => NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') {
      return value === OFF ? { ignore: true } : { phase: 'digit', id: value };
    }
    if (state.ignore) return state;
    if (state.phase === 'digit') {
      return { phase: 'neighbour', id: state.id, digit: value, count: 0 };
    }
    if (state.phase === 'neighbour') {
      return { ...state, phase: 'neighbourDigit', match: value === state.id };
    }
    const count = state.count + (state.match && value < state.digit ? 1 : 0);
    if (count > target) return undefined;
    return { phase: 'neighbour', id: state.id, digit: state.digit, count };
  },
  accept: (state) => state.ignore === true || state.count === target,
}, geometry.numValues);
const bulbIncrease = increaseMachine(0);
const otherIncrease = increaseMachine(1);
const increaseRules = gridCells.map((cell) => new NFA(
  isBulb(cell) ? bulbIncrease : otherIncrease,
  'thermo-increase', thermo.at(cell), cell,
  ...graph.neighbours(cell).flatMap((n) => [thermo.at(n), n])));

return [
  new Shape('9x9'),
  thermo.toVar('thermometer path'),
  ...domain,
  ...connectivity,
  ...degreeRules,
  ...increaseRules,
];
