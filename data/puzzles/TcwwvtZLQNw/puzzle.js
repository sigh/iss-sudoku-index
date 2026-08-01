// Title: Negative Gifts
// Author: Patrick Junke
// Video: https://www.youtube.com/watch?v=TcwwvtZLQNw
// Source: https://app.crackingthecryptic.com/T4FNnnm2RQ

// Normal row, column, and marked-region Sudoku applies. Five digit classes are
// labyrinth cells; their cells form one orthogonally connected area. Arrows mark
// exactly its dead ends, and all Xs, white dots, and 2x2 squares are given.

const WALL = 1;
const LABYRINTH = 2;
const graph = cellGraph('9x9');
const cells = graph.cells();
const labyrinth = graph.makeOverlay('VL');
const digitClass = new Var('D', 'digit class', 9);
const classes = digitClass.cells();

// The drawn irregular regions, transcribed from the region outlines.
const regions = [
  ['R1C1','R1C2','R1C3','R2C1','R2C2','R3C1','R3C2','R1C4','R2C4'],
  ['R4C1','R4C2','R4C3','R5C1','R6C1','R6C2','R3C3','R2C3','R7C1'],
  ['R7C2','R7C3','R8C1','R8C2','R8C3','R9C1','R9C2','R9C3','R6C3'],
  ['R2C5','R3C5','R3C6','R4C6','R5C6','R4C5','R5C5','R6C5','R7C5'],
  ['R4C4','R5C4','R6C4','R3C4','R7C4','R8C4','R9C4','R5C3','R5C2'],
  ['R7C6','R8C6','R6C6','R6C7','R6C8','R7C8','R5C7','R4C7','R4C8'],
  ['R1C7','R1C8','R1C9','R2C7','R2C8','R2C9','R1C5','R1C6','R2C6'],
  ['R4C9','R5C8','R5C9','R6C9','R3C7','R3C8','R3C9','R7C9','R8C9'],
  ['R7C7','R8C7','R8C8','R9C7','R9C8','R9C9','R9C6','R9C5','R8C5'],
];

// Each grid digit selects its shared class Var; exactly five digits are labyrinth.
const digitMembership = cells.map(cell => new Or(
  Array.from({ length: 9 }, (_, i) => [WALL, LABYRINTH].map(kind => new And([
    new Given(cell, i + 1), new Given(classes[i], kind),
    new Given(labyrinth.at(cell), kind),
  ]))).flat()));

const membershipDomain = labyrinth.makeReplicate(
  new Given(labyrinth.cells()[0], WALL, LABYRINTH));
const classDomain = classes.map(cell => new Given(cell, WALL, LABYRINTH));

// This NFA reads a cell then its orthogonal neighbours and rejects a labyrinth
// cell with exactly one labyrinth neighbour: unmarked dead ends are forbidden.
const noUnmarkedDeadEndSpec = NFA.encodeSpec({
  startState: { center: null, count: 0 },
  transition: ({ center, count }, value) =>
    center === null ? { center: value, count: 0 }
      : { center, count: Math.min(2, count + (value === LABYRINTH ? 1 : 0)) },
  accept: ({ center, count }) => center === WALL || count !== 1,
}, 2);
const arrowCells = new Set(['R4C9', 'R1C1', 'R9C3']);
const noUnmarkedDeadEnds = cells.filter(cell => !arrowCells.has(cell)).map(cell => new NFA(
  noUnmarkedDeadEndSpec, 'no-unmarked-dead-end',
  labyrinth.at(cell), ...labyrinth.at(graph.neighbours(cell))));

// Every unmarked 2x2 contains both classes, because every uniform 2x2 is marked.
const nonUniformSquareSpec = NFA.encodeSpec({
  startState: { seenWall: false, seenLabyrinth: false },
  transition: ({ seenWall, seenLabyrinth }, value) => ({
    seenWall: seenWall || value === WALL,
    seenLabyrinth: seenLabyrinth || value === LABYRINTH,
  }),
  accept: ({ seenWall, seenLabyrinth }) => seenWall && seenLabyrinth,
}, 2);
const blankSquareCells = ['R4C5', 'R4C6', 'R5C5', 'R5C6'];
const unmarkedSquareOrigins = cells
  .map(cell => graph.block(cell, 2, 2))
  .filter(block => block && block.join() !== blankSquareCells.join())
  .map(block => block[0]);
const unmarkedSquares = labyrinth.makeReplicate(
  new NFA(nonUniformSquareSpec, 'non-uniform-2x2',
    ...labyrinth.at(graph.block('R1C1', 2, 2))),
  labyrinth.at(unmarkedSquareOrigins));

// The decoded white-dot and X edge marks, respectively.
const dots = [
  ['R1C8','R2C8'], ['R5C8','R6C8'], ['R8C8','R8C9'], ['R8C8','R9C8'],
  ['R9C3','R9C4'], ['R8C3','R9C3'], ['R2C4','R3C4'], ['R2C3','R2C4'],
];
const xs = [
  ['R8C1','R8C2'], ['R7C1','R7C2'], ['R6C3','R7C3'], ['R4C3','R4C4'],
  ['R2C2','R2C3'], ['R2C5','R2C6'], ['R5C6','R6C6'],
];
const markedEdges = new Set([...dots, ...xs].map(edge => edge.slice().sort().join(',')));
const markedRules = [
  ...dots.flatMap(([a, b]) => [new WhiteDot(a, b), new AllDifferent(...labyrinth.at([a, b]))]),
  ...xs.flatMap(([a, b]) => [new X(a, b), new AllDifferent(...labyrinth.at([a, b]))]),
];

// For each unmarked orthogonal edge, cross-class pairs are neither consecutive
// nor summing to 10; this is the "all Xs and white dots are given" clause.
const noUnmarkedMarkerSpec = NFA.encodeSpec({
  startState: { digitA: null, classA: null, digitB: null, classB: null },
  transition: ({ digitA, classA, digitB }, value) =>
    digitA === null ? { digitA: value, classA: null, digitB: null, classB: null }
      : classA === null ? (value === WALL || value === LABYRINTH
        ? { digitA, classA: value, digitB: null, classB: null } : undefined)
      : digitB === null ? { digitA, classA, digitB: value, classB: null }
      : (value === WALL || value === LABYRINTH
        ? { digitA, classA, digitB, classB: value } : undefined),
  accept: ({ digitA, classA, digitB, classB }) =>
    classA === classB || (Math.abs(digitA - digitB) !== 1 && digitA + digitB !== 10),
}, 9);
const allEdges = cells.flatMap(cell => graph.neighbours(cell)
  .filter(other => cell < other).map(other => [cell, other]));
const noUnmarkedMarkers = allEdges
  .filter(([a, b]) => !markedEdges.has([a, b].sort().join(',')))
  .map(([a, b]) => new NFA(noUnmarkedMarkerSpec, 'no-unmarked-marker',
    a, labyrinth.at(a), b, labyrinth.at(b)));

// The three arrows point from their labyrinth dead end to its sole exit.
const arrows = [
  ['R4C9', 'R3C9'], ['R1C1', 'R2C1'], ['R9C3', 'R9C2'],
];
const arrowRules = arrows.flatMap(([cell, exit]) => [
  new Given(labyrinth.at(cell), LABYRINTH),
  new Given(labyrinth.at(exit), LABYRINTH),
  ...graph.neighbours(cell).filter(other => other !== exit)
    .map(other => new Given(labyrinth.at(other), WALL)),
]);

return [
  new Shape('9x9'), new NoBoxes(), labyrinth.toVar('labyrinth'), digitClass,
  new Given('R1C7', 1), ...regions.map(region => new AllDifferent(...region)),
  membershipDomain, ...classDomain, new ContainExact('2_2_2_2_2', ...classes),
  ...digitMembership, new ConnectedValues('VL', LABYRINTH),
  ...arrowRules, ...noUnmarkedDeadEnds,
  ...blankSquareCells.map(cell => new Given(labyrinth.at(cell), LABYRINTH)), unmarkedSquares,
  ...markedRules, ...noUnmarkedMarkers,
];
