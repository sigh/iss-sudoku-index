// Title: Black and White
// Author: Thomas Occhipinti
// Video: https://www.youtube.com/watch?v=N3bfncZTHt0
// Source: https://app.crackingthecryptic.com/sudoku/mr3fHnMfQp

// Standard 9x9 sudoku, plus a shading: shaded cells are orthogonally
// connected; no 2x2 block is entirely shaded or entirely unshaded; outside
// clues give the sum of the shaded digits in that row/column; every circled
// cell is shaded; and a circled cell's own digit equals the number of shaded
// cells (itself included) in its own box.
//
// Omitted: "no group of unshaded cells is enclosed by shaded cells." ISS has
// no primitive for "every component of a shading class reaches the grid
// border" when that class may hold several components (here, the unshaded
// side, which this ruleset does not require to be a single region) --
// blocker #861 (constraint-gap, CONSOLIDATED ASK, "boundary/anchor
// reachability for a class with several components").

const SHADED = 1;
const UNSHADED = 2;

// Widened so the shading-conditioned row/column sums (below) have a real 0
// to fall back on for unshaded cells; grid cells are pinned back to 1-9.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

const shade = graph.makeOverlay('VS');
const eff = graph.makeOverlay('VE'); // shaded-value-or-0, for the outside sums

const circles = ['R2C5', 'R3C3', 'R3C8', 'R5C1', 'R5C8', 'R8C5', 'R9C1', 'R9C8'];

// left-to-right outside clues, printed top-to-bottom -> row sums R1..R9
const rowSums = [17, 38, 9, 44, 13, 40, 24, 43, 8];
// top outside clues, printed left-to-right -> column sums C1..C9
const colSums = [38, 21, 30, 30, 7, 15, 28, 38, 29];

// --- Domains ---
const domains = [
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED)),
];

// --- Shading connectivity and anti-monochrome-2x2 ---
const connectivity = [
  new ConnectedValues('VS', SHADED),
];

// "Not all four the same shade" over every 2x2 block: with a 2-valued
// domain, the corner cell differing from any one neighbour already breaks
// the monochrome block, and the converse holds too (if none differ, all four
// are equal to the corner).
const noMonoBlocks = graph.cells()
  .map(cell => graph.block(cell, 2, 2))
  .filter(Boolean)
  .map(([tl, tr, bl, br]) => new Or([
    new AllDifferent(...shade.at([tl, tr])),
    new AllDifferent(...shade.at([tl, bl])),
    new AllDifferent(...shade.at([tl, br])),
  ]));

// --- Circled cells: shaded, and digit == shaded-cell count of their box ---
const boxes = graph.boxes();
const boxOf = (cell) => boxes.find(box => box.includes(cell));

const circleShaded = circles.map(cell => new Given(shade.at(cell), SHADED));

// digit + sum(shade values over the box) == 18 iff digit == shaded count:
// each shaded cell contributes SHADED=1 and each unshaded UNSHADED=2, so
// summing shade values over the 9-cell box gives 18 - (shaded count); adding
// the circled cell's own digit to that must reach 18 exactly when the digit
// equals the shaded count.
const circleCounts = circles.map(
  cell => new Sum(18, cell, ...shade.at(boxOf(cell))));

// --- Outside clues: sum of shaded digits per row/column ---
// eff.at(cell) == digit at cell when shaded, 0 when unshaded.
const eqKey = Pair.fnToKey((a, b) => a === b, shape);
const effRelations = graph.cells().map(cell => new Or([
  new And([
    new Given(shade.at(cell), SHADED),
    new Pair(eqKey, 'eff equals digit when shaded', cell, eff.at(cell)),
  ]),
  new And([
    new Given(shade.at(cell), UNSHADED),
    new Given(eff.at(cell), 0),
  ]),
]));

const outsideSums = [
  ...rowSums.map((total, i) => new Sum(total, ...eff.at(graph.row(i + 1)))),
  ...colSums.map((total, i) => new Sum(total, ...eff.at(graph.column(i + 1)))),
];

return [
  shape,
  new Given('R5C5', 4),
  shade.toVar('shading'),
  eff.toVar('shaded value or 0'),
  ...domains,
  ...connectivity,
  ...noMonoBlocks,
  ...circleShaded,
  ...circleCounts,
  ...effRelations,
  ...outsideSums,
];
