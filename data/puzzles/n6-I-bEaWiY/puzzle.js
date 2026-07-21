// Title: Foggy Expeadition
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=n6-I-bEaWiY
// Source: https://sudokupad.app/r38cxr9nhu

// The VS overlay stores 1 = unshaded and 2 = shaded. ISS can enforce the
// connected unshaded cave and every fixed-line rule. It cannot require every
// shaded component to reach the boundary or measure the size of an unknown
// shaded component, so those two cave clauses are explicitly omitted.

const UNSHADED = 1;
const SHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const cells = graph.cells();

const CIRCLES = [
  'R1C2', 'R3C1', 'R1C3', 'R4C1', 'R4C3', 'R7C1', 'R8C2',
  'R7C5', 'R8C6', 'R9C8', 'R5C7', 'R3C9', 'R2C6', 'R2C5',
];

const LINES = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2'],
  ['R4C1', 'R4C2', 'R3C2', 'R3C3', 'R2C3', 'R1C3'],
  [
    'R4C3', 'R5C3', 'R5C4', 'R4C4', 'R4C5', 'R5C5',
    'R6C5', 'R6C4', 'R6C3', 'R7C3', 'R7C2', 'R7C1',
  ],
  [
    'R8C2', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4',
    'R8C4', 'R8C5', 'R7C5',
  ],
  ['R9C8', 'R8C8', 'R7C8', 'R6C8', 'R6C7', 'R5C7'],
];

// Each Var stores one plus the visible run length in a direction. The four
// values therefore sum to the circle digit plus 3.
const sightCounts = new Var('C', 'directional sight counts', 4 * CIRCLES.length);
const countVar = (circleIndex, directionIndex) =>
  sightCounts.cell(4 * circleIndex + directionIndex + 1);
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const sightCountSpec = NFA.encodeSpec({
  startState: { phase: 'count' },
  transition: (state, value) => {
    if (state.phase === 'count') {
      return { phase: 'centre', remaining: value - 1 };
    }
    if (state.phase === 'centre') {
      return { phase: 'visible', remaining: state.remaining };
    }
    if (state.phase === 'blocked') return state;
    if (value === SHADED) {
      return state.remaining === 0 ? { phase: 'blocked' } : undefined;
    }
    if (state.remaining === 0) return undefined;
    return { phase: 'visible', remaining: state.remaining - 1 };
  },
  accept: state =>
    (state.phase === 'visible' && state.remaining === 0) ||
    state.phase === 'blocked',
}, geometry.numValues);

const unshadedCircleClues = CIRCLES.map((cell, circleIndex) => {
  const counts = directions.map((_, directionIndex) =>
    countVar(circleIndex, directionIndex));
  const directionalCounts = directions.map((direction, directionIndex) =>
    new NFA(
      sightCountSpec,
      `unshaded sight ${cell} direction ${directionIndex + 1}`,
      countVar(circleIndex, directionIndex),
      shade.at(cell),
      ...shade.at(graph.ray(cell, ...direction).slice(1)),
    ));
  return new Or([
    // The shaded-circle component-size rule is the omitted branch.
    new Given(shade.at(cell), SHADED),
    new And([
      new Given(shade.at(cell), UNSHADED),
      ...directionalCounts,
      new Sum(3, ...counts, [cell, -1]),
    ]),
  ]);
});

// Read [endpoint digit, endpoint shade, every shade on the line]. The final
// count must equal the endpoint digit.
const lineCountSpec = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'colour', target: value };
    }
    if (state.phase === 'colour') {
      return { phase: 'line', target: state.target, colour: value, count: 0 };
    }
    const count = state.count + (value === state.colour ? 1 : 0);
    if (count > state.target) return undefined;
    return { ...state, count };
  },
  accept: state => state.phase === 'line' && state.count === state.target,
}, geometry.numValues);

const lineCounts = LINES.flatMap(line => {
  const lineShades = shade.at(line);
  return [line[0], line[line.length - 1]].map(endpoint =>
    new NFA(
      lineCountSpec,
      `same-shade cells on line from ${endpoint}`,
      endpoint,
      shade.at(endpoint),
      ...lineShades,
    ));
});

// The interior sum is the two endpoint digits, with either endpoint as tens.
const splitPeas = LINES.map(line => {
  const first = line[0];
  const last = line[line.length - 1];
  const middle = line.slice(1, -1);
  return new Or([
    new Sum(0, ...middle, [first, -10], [last, -1]),
    new Sum(0, ...middle, [last, -10], [first, -1]),
  ]);
});

const vClues = [
  ['R2C3', 'R2C4'],
  ['R4C1', 'R5C1'],
  ['R6C4', 'R7C4'],
].map(pair => new V(...pair));

const xClues = [
  ['R3C3', 'R4C3'],
  ['R9C6', 'R9C7'],
  ['R6C5', 'R6C6'],
  ['R4C7', 'R4C8'],
].map(pair => new X(...pair));

return [
  new Shape('9x9'),
  shade.toVar('cave shading'),
  sightCounts,
  shade.makeReplicate(new Given(shade.cells()[0], UNSHADED, SHADED)),
  new ConnectedValues('VS', UNSHADED),
  ...unshadedCircleClues,
  ...lineCounts,
  ...splitPeas,
  ...vClues,
  ...xClues,
];
