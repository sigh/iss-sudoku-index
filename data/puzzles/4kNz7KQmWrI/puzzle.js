// Title: Picking Blackcurrants
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=4kNz7KQmWrI
// Source: https://sudokupad.app/qx6r0v9p4f

// VP records the direction from which the path enters a cell; VS records the
// direction in which it leaves. Local edge agreement therefore represents one
// directed visit per selected cell. The available movement directions are
// north, east, and southwest.
const NONE = 1;
const FROM_S = 2, FROM_W = 3, FROM_NE = 4;
const TO_N = 2, TO_E = 3, TO_SW = 4;
const ON_DIRECTIONS = [2, 3, 4];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const predecessor = graph.makeOverlay('VP');
const successor = graph.makeOverlay('VS');

const predecessorSteps = [
  [FROM_S, 1, 0],
  [FROM_W, 0, -1],
  [FROM_NE, -1, 1],
];
const successorSteps = [
  [TO_N, -1, 0],
  [TO_E, 0, 1],
  [TO_SW, 1, -1],
];

// Border cells cannot point to a predecessor or successor outside the grid.
const directionDomains = gridCells.flatMap(cell => {
  const incoming = predecessorSteps
    .filter(([, dRow, dCol]) => graph.step(cell, dRow, dCol))
    .map(([code]) => code);
  const outgoing = successorSteps
    .filter(([, dRow, dCol]) => graph.step(cell, dRow, dCol))
    .map(([code]) => code);
  return [
    new Given(predecessor.at(cell), NONE, ...incoming),
    new Given(successor.at(cell), NONE, ...outgoing),
  ];
});

// Every possible directed edge is either selected at both ends or at neither.
const edgeAgreement = gridCells.flatMap(cell => successorSteps.flatMap(
  ([outCode, dRow, dCol], index) => {
    const next = graph.step(cell, dRow, dCol);
    if (!next) return [];
    const inCode = predecessorSteps[index][0];
    const key = Pair.fnToKey(
      (outgoing, incoming) =>
        (outgoing === outCode) === (incoming === inCode),
      geometry,
    );
    return [new Pair(key, 'directed path edge',
      successor.at(cell), predecessor.at(next))];
  },
));

const endpointCells = ['R8C2', 'R9C4'];
const endpointSet = new Set(endpointCells);

// Away from the endpoint circles, a cell is either off the path at both ends
// or has exactly one predecessor and one successor.
const visitKey = Pair.fnToKey(
  (incoming, outgoing) =>
    (incoming === NONE) === (outgoing === NONE),
  geometry,
);
const visits = gridCells
  .filter(cell => !endpointSet.has(cell))
  .map(cell => new Pair(visitKey, 'path visit',
    predecessor.at(cell), successor.at(cell)));

// Either blue circle may be the start; the other is then the end.
const [circleA, circleB] = endpointCells;
const endpoints = new Or([
  new And([
    new Given(predecessor.at(circleA), NONE),
    new Given(successor.at(circleA), ...ON_DIRECTIONS),
    new Given(predecessor.at(circleB), ...ON_DIRECTIONS),
    new Given(successor.at(circleB), NONE),
  ]),
  new And([
    new Given(predecessor.at(circleB), NONE),
    new Given(successor.at(circleB), ...ON_DIRECTIONS),
    new Given(predecessor.at(circleA), ...ON_DIRECTIONS),
    new Given(successor.at(circleA), NONE),
  ]),
]);

// Every internal path cell and its selected predecessor/successor must occupy
// the three entropy bands. Candidate neighbours are scanned in the same order
// as their direction-code tables above.
const bandOf = digit => Math.floor((digit - 1) / 3);
const ALL_BANDS = 0b111;
const entropics = gridCells
  .filter(cell => !endpointSet.has(cell))
  .map(cell => {
    const candidates = [
      ...predecessorSteps.map(([code, dRow, dCol]) => ({
        kind: 'predecessor', code, cell: graph.step(cell, dRow, dCol),
      })),
      ...successorSteps.map(([code, dRow, dCol]) => ({
        kind: 'successor', code, cell: graph.step(cell, dRow, dCol),
      })),
    ].filter(candidate => candidate.cell);

    const machine = NFA.encodeSpec({
      startState: { phase: 'predecessor' },
      transition: (state, value) => {
        if (state.phase === 'predecessor') {
          return { phase: 'successor', incoming: value };
        }
        if (state.phase === 'successor') {
          return { phase: 'digit', incoming: state.incoming, outgoing: value };
        }
        if (state.phase === 'digit') {
          return {
            phase: 'candidates',
            incoming: state.incoming,
            outgoing: state.outgoing,
            bands: 1 << bandOf(value),
            index: 0,
          };
        }
        if (state.index >= candidates.length) return undefined;
        const candidate = candidates[state.index];
        const selected = candidate.kind === 'predecessor'
          ? state.incoming === candidate.code
          : state.outgoing === candidate.code;
        return {
          ...state,
          bands: selected ? state.bands | (1 << bandOf(value)) : state.bands,
          index: state.index + 1,
        };
      },
      accept: state => state.phase === 'candidates' &&
        state.index === candidates.length &&
        (state.incoming === NONE || state.bands === ALL_BANDS),
    }, geometry.numValues);

    return new NFA(machine, 'path entropy',
      predecessor.at(cell), successor.at(cell), cell,
      ...candidates.map(candidate => candidate.cell));
  });

const whiteDots = [
  ['R1C7', 'R1C8'],
  ['R2C2', 'R3C2'],
  ['R6C3', 'R7C3'],
  ['R7C5', 'R8C5'],
];
const whiteDotRules = whiteDots.flatMap(cells => [
  new WhiteDot(...cells),
  ...cells.flatMap(cell => [
    new Given(predecessor.at(cell), NONE),
    new Given(successor.at(cell), NONE),
  ]),
]);

// Both black dots lie on vertical edges, so the permitted crossing direction is
// north: from the lower cell to the upper cell.
const blackDots = [
  ['R2C7', 'R3C7'],
  ['R8C6', 'R9C6'],
];
const blackDotRules = blackDots.flatMap(([upper, lower]) => [
  new BlackDot(upper, lower),
  new Given(successor.at(lower), TO_N),
  new Given(predecessor.at(upper), FROM_S),
]);

return [
  new Shape('9x9'),
  predecessor.toVar('path predecessor'),
  successor.toVar('path successor'),
  ...directionDomains,
  ...edgeAgreement,
  ...visits,
  endpoints,
  ...entropics,
  ...whiteDotRules,
  ...blackDotRules,
  new GreaterThan('R1C7', 'R1C8'),
];
