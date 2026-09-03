// Title: Milestones
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=Eao9sPEyvS0
// Source: https://sudokupad.app/d4qzz9umkk

// Normal 9x9 sudoku with no given digits. The answer also colours every cell
// grey or orange; a "region" is an orthogonally connected group of cells of one
// colour. The rules encoded below, in full:
//   - the grid divides into grey and orange regions, no 2x2 area is all one
//     colour, and two regions of the same colour may not touch diagonally;
//   - MILESTONES: a digit on an arrow cell says how many cells you travel in the
//     arrow's direction to reach the first cell of the opposite colour;
//   - DUTCH WHISPERS: two orthogonally adjacent orange cells differ by at least 4;
//   - REGION SIZE CLUES: a small corner clue gives the number of cells in the
//     region containing its cell;
//   - BALANCED CAGES: in a cage the orange digits sum to the grey digits, and
//     digits may repeat.
// Nothing is omitted.

const shape = new Shape('9x9');
const graph = cellGraph('9x9');

// The colour of each cell.
const GREY = 1;
const ORANGE = 2;
const colour = graph.makeOverlay('VC');

// Which size-clued region a cell belongs to, if any. The four clued sizes are
// all different, so the clues name four distinct regions and one label layer
// holds them all.
const UNLABELLED = 1;
// Drawn data: the small number in the top-left corner of each of these cells.
const regionClues = [
  { cell: 'R2C1', size: 28, label: 2 },
  { cell: 'R3C3', size: 12, label: 3 },
  { cell: 'R5C4', size: 3, label: 4 },
  { cell: 'R9C3', size: 9, label: 5 },
];
const labelCount = 1 + 4;   // UNLABELLED plus one label per region-size clue
const region = graph.makeOverlay('VR');

// Every orthogonally adjacent pair, once each: a cell with its right and lower
// neighbour.
const orthEdges = graph.cells().flatMap(
  cell => [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter(other => other !== null)
    .map(other => [cell, other]));

// The three shading clauses together are exactly this local condition on every
// 2x2 area: its two diagonal pairs are not both equal. Both pairs equal means
// either all four cells match (the forbidden monochrome 2x2) or the 2x2 is a
// checkerboard; a checkerboard's two diagonal pairs would each have to be joined
// by an orthogonal path of their own colour, and two such paths cannot both
// exist without sharing a cell, so the diagonal-touch clause forbids it. The
// condition forbids nothing else: with neither pattern present, two diagonally
// touching cells of one colour always have a same-coloured cell in the 2x2
// joining them orthogonally, so they lie in a single region.
const shadingRules = graph.cells()
  .map(cell => graph.block(cell, 2, 2))
  .filter(block => block !== null)
  .map(([topLeft, topRight, bottomLeft, bottomRight]) => new Or([
    new AllDifferent(...colour.at([topLeft, bottomRight])),
    new AllDifferent(...colour.at([topRight, bottomLeft])),
  ]));

// Reads [digit, arrow cell's colour, colours along the ray]. `steps` counts down
// the cells still to travel: every cell before the last must keep the arrow
// cell's colour and the last must break it, so a ray that runs off the grid
// first never reaches the accepting state. The colour reads reject anything
// outside the two shades, which bounds the compiled machine; the longest scan is
// a digit, its own colour and an 8-cell ray.
const milestoneSpec = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: ({ phase, steps, own }, value) => {
    if (phase !== 'digit' && value !== GREY && value !== ORANGE) return undefined;
    switch (phase) {
      case 'digit': return { phase: 'own', steps: value };
      case 'own': return { phase: 'scan', steps, own: value };
      case 'scan':
        if (steps === 1) return value === own ? undefined : { phase: 'done' };
        return value === own ? { phase: 'scan', steps: steps - 1, own } : undefined;
      default: return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
  maxDepth: 10,
}, shape);

// Drawn data: the 16 arrow markers, as cell and (row, column) step.
const milestones = [
  ['R1C4', 1, 0],
  ['R3C7', 1, 0],
  ['R4C7', 0, 1],
  ['R4C9', -1, -1],
  ['R5C2', 1, 0],
  ['R5C5', -1, 0],
  ['R5C6', -1, -1],
  ['R6C1', 0, 1],
  ['R6C2', -1, 0],
  ['R6C7', -1, 0],
  ['R7C1', -1, 0],
  ['R7C2', -1, 0],
  ['R7C3', 1, 0],
  ['R7C6', 1, 0],
  ['R8C1', -1, 1],
  ['R8C2', -1, 0],
];
const milestoneRules = milestones.map(([cell, dRow, dCol]) => new NFA(
  milestoneSpec, 'milestone',
  cell, colour.at(cell),
  ...colour.at(graph.ray(cell, dRow, dCol).slice(1))));

const whisperRules = orthEdges.map(([a, b]) => new Or([
  new Given(colour.at(a), GREY),
  new Given(colour.at(b), GREY),
  new Whisper(4, a, b),
]));

// Reads [colour a, colour b, label a, label b] for one adjacent pair. Two
// adjacent cells of the same colour are in the same region, so they carry the
// same label; two adjacent cells of different colours are in different regions,
// so they may not share a clued label (both unlabelled is fine). Given the
// anchor and size below, this makes each label's cells exactly the region
// holding its clue.
const regionEdgeSpec = NFA.encodeSpec({
  startState: { phase: 'colourA' },
  transition: ({ phase, colourA, same, labelA }, value) => {
    const shade = phase === 'colourA' || phase === 'colourB';
    if (shade && value !== GREY && value !== ORANGE) return undefined;
    if (!shade && value > labelCount) return undefined;
    switch (phase) {
      case 'colourA': return { phase: 'colourB', colourA: value };
      case 'colourB': return { phase: 'labelA', same: colourA === value };
      case 'labelA': return { phase: 'labelB', same, labelA: value };
      default:
        if (same) return value === labelA ? { phase: 'ok' } : undefined;
        return value !== labelA || value === UNLABELLED ? { phase: 'ok' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'ok',
  maxDepth: 4,
}, shape);

const regionEdgeRules = orthEdges.map(([a, b]) => new NFA(
  regionEdgeSpec, 'region',
  colour.at(a), colour.at(b), region.at(a), region.at(b)));

const regionSizeRules = regionClues.flatMap(({ cell, size, label }) => [
  new Given(region.at(cell), label),
  new ConnectedValues('VR', label, size),
]);

// Reads [colour, digit] for each cage cell, carrying orange sum minus grey sum.
// The longest cage holds 5 cells, so the scan is at most 10 symbols.
const balancedSpec = NFA.encodeSpec({
  startState: { diff: 0, pending: null },
  transition: ({ diff, pending }, value) => {
    if (pending === null) {
      return value === GREY || value === ORANGE ? { diff, pending: value } : undefined;
    }
    return { diff: diff + (pending === ORANGE ? value : -value), pending: null };
  },
  accept: ({ diff, pending }) => pending === null && diff === 0,
  maxDepth: 10,
}, shape);

// Drawn data: the 6 dashed cage outlines, none of which carries a total.
const cages = [
  ['R3C2', 'R3C3', 'R4C2', 'R4C3'],
  ['R5C3', 'R6C3', 'R7C3', 'R8C3'],
  ['R4C6', 'R5C6', 'R5C7', 'R6C6', 'R6C7'],
  ['R7C1', 'R8C1', 'R8C2', 'R9C1'],
  ['R4C9', 'R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R7C7', 'R7C8', 'R8C6', 'R8C7'],
];
const cageRules = cages.map(cells => new NFA(
  balancedSpec, 'balanced',
  ...cells.flatMap(cell => [colour.at(cell), cell])));

return [
  shape,
  colour.toVar('colour'),
  region.toVar('region'),
  colour.makeReplicate(new Given(colour.cells()[0], GREY, ORANGE)),
  region.makeReplicate(new Given(
    region.cells()[0], UNLABELLED, ...regionClues.map(clue => clue.label))),
  ...shadingRules,
  ...milestoneRules,
  ...whisperRules,
  ...regionEdgeRules,
  ...regionSizeRules,
  ...cageRules,
];
