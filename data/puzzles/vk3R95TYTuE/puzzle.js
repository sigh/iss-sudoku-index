// Title: The Thing
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=vk3R95TYTuE
// Source: https://app.crackingthecryptic.com/sudoku/FrQ76Q9jmD

// Normal sudoku rules apply. Once in each row, column, and box, the Thing
// assimilates a number, thereby negating it (if the Thing is in R5C7 and the
// cell appears to contain a 3, its actual value is -3). Values on the blue line
// have the same sum in each 3x3 box the line is in. Values along a thermo
// increase from the bulb end. Adjacent values on a green line differ by 5 or
// more. Numbers in a circle appear once in the four surrounding cells; they may
// be genuine (positive) or they may be the Thing (negative). To successfully
// escape, you must travel from the now destroyed Outpost #31 (R2C2) to the
// helicopter (R8C8). Your path is one cell wide and may not go outside of
// Antarctica's boundary (blue line). The path which travels orthogonally may
// not contain nor be orthogonally adjacent to any of the Thing's cells.
// Adjacent values on the escape route differ by 5 or more.
//
// The puzzle has no given digits.
//
// Two quantities per cell: the sudoku digit, held by the grid cell, and the
// value, which is the digit except in the nine assimilated cells where it is
// the digit negated.

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// VT marks assimilation: 0 for an untouched cell (value = digit), otherwise the
// cell's own digit, marking it assimilated (value = -digit). Value 0 is what
// forces the widened 0-9 alphabet; the grid cells are restricted back to 1-9.
const UNTOUCHED = 0;

// VP marks escape-route membership.
const OFF = 0;
const ON = 1;

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const thing = graph.makeOverlay('VT');
const route = graph.makeOverlay('VP');

const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...DIGITS)),
  route.makeReplicate(new Given(route.cells()[0], OFF, ON)),
];

// --- The Thing: which cell of each unit is assimilated. ---

// Pairs each grid cell with its VT mark: untouched, or the cell's own digit.
const assimilationKey = Pair.fnToKey(
  (digit, mark) => mark === UNTOUCHED || mark === digit, shape);
const assimilationMarks = gridCells.map(
  cell => new Pair(assimilationKey, 'assimilated', cell, thing.at(cell)));

// Exactly one assimilated cell per row, column and box: eight of the nine marks
// in each unit are UNTOUCHED, so the ninth is not.
const eightUntouched = Array(8).fill(UNTOUCHED).join('_');
const oneThingPerUnit = graph.rowsColumnsBoxes().map(
  unit => new ContainExact(eightUntouched, ...thing.at(unit)));

// Signed value of a cell from its (digit, mark) reading; undefined for a mark
// the pairing above already excludes.
const signedValue = (digit, mark) => {
  if (mark === UNTOUCHED) return digit;
  return mark === digit ? -digit : undefined;
};

// Reads (digit, mark, digit, mark) for two cells and requires `relation` to
// hold between their two signed values.
const valueRelation = (relation) => NFA.encodeSpec({
  startState: { phase: 'digitA' },
  transition: (state, cellValue) => {
    switch (state.phase) {
      case 'digitA':
        return cellValue === 0 ? undefined
          : { phase: 'markA', digitA: cellValue };
      case 'markA': {
        const valueA = signedValue(state.digitA, cellValue);
        return valueA === undefined ? undefined : { phase: 'digitB', valueA };
      }
      case 'digitB':
        return cellValue === 0 ? undefined
          : { phase: 'markB', valueA: state.valueA, digitB: cellValue };
      case 'markB': {
        const valueB = signedValue(state.digitB, cellValue);
        if (valueB === undefined) return undefined;
        return relation(state.valueA, valueB) ? { phase: 'done' } : undefined;
      }
      default:
        return undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);

const valuePair = (machine, name) => (a, b) =>
  new NFA(machine, name, a, thing.at(a), b, thing.at(b));

// --- Blue line: the drawn closed boundary, read as its cell cycle. ---
const BLUE_LINE = [
  'R1C1', 'R2C1', 'R3C2', 'R4C2', 'R5C2', 'R6C3', 'R7C3', 'R7C4',
  'R8C5', 'R9C5', 'R9C6', 'R8C7', 'R8C8', 'R7C9', 'R6C9', 'R5C8',
  'R4C8', 'R3C8', 'R2C7', 'R2C6', 'R2C5', 'R3C4', 'R3C3', 'R2C2',
];

// Box 7 holds the single blue cell R7C3, so its box total is that cell's value;
// every other visited box is equated to it. Box 5 holds no blue cell and so is
// not a box "the line is in". Each cell contributes digit - 2*mark, which is
// +digit when untouched and -digit when assimilated.
const BLUE_REFERENCE = 'R7C3';
const blueLineSums = graph.boxes()
  .map(box => BLUE_LINE.filter(cell => box.includes(cell)))
  .filter(cells => cells.length > 0 && !cells.includes(BLUE_REFERENCE))
  .map(cells => new Sum(
    0,
    ...cells.map(cell => [cell, 1]),
    ...cells.map(cell => [thing.at(cell), -2]),
    [BLUE_REFERENCE, -1],
    [thing.at(BLUE_REFERENCE), 2]));

// --- Thermo: grey line, bulb at the crash site, waypoints R4C5-R1C8-R1C9. ---
const CRASH_SITE = 'R4C5';
const THERMO = [CRASH_SITE, 'R3C6', 'R2C7', 'R1C8', 'R1C9'];
const increasingValues = valuePair(valueRelation((a, b) => a < b), 'thermo');
const thermo = THERMO.slice(1).map(
  (cell, i) => increasingValues(THERMO[i], cell));

// --- Green lines: eight two-cell segments from the crash site to each of its
// king neighbours (the payload draws the R4C5-R3C6 segment twice). ---
const whisperValues = valuePair(
  valueRelation((a, b) => Math.abs(a - b) >= 5), 'green');
const greenLines = graph.kingNeighbours(CRASH_SITE).map(
  cell => whisperValues(CRASH_SITE, cell));

// --- Circles: each 2x2 lies wholly within one box, so its four digits are
// already distinct and "appears once" is Quad's "appears". ---
const circles = [
  new Quad('R2C2', 1, 4),
  new Quad('R5C1', 2, 3),
  new Quad('R8C5', 7),
  new Quad('R2C8', 1, 7),
];

// --- Escape route. ---
const START = 'R2C2';
const FINISH = 'R8C8';

// Antarctica's interior, derived from the drawn boundary: flood the grid from
// its border through cells the blue line does not occupy. Every diagonal step
// of the boundary has its two off-line corner cells diagonal to each other, so
// an orthogonal flood cannot leak across one.
const outsideAntarctica = new Set();
const frontier = gridCells.filter(cell => {
  const { row, col } = parseCellId(cell);
  return row === 1 || row === 9 || col === 1 || col === 9;
}).filter(cell => !BLUE_LINE.includes(cell));
frontier.forEach(cell => outsideAntarctica.add(cell));
for (let i = 0; i < frontier.length; i++) {
  for (const next of graph.neighbours(frontier[i])) {
    if (BLUE_LINE.includes(next) || outsideAntarctica.has(next)) continue;
    outsideAntarctica.add(next);
    frontier.push(next);
  }
}
const antarctica = gridCells.filter(cell => !outsideAntarctica.has(cell));

const routePlacement = [
  ...[...outsideAntarctica].map(cell => new Given(route.at(cell), OFF)),
  new Given(route.at(START), ON),
  new Given(route.at(FINISH), ON),
];

// One cell wide, orthogonal, and running end to end: the two named endpoints
// have one route neighbour, every other route cell has two, and the route cells
// form a single connected region. Reads the cell's own membership, then each
// orthogonal neighbour's; a cell off the route is unconstrained.
const degreeMachine = (degree) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, membership) => {
    if (state.phase === 'start') {
      return membership === ON ? { phase: 'on', count: 0 } : { phase: 'off' };
    }
    if (state.phase === 'off') return { phase: 'off' };
    const count = state.count + (membership === ON ? 1 : 0);
    return count > degree ? undefined : { phase: 'on', count };
  },
  accept: (state) => state.phase === 'off' || state.count === degree,
}, shape);
const endpointDegree = degreeMachine(1);
const interiorDegree = degreeMachine(2);
const routeDegrees = antarctica.map(cell => new NFA(
  cell === START || cell === FINISH ? endpointDegree : interiorDegree,
  'route-degree',
  ...route.at([cell, ...graph.neighbours(cell)])));

// A route cell is not assimilated, and neither is any of its orthogonal
// neighbours. Reads the cell's membership, then its own mark and its
// neighbours' marks.
const clearOfTheThing = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, cellValue) => {
    if (state.phase === 'start') {
      return cellValue === ON ? { phase: 'on' } : { phase: 'off' };
    }
    if (state.phase === 'off') return { phase: 'off' };
    return cellValue === UNTOUCHED ? { phase: 'on' } : undefined;
  },
  accept: () => true,
}, shape);
const routeAvoidsTheThing = antarctica.map(cell => new NFA(
  clearOfTheThing, 'route-clear',
  route.at(cell), ...thing.at([cell, ...graph.neighbours(cell)])));

// Adjacent values on the route differ by 5 or more. No route cell is
// assimilated (previous constraint), so a route cell's value is its digit.
// Reads both memberships then both digits; if either cell is off the route the
// remaining symbols are absorbed. The route is one cell wide, so two
// orthogonally adjacent route cells are always consecutive along it.
const routeWhisperMachine = NFA.encodeSpec({
  startState: { phase: 'membershipA' },
  transition: (state, cellValue) => {
    switch (state.phase) {
      case 'membershipA':
        return cellValue === ON ? { phase: 'membershipB' }
          : { phase: 'skip', left: 3 };
      case 'membershipB':
        return cellValue === ON ? { phase: 'digitA' }
          : { phase: 'skip', left: 2 };
      case 'digitA':
        return { phase: 'digitB', digitA: cellValue };
      case 'digitB':
        return Math.abs(state.digitA - cellValue) >= 5
          ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
      default:
        return undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
// Right and down steps only, so each orthogonal pair is covered once.
const routeWhispers = antarctica.flatMap(
  cell => [[0, 1], [1, 0]]
    .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
    .filter(other => other !== null && !outsideAntarctica.has(other))
    .map(other => new NFA(routeWhisperMachine, 'route-whisper',
      route.at(cell), route.at(other), cell, other)));

return [
  shape,
  thing.toVar('assimilated'),
  route.toVar('escape route'),
  ...domains,
  ...assimilationMarks,
  ...oneThingPerUnit,
  ...blueLineSums,
  ...thermo,
  ...greenLines,
  ...circles,
  ...routePlacement,
  ...routeDegrees,
  new ConnectedValues('VP', ON),
  ...routeAvoidsTheThing,
  ...routeWhispers,
];
