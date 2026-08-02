// Title: Negative Kropki Arrows
// Author: Finn Scherer
// Video: https://www.youtube.com/watch?v=A9q08AUMzTs
// Source: https://app.crackingthecryptic.com/sudoku/HPgDpfjgFb

// Normal Sudoku applies.  Grey arrows have a circled control cell equal to the
// sum of the following arm cells.  Visible white and black dots are consecutive
// and 2:1-ratio pairs.  The VM overlay marks the nine negative-Kropki cells:
// exactly one in each row, column, box, and arrow arm; their digits differ; and
// its unmarked incident edges cannot carry a Kropki-related pair.
const graph = cellGraph('9x9');
const marks = graph.makeOverlay('VM');
const selectedDigits = new Var('D', 'negative Kropki row digits', 9);

const arrows = [
  ['R7C1', 'R6C2', 'R5C3', 'R5C2'],
  ['R9C1', 'R8C2', 'R8C1'],
  ['R4C4', 'R3C3'],
  ['R6C7', 'R5C8', 'R4C9', 'R4C8'],
  ['R8C5', 'R7C4', 'R7C5', 'R7C6', 'R8C7'],
  ['R5C4', 'R6C4', 'R6C5', 'R6C6'],
  ['R8C9', 'R9C8', 'R9C7'],
  ['R3C6', 'R2C5', 'R1C5'],
  ['R2C8', 'R1C8', 'R2C9'],
];

// Transcribed from the drawn dot overlays: white dots, then black dots.
const whiteDots = [
  ['R5C2', 'R5C3'], ['R6C4', 'R7C4'], ['R1C8', 'R2C8'],
  ['R4C9', 'R5C9'], ['R3C9', 'R4C9'], ['R2C5', 'R3C5'],
];
const blackDots = [
  ['R7C1', 'R7C2'], ['R6C5', 'R6C6'], ['R9C6', 'R9C7'],
  ['R2C6', 'R2C7'],
];

// For a row's VD control followed by its VM/grid pairs, remember the one grid
// digit whose marker is 2 and require it to be the control digit.
const selectedDigit = NFA.encodeSpec({
  startState: { phase: 'control', chosen: null },
  transition: (state, value) => {
    if (state.phase === 'control') return { phase: 'mark', chosen: null, control: value };
    if (state.phase === 'mark') return { ...state, phase: 'digit', mark: value };
    if (state.mark === 2) return state.chosen === null
      ? { ...state, phase: 'mark', chosen: value }
      : undefined;
    return { ...state, phase: 'mark' };
  },
  accept: state => state.phase === 'mark' && state.chosen === state.control,
  maxDepth: 19,
}, 9);

// A marked cell (VM=2) forbids either Kropki relation on each unmarked incident edge.
const negativeKropki = NFA.encodeSpec({
  startState: { phase: 'mark' },
  transition: (state, value) => {
    if (state.phase === 'mark') return { phase: 'cell', mark: value };
    if (state.phase === 'cell') return { phase: 'neighbour', mark: state.mark, cell: value, hit: false };
    const bad = state.bad || Math.abs(state.cell - value) === 1 || state.cell === 2 * value || value === 2 * state.cell;
    return { ...state, bad };
  },
  accept: state => state.mark !== 2 || !state.bad,
  maxDepth: 6,
}, 9);

const markerCells = marks.at(graph.cells());
const markersByRow = graph.rows().map(marks.at.bind(marks));
const markersByColumn = graph.columns().map(marks.at.bind(marks));
const markersByBox = graph.boxes().map(marks.at.bind(marks));
const edgeKey = (a, b) => [a, b].sort().join(':');
const dottedEdges = new Set([...whiteDots, ...blackDots].map(([a, b]) => edgeKey(a, b)));
const markerByCell = cell => new NFA(
  negativeKropki,
  'negative Kropki edges',
  marks.at(cell), cell,
  ...graph.neighbours(cell).filter(neighbour => !dottedEdges.has(edgeKey(cell, neighbour))),
);

return [
  new Shape('9x9'),
  marks.toVar('negative Kropki markers'),
  selectedDigits,
  marks.makeReplicate(new Given(markerCells[0], 1, 2)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...markersByRow.map(cells => new ContainExact('2', ...cells)),
  ...markersByColumn.map(cells => new ContainExact('2', ...cells)),
  ...markersByBox.map(cells => new ContainExact('2', ...cells)),
  ...arrows.map(cells => new ContainExact('2', ...marks.at(cells.slice(1)))),
  ...graph.rows().map((cells, row) => new NFA(
    selectedDigit,
    'selected digit in row',
    selectedDigits.cell(row + 1),
    ...cells.flatMap(cell => [marks.at(cell), cell]),
  )),
  new AllDifferent(...selectedDigits.cells()),
  ...graph.cells().map(markerByCell),
];
