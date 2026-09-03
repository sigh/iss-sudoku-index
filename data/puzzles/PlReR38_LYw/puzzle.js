// Title: Harbor
// Author: Bert
// Video: https://www.youtube.com/watch?v=PlReR38_LYw
// Source: https://app.crackingthecryptic.com/7moj9pjur7

// Rules encoded below:
//  - Normal sudoku.
//  - The cage cells are the harbour's quay and piers. They carry no digit rule
//    of their own (the cage is not a killer cage), but they are land: never
//    water, never part of a ship, and they block a buoy's sight.
//  - Every cell outside the cage is water when its digit is 1-6 and a ship when
//    its digit is 7-9, so that split needs no constraint of its own. Ships are
//    one cell wide and two or three cells long, horizontal or vertical, and no
//    two ships touch, diagonally included.
//  - A circled cell is a buoy: it is water, and its digit counts the water cells
//    it sees along its own row and column, itself included. Piers and ships
//    block sight.
//  - "All buoys are given": the twelve circles are the whole list of buoys, so
//    no uncircled cell may be one either. A cell is a buoy exactly when it is
//    water whose digit equals its own sight count, so every uncircled water cell
//    must have a digit different from its own sight count.
//  - Digits either side of a black dot are in a 1:2 ratio. "Not all black dots
//    are given", so unmarked pairs carry no negative constraint.
//  - Crane (thermometer) digits increase from the tower (bulb).

const shape = new Shape('9x9');
const graph = cellGraph(shape);

const WATER = [1, 2, 3, 4, 5, 6];
const SHIP = [7, 8, 9];

// The single drawn cage: the quay (R4C1-R9C1 and all of row 9) plus the two
// piers reaching out from it, R6C4-R8C4 and R7C8-R8C8.
const LAND = [
  'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1',
  'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
  'R6C4', 'R7C4', 'R8C4',
  'R7C8', 'R8C8',
];
const landSet = new Set(LAND);
const seaCells = graph.cells().filter(cell => !landSet.has(cell));

// The circled cells (buoys), read off the twelve drawn circles.
const BUOYS = [
  'R1C1', 'R1C5', 'R1C9', 'R3C3', 'R3C7', 'R5C4',
  'R6C2', 'R6C8', 'R7C6', 'R7C9', 'R8C3', 'R8C5',
];

const ORTHOGONAL = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// Cells from `cell` outwards in direction (dR, dC), inclusive of `cell`,
// stopping before the first land cell or the grid edge.
const seaRun = (cell, dR, dC) => {
  const run = [];
  for (const next of graph.ray(cell, dR, dC)) {
    if (landSet.has(next)) break;
    run.push(next);
  }
  return run;
};

// Every maximal straight line of sea cells in direction (dR, dC): a run starts
// where the cell behind it is land or off-grid.
const maximalSeaRuns = (dR, dC) => seaCells
  .filter(cell => {
    const behind = graph.step(cell, -dR, -dC);
    return behind === null || landSet.has(behind);
  })
  .map(cell => seaRun(cell, dR, dC));

// The sight scan behind both buoy rules. The first segment holds the scanned
// cell alone: it fixes `target` to that cell's own digit and opens `count` at 1
// for the cell itself. Each later segment is one ray, already cut short at the
// quay or pier that blocks it, read outwards from the cell; water cells add to
// the count until the first ship cell, after which `blocked` ignores the rest of
// that ray. SEGMENT_BREAK clears `blocked` for the next ray. The count saturates
// one past `target`, which is all either acceptance test needs and keeps the
// state count finite.
const sightTransition = (state, value) => {
  if (value === SEGMENT_BREAK) {
    return { target: state.target, count: state.count, blocked: false };
  }
  if (state.target === null) return { target: value, count: 1, blocked: false };
  if (state.blocked) return state;
  if (value >= SHIP[0]) {
    return { target: state.target, count: state.count, blocked: true };
  }
  return {
    target: state.target,
    count: Math.min(state.count + 1, state.target + 1),
    blocked: false,
  };
};
const START_STATE = { target: null, count: 0, blocked: false };

// A circled cell is a buoy: its digit is its sight count.
const isBuoySpec = NFA.encodeSpec({
  startState: START_STATE,
  transition: sightTransition,
  accept: (state) => state.count === state.target,
}, shape, { multiSegment: true });

// An uncircled cell is not a buoy: either it is a ship (7-9), or its digit
// differs from its sight count.
const isNotBuoySpec = NFA.encodeSpec({
  startState: START_STATE,
  transition: sightTransition,
  accept: (state) => state.target > WATER[WATER.length - 1]
    || state.count !== state.target,
}, shape, { multiSegment: true });

// The rays leaving `cell`, each cut short where the quay or a pier blocks it,
// and empty rays dropped.
const sightRays = (cell) => ORTHOGONAL
  .map(([dR, dC]) => seaRun(cell, dR, dC).slice(1))
  .filter(ray => ray.length > 0);

const buoySet = new Set(BUOYS);
const buoySight = BUOYS.map(
  buoy => new NFA(isBuoySpec, 'buoy sight', [buoy], ...sightRays(buoy)));
const notBuoy = seaCells.filter(cell => !buoySet.has(cell)).map(
  cell => new NFA(isNotBuoySpec, 'not a buoy', [cell], ...sightRays(cell)));

// The fleet rule is enforced as three local conditions on the ship cells (the
// sea cells holding 7-9):
//   1. no two ship cells are diagonally adjacent,
//   2. no four ship cells run consecutively along a row or column,
//   3. every ship cell has an orthogonally adjacent ship cell.
// Condition 1 also rules out bends, because a bent orthogonal chain always
// contains a diagonally adjacent pair; so each orthogonally connected group of
// ship cells is a straight run, 2 and 3 hold its length to two or three, and 1
// keeps distinct runs from touching each other.
const notBothShips = Pair.fnToKey((a, b) => !(a >= SHIP[0] && b >= SHIP[0]), shape);

// Pair relates consecutive cells of its list, and consecutive cells of a
// diagonal run are exactly the diagonally adjacent sea pairs.
const noDiagonalContact = [...maximalSeaRuns(1, 1), ...maximalSeaRuns(1, -1)]
  .filter(run => run.length >= 2)
  .map(run => new Pair(notBothShips, 'ships do not touch', ...run));

const noShipOfFour = [...maximalSeaRuns(0, 1), ...maximalSeaRuns(1, 0)]
  .flatMap(run => run
    .slice(3)
    .map((_, i) => new Or(
      run.slice(i, i + 4).map(cell => new Given(cell, ...WATER)))));

const noShipOfOne = seaCells.map(cell => new Or([
  new Given(cell, ...WATER),
  ...ORTHOGONAL
    .map(([dR, dC]) => graph.step(cell, dR, dC))
    .filter(next => next !== null && !landSet.has(next))
    .map(next => new Given(next, ...SHIP)),
]));

return [
  shape,
  new Given('R1C1', 5),

  // Buoys are water, and their digit is the printed 1-6 range.
  ...BUOYS.map(buoy => new Given(buoy, ...WATER)),
  ...buoySight,
  ...notBuoy,

  ...noDiagonalContact,
  ...noShipOfFour,
  ...noShipOfOne,

  // Black dots.
  new BlackDot('R3C3', 'R4C3'),
  new BlackDot('R4C4', 'R3C4'),

  // Cranes, bulb (tower) first.
  new Thermo('R6C1', 'R5C1'),
  new Thermo('R9C7', 'R8C7', 'R7C7', 'R6C7'),
  new Thermo('R8C4', 'R7C4', 'R6C4'),
];
