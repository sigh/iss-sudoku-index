// Title: ThermoMaze
// Author: Evernerd
// Video: https://www.youtube.com/watch?v=Up-P-k4qeM0
// Source: https://app.crackingthecryptic.com/webapp/fr2r2bQFGG
//
// Standard 9x9 sudoku, standard 3x3 boxes. Five thermometers increase from
// their bulb. There is one path of orthogonally-connected ODD digits,
// starting at R5C5 and ending at one of the four corners, that does not
// cross any thermometer.
//
// The path is modelled as an independent membership overlay ('VP', ON/OFF)
// rather than reusing every odd cell in the grid: the rules assert a path
// exists made of odd digits, not that every odd digit belongs to it, and the
// second (exhaustive) reading is unsatisfiable by simple arithmetic -- each
// thermometer has at least 5 cells needing that many distinct strictly
// increasing values, but only 4 even digits (2,4,6,8) exist, so no
// thermometer's cells could all be forced non-path/even. The path is
// therefore a solver-chosen subset:
// - on-path (ON) forces the grid cell odd (one direction only; an off-path
//   cell may be odd or even).
// - ConnectedValues over 'VP' ties the ON cells into one connected region.
// - A per-cell NFA reads a cell's own membership then each orthogonal
//   neighbour's membership and counts ON neighbours (capped at 2, since no
//   path cell may have 3+ path neighbours). OFF cells are unconstrained.
//   R5C5 is given ON and must show exactly 1 ON neighbour (a path end, not a
//   pass-through); each of the four corners may show 1 (the path's other
//   end) or 2 (on-path but not the chosen end -- only possible as a
//   same-degree pass-through, since a corner has just 2 neighbours); every
//   other ON cell must show exactly 2.
//   A connected graph with all degrees <= 2 is a disjoint union of paths and
//   cycles; forcing R5C5 to degree 1 rules out a cycle, so the single
//   connected ON-region is forced to be one simple path with R5C5 as one
//   end. The handshake lemma (a graph has an even number of odd-degree
//   vertices) then forces exactly one more degree-1 vertex to exist;
//   non-corner cells are pinned to degree 2, so that vertex can only be a
//   corner -- which is exactly "ends in one of the four corners", with no
//   separate disjunction needed.
// "Does not cross any thermometer" is read as: every thermometer cell is
// forced OFF the path (it may still hold an odd digit, just not as part of
// this connected path).

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const ON = 1;
const OFF = 2;
const isOdd = (value) => value % 2 === 1;

// --- Givens ---
const givens = [
  new Given('R1C1', 3), new Given('R1C4', 9), new Given('R1C5', 8),
  new Given('R1C9', 5), new Given('R2C9', 9), new Given('R3C6', 1),
  new Given('R5C1', 6), new Given('R5C9', 4), new Given('R8C1', 9),
  new Given('R9C5', 4), new Given('R9C8', 9), new Given('R9C9', 3),
];

// --- Thermometers, bulb-first (some source lines were drawn tip-first, so
// the cell order here is the reverse of the drawn waypoint order for those).
const thermos = [
  new Thermo('R6C4', 'R5C4', 'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6'),
  new Thermo('R2C5', 'R2C4', 'R2C3', 'R2C2', 'R3C2'),
  new Thermo('R5C2', 'R6C2', 'R7C2', 'R8C2', 'R8C3'),
  new Thermo('R8C5', 'R8C6', 'R8C7', 'R8C8', 'R7C8'),
  new Thermo('R5C8', 'R4C8', 'R3C8', 'R2C8', 'R2C7'),
];
const thermoCells = [
  'R6C4', 'R5C4', 'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6',
  'R2C5', 'R2C4', 'R2C3', 'R2C2', 'R3C2',
  'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R8C3',
  'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R7C8',
  'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R2C7',
];

const centerCell = 'R5C5';
const cornerCells = ['R1C1', 'R1C9', 'R9C1', 'R9C9'];

// --- Path membership overlay: one Var per grid cell, ON or OFF. ---
const path = graph.makeOverlay('VP');
const originCell = path.cells()[0];
const membership = [
  // Restrict every cell in the overlay to exactly {ON, OFF}.
  path.makeReplicate(new Given(originCell, ON, OFF)),
  new Given(path.at(centerCell), ON),
  ...path.at(thermoCells).map(cell => new Given(cell, OFF)),
];

// --- Link: an on-path cell's digit must be odd; off-path is unconstrained.
const oddOnPathKey = Pair.fnToKey(
  (membership, digit) => membership === OFF || isOdd(digit), geometry.numValues);
const links = gridCells.map(cell => new Pair(oddOnPathKey, 'odd-on-path', path.at(cell), cell));

// --- Degree: a factory NFA parameterised by the allowed ON-neighbour counts
// for an ON cell, reading membership only (not the grid digit).
function makeDegreeMachine(allowedDegrees) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, value) => {
      if (phase === 'start') {
        return value === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (value === ON ? 1 : 0);
      return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) =>
      phase === 'off' || allowedDegrees.includes(onNeighbours),
  }, geometry.numValues);
}
const centerMachine = makeDegreeMachine([1]);
const cornerMachine = makeDegreeMachine([1, 2]);
const genericMachine = makeDegreeMachine([2]);

const degrees = gridCells.map(cell => {
  const machine = cell === centerCell ? centerMachine
    : cornerCells.includes(cell) ? cornerMachine
      : genericMachine;
  return new NFA(machine, 'path-degree', path.at(cell), ...path.at(graph.neighbours(cell)));
});

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
  path.toVar('path'),
  ...membership,
  // The on-path cells form one connected region.
  new ConnectedValues('VP', ON),
  ...links,
  ...degrees,
];
