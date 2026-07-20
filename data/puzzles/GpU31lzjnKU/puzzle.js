// Title: Same Sum Entropic Loop
// Author: yttrio
// Video: https://www.youtube.com/watch?v=GpU31lzjnKU
// Source: https://sudokupad.app/yttrio/same-sum-entropic-loop

// Loop membership is represented by one auxiliary cell per grid cell:
// 1 means on the loop and 2 means off it. Connected degree-2 membership gives
// one closed loop; the 2x2 checks forbid a diagonal self-touch.
const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VL');

const cages = [
  ['R1C1', 'R1C2'],
  ['R3C2', 'R3C3'],
  ['R1C8', 'R1C9'],
  ['R4C7', 'R5C7', 'R6C7'],
  ['R6C2', 'R6C3'],
  ['R8C5', 'R9C5'],
  ['R9C7', 'R9C8'],
  ['R5C5', 'R6C5'],
];
const cageCells = [...new Set(cages.flat())];

const originLoopCell = loop.cells()[0];
const membership = [
  loop.makeReplicate(new Given(originLoopCell, ON, OFF)),
  ...loop.at(cageCells).map(cell => new Given(cell, ON)),
];

// An ON cell has exactly two orthogonally adjacent ON cells. OFF cells impose
// no neighbour-count condition.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membershipValue) => {
    if (phase === 'start') {
      return membershipValue === ON
        ? { phase: 'on', onNeighbours: 0 }
        : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const nextCount = onNeighbours + (membershipValue === ON ? 1 : 0);
    return nextCount > 2
      ? undefined
      : { phase: 'on', onNeighbours: nextCount };
  },
  accept: ({ phase, onNeighbours }) =>
    phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(
  degreeMachine,
  'loop degree',
  ...loop.at([cell, ...graph.neighbours(cell)]),
));

// A diagonal-only pair in a 2x2 block is a diagonal self-touch. Three cells in
// a block remain legal because an ordinary orthogonal turn necessarily has that
// form.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, membershipValue) => {
    if (block === null) return { block: null };
    const next = [...block, membershipValue === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(
  new NFA(
    noDiagonalTouchMachine,
    'no diagonal touch',
    ...loop.at(graph.block(gridCells[0], 2, 2)),
  ),
  loop.at(blockOrigins),
);

// Each ON cell and its two ON neighbours are exactly a length-three window of
// the loop. Requiring their digit bands to be {low, middle, high} enforces the
// entropic rule on every consecutive triple, including triples across closure.
const bandOf = digit => Math.floor((digit - 1) / 3);
const ALL_BANDS = 0b111;
const entropicMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, bands, neighbourOn }, value) => {
    if (phase === 'start') {
      return { phase: value === ON ? 'ownDigit' : 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    if (phase === 'ownDigit') {
      return { phase: 'membership', bands: 1 << bandOf(value) };
    }
    if (phase === 'membership') {
      return { phase: 'digit', bands, neighbourOn: value === ON };
    }
    return {
      phase: 'membership',
      bands: neighbourOn ? bands | (1 << bandOf(value)) : bands,
    };
  },
  accept: ({ phase, bands }) =>
    phase === 'off' || (phase === 'membership' && bands === ALL_BANDS),
}, geometry.numValues);
const entropics = gridCells.map(cell => new NFA(
  entropicMachine,
  'entropic loop',
  loop.at(cell),
  cell,
  ...graph.neighbours(cell).flatMap(neighbour => [loop.at(neighbour), neighbour]),
));

const cageDistinctness = cages.map(cage => new AllDifferent(...cage));

return [
  new Shape('9x9'),
  loop.toVar('loop membership'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...entropics,
  ...cageDistinctness,
  new EqualSum(...cages),
];
