// Title: Connect 4 Draw
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=TbITeXXmtzE
// Source: https://sudokupad.app/q3b8weqj5f
//
// Rules encoded:
// - Fill the 6x7 board of discs with digits 1-7 so no digit repeats in a row
//   or column (no box regions: a 6x7 board at 7 values has no factor pair
//   that tiles it, so NoBoxes only makes that explicit).
// - Colour every disc red or yellow. Equal numbers of each colour over the
//   42 discs. No four discs of one colour form an unbroken horizontal,
//   vertical, or diagonal run anywhere on the board (the Connect 4
//   "no-win" condition). The first two moves are given: R6C4 red, R5C4
//   yellow (the two coloured discs drawn in the payload).
// - An arrow disc's digit equals the combined count, over every direction
//   its arrow(s) point, of same-coloured discs strictly beyond it out to
//   the board edge (the arrow disc's own cell is excluded).
// - Two orthogonally adjacent red discs hold different-parity digits; two
//   orthogonally adjacent yellow discs hold digits differing by >= 3;
//   mixed-colour neighbours carry neither restriction.

const shape = new Shape('6x7');
const graph = cellGraph(shape);
const colour = graph.makeOverlay('VC'); // one colour cell per board disc
const RED = 1, YELLOW = 2;

// -- Colour layer --------------------------------------------------------

const colourGivens = [
  ...graph.cells().map(cell => new Given(colour.at(cell), RED, YELLOW)),
  // The two pre-coloured discs ("the first two moves"), drawn as underlay
  // circles at R5C4 (khaki/yellow) and R6C4 (salmon/red).
  new Given(colour.at('R5C4'), YELLOW),
  new Given(colour.at('R6C4'), RED),
];

// Equal number of red and yellow discs over the whole board.
const equalColours = new ContainExact(
  [...Array(21).fill(RED), ...Array(21).fill(YELLOW)].join('_'),
  ...colour.cells());

// No four consecutive same-coloured discs along any row, column, or
// diagonal. Scans the colour sequence and rejects as soon as a run of
// matching colours reaches four; a shorter line simply cannot trigger it.
function noFourRunSpec() {
  return NFA.encodeSpec({
    startState: { prev: null, run: 0 },
    transition: ({ prev, run }, value) => {
      if (prev === null) return { prev: value, run: 1 };
      if (value !== prev) return { prev: value, run: 1 };
      const nextRun = run + 1;
      if (nextRun >= 4) return undefined; // reject: four of one colour in a row
      return { prev: value, run: nextRun };
    },
    accept: () => true,
  }, shape);
}
const noFourRun = noFourRunSpec();

const rowLines = colour.at(graph.rows());
const colLines = colour.at(graph.columns());
// Diagonals: every "\" diagonal starts on the top row or (below the corner)
// the left column; every "/" diagonal starts on the top row or (below the
// corner) the right column. Only runs of >= 4 cells can ever hold a run of
// four, so shorter corner diagonals need no constraint.
const downRightStarts = [...graph.row(1), ...graph.column(1).slice(1)];
const downLeftStarts = [...graph.row(1), ...graph.column(7).slice(1)];
const diagLinesRaw = [
  ...downRightStarts.map(cell => graph.ray(cell, 1, 1)),
  ...downLeftStarts.map(cell => graph.ray(cell, 1, -1)),
].filter(line => line.length >= 4);
const diagLines = colour.at(diagLinesRaw);

const noFourConstraints = [...rowLines, ...colLines, ...diagLines].map(
  (line, i) => new NFA(noFourRun, `no-four-run-${i}`, ...line));

// -- Arrow discs -----------------------------------------------------------

// Arrow ticks transcribed from the drawn arrow markers: each tick is
// [cell, [dRow, dCol]], one compass-octant direction per short arrow drawn
// on that disc. Ticks sharing a cell are one clue whose counts combine
// ("the total number ... in the indicated directions (combined)"), per the
// rules text.
const arrowTicks = [
  ['R1C1', [1, 1]],
  ['R1C5', [1, -1]], ['R1C5', [1, 1]],
  ['R1C6', [1, 0]],
  ['R2C2', [1, 0]], ['R2C2', [-1, 0]],
  ['R3C2', [1, 0]], ['R3C2', [0, 1]], ['R3C2', [-1, 1]],
  ['R4C2', [1, 1]], ['R4C2', [1, 0]],
  ['R4C5', [0, -1]], ['R4C5', [1, 0]],
  ['R5C1', [-1, 1]],
  ['R5C3', [-1, 0]], ['R5C3', [1, -1]],
  ['R5C4', [0, -1]],
  ['R5C5', [0, -1]],
  ['R6C2', [-1, 1]],
  ['R6C3', [0, 1]],
  ['R6C4', [0, 1]],
  ['R6C5', [0, 1]],
];
const arrowsByCell = new Map();
for (const [cell, dir] of arrowTicks) {
  if (!arrowsByCell.has(cell)) arrowsByCell.set(cell, []);
  arrowsByCell.get(cell).push(dir);
}

// "digit == count of same-coloured cells across every indicated ray,
// excluding the origin": read the origin's digit (the target), then its own
// colour, then scan every ray's colour cells and tally matches against it.
function arrowSpec() {
  return NFA.encodeSpec({
    startState: { phase: 0, target: null, ownColour: null, count: 0 },
    transition: ({ phase, target, ownColour, count }, value) => {
      if (phase === 0) return { phase: 1, target: value, ownColour: null, count: 0 };
      if (phase === 1) return { phase: 2, target, ownColour: value, count: 0 };
      const hit = value === ownColour ? 1 : 0;
      // Clamp: target + 1 is a sink meaning "already too many".
      return { phase: 2, target, ownColour, count: Math.min(count + hit, target + 1) };
    },
    accept: ({ phase, target, count }) => phase === 2 && count === target,
  }, shape);
}
const arrowCount = arrowSpec();

const arrowConstraints = [...arrowsByCell].map(([cell, dirs]) => {
  const rayCells = dirs.flatMap(([dr, dc]) => graph.ray(cell, dr, dc).slice(1));
  return new NFA(
    arrowCount, `arrow-${cell}`,
    cell, colour.at(cell), ...colour.at(rayCells));
});

// -- Colour-conditioned adjacency rules -------------------------------------

// Every orthogonal edge once: each cell's right neighbour and its down
// neighbour, dropping the ones that fall off the board.
const edges = graph.cells().flatMap(
  cell => [graph.block(cell, 1, 2), graph.block(cell, 2, 1)])
  .filter(pair => pair !== null);

const adjacencyConstraints = edges.map(([a, b]) => new Or([
  // Both red: digits differ in parity.
  new And([new Given(colour.at(a), RED), new Given(colour.at(b), RED),
  new Modular(2, a, b)]),
  // Both yellow: digits differ by at least 3.
  new And([new Given(colour.at(a), YELLOW), new Given(colour.at(b), YELLOW),
  new Whisper(3, a, b)]),
  // Mixed colours: no restriction between the two rules.
  new And([new Given(colour.at(a), RED), new Given(colour.at(b), YELLOW)]),
  new And([new Given(colour.at(a), YELLOW), new Given(colour.at(b), RED)]),
]));

return [
  shape,
  new NoBoxes(),
  colour.toVar('Colour'),
  ...colourGivens,
  equalColours,
  ...noFourConstraints,
  ...arrowConstraints,
  ...adjacencyConstraints,
];
