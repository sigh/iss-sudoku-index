// Title: Earth Wurm
// Author: Nordyttrio
// Video: https://www.youtube.com/watch?v=aYnJBtWwDIc
// Source: https://sudokupad.app/lbvymeu3as

// Standard Sudoku. A VL overlay marks the solver-drawn snake: the two circles
// are its endpoints, the four squares are on it, and its cells form one
// unbranched orthogonal path. Squares count visible snake cells; adjacent snake
// digits are German Whisper pairs. Circle and square coordinates come from the
// drawn markers.
const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const snake = graph.makeOverlay('VL');
const cells = graph.cells();
const endpoints = ['R7C5', 'R9C9'];
const squares = ['R1C1', 'R2C3', 'R2C6', 'R8C3'];

// Every non-endpoint snake cell has exactly two orthogonal snake neighbours.
const degreeTwo = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({phase, count}, value) => {
    if (phase === 'start') return value === ON ? {phase: 'on', count: 0} : {phase: 'off'};
    if (phase === 'off') return {phase: 'off'};
    const next = count + (value === ON ? 1 : 0);
    return next > 2 ? undefined : {phase: 'on', count: next};
  },
  accept: ({phase, count}) => phase === 'off' || count === 2,
}, geometry.numValues);

// A circled endpoint is on the snake and has exactly one orthogonal neighbour.
const endpointDegree = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({phase, count}, value) => {
    if (phase === 'start') return value === ON ? {phase: 'on', count: 0} : undefined;
    const next = count + (value === ON ? 1 : 0);
    return next > 1 ? undefined : {phase: 'on', count: next};
  },
  accept: ({phase, count}) => phase === 'on' && count === 1,
}, geometry.numValues);

// A square reads its own digit after its snake state, then one outward ray per
// segment. In a ray, the first OFF cell blocks all further sight.
const vision = NFA.encodeSpec({
  startState: { type: null, need: null, seen: 0, blocked: false },
  transition: ({type, need, seen, blocked}, value) => {
    if (type === null) return value === ON ? {type: value, need: null, seen: 0, blocked: false} : undefined;
    if (need === null) return {type, need: value - 1, seen: 0, blocked: false};
    if (value === SEGMENT_BREAK) return {type, need, seen, blocked: false};
    if (blocked || value !== type) return {type, need, seen, blocked: true};
    const next = seen + 1;
    return next > need ? undefined : {type, need, seen: next, blocked: false};
  },
  accept: ({need, seen}) => seen === need,
}, geometry.numValues, {multiSegment: true});

// When both ends of a grid edge are on the snake, their digits differ by at
// least five. Edges touching an OFF cell have no line constraint.
const whisper = NFA.encodeSpec({
  startState: { phase: 'aState' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aState': return value === ON ? {phase: 'aDigit'} : {phase: 'skip', left: 3};
      case 'aDigit': return {phase: 'bState', a: value};
      case 'bState': return value === ON ? {phase: 'bDigit', a: state.a} : {phase: 'skip', left: 1};
      case 'bDigit': return Math.abs(state.a - value) >= 5 ? {phase: 'done'} : undefined;
      case 'skip': return state.left > 1 ? {phase: 'skip', left: state.left - 1} : {phase: 'done'};
    }
  },
  accept: ({phase}) => phase === 'done',
}, geometry.numValues);

const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], ON, OFF)),
  ...snake.at(endpoints).map(cell => new Given(cell, ON)),
  ...snake.at(squares).map(cell => new Given(cell, ON)),
];
const ordinaryDegrees = cells.filter(cell => !endpoints.includes(cell)).map(cell =>
  new NFA(degreeTwo, 'snake-degree', ...snake.at([cell, ...graph.neighbours(cell)])));
const endpointDegrees = endpoints.map(cell =>
  new NFA(endpointDegree, 'endpoint-degree', ...snake.at([cell, ...graph.neighbours(cell)])));
const visions = squares.map(cell => new NFA(
  vision, 'square-vision',
  [snake.at(cell), cell],
  ...directions.map(([dRow, dCol]) => snake.at(graph.ray(cell, dRow, dCol).slice(1))),
));
const whispers = cells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(whisper, 'snake-whisper', snake.at(cell), cell, snake.at(other), other)));

return [
  new Shape('9x9'),
  snake.toVar('snake membership'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...ordinaryDegrees,
  ...endpointDegrees,
  ...visions,
  ...whispers,
];
