// Title: Alto
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=ZPPu390EaC0
// Source: https://sudokupad.app/eb90s76a4e

// Rules:
//  1. Normal 6x6 sudoku: 1-6 once each per row, column and 2x3 box.
//  2. Shade every cell one of two colours such that each colour forms a single
//     orthogonally connected area and no 2x2 area is entirely one colour.
//  3. Clues outside the grid show the sum of the digits in the first continuous
//     run of same-coloured cells along marked diagonals.
//  4. The grid is toroidal: each edge of the grid is adjacent/orthogonal to its
//     opposite edge.
//
// Rule 1 is the default 6x6 shape and its 2x3 boxes. Rule 4 is not a separate
// constraint: it is the adjacency and the diagonal stepping that rules 2 and 3
// are built on, so every step below wraps modulo 6.

const N = 6;
const shape = new Shape('6x6');
const graph = cellGraph(shape);
const cells = graph.cells();

const shade = graph.makeOverlay('VS');    // the two colours
const phase = graph.makeOverlay('VR');    // reading-order run phase (below)
const rankHi = graph.makeOverlay('VH');   // rank, high digit (below)
const rankLo = graph.makeOverlay('VL');   // rank, low digit

// Toroidal step. cellGraph's own step/neighbours stop at the grid edge, so the
// wrap is done here on the row/column numbers.
const torusStep = (cell, dR, dC) => {
  const { row, col } = parseCellId(cell);
  return makeCellId((row - 1 + dR + N) % N + 1, (col - 1 + dC + N) % N + 1);
};
// The four orthogonal steps; wrapped, every cell has all four neighbours.
const ADJACENT_STEPS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// With two colours, "the same colour" is SameValues with one cell per set and
// "a different colour" is AllDifferent over the pair.
const COLOURS = [1, 2];
const shadeDomain = cells.map(cell => new Given(shade.at(cell), ...COLOURS));

// The rules name no colour, so the two labels are interchangeable and every
// shading would otherwise be found twice. Pin R1C1's label to break that.
const colourPin = new Given(shade.at(cells[0]), COLOURS[0]);

// Rule 2, second half: no 2x2 area, wrapped, is entirely one colour -- at least
// one of the other three cells of the block differs from its top-left cell.
const noMonochrome2x2 = cells.map(cell => new Or(
  [[0, 1], [1, 0], [1, 1]].map(([dR, dC]) => new AllDifferent(
    shade.at(cell), shade.at(torusStep(cell, dR, dC))))));

// Rule 2, first half: each colour is a single toroidally-connected area.
//
// ConnectedValues works on the grid adjacency of a Var layer, which cannot
// wrap, so connectivity is certified here instead. Each cell carries a rank,
// held as two digits (rank = N*(rankHi - 1) + rankLo, so 1..36 covers any
// component), and the constraints below make rank exactly one more than the
// cell's distance to its colour's root, measured through same-coloured cells:
//
//   * every non-root cell has a same-coloured neighbour ranked one lower, so
//     following that chain reaches a root of its own colour -- which is what
//     connectedness means, given one root per colour;
//   * same-coloured neighbours differ in rank by at most one, which pins the
//     rank down to the distance rather than leaving any longer labelling free.
//
// The root of each colour has to be named without reading the shading, or the
// choice of root would multiply solutions. It is the first cell of that colour
// in reading order, which the phase overlay tracks as the grid is scanned:
const FIRST_ROOT = 1;     // R1C1, root of its own colour
const IN_FIRST_RUN = 2;   // every cell so far has R1C1's colour
const SECOND_ROOT = 3;    // the first cell that does not: root of the other
const AFTER = 4;          // past that cell
const phaseDomain = cells.map(
  cell => new Given(phase.at(cell), FIRST_ROOT, IN_FIRST_RUN, SECOND_ROOT, AFTER));

const firstColour = shade.at(cells[0]);
const phaseChain = [
  new Given(phase.at(cells[0]), FIRST_ROOT),
  ...cells.slice(1).map((cell, i) => {
    const prev = phase.at(cells[i]);
    const cur = phase.at(cell);
    return new Or([
      new And([
        new Given(prev, FIRST_ROOT, IN_FIRST_RUN),
        new SameValues(2, shade.at(cell), firstColour),
        new Given(cur, IN_FIRST_RUN)]),
      new And([
        new Given(prev, FIRST_ROOT, IN_FIRST_RUN),
        new AllDifferent(shade.at(cell), firstColour),
        new Given(cur, SECOND_ROOT)]),
      new And([
        new Given(prev, SECOND_ROOT, AFTER),
        new Given(cur, AFTER)]),
    ]);
  }),
];

// rank(a) - rank(b) = difference, over the two-digit rank.
const rankDiff = (a, b, difference) => new Sum(
  difference,
  [rankHi.at(a), N], [rankLo.at(a), 1],
  [rankHi.at(b), -N], [rankLo.at(b), -1]);

const rankSteps = cells.map(cell => new Or([
  new And([
    new Given(phase.at(cell), FIRST_ROOT, SECOND_ROOT),
    new Given(rankHi.at(cell), 1),
    new Given(rankLo.at(cell), 1)]),
  ...ADJACENT_STEPS.map(([dR, dC]) => torusStep(cell, dR, dC)).map(
    neighbour => new And([
      new Given(phase.at(cell), IN_FIRST_RUN, AFTER),
      new SameValues(2, shade.at(cell), shade.at(neighbour)),
      rankDiff(neighbour, cell, -1)])),
]));

const torusEdges = cells.flatMap(
  cell => [[0, 1], [1, 0]].map(([dR, dC]) => [cell, torusStep(cell, dR, dC)]));
const rankSmooth = torusEdges.map(([a, b]) => new Or([
  new AllDifferent(shade.at(a), shade.at(b)),
  rankDiff(b, a, -1), rankDiff(b, a, 0), rankDiff(b, a, 1),
]));

// Rule 3. Transcribed from the six drawn badges: each sits in the frame outside
// the grid with a short arrow pointing diagonally into it, which gives the cell
// the run starts at and the direction it travels. The rules text's own worked
// example fixes this reading -- it states that the second cell of the 22
// diagonal is R2C1, which is R1C6 stepped down-right with the wrap.
const diagonals = [
  { clue: 'inf', start: 'R1C5', dR: 1, dC: 1 },   // badge above column 4
  { clue: 24, start: 'R1C3', dR: 1, dC: 1 },      // badge above column 2
  { clue: 22, start: 'R1C6', dR: 1, dC: 1 },      // badge above column 5
  { clue: 5, start: 'R6C5', dR: -1, dC: -1 },     // badge below column 6
  { clue: 5, start: 'R6C2', dR: -1, dC: 1 },      // badge below column 1
  { clue: 10, start: 'R4C1', dR: -1, dC: 1 },     // badge left of row 5
];

// A wrapped diagonal closes on itself after N cells.
const diagonalCells = ({ start, dR, dC }) => {
  const list = [start];
  while (list.length < N) list.push(torusStep(list[list.length - 1], dR, dC));
  return list;
};

// A finite clue's run ends at the first cell of the other colour, so on a closed
// N-cell diagonal it covers 1..N-1 cells: the clue is the disjunction over those
// lengths. A run covering all N cells never ends, which is the infinity clue.
const runClue = (total, list) => new Or(
  list.slice(0, N - 1).map((_, index) => {
    const len = index + 1;
    return new And([
      ...(len > 1 ? [new SameValues(len, ...shade.at(list.slice(0, len)))] : []),
      new AllDifferent(shade.at(list[len - 1]), shade.at(list[len])),
      new Sum(total, ...list.slice(0, len)),
    ]);
  }));

const diagonalClues = diagonals.map(diagonal => {
  const list = diagonalCells(diagonal);
  return diagonal.clue === 'inf'
    ? new SameValues(N, ...shade.at(list))
    : runClue(diagonal.clue, list);
});

return [
  shape,
  shade.toVar('shade'),
  phase.toVar('run phase'),
  rankHi.toVar('rank high'),
  rankLo.toVar('rank low'),
  ...shadeDomain,
  colourPin,
  ...phaseDomain,
  ...noMonochrome2x2,
  ...phaseChain,
  ...rankSteps,
  ...rankSmooth,
  ...diagonalClues,
];
