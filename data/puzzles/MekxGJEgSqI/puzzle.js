// Title: Foggy Segmented Yin Yang Snake
// Author: apetersen
// Video: https://www.youtube.com/watch?v=MekxGJEgSqI
// Source: https://sudokupad.app/zm4m78m9xh

// Normal sudoku (standard boxes). Fog is a solving aid, not encoded (it
// governs which cells are visible while solving, not the finished grid).
//
// Snake/non-snake is a discovered shading layer (no shading is given in the
// payload): a Var overlay 'VS' with SNAKE/NON_SNAKE per cell. "Does not
// branch or touch itself" is enforced the same way as the other ISS
// path/loop scripts (nordschleife.js, xin_yang_v2.js): the induced subgraph
// on SNAKE cells (edges = real grid adjacency, not hand-picked path edges)
// is capped at degree <= 2 per cell, so any accidental extra adjacency
// ("touching") or branch would push a cell's degree over the cap and is
// rejected automatically -- no separate touch/branch check is needed. Unlike
// those scripts this snake has no fixed endpoints or fixed length, so degree
// is capped at <=2 (0, 1, or 2) rather than pinned to exactly 2 (loop) or to
// 1 at two known endpoints (fixed-endpoint path): this also leaves a
// closed-loop shading technically admissible, since "does not branch or
// touch itself" alone does not exclude a cycle.
//
// "The non-snake cells must form a single, orthogonally connected area" and
// the snake's own connectedness are each one ConnectedValues over the same
// VS layer (single-value, disjoint sets on one layer -- the supported case).
//
// Omitted: "Box borders divide the snake into segments, each of which have
// the same sum."

const SNAKE = 1;
const NON_SNAKE = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either snake or non-snake.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SNAKE, NON_SNAKE));

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

// No 2x2 block may be all-snake or all-non-snake.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

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
  shade.toVar('shade'),
  shadeDomain,
  ...dotRules,
  noMono2x2,
  ...degrees,
  // Each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SNAKE),
  new ConnectedValues('VS', NON_SNAKE),
];
