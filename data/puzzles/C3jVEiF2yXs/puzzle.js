// Title: Marble Run
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=C3jVEiF2yXs
// Source: https://app.crackingthecryptic.com/sudoku/r34hQD84Tn

// Standard Sudoku. A marble travels from R1C1 to R9C1 by down or sideways steps,
// without revisiting a cell. Its cells are excluded from the indicated cage sums;
// all digits within each cage are distinct.

const OFF = 1;
const FROM_N = 2, FROM_E = 3, FROM_W = 4, START = 5;
const TO_E = 2, TO_W = 3, TO_S = 4, END = 5;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const incoming = graph.makeOverlay('VI');
const outgoing = graph.makeOverlay('VO');
const cells = graph.cells();

// The two overlays hold the directed entry and exit of each marble cell. The
// listed values are the only locally possible directions at each grid boundary.
const routeDomains = [
  incoming.makeReplicate(new Given(incoming.cells()[0], OFF, FROM_N, FROM_E, FROM_W),
    incoming.at(cells.filter(cell => cell !== 'R1C1'))),
  outgoing.makeReplicate(new Given(outgoing.cells()[0], OFF, TO_E, TO_W, TO_S),
    outgoing.at(cells.filter(cell => cell !== 'R9C1'))),
  ...cells.flatMap(cell => {
    const { row, col } = parseCellId(cell);
    return [
      ...(row === 1 && col !== 1 ? [new Given(incoming.at(cell), OFF, FROM_E, FROM_W)] : []),
      ...(col === geometry.numCols ? [new Given(incoming.at(cell), OFF, FROM_N, FROM_W)] : []),
      ...(col === 1 && row !== 1 ? [new Given(incoming.at(cell), OFF, FROM_N, FROM_E)] : []),
      ...(row === geometry.numRows && col !== 1 ? [new Given(outgoing.at(cell), OFF, TO_E, TO_W)] : []),
      ...(col === geometry.numCols ? [new Given(outgoing.at(cell), OFF, TO_W, TO_S)] : []),
      ...(col === 1 && cell !== 'R9C1' ? [new Given(outgoing.at(cell), OFF, TO_E, TO_S)] : []),
    ];
  }),
];

// An entered marble cell exits without immediately reversing. R1C1 has no entry;
// R9C1 has no exit.
const cellRouteKey = Pair.fnToKey((entry, exit) => {
  if (entry === OFF || exit === OFF) return entry === OFF && exit === OFF;
  if (entry === START) return exit === TO_E || exit === TO_S;
  if (exit === END) return entry === FROM_N || entry === FROM_E;
  if (entry === FROM_N) return exit === TO_E || exit === TO_W || exit === TO_S;
  if (entry === FROM_E) return exit === TO_W || exit === TO_S;
  return entry === FROM_W && (exit === TO_E || exit === TO_S);
}, geometry.numValues);

// Each right/down neighbour pair agrees whether the directed route crosses their
// shared edge. These agreements make every non-endpoint route cell have one entry
// and one exit; the allowed directions cannot form a cycle.
const horizontalOutKey = Pair.fnToKey(
  (exit, entry) => (exit === TO_E) === (entry === FROM_W), geometry.numValues);
const horizontalInKey = Pair.fnToKey(
  (entry, exit) => (entry === FROM_E) === (exit === TO_W), geometry.numValues);
const verticalKey = Pair.fnToKey(
  (exit, entry) => (exit === TO_S) === (entry === FROM_N), geometry.numValues);
const routeEdges = cells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [
    ...(right ? [
      new Pair(horizontalOutKey, 'route right', outgoing.at(cell), incoming.at(right)),
      new Pair(horizontalInKey, 'route left', incoming.at(cell), outgoing.at(right)),
    ] : []),
    ...(down ? [new Pair(verticalKey, 'route down', outgoing.at(cell), incoming.at(down))] : []),
  ];
});

// Cage data transcribed from the drawn cage outlines and totals.
const cages = [
  [15, ['R2C1','R2C2']], [8, ['R2C3','R2C4']], [6, ['R2C5','R2C6']],
  [6, ['R2C7','R2C8','R2C9']], [6, ['R1C7','R1C8','R1C9']],
  [7, ['R3C1','R4C1','R4C2','R4C3']], [5, ['R3C2','R3C3','R3C4','R4C4']],
  [15, ['R3C5','R4C5','R5C5','R6C5','R7C5','R5C4','R5C6']],
  [9, ['R3C6','R3C7','R3C8']], [10, ['R3C9','R4C9','R4C8','R4C7','R4C6']],
  [9, ['R5C2','R5C1','R6C1','R6C2']], [9, ['R5C3','R6C3','R6C4']],
  [12, ['R6C6','R6C7','R5C7']], [24, ['R5C9','R5C8','R6C8','R6C9']],
  [23, ['R7C1','R8C1','R9C1','R9C2','R8C2','R7C2','R7C3','R8C3','R9C3']],
  [3, ['R7C4','R8C4','R8C5','R8C6','R7C6']],
  [33, ['R7C7','R8C7','R9C7','R9C8','R8C8','R7C8','R7C9','R8C9','R9C9']],
];

// This machine reads each cage cell's entry code then digit, adding only digits
// whose entry code is OFF. It is instantiated once per displayed total.
const marbleCageMachine = target => NFA.encodeSpec({
  startState: { phase: 'entry', sum: 0 },
  transition: ({ phase, sum, onPath }, value) => {
    if (phase === 'entry') return { phase: 'digit', sum, onPath: value !== OFF };
    const next = sum + (onPath ? 0 : value);
    return next > target ? undefined : { phase: 'entry', sum: next };
  },
  accept: ({ phase, sum }) => phase === 'entry' && sum === target,
}, geometry.numValues);
// The R7C1-R9C3 and R7C7-R9C9 cages are complete 3x3 boxes, so standard Sudoku
// already makes their digits distinct.
const cageDistinctness = cages.slice(0, 14).map(([, cage]) => new AllDifferent(...cage));
const cageSums = cages.map(([total, cage]) =>
  new NFA(marbleCageMachine(total), 'marble cage',
    ...cage.flatMap(cell => [incoming.at(cell), cell])));

return [
  new Shape('9x9'),
  incoming.toVar('marble entry'),
  outgoing.toVar('marble exit'),
  new Given(incoming.at('R1C1'), START),
  new Given(outgoing.at('R9C1'), END),
  ...routeDomains,
  ...cells.map(cell => new Pair(cellRouteKey, 'route cell', incoming.at(cell), outgoing.at(cell))),
  ...routeEdges,
  ...cageDistinctness,
  ...cageSums,
];
