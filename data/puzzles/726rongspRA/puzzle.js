// Title: Fog and Phantoms: Raising Sails
// Author: DubiousMobius
// Video: https://www.youtube.com/watch?v=726rongspRA
// Source: https://sudokupad.app/t6465th9zv

// Place 1-6 once in every row, column, and 2x3 box. Every cell is sea or
// island; sea is one orthogonally connected region, and every 2x2 contains
// an island cell. Circled cells are islands. An arrow line sums to its circle;
// its tip is sea and counts island cells among its king neighbours.
//
// Omitted: tying each unknown island component's size to every and only its
// circled cells. ISS can connect the single sea region, but cannot discover
// multiple island components and apply a size predicate to each component.

const graph = cellGraph('6x6');
const geometry = graph.gridGeometry();
const shading = graph.makeOverlay('VS');
const shadeCell = cell => shading.at(cell);

const SEA = 1;
const ISLAND = 2;

const circles = ['R1C2', 'R1C5', 'R3C2', 'R3C6', 'R5C5', 'R6C2'];
const arrows = [
  { circle: 'R1C5', line: ['R2C5', 'R2C4'], tip: 'R2C4' },
  { circle: 'R3C2', line: ['R3C3', 'R3C4'], tip: 'R3C4' },
  { circle: 'R3C6', line: ['R4C6', 'R4C5'], tip: 'R4C5' },
  { circle: 'R5C5', line: ['R5C4', 'R5C3'], tip: 'R5C3' },
  { circle: 'R6C2', line: ['R6C1', 'R5C1', 'R5C2'], tip: 'R5C2' },
];

// Each shading cell is either sea or island. One template is replicated over
// the whole overlay rather than emitting 36 identical candidate restrictions.
const shadingCells = shading.at(Array.from(graph.cells()));
const shadingDomain = shading.makeReplicate(
  new Given(shadingCells[0], SEA, ISLAND), shadingCells);

// A 2x2 block is valid unless all four cells are sea.
const islandInBlockMachine = NFA.encodeSpec({
  startState: { found: false },
  transition: ({ found }, value) => ({ found: found || value === ISLAND }),
  accept: ({ found }) => found,
}, geometry.numValues);
const blockTemplate = new NFA(
  islandInBlockMachine,
  'island-in-2x2',
  shadeCell('R1C1'), shadeCell('R1C2'), shadeCell('R2C1'), shadeCell('R2C2'));
const blockAnchors = [];
for (let row = 1; row <= 5; row++) {
  for (let col = 1; col <= 5; col++) {
    blockAnchors.push(shadeCell(makeCellId(row, col)));
  }
}

// Read the arrow-tip digit first, then the shading of each king neighbour,
// accepting exactly when the number of island neighbours equals that digit.
const tipCountMachine = NFA.encodeSpec({
  startState: { phase: 'tip' },
  transition: (state, value) => {
    if (state.phase === 'tip') return { phase: 'neighbours', target: value, count: 0 };
    const count = state.count + (value === ISLAND ? 1 : 0);
    return count <= state.target
      ? { phase: 'neighbours', target: state.target, count }
      : undefined;
  },
  accept: ({ phase, target, count }) => phase === 'neighbours' && count === target,
}, geometry.numValues);

const arrowSums = arrows.map(({ circle, line }) => new Arrow(circle, ...line));
const arrowTerrain = arrows.flatMap(({ tip }) => [
  new Given(shadeCell(tip), SEA),
  new NFA(
    tipCountMachine,
    'tip-island-count',
    tip,
    ...shading.at(graph.kingNeighbours(tip))),
]);

return [
  new Shape('6x6'),
  new Given('R2C3', 3),
  shading.toVar('sea/island shading'),
  shadingDomain,
  shading.makeReplicate(blockTemplate, blockAnchors),
  new ConnectedValues('VS', SEA),
  ...circles.map(cell => new Given(shadeCell(cell), ISLAND)),
  ...arrowSums,
  ...arrowTerrain,
];
