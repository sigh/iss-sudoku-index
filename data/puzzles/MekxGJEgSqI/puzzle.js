// Title: Foggy Segmented Yin Yang Snake
// Author: apetersen
// Video: https://www.youtube.com/watch?v=MekxGJEgSqI
// Source: https://sudokupad.app/zm4m78m9xh

// Normal sudoku (standard boxes). Fog is a solving aid, not encoded (it
// governs which cells are visible while solving, not the finished grid).
//
// Snake/non-snake shading uses the native YinYang constraint's YY cell
// group (two shades, one connected region each, no monochrome 2x2). "Does
// not branch or touch itself" is enforced separately, the same way as the
// other ISS path/loop scripts (nordschleife.js, xin_yang_v2.js): the induced
// subgraph on SNAKE cells (edges = real grid adjacency, not hand-picked path
// edges) is capped at degree <= 2 per cell, so any accidental extra
// adjacency ("touching") or branch would push a cell's degree over the cap
// and is rejected automatically -- no separate touch/branch check is
// needed. Unlike those scripts this snake has no fixed endpoints or fixed
// length, so degree is capped at <=2 (0, 1, or 2) rather than pinned to
// exactly 2 (loop) or to 1 at two known endpoints (fixed-endpoint path):
// this also leaves a closed-loop shading technically admissible, since
// "does not branch or touch itself" alone does not exclude a cycle.
//
// Omitted: "Box borders divide the snake into segments, each of which have
// the same sum."

const SNAKE = 1;
const NON_SNAKE = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');
const gridCells = graph.cells();

// Drawn dots (payload `difference` entries, no explicit value -- the
// f-puzzles default is a white/consecutive dot).
const dots = [
  ['R1C1', 'R2C1'],
  ['R7C1', 'R7C2'],
  ['R7C2', 'R8C2'],
  ['R8C2', 'R9C2'],
  ['R5C3', 'R6C3'],
  ['R4C3', 'R4C4'],
  ['R4C4', 'R5C4'],
  ['R7C7', 'R8C7'],
  ['R5C6', 'R5C7'],
  ['R4C8', 'R4C9'],
  ['R7C4', 'R7C5'],
  ['R8C5', 'R9C5'],
];

// A dot's two cells are consecutive digits (white dot) and opposite shades
// (with two shades, "opposite" is just all-different).
const dotRules = dots.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new AllDifferent(...shade.at([a, b])),
]);

// Degree <= 2 on SNAKE cells: reads a cell's own membership, then each
// orthogonal neighbour's. An off cell is unconstrained (phase 'off'); an on
// cell counts on-neighbours and is rejected outright once the count would
// exceed 2, which is what rules out both branching and self-touching.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === SNAKE
        ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === SNAKE ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: () => true,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...shade.at([cell, ...graph.neighbours(cell)])));

return [
  new Shape('9x9'),
  new YinYang(),
  ...dotRules,
  ...degrees,
];
