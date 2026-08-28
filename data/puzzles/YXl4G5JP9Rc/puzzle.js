// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YXl4G5JP9Rc
// Source: https://cracking-the-cryptic.web.app/sudoku/Hph4Qn9fB9

// Cave Sudoku (Phistomefel).
//
// Normal Sudoku rules apply. Some cells are shaded grey ("wall"); the rest
// are the "cave". Every wall region is orthogonally connected to the edge of
// the grid, and all cave cells form one orthogonally connected area. Each
// yellow cell lies in the cave, and its digit counts the cave cells visible
// from it along its row and column - walls and the grid edge block sight, and
// the yellow cell itself is counted. Not every cave cell carries a yellow
// clue, and 2x2 blocks of either wall or cave are allowed; neither sentence
// adds a constraint.
//
// OMITTED: "In an orthogonally connected area of grey cells no digits may
// repeat." Enforcing that needs per-component distinctness over a partition
// the solver discovers, which has no ISS expression.

const WALL = 1;
const CAVE = 2;

const grid = cellGraph('9x9');

// The shading lives on an 11x11 overlay: the 9x9 grid inset in a one-cell
// frame whose cells are pinned to WALL. "Every wall region reaches the grid
// edge" is then exactly "the walls plus the frame form a single orthogonally
// connected region", which ConnectedValues states directly.
const framedGrid = cellGraph('11x11');
const shade = framedGrid.makeOverlay('VS');
const innerShade = shade.at(framedGrid.block('R2C2', 9, 9));
const shadeOf = new Map(grid.cells().map((cell, i) => [cell, innerShade[i]]));
const insetCells = new Set(innerShade);
const frameCells = shade.cells().filter(cell => !insetCells.has(cell));

// Drawn data: the eight printed digits.
const givens = [
  ['R4C6', 3], ['R5C3', 6], ['R5C9', 1], ['R6C3', 5],
  ['R6C8', 3], ['R8C2', 2], ['R8C9', 3], ['R9C7', 4],
];

// Drawn data: the nineteen yellow cells.
const yellow = [
  'R1C2', 'R1C9', 'R2C1', 'R2C4', 'R2C6', 'R2C8', 'R3C3', 'R4C1', 'R4C5',
  'R4C6', 'R5C7', 'R6C3', 'R6C8', 'R7C5', 'R7C9', 'R8C2', 'R8C6', 'R8C8',
  'R9C7',
];

// One scan per yellow clue: the clue's own digit is the first segment, then
// each of the four rays away from it in turn. `target` is the clue digit,
// `count` the cave cells seen so far, and `blocked` records that the current
// ray has already run into a wall, so nothing beyond it is visible. The break
// between segments starts the next ray with sight restored. The clue counts
// itself, so the rays must supply exactly `target - 1` cells; passing that is
// a dead branch, which also bounds `count`.
const sightSpec = NFA.encodeSpec({
  startState: { target: null, count: 0, blocked: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { target: state.target, count: state.count, blocked: false };
    }
    if (state.target === null) return { target: value, count: 0, blocked: false };
    if (state.blocked || value !== CAVE) {
      return { target: state.target, count: state.count, blocked: true };
    }
    const count = state.count + 1;
    if (count >= state.target) return undefined;
    return { target: state.target, count: count, blocked: false };
  },
  accept: (state) => state.target !== null && state.count === state.target - 1,
  maxDepth: 21,   // 17 cells (the clue and its two full lines) plus 4 breaks
}, 9, { multiSegment: true });

const RAY_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const sightCounts = yellow.map(cell => new NFA(
  sightSpec, 'sight', [cell],
  ...RAY_DIRECTIONS
    .map(([dRow, dCol]) => grid.ray(cell, dRow, dCol).slice(1)
      .map(rayCell => shadeOf.get(rayCell)))
    .filter(ray => ray.length)));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),

  shade.toVar('shade'),
  // The wall/cave domain is stamped over the whole layer, frame included, so
  // the frame pins and the yellow cave clues narrow it rather than replace it.
  shade.makeReplicate(new Given(shade.cells()[0], WALL, CAVE)),
  ...frameCells.map(cell => new Given(cell, WALL)),

  new ConnectedValues('VS', WALL),
  new ConnectedValues('VS', CAVE),

  ...yellow.map(cell => new Given(shadeOf.get(cell), CAVE)),
  ...sightCounts,
];
