// Title: Kropki Cave
// Author: Ben Needham
// Video: https://www.youtube.com/watch?v=wQ6w_Pqdjm8
// Source: https://app.crackingthecryptic.com/3D64nRR387

// Normal Sudoku rules apply, with no given digits.
//
// Every cell is either a "wall" (shaded) or a "tunnel" (unshaded) cell.
//   - Each orthogonally connected wall region touches an edge of the grid.
//   - The tunnel cells form a single orthogonally connected path, which does
//     not branch and does not touch itself diagonally.
//   - No 2x2 area of the grid is completely shaded or completely unshaded.
//   - A cell marked with a square counts, with itself included, the cells it
//     sees along its row and column; walls and the grid edge block the view,
//     and the marked cell may itself be a wall.
//   - A white dot joins two tunnel cells with consecutive digits; a black dot
//     joins two wall cells in a 1:2 ratio. All dots of both colours are shown,
//     and a dot is never drawn between a wall cell and a tunnel cell, so an
//     undotted edge restricts its pair only when both its cells fall in the
//     same class.
//
// Nothing is omitted.

const WALL = 1;
const TUNNEL = 2;

const grid = cellGraph('9x9');

// The shading lives on an 11x11 overlay: the 9x9 grid inset in a one-cell
// frame whose cells are pinned to WALL. "Every wall region touches an edge of
// the grid" is then exactly "the walls plus the frame form a single
// orthogonally connected region", which ConnectedValues states directly.
const framedGrid = cellGraph('11x11');
const shade = framedGrid.makeOverlay('VS');
const innerShade = shade.at(framedGrid.block('R2C2', 9, 9));
const shadeOf = new Map(grid.cells().map((cell, i) => [cell, innerShade[i]]));
const insetCells = new Set(innerShade);
const frameCells = shade.cells().filter(cell => !insetCells.has(cell));

// Drawn data: the seven square markers.
const squares = ['R1C7', 'R2C1', 'R4C7', 'R5C5', 'R6C1', 'R9C3', 'R9C9'];

// Drawn data: the twelve white dots, as the cell pair each sits between.
const whiteDots = [
  ['R1C2', 'R2C2'], ['R1C5', 'R1C6'], ['R1C6', 'R1C7'], ['R2C4', 'R2C5'],
  ['R3C2', 'R4C2'], ['R3C4', 'R4C4'], ['R5C7', 'R6C7'], ['R6C4', 'R6C5'],
  ['R6C7', 'R6C8'], ['R7C2', 'R8C2'], ['R9C3', 'R9C4'], ['R9C7', 'R9C8'],
];

// Drawn data: the eight black dots, as the cell pair each sits between.
const blackDots = [
  ['R1C8', 'R1C9'], ['R3C6', 'R3C7'], ['R4C6', 'R5C6'], ['R5C6', 'R6C6'],
  ['R7C3', 'R7C4'], ['R7C4', 'R8C4'], ['R7C8', 'R8C8'], ['R9C1', 'R9C2'],
];

// The exhaustiveness clauses apply to the undotted edges, which are the grid's
// adjacent pairs minus the drawn ones.
const edgeKey = (a, b) => [a, b].sort().join('_');
const drawnEdges = new Set(
  [...whiteDots, ...blackDots].map(([a, b]) => edgeKey(a, b)));
const undottedEdges = grid.cells()
  .flatMap(cell => [[0, 1], [1, 0]]
    .map(([dRow, dCol]) => grid.step(cell, dRow, dCol))
    .filter(other => other)
    .map(other => [cell, other]))
  .filter(([a, b]) => !drawnEdges.has(edgeKey(a, b)));

// One machine per undotted edge, over its two digits followed by the two
// shade cells. `cons` and `ratio` record which dot the two digits would have
// earned; the shades then decide whether that dot was owed. A wall/tunnel pair
// is accepted whatever its digits do, which is the "dots do not disclose
// relationships between shaded and unshaded cells" clause.
const undottedSpec = NFA.encodeSpec({
  startState: { phase: 'digitA', digitA: 0, cons: false, ratio: false, shadeA: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 'digitA':
        return { phase: 'digitB', digitA: value, cons: false, ratio: false, shadeA: 0 };
      case 'digitB':
        return {
          phase: 'shadeA',
          digitA: 0,
          cons: Math.abs(state.digitA - value) === 1,
          ratio: state.digitA === 2 * value || value === 2 * state.digitA,
          shadeA: 0,
        };
      case 'shadeA':
        if (value !== WALL && value !== TUNNEL) return undefined;
        return { phase: 'shadeB', digitA: 0, cons: state.cons, ratio: state.ratio, shadeA: value };
      case 'shadeB':
        if (value !== WALL && value !== TUNNEL) return undefined;
        if (state.cons && state.shadeA === TUNNEL && value === TUNNEL) return undefined;
        if (state.ratio && state.shadeA === WALL && value === WALL) return undefined;
        return { phase: 'done', digitA: 0, cons: false, ratio: false, shadeA: 0 };
      default:
        return undefined;
    }
  },
  accept: (state) => state.phase === 'done',
  maxDepth: 4,   // two digits and two shades
}, 9);

const undotted = undottedEdges.map(([a, b]) => new NFA(
  undottedSpec, 'undotted', a, b, shadeOf.get(a), shadeOf.get(b)));

// One machine per 2x2 block of the grid, over its four shade cells in reading
// order, stamped by Replicate from the block at the overlay's first cell. It
// rejects a monochrome block, and rejects a block whose two tunnel
// cells lie on one diagonal with walls on the other: those two tunnel cells
// touch diagonally without sharing a tunnel neighbour, so they are not the two
// ends of a turn in the path.
const blockSpec = NFA.encodeSpec({
  startState: { seen: [] },
  transition: (state, value) => {
    if (value !== WALL && value !== TUNNEL) return undefined;
    const seen = state.seen.concat([value]);
    if (seen.length < 4) return { seen: seen };
    const [topLeft, topRight, bottomLeft, bottomRight] = seen;
    if (topLeft === topRight && topRight === bottomLeft && bottomLeft === bottomRight) {
      return undefined;
    }
    if (topLeft === TUNNEL && bottomRight === TUNNEL &&
        topRight === WALL && bottomLeft === WALL) {
      return undefined;
    }
    if (topRight === TUNNEL && bottomLeft === TUNNEL &&
        topLeft === WALL && bottomRight === WALL) {
      return undefined;
    }
    return { seen: seen };
  },
  accept: (state) => state.seen.length === 4,
  maxDepth: 4,
}, 9);

// The targets are the shade cells of the 64 grid cells that start a 2x2 block.
// The frame's own blocks are deliberately not targets: the frame is all wall,
// so stamping the rule there would reject every legal shading.
const blocks = shade.makeReplicate(
  new NFA(blockSpec, 'block2x2', ...shade.block(shade.cells()[0], 2, 2)),
  grid.cells()
    .filter(cell => grid.block(cell, 2, 2))
    .map(cell => shadeOf.get(cell)));

// One machine per cell, over its own shade followed by its orthogonal
// neighbours' shades: a tunnel cell may have at most two tunnel neighbours,
// which is the path not branching. `count` is clamped one past the limit so
// the state stays bounded. Connected tunnel cells of degree at most two are a
// path or a closed ring; a ring is already excluded, because the smallest ring
// that encloses no cell contains a fully unshaded 2x2, and any larger ring
// encloses wall cells that it cuts off from the grid edge.
const branchSpec = NFA.encodeSpec({
  startState: { self: 0, count: 0 },
  transition: (state, value) => {
    if (value !== WALL && value !== TUNNEL) return undefined;
    if (state.self === 0) return { self: value, count: 0 };
    const count = state.count + (value === TUNNEL ? 1 : 0);
    if (state.self === TUNNEL && count > 2) return undefined;
    return { self: state.self, count: Math.min(count, 3) };
  },
  accept: (state) => state.self !== 0,
  maxDepth: 5,   // the cell and its up-to-four neighbours
}, 9);

const noBranching = grid.cells().map(cell => new NFA(
  branchSpec, 'no-branch',
  shadeOf.get(cell),
  ...grid.neighbours(cell).map(other => shadeOf.get(other))));

// One machine per square marker: the marker's own digit is the first segment,
// then each of the four rays away from it in turn, read over the shade
// overlay. `target` is the marked digit, `count` the cells seen so far, and
// `blocked` records that the current ray has already run into a wall, so
// nothing beyond it is visible. The break between segments starts the next ray
// with sight restored. The marker counts itself, so the rays must supply
// exactly `target - 1` cells; passing that is a dead branch, which also bounds
// `count`. The marker's own shade is never read, since a marked cell may be a
// wall and still sees outwards.
const sightSpec = NFA.encodeSpec({
  startState: { target: 0, count: 0, blocked: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { target: state.target, count: state.count, blocked: false };
    }
    if (state.target === 0) return { target: value, count: 0, blocked: false };
    if (state.blocked || value !== TUNNEL) {
      return { target: state.target, count: state.count, blocked: true };
    }
    const count = state.count + 1;
    if (count >= state.target) return undefined;
    return { target: state.target, count: count, blocked: false };
  },
  accept: (state) => state.target !== 0 && state.count === state.target - 1,
  maxDepth: 21,   // 17 cells (the marker and its two full lines) plus 4 breaks
}, 9, { multiSegment: true });

const RAY_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const sightCounts = squares.map(cell => new NFA(
  sightSpec, 'sight', [cell],
  ...RAY_DIRECTIONS
    .map(([dRow, dCol]) => grid.ray(cell, dRow, dCol).slice(1)
      .map(rayCell => shadeOf.get(rayCell)))
    .filter(ray => ray.length)));

return [
  new Shape('9x9'),

  shade.toVar('shade'),
  // The wall/tunnel domain is stamped over the whole layer, frame included, so
  // the frame pins and the dot clues narrow it rather than replace it.
  shade.makeReplicate(new Given(shade.cells()[0], WALL, TUNNEL)),
  shade.makeReplicate(new Given(shade.cells()[0], WALL), frameCells),

  new ConnectedValues('VS', WALL),
  new ConnectedValues('VS', TUNNEL),

  blocks,
  ...noBranching,

  ...whiteDots.flatMap(([a, b]) => [
    new Given(shadeOf.get(a), TUNNEL),
    new Given(shadeOf.get(b), TUNNEL),
    new WhiteDot(a, b),
  ]),
  ...blackDots.flatMap(([a, b]) => [
    new Given(shadeOf.get(a), WALL),
    new Given(shadeOf.get(b), WALL),
    new BlackDot(a, b),
  ]),
  ...undotted,

  ...sightCounts,
];
