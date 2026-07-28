// Title: Equilibrium
// Author: SneakySteve
// Video: https://www.youtube.com/watch?v=AYUKq0XaOlk
// Source: https://sudokupad.app/aw4ctbznsl

// Normal Sudoku plus the marked rising blue diagonal. Each orange or blue
// arrow starts at a control cell: digit N selects the Nth cell along its ray;
// orange requires that target to exceed N, and blue requires it to be below N.
const arrowSpecs = [
  ['cold', 'R5C5', 0, 1], ['cold', 'R6C6', 0, 1], ['cold', 'R8C2', 0, 1],
  ['cold', 'R5C5', 1, 0], ['cold', 'R6C6', 1, 0], ['cold', 'R4C6', 1, 0],
  ['cold', 'R2C8', 1, 0], ['cold', 'R3C8', 1, 0], ['cold', 'R3C9', 0, -1],
  ['cold', 'R6C8', 0, -1], ['cold', 'R7C5', 0, -1], ['cold', 'R8C8', 0, -1],
  ['cold', 'R8C8', -1, 0], ['cold', 'R9C8', -1, 0], ['cold', 'R8C5', -1, 0],
  ['cold', 'R8C4', -1, 0], ['cold', 'R9C3', -1, 0],
  ['hot', 'R2C2', 0, 1], ['hot', 'R3C5', 0, 1], ['hot', 'R4C2', 0, 1],
  ['hot', 'R7C1', 0, 1], ['hot', 'R1C2', 1, 0], ['hot', 'R2C2', 1, 0],
  ['hot', 'R2C5', 1, 0], ['hot', 'R2C6', 1, 0], ['hot', 'R1C7', 1, 0],
  ['hot', 'R2C8', 0, -1], ['hot', 'R4C4', 0, -1], ['hot', 'R5C5', 0, -1],
  ['hot', 'R5C5', -1, 0], ['hot', 'R4C4', -1, 0], ['hot', 'R6C4', -1, 0],
  ['hot', 'R7C2', -1, 0], ['hot', 'R8C2', -1, 0],
];

// The drawn arrowheads supply each origin and direction above. The NFA scans
// from its origin to that edge; its state remembers N and checks only step N.
const arrowNfa = (isHot) => NFA.encodeSpec({
  startState: { target: null, step: 0, checked: false },
  transition: ({ target, step, checked }, value) => {
    if (target === null) return { target: value, step: 0, checked: false };
    const nextStep = step + 1;
    if (nextStep !== target) return { target, step: nextStep, checked };
    if (isHot ? value > target : value < target) {
      return { target, step: nextStep, checked: true };
    }
    return undefined;
  },
  accept: ({ checked }) => checked,
  maxDepth: 9,
}, 9);

const rayToEdge = (origin, rowStep, colStep) => {
  const cells = [origin];
  let { row, col } = parseCellId(origin);
  while (true) {
    row += rowStep;
    col += colStep;
    if (row < 1 || row > 9 || col < 1 || col > 9) return cells;
    cells.push(makeCellId(row, col));
  }
};

const hotNfa = arrowNfa(true);
const coldNfa = arrowNfa(false);
const arrows = arrowSpecs.map(([kind, origin, rowStep, colStep]) =>
  new NFA(kind === 'hot' ? hotNfa : coldNfa, kind, rayToEdge(origin, rowStep, colStep))
);

return [
  new Shape('9x9'),
  new Diagonal(1),
  ...arrows,
];
