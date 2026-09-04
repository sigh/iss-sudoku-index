// Title: Snake Egg
// Author: Murat Can Tonta
// Video: https://www.youtube.com/watch?v=73Meh3NPno4
// Source: https://sudokupad.app/DBp4TtjDgH

// Locate a snake (a 1-cell wide path) in the grid whose head and tail are
// given (as circles). The snake can touch itself diagonally but cannot touch
// itself orthogonally. Besides the snake, the remaining cells must form
// exactly nine white areas, one of each size from 1 cell to 9 cells. Numbers
// in the grid must be part of white areas of the indicated size.
//
// Every sentence above is encoded; nothing is omitted. No sudoku rules apply
// (no rows/columns/boxes, digits may repeat), so the grid is Raw.

// One value per cell does both jobs the rules need: a white cell's value IS
// the size of its own area (1-9), and SNAKE (10) marks a cell as part of the
// snake instead, holding no area size. This matches the source's own
// solution alphabet, which is 1-9 plus '.' for the snake's cells.
const SNAKE = 10;

const shape = new Shape('10x10', '1-10', 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// The snake's head and tail, transcribed from the two drawn circles (which
// end is the head is not stated and is not needed).
const ends = ['R1C3', 'R3C1'];
const endSet = new Set(ends);

// --- The snake --------------------------------------------------------

// Degree: a cell on the snake away from its two drawn ends has exactly two
// orthogonal snake neighbours (an interior cell of the path); a drawn end has
// exactly one (it is the path's own tip, not a pass-through cell). A cell off
// the snake is unconstrained. Reads the cell's own value, then each in-grid
// orthogonal neighbour's value.
const makeDegreeMachine = (wanted) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    if (state.phase === 'start') {
      return value === SNAKE ? { phase: 'on', count: 0 } : { phase: 'off' };
    }
    if (state.phase === 'off') return { phase: 'off' };
    const count = state.count + (value === SNAKE ? 1 : 0);
    return count > wanted ? undefined : { phase: 'on', count };
  },
  accept: (state) => state.phase === 'off' || state.count === wanted,
}, geometry.numValues);
const interiorDegreeMachine = makeDegreeMachine(2);
const endDegreeMachine = makeDegreeMachine(1);

// The 64 cells with all four orthogonal neighbours in-grid (rows/columns
// 2-9) share one translated template, stamped by Replicate; neither drawn
// end (R1C3, R3C1) falls in this block. The remaining border cells have
// fewer neighbours each (a different shape per edge/corner), so they -- and
// the two ends, which use the other machine -- get one NFA apiece.
const fullNeighbourBlock = graph.block('R2C2', 8, 8);
const fullNeighbourSet = new Set(fullNeighbourBlock);
// graph.makeReplicate() always shifts from the grid's own first cell
// (R1C1, a corner with only 2 neighbours); the template here needs a
// 4-neighbour origin, so build the Replicate directly from this block's own
// top-left cell instead.
const replicateOrigin = fullNeighbourBlock[0];
const interiorDegrees = new Replicate(
  [new NFA(interiorDegreeMachine, 'snake-interior-degree',
    replicateOrigin, ...graph.neighbours(replicateOrigin))],
  Replicate.encodeTargetCells(fullNeighbourBlock, replicateOrigin, graph),
  replicateOrigin);
const borderDegrees = gridCells
  .filter(cell => !fullNeighbourSet.has(cell) && !endSet.has(cell))
  .map(cell => new NFA(interiorDegreeMachine, 'snake-interior-degree',
    cell, ...graph.neighbours(cell)));
const endDegrees = ends.map(cell => new NFA(endDegreeMachine, 'snake-end-degree',
  cell, ...graph.neighbours(cell)));

// A single connected snake of the size the nine white areas leave over: 100
// cells less the 1+2+...+9 = 45 cells the areas use, 55 cells. Together with
// the degree rule above -- which forces exactly the two drawn cells to
// degree 1 -- a connected, size-55, (at most) degree-2 set of cells is a
// single simple path between exactly those two cells (any branch or loop
// would need a third degree-1/0 cell or a degree-3+ cell, both excluded).
const snakeConnected = new ConnectedValues('', SNAKE, 100 - 45);

// --- The nine white areas -----------------------------------------------

// The rules fix the areas' sizes to the pairwise-distinct multiset 1..9, so
// each area is labelled by its own size. ConnectedValues, given a size, both
// fixes the cell count and forces every cell holding that value into one
// connected region.
const whiteAreas = Array.from({ length: 9 }, (_, i) => i + 1)
  .map(size => new ConnectedValues('', size, size));

return [
  shape,
  new Given('R1C3', SNAKE),
  new Given('R3C1', SNAKE),
  // The two given numbers: each names the size of the white area at that cell.
  new Given('R2C9', 5),
  new Given('R4C2', 2),
  interiorDegrees,
  ...borderDegrees,
  ...endDegrees,
  snakeConnected,
  ...whiteAreas,
];
