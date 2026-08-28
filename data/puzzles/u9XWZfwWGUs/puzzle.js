// Title: The Hardest Sudoku Ever
// Author: Matyas Martinka
// Video: https://www.youtube.com/watch?v=u9XWZfwWGUs
// Source: https://cracking-the-cryptic.web.app/sudoku/H9Jr7gQHtm

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, supplied by
// Shape('9x9')). Every cell is coloured water or land. The water cells form a
// single orthogonally-connected region, and no 2x2 block is entirely water.
// A cell carrying an arrow (33 of the 81 -- not every cell has one) has a
// digit equal to how many cells, going from the next cell out in the arrow's
// direction to the grid edge, share that arrow cell's own colour (the arrow
// cell itself is not counted).
//
// Islands (orthogonally-connected land groups of >= 3 cells, each internally
// all-different, every land cell in one) are NOT encoded: the land partition
// is unanchored (no drawn per-island clue) and unbounded (unknown island
// count and sizes).

const WATER = 1;
const LAND = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
// One water/land Var per grid cell (VW1..VW81, in grid order).
const colour = graph.makeOverlay('VW');

const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

// Arrow cell + direction, transcribed from the puzzle's drawn arrows (33
// one-cell direction stubs -- direction only, no path length beyond the
// bulb cell).
const arrows = [
  ['R1C1', 'down'], ['R1C2', 'right'], ['R2C1', 'right'], ['R2C2', 'down'],
  ['R1C4', 'down'], ['R1C6', 'down'], ['R3C6', 'right'], ['R1C8', 'down'],
  ['R2C8', 'down'], ['R1C9', 'down'], ['R2C9', 'left'], ['R4C1', 'down'],
  ['R4C2', 'down'], ['R6C1', 'right'], ['R6C2', 'right'], ['R4C5', 'up'],
  ['R6C5', 'down'], ['R5C6', 'left'], ['R4C8', 'down'], ['R4C9', 'up'],
  ['R6C8', 'left'], ['R6C9', 'left'], ['R8C1', 'right'], ['R9C1', 'up'],
  ['R9C2', 'up'], ['R7C4', 'up'], ['R7C6', 'right'], ['R9C4', 'up'],
  ['R9C6', 'up'], ['R8C7', 'up'], ['R8C9', 'left'], ['R9C8', 'left'],
  ['R9C9', 'up'],
];

// "This cell's digit = the count of ray cells sharing this cell's own
// colour." Two segments: the origin (digit, then the origin's own colour),
// then the ray (colours only, nearest cell first -- order doesn't matter to a
// running count). SEGMENT_BREAK between them is a pass-through: it only ever
// falls once, between the two segments, so no branch below may consume it.
const arrowCountSpec = NFA.encodeSpec({
  startState: { target: null, myColour: null, count: 0 },
  transition: ({ target, myColour, count }, value) => {
    if (value === SEGMENT_BREAK) return { target, myColour, count };
    if (target === null) return { target: value, myColour: null, count: 0 };
    if (myColour === null) return { target, myColour: value, count: 0 };
    const hit = value === myColour ? 1 : 0;
    // Clamp: target + 1 is a sink meaning "already too many".
    return { target, myColour, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, myColour, count }) => target !== null && count === target,
}, geometry.numValues, { multiSegment: true });

const arrowCounts = arrows.map(([cell, dir]) => {
  const [dRow, dCol] = DIRS[dir];
  const ray = graph.ray(cell, dRow, dCol).slice(1);   // exclude the arrow cell
  return new NFA(
    arrowCountSpec, 'arrow-count', [cell, colour.at(cell)], colour.at(ray));
});

// No 2x2 block is entirely water: at least one of its four cells is land.
const noWaterBlocks = graph.cells()
  .map(cell => graph.block(cell, 2, 2))
  .filter(Boolean)
  .map(block => new Or(colour.at(block).map(c => new Given(c, LAND))));

const colourOrigin = colour.cells()[0];

return [
  new Shape('9x9'),
  colour.toVar('colour'),
  // Restrict every colour cell's domain to WATER/LAND.
  colour.makeReplicate(new Given(colourOrigin, WATER, LAND)),
  // Water: exactly one connected region. Land is intentionally not asserted
  // connected -- it is meant to split into several islands.
  new ConnectedValues('VW', WATER),
  ...noWaterBlocks,
  ...arrowCounts,
];
