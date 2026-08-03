// Title: The Squaretaker
// Author: haleypro
// Video: https://www.youtube.com/watch?v=RRQMn8JU4q8
// Source: https://sudokupad.app/x07h2149k1

// Standard 9x9 sudoku. Black lines are renbans, blue lines are thermos (bulb
// at the first, thicker-marked cell), grey lines are region sum lines, and
// yellow circles mark odd cells.
//
// A hidden thermo also runs between the two marked cells Delta (R5C5) and
// alpha (R1C9): a solver-discovered simple orthogonal path whose bulb end is
// not given, and which may not use any cell of the renban loop. It is
// encoded as a Var overlay 'VH' holding, per cell, whether the cell lies on
// that hidden path (ON) or not (OFF); Delta and Alpha are forced ON as the
// path's two stated ends, the renban-loop cells are forced OFF, degree rules
// plus ConnectedValues pin the ON cells to one simple path between Delta and
// Alpha, and an Or over the two possible bulb ends builds the induction
// chain that makes digits strictly increase away from whichever end the
// solver picks as the bulb.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const path = graph.makeOverlay('VH');
const gridCells = graph.cells();

const DELTA = 'R5C5';
const ALPHA = 'R1C9';
// Renban-loop cells (see below): the hidden thermo may not cross them.
const RENBAN = ['R1C4', 'R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6', 'R1C5'];

const OFF = 1, ON = 2;
const isEndpoint = (cell) => cell === DELTA || cell === ALPHA;

// Domain: every cell may be on or off the hidden path by default (one
// replicated template over the whole grid); Delta/Alpha are then narrowed to
// on and the renban-loop cells to off, intersecting with that default.
const pathDomain = [
  path.makeReplicate(
    new Given(path.at(gridCells[0]), OFF, ON), path.at(gridCells)),
  ...gridCells.filter(isEndpoint).map((cell) => new Given(path.at(cell), ON)),
  ...RENBAN.map((cell) => new Given(path.at(cell), OFF)),
];

// Degree: Delta and Alpha (the path's two stated ends) have at most one
// on-path neighbour; every other on-path cell has at most two. Connected
// (below) with max degree 2 and two forced-<=1-degree cells rules out a
// cycle, so this is a single simple path with Delta and Alpha as its ends.
// Reads [own value, value of each orthogonal neighbour] and counts ON hits.
const degreeMachine = (maxDegree) => NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') {
      return value === OFF ? { ignore: true } : { count: 0 };
    }
    if (state.ignore) return state;
    const count = state.count + (value === ON ? 1 : 0);
    return count > maxDegree ? undefined : { count };
  },
  accept: () => true,
}, geometry.numValues);
const pathDegree = [2, 1].map(degreeMachine);
const degreeRules = gridCells.map((cell) => new NFA(
  pathDegree[isEndpoint(cell) ? 1 : 0], 'hidden-thermo-degree',
  path.at(cell), ...path.at(graph.neighbours(cell))));

// One connected ON region: with the degree rules above, this pins the ON
// cells to exactly one simple path (no separate branch or loop).
const connectivity = new ConnectedValues('VH', ON);

// Digits strictly increase from the bulb end to the far end. Which end is
// the bulb is not given, so build the induction chain from each candidate
// bulb and let the solver choose the branch that holds (Or, below). At the
// hypothesised bulb no same-path neighbour may hold a smaller digit; every
// other on-path cell has exactly one (the neighbour one step closer to the
// bulb), which chains the increase outward across the whole path.
// Reads [own value, own digit, then value and digit of each neighbour].
const increaseMachine = (target) => NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') {
      return value === OFF ? { ignore: true } : { phase: 'digit' };
    }
    if (state.ignore) return state;
    if (state.phase === 'digit') {
      return { phase: 'neighbour', digit: value, count: 0 };
    }
    if (state.phase === 'neighbour') {
      return { ...state, phase: 'neighbourDigit', match: value === ON };
    }
    const count = state.count + (state.match && value < state.digit ? 1 : 0);
    if (count > target) return undefined;
    return { phase: 'neighbour', digit: state.digit, count };
  },
  accept: (state) => state.ignore === true || state.count === target,
}, geometry.numValues);
const pathIncrease = [1, 0].map(increaseMachine);
const increaseRules = (bulb) => gridCells.map((cell) => new NFA(
  pathIncrease[cell === bulb ? 1 : 0], 'hidden-thermo-increase',
  path.at(cell), cell,
  ...graph.neighbours(cell).flatMap((n) => [path.at(n), n])));

const hiddenThermo = [
  path.toVar('hidden thermo path'),
  ...pathDomain,
  ...degreeRules,
  connectivity,
  new Or([
    new And(increaseRules(DELTA)),
    new And(increaseRules(ALPHA)),
  ]),
];

return [
  new Shape('9x9'),

  new Given('R3C2', 1),
  new Given('R6C2', 7),
  new Given('R8C7', 1),
  new Given('R8C9', 4),
  new Given('R9C5', 6),

  // Odd cells (yellow circles): candidate-restricted to the odd digits.
  new Given('R1C2', 1, 3, 5, 7, 9),
  new Given('R4C1', 1, 3, 5, 7, 9),
  new Given('R4C2', 1, 3, 5, 7, 9),
  new Given('R4C5', 1, 3, 5, 7, 9),
  new Given('R4C9', 1, 3, 5, 7, 9),
  new Given('R9C4', 1, 3, 5, 7, 9),
  new Given('R9C9', 1, 3, 5, 7, 9),

  // Renban (black), closed 8-cell loop; Renban is set-based so the closing
  // edge needs no repeated cell.
  new Renban(
    'R1C4', 'R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6', 'R1C5'),

  // Region sum line (grey). The drawn stroke's waypoints revisit R7C3 as
  // their 8th/last entry; both literal readings of that revisit are
  // arithmetically impossible (walking every visit as its own segment forces
  // R8C2 = 0; reading the tail as a 6-cell closed loop that drops R8C2 forces
  // R7C3 = R7C4, which share row 7 and so must differ), so the trailing
  // duplicate is dropped and the line is encoded as its 7 distinct cells.
  new RegionSumLine('R8C2', 'R7C3', 'R7C4', 'R6C5', 'R5C5', 'R5C4', 'R6C3'),

  // Thermos (blue), bulb cell first.
  new Thermo('R7C2', 'R8C1'),
  new Thermo('R8C3', 'R9C2'),

  ...hiddenThermo,
];
