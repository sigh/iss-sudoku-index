// Title: Molino de huevos
// Author: Glum Hippo
// Video: https://www.youtube.com/watch?v=AVO_6grJX1k
// Source: https://sudokupad.app/pqttdq9MbQ

// Rules encoded here, in full:
//   Normal sudoku rules apply.  Draw a snake (a one-cell wide path) into the
//   grid which does not touch itself orthogonally.  Areas not covered by the
//   snake form 8 separate regions, one of each size 1-8 ('eggs') which, in
//   turn, may touch one another diagonally but not orthogonally.  Adjacent
//   cells on a green line must contain one snake cell and one egg cell AND
//   these cells' digits must differ in value by at least 5.  If a circle is in
//   an egg, it gives the count of cells in the egg.  If a circle is on the
//   snake, it gives the number of snake cells "seen" by that circle, including
//   itself (ie the number of contiguous snake cells extending horizontally and
//   vertically from that cell, including itself).
// Nothing is omitted.

// The VE overlay holds each cell's role: SNAKE, or the size of the egg the
// cell belongs to.  Labelling an egg by its own size rather than by an
// arbitrary index is what makes the labels non-interchangeable, so the
// encoding carries no label symmetry.
const SNAKE = 9;
const EGG_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const role = graph.makeOverlay('VE');

// The eggs cover 1+2+...+8 = 36 cells, so the snake covers the other 45.
const SNAKE_SIZE =
  geometry.numGridCells - EGG_SIZES.reduce((total, size) => total + size, 0);

// One egg of each size 1-8, each a single orthogonally connected region, plus
// the snake as a single orthogonally connected region.
const regions = [
  ...EGG_SIZES.map(size => new ConnectedValues('VE', size, size)),
  new ConnectedValues('VE', SNAKE, SNAKE_SIZE),
];

// Two orthogonally adjacent non-snake cells lie in the same uncovered area, so
// they must carry the same egg label; that is what makes the eight labelled
// regions the eight areas the snake leaves behind, and what stops two eggs
// touching orthogonally.
const sameEggKey = Pair.fnToKey(
  (a, b) => a === SNAKE || b === SNAKE || a === b, geometry.numValues);
// One Replicate per step direction stamps the pair onto every cell that has a
// neighbour that way, which covers each orthogonal edge exactly once.
const eggSeparation = [[0, 1], [1, 0]].map(([dRow, dCol]) => {
  const origin = graph.cells()[0];
  const template = new Pair(sameEggKey, 'egg',
    ...role.at([origin, graph.step(origin, dRow, dCol)]));
  const targets = graph.cells().filter(cell => graph.step(cell, dRow, dCol));
  return role.makeReplicate(template, role.at(targets));
});

// "Does not touch itself orthogonally": a snake cell's orthogonal neighbours
// are only its neighbours along the path, so at most two of them are snake.
// Reads the cell's own role, then each orthogonal neighbour's role; an egg
// cell is unconstrained.  Rejection happens in the transition, so accept() is
// unconditional.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: ({ phase, adjacent }, value) => {
    if (phase === 'self') {
      return value === SNAKE ? { phase: 'snake', adjacent: 0 } : { phase: 'egg' };
    }
    if (phase === 'egg') return { phase: 'egg' };
    const count = adjacent + (value === SNAKE ? 1 : 0);
    return count > 2 ? undefined : { phase: 'snake', adjacent: count };
  },
  accept: () => true,
}, geometry.numValues);
const snakeDegrees = graph.cells().map(cell => new NFA(degreeMachine, 'snake',
  ...role.at([cell, ...graph.neighbours(cell)])));
// Connected + every degree at most 2 leaves a single path or a single cycle.
// The grid graph is bipartite (colour by row+column parity), so every cycle in
// it has even length, while the snake has 45 cells.  So no extra constraint is
// needed to make the snake a path rather than a loop.

// The seven green strokes, each listed in the order it is drawn through cell
// centres; every consecutive pair is an orthogonally adjacent pair of cells.
const greenLines = [
  ['R2C1', 'R1C1', 'R1C2'],
  ['R1C7', 'R1C8'],
  ['R3C3', 'R3C4'],
  ['R7C2', 'R8C2'],
  ['R6C5', 'R6C6'],
  ['R5C6', 'R5C5', 'R4C5'],
  ['R3C8', 'R4C8'],
];
const snakeEggPairKey = Pair.fnToKey(
  (a, b) => (a === SNAKE) !== (b === SNAKE), geometry.numValues);
const greenLineRules = greenLines.flatMap(cells => [
  new Whisper(5, ...cells),
  new Pair(snakeEggPairKey, 'green', ...role.at(cells)),
]);

// The 26 white circles, in reading order.
const circles = [
  'R1C1', 'R1C2', 'R1C3', 'R1C7', 'R1C8', 'R1C9',
  'R2C1',
  'R3C3', 'R3C4',
  'R4C1', 'R4C3', 'R4C8',
  'R5C3', 'R5C7',
  'R6C4', 'R6C5', 'R6C7',
  'R7C2', 'R7C4', 'R7C9',
  'R8C1', 'R8C2', 'R8C5', 'R8C6',
  'R9C1', 'R9C8',
];

// One machine per circle.  The first segment is the circle's digit followed by
// the circle cell's own role; each later segment is one orthogonal ray of role
// cells running outwards from the circle.
//   phase 'digit' -> read the digit;
//   phase 'label' -> read the circle's role.  An egg circle is settled here
//     (digit must equal the egg's size, which is its label) and goes to 'done',
//     which absorbs the rays.  A snake circle starts counting: it has already
//     seen itself, so `left` counts the further snake cells still needed.
//   phase 'ray'   -> walk outwards while the run of snake cells continues;
//     the first non-snake cell blocks the rest of that ray, and the segment
//     break starting the next ray clears the block.
// The segment break is tested before any branch that consumes a cell.
const circleMachine = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'done') return state;
    if (value === SEGMENT_BREAK) {
      // A break only ever falls between rays; the first segment holds both the
      // digit and the role, so 'digit' and 'label' never see one.
      return state.phase === 'ray'
        ? { phase: 'ray', left: state.left, blocked: false } : undefined;
    }
    if (state.phase === 'digit') return { phase: 'label', digit: value };
    if (state.phase === 'label') {
      if (value !== SNAKE) {
        return value === state.digit ? { phase: 'done' } : undefined;
      }
      return { phase: 'ray', left: state.digit - 1, blocked: false };
    }
    if (state.blocked) return state;
    if (value !== SNAKE) return { phase: 'ray', left: state.left, blocked: true };
    return state.left === 0
      ? undefined
      : { phase: 'ray', left: state.left - 1, blocked: false };
  },
  accept: state =>
    state.phase === 'done' || (state.phase === 'ray' && state.left === 0),
}, geometry.numValues, { multiSegment: true });

const RAYS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const circleRules = circles.map(cell => {
  const self = role.at(cell);
  const rays = RAYS
    .map(([dRow, dCol]) => role.ray(self, dRow, dCol).slice(1))
    .filter(ray => ray.length > 0);
  return new NFA(circleMachine, 'circle', [cell, self], ...rays);
});

return [
  new Shape('9x9'),
  new Given('R4C9', 1),
  new Given('R9C4', 9),
  role.toVar('role'),
  ...regions,
  ...eggSeparation,
  ...snakeDegrees,
  ...greenLineRules,
  ...circleRules,
];
