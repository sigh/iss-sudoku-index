// Title: Catch the Zippersnake
// Author: Marty Sears and Dorlir
// Video: https://www.youtube.com/watch?v=k8Y7Sl7eSu8
// Source: https://sudokupad.app/9onywsf67u

// Normal sudoku. The purple spots form the two snake ends and its interior
// centre; the snake is orthogonal and has no diagonal self-touch. Every marked
// domino has equal snake membership. The zipper's path-order digit pairing is
// omitted: a membership layer does not retain the order needed to pair cells at
// equal distances from the centre.

const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const snake = graph.makeOverlay('VS');
const gridCells = graph.cells();
const purple = ['R1C4', 'R2C1', 'R9C9'];

// The drawn white, black, green, red-diamond, X, and V dominoes. Each green
// dot has a white outline/backing layer, which is not a second white-dot clue.
const whiteDots = [
  ['R8C6', 'R9C6'], ['R4C7', 'R4C8'],
];
const blackDots = [['R5C8', 'R6C8'], ['R2C7', 'R3C7']];
const greenDots = [
  ['R8C7', 'R8C8'], ['R8C3', 'R8C4'], ['R6C5', 'R7C5'], ['R7C2', 'R8C2'],
];
const redDiamonds = [['R5C9', 'R6C9'], ['R4C1', 'R5C1']];
const xMarks = [['R8C5', 'R8C6'], ['R4C5', 'R5C5']];
const vMarks = [['R6C2', 'R6C3'], ['R3C4', 'R3C5']];
const dominoes = [...whiteDots, ...blackDots, ...greenDots, ...redDiamonds, ...xMarks, ...vMarks];

// A snake cell has exactly two orthogonal snake neighbours, unless it is an end.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, membership) => {
    if (phase === 'start') return membership === ON ? { phase: 'on', count: 0 } : { phase: 'off' };
    if (phase === 'off') return { phase: 'off' };
    const next = count + (membership === ON ? 1 : 0);
    return next > 2 ? undefined : { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === 2,
}, geometry.numValues);

// This variant is used only for a forced-purple endpoint or centre.
function purpleDegree(cell, required) {
  const machine = NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count }, membership) => {
      const next = count + (membership === ON ? 1 : 0);
      return next > required ? undefined : { count: next };
    },
    accept: ({ count }) => count === required,
  }, geometry.numValues);
  return new NFA(machine, `purple-degree-${required}`, ...snake.at(graph.neighbours(cell)));
}

// A diagonal pair alone in a 2x2 would make the snake touch itself diagonally.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly = (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);

const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], ON, OFF)),
  ...snake.at(purple).map(cell => new Given(cell, ON)),
  ...dominoes.map(([a, b]) => new SameValues(2, snake.at(a), snake.at(b))),
];
// The interior and each non-corner edge have one translated degree template.
const interiorDegree = new NFA(degreeMachine, 'snake degree',
  snake.at('R2C2'), ...snake.at(graph.neighbours('R2C2')));
const topDegree = new NFA(degreeMachine, 'snake degree',
  snake.at('R1C2'), ...snake.at(graph.neighbours('R1C2')));
const bottomDegree = new NFA(degreeMachine, 'snake degree',
  snake.at('R9C2'), ...snake.at(graph.neighbours('R9C2')));
const leftDegree = new NFA(degreeMachine, 'snake degree',
  snake.at('R2C1'), ...snake.at(graph.neighbours('R2C1')));
const rightDegree = new NFA(degreeMachine, 'snake degree',
  snake.at('R2C9'), ...snake.at(graph.neighbours('R2C9')));
function replicateFrom(template, origin, targets) {
  // lint-ok: bare-replicate-constructor
  return new Replicate([template], Replicate.encodeTargetCells(targets, origin, snake), origin);
}
const ordinaryDegrees = [
  replicateFrom(interiorDegree, snake.at('R2C2'), snake.at(gridCells.filter(cell => {
    const { row, col } = parseCellId(cell);
    return row > 1 && row < 9 && col > 1 && col < 9;
  }))),
  replicateFrom(topDegree, snake.at('R1C2'), snake.at(['R1C2', 'R1C3', 'R1C5', 'R1C6', 'R1C7', 'R1C8'])),
  replicateFrom(bottomDegree, snake.at('R9C2'), snake.at(['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'])),
  replicateFrom(leftDegree, snake.at('R2C1'), snake.at(['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'])),
  replicateFrom(rightDegree, snake.at('R2C9'), snake.at(['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'])),
  new NFA(degreeMachine, 'snake degree', snake.at('R1C1'), ...snake.at(graph.neighbours('R1C1'))),
  new NFA(degreeMachine, 'snake degree', snake.at('R1C9'), ...snake.at(graph.neighbours('R1C9'))),
  new NFA(degreeMachine, 'snake degree', snake.at('R9C1'), ...snake.at(graph.neighbours('R9C1'))),
];
const purpleRoles = new Or([
  new And([purpleDegree(purple[0], 2), purpleDegree(purple[1], 1), purpleDegree(purple[2], 1)]),
  new And([purpleDegree(purple[0], 1), purpleDegree(purple[1], 2), purpleDegree(purple[2], 1)]),
  new And([purpleDegree(purple[0], 1), purpleDegree(purple[1], 1), purpleDegree(purple[2], 2)]),
]);
const noDiagonalTouch = new NFA(noDiagonalTouchMachine, 'no diagonal touch',
  ...snake.at(graph.block('R1C1', 2, 2)));
const noDiagonalTouches = replicateFrom(noDiagonalTouch, snake.at('R1C1'), snake.at(
  gridCells.filter(cell => {
    const { row, col } = parseCellId(cell);
    return row < 9 && col < 9;
  })));

return [
  new Shape('9x9'),
  snake.toVar('snake membership'),
  ...membership,
  new ConnectedValues('VS', ON),
  ...ordinaryDegrees,
  purpleRoles,
  noDiagonalTouches,
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...greenDots.map(cells => new Pair(Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, geometry.numValues), 'green dot', ...cells)),
  ...redDiamonds.map(cells => new Pair(Pair.fnToKey((a, b) => a % 2 === b % 2, geometry.numValues), 'red diamond', ...cells)),
  ...xMarks.map(cells => new X(...cells)),
  ...vMarks.map(cells => new V(...cells)),
];
