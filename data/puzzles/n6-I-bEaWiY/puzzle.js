// Title: Foggy Expeadition
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=n6-I-bEaWiY
// Source: https://sudokupad.app/r38cxr9nhu

// Rules encoded here:
//   Sudoku: normal sudoku rules.
//   Cave: some cells are shaded; the unshaded cells form a single orthogonally
//     connected region, and every shaded cell is connected to the grid edge
//     through shaded cells. A digit in a circle either gives the size of the
//     shaded region it lies in, or -- when the circled cell is unshaded -- the
//     total number of unshaded cells seen from it in the four orthogonal
//     directions, itself included, with shaded cells blocking vision.
//   Line Count: a circle at the end of a line counts the cells of that line
//     which share the circle's shading, both endpoints included.
//   Split Peas: the digits strictly between the two circles of a line sum to a
//     two-digit number whose tens digit and ones digit sit in the two circles.
//   XV: a pair separated by X sums to 10 and by V sums to 5. Not all X and V
//     are given, so unmarked pairs carry no restriction.
//   Fog: progressive reveal only; it restricts no final digit.
//
// Two cave clauses are omitted, both quantifying over components of the unknown
// shaded partition:
//   - "all shaded cells are connected to the edge of the grid". The shaded cells
//     may form several components, so asserting a single shaded region would be
//     stronger than the rule.
//   - "digits in circles give the size of the shaded region in which it lies",
//     for a circle that is shaded.
// The shaded branch of each circle clue is therefore left unconstrained. The
// unshaded branch is encoded exactly.

const UNSHADED = 1;
const SHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');

// Drawn white circles with a green border, one per overlay entry.
const CIRCLES = [
  'R1C2', 'R3C1', 'R1C3', 'R4C1', 'R4C3', 'R7C1', 'R8C2',
  'R7C5', 'R8C6', 'R9C8', 'R5C7', 'R3C9', 'R2C6', 'R2C5',
];

// Green line paths, in drawn waypoint order; every line ends on a circle.
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

// Drawn V marks, as the cell pair each one separates.
const V_PAIRS = [
  ['R2C3', 'R2C4'],
  ['R4C1', 'R5C1'],
  ['R6C4', 'R7C4'],
];

// Drawn X marks, as the cell pair each one separates.
const X_PAIRS = [
  ['R3C3', 'R4C3'],
  ['R9C6', 'R9C7'],
  ['R6C5', 'R6C6'],
  ['R4C7', 'R4C8'],
];

const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// Segments are [circle digit], then the shading of each of the four rays taken
// from the circle outwards. Each ray repeats the circle itself as its first
// cell, so `atCentre` skips it: the centre is counted once, by starting `count`
// at 1 when the digit is read, and rejecting it while shaded is what makes this
// machine the unshaded branch of the circle clue. `blocked` latches on the first
// shaded cell of a ray and is cleared at each segment break.
const sightSpec = NFA.encodeSpec({
  startState: { target: null, count: 0, atCentre: false, blocked: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { ...state, atCentre: true, blocked: false };
    }
    if (state.target === null) {
      return { target: value, count: 1, atCentre: false, blocked: false };
    }
    if (state.atCentre) {
      if (value === SHADED) return undefined;
      return { ...state, atCentre: false };
    }
    if (state.blocked) return state;
    if (value === SHADED) return { ...state, blocked: true };
    const count = state.count + 1;
    if (count > state.target) return undefined;
    return { ...state, count };
  },
  accept: state => state.target !== null && state.count === state.target,
}, geometry.numValues, { multiSegment: true });

const circleClues = CIRCLES.map(cell => new Or([
  new Given(shade.at(cell), SHADED),
  new NFA(
    sightSpec, `unshaded cells seen from ${cell}`,
    [cell],
    ...DIRECTIONS.map(([dR, dC]) => shade.at(graph.ray(cell, dR, dC)))),
]));

// Reads the endpoint digit, then the endpoint's shading, then the shading of
// every cell of the line: `count` tallies the cells matching the endpoint.
const lineCountSpec = NFA.encodeSpec({
  startState: { target: null, colour: null, count: 0 },
  transition: (state, value) => {
    if (state.target === null) return { ...state, target: value };
    if (state.colour === null) return { ...state, colour: value };
    const count = state.count + (value === state.colour ? 1 : 0);
    if (count > state.target) return undefined;
    return { ...state, count };
  },
  accept: state => state.count === state.target,
}, geometry.numValues);

const lineCounts = LINES.flatMap(line => {
  const lineShades = shade.at(line);
  return [line[0], line[line.length - 1]].map(endpoint => new NFA(
    lineCountSpec, `line cells shaded like ${endpoint}`,
    endpoint, shade.at(endpoint), ...lineShades));
});

const splitPeas = LINES.map(line => {
  const first = line[0];
  const last = line[line.length - 1];
  const middle = line.slice(1, -1);
  // Either circle may hold the tens digit; nothing drawn orients the line.
  return new Or([
    new Sum(0, ...middle, [first, -10], [last, -1]),
    new Sum(0, ...middle, [last, -10], [first, -1]),
  ]);
});

return [
  new Shape('9x9'),
  shade.toVar('cave shading'),
  shade.makeReplicate(new Given(shade.cells()[0], UNSHADED, SHADED)),
  new ConnectedValues('VS', UNSHADED),
  ...circleClues,
  ...lineCounts,
  ...splitPeas,
  ...V_PAIRS.map(pair => new V(...pair)),
  ...X_PAIRS.map(pair => new X(...pair)),
];
