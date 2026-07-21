// Title: Killer cages dead end
// Author: Patrick Junke
// Video: https://www.youtube.com/watch?v=1FdYTTEecbU
// Source: https://sudokupad.app/mvjp2dw24q

// Five digit classes form one orthogonally connected labyrinth. A binary
// overlay marks labyrinth (1) and wall (2) cells; nine small NFAs ensure that
// every occurrence of a digit has the same mark. Since every Sudoku row has
// all nine digits, requiring five labyrinth marks in row 1 selects five digits.
// The drawn arrows are exactly the labyrinth dead ends.

const LABYRINTH = 1;
const WALL = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shade = graph.makeOverlay('VS');

const noTotalCages = [
  ['R1C4', 'R1C5', 'R2C5', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R4C2'],
  ['R3C6', 'R3C7', 'R3C9', 'R4C7', 'R4C8', 'R4C9', 'R5C7', 'R6C6', 'R6C7'],
];
const cages = [
  [6, ['R7C8', 'R8C8', 'R9C8']],
  [15, ['R7C3', 'R8C2', 'R8C3', 'R9C2', 'R9C3']],
  [28, ['R6C3', 'R6C4', 'R6C5', 'R7C5', 'R7C6', 'R7C7', 'R8C5']],
  [24, ['R5C1', 'R5C2', 'R5C3', 'R6C2']],
  [14, ['R9C5', 'R9C6', 'R9C7']],
];

const arrows = [
  ['R1C2', 'R1C3'],
  ['R1C7', 'R1C8'],
  ['R8C3', 'R8C4'],
  ['R7C8', 'R7C9'],
  ['R1C5', 'R2C5'],
  ['R8C7', 'R9C7'],
  ['R5C7', 'R5C6'],
  ['R9C1', 'R8C1'],
  ['R8C9', 'R7C9'],
  ['R5C1', 'R4C1'],
];
const arrowCells = new Set(arrows.map(([cell]) => cell));

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], LABYRINTH, WALL));

// For each target digit, scan (grid digit, shade) pairs and require every
// occurrence to carry one consistent shade value.
function sameShadeForDigit(target) {
  const machine = NFA.encodeSpec({
    startState: { phase: 'digit', targetCell: false, shade: null },
    transition: ({ phase, targetCell, shade: digitShade }, value) => {
      if (phase === 'digit') {
        return { phase: 'shade', targetCell: value === target, shade: digitShade };
      }
      if (!targetCell) {
        return { phase: 'digit', targetCell: false, shade: digitShade };
      }
      if (digitShade !== null && value !== digitShade) return undefined;
      return { phase: 'digit', targetCell: false, shade: value };
    },
    accept: ({ phase, shade: digitShade }) =>
      phase === 'digit' && digitShade !== null,
  }, geometry.numValues);
  return new NFA(machine, `digit ${target} labyrinth class`,
    ...gridCells.flatMap(cell => [cell, shade.at(cell)]));
}
const digitClasses = Array.from({ length: 9 }, (_, index) =>
  sameShadeForDigit(index + 1));

// Every unmarked labyrinth cell must not have degree one. Connectivity and the
// five selected digit classes exclude degree zero, so only arrows are dead ends.
const nonArrowDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'center' },
  transition: ({ phase, count }, value) => {
    if (phase === 'center') {
      return value === WALL
        ? { phase: 'wall' }
        : { phase: 'labyrinth', count: 0 };
    }
    if (phase === 'wall') return { phase: 'wall' };
    return {
      phase: 'labyrinth',
      count: Math.min(2, count + (value === LABYRINTH ? 1 : 0)),
    };
  },
  accept: ({ phase, count }) => phase === 'wall' || count !== 1,
}, geometry.numValues);
const nonArrowDegrees = gridCells
  .filter(cell => !arrowCells.has(cell))
  .map(cell => new NFA(nonArrowDegreeMachine, 'not a dead end',
    ...shade.at([cell, ...graph.neighbours(cell)])));

// An arrow cell and its pointed-to neighbour are labyrinth; all its other
// orthogonal neighbours are walls.
const arrowRules = arrows.flatMap(([cell, pointedTo]) => [
  new Given(shade.at(cell), LABYRINTH),
  new Given(shade.at(pointedTo), LABYRINTH),
  ...graph.neighbours(cell)
    .filter(neighbour => neighbour !== pointedTo)
    .map(neighbour => new Given(shade.at(neighbour), WALL)),
]);

return [
  new Shape('9x9'),
  shade.toVar('labyrinth / wall'),
  shadeDomain,
  // Row 1 contains every digit once, so five labyrinth cells select exactly
  // five of the nine globally consistent digit classes.
  new ContainExact('1_1_1_1_1', ...shade.at(graph.row('R1C1'))),
  ...digitClasses,
  new ConnectedValues('VS', LABYRINTH),
  ...nonArrowDegrees,
  ...arrowRules,
  ...noTotalCages.map(cells => new AllDifferent(...cells)),
  ...cages.map(([total, cells]) => new Cage(total, ...cells)),
  new WhiteDot('R8C1', 'R9C1'),
];
