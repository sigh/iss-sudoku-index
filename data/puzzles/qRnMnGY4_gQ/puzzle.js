// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qRnMnGY4_gQ
// Source: https://cracking-the-cryptic.web.app/sudoku/Q72RPgdfGh

// Cave, on a 10x10 board with no Sudoku layer.
//
// Rules encoded:
// - Every cell is either a WALL or part of the CAVE. The answer is that
//   two-colouring; the board holds no digits, so the grid is Raw with two
//   values and asserts nothing about rows, columns or boxes.
// - Every orthogonally connected group of WALL cells is connected to the edge
//   of the grid through WALL cells; the walls need not form one group.
// - All CAVE cells form a single orthogonally connected area.
// - Each printed number lies in a CAVE cell and counts the CAVE cells seen
//   from it along its row and its column, counting its own cell once. A WALL
//   cell and the grid edge both stop sight, and a blocking WALL cell is not
//   seen.
//
// That is the whole ruleset; nothing is omitted. The source prints no rules
// text, so the ruleset is the published Cave genre the puzzle is introduced as.
// A 2x2 block of either colour is allowed: the "walls may not form a 2x2 block"
// clause belongs to hybrid Cave-Sudoku rulesets, which write it out as an extra
// sentence, and is not part of the genre.

const WALL = 1;
const CAVE = 2;

const SIZE = 10;      // the real board
const RING = 1;       // one extra cell on each side

// Wall-to-edge connectivity needs a widened board. ConnectedValues proves ONE
// region connected; "each wall group independently touches the edge" is not
// that. Surrounding the real 10x10 with a ring of cells pinned to WALL turns it
// into one: ring plus walls is a single region exactly when every interior wall
// group has a wall-only path out to the border, since the ring is itself
// connected. The ring cells carry no puzzle meaning and no other constraint
// reads them.
const shape = new Shape('12x12', '1-2', 'Raw');
const graph = cellGraph(shape);

// Printed coordinates (1..10) -> board cell id, offset by the ring. Row 10+
// cell ids are not decimal, so they are always built with makeCellId.
const cellAt = (row, col) => makeCellId(row + RING, col + RING);

const boardCells = [];
for (let row = 1; row <= SIZE; row++) {
  for (let col = 1; col <= SIZE; col++) boardCells.push(cellAt(row, col));
}
const boardCellSet = new Set(boardCells);
const ringCells = graph.cells().filter(cell => !boardCellSet.has(cell));

// Drawn data: the 22 printed numbers, as [row, col, clue]. Twenty are payload
// cell values; the two-character 10 and 12 are drawn as text overlays centred
// on R3C3 and R8C3.
const clues = [
  [1, 1, 3], [1, 5, 7], [1, 10, 2],
  [2, 7, 6], [2, 9, 6],
  [3, 3, 10], [3, 8, 7],
  [4, 7, 4], [4, 9, 6],
  [5, 1, 2], [5, 5, 4],
  [6, 6, 7], [6, 10, 5],
  [7, 2, 7], [7, 4, 5],
  [8, 3, 12], [8, 8, 9],
  [9, 2, 9], [9, 4, 6],
  [10, 1, 4], [10, 6, 4], [10, 10, 3],
];

// A clue's sight ray, read outwards from the cell next to the clue. Sight stops
// at the edge of the real 10x10, so the ring is never part of a ray.
function sightRay(row, col, dRow, dCol) {
  const cells = [];
  for (let r = row + dRow, c = col + dCol;
    r >= 1 && r <= SIZE && c >= 1 && c <= SIZE;
    r += dRow, c += dCol) {
    cells.push(cellAt(r, c));
  }
  return cells;
}

const RAY_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// One machine per distinct clue value, applied over that clue's four rays as
// four segments. `count` is how many CAVE cells the rays have shown so far and
// `blocked` records that the current ray has already met a WALL, so nothing
// further along it is visible; SEGMENT_BREAK starts the next ray with sight
// restored. The clue counts its own cell, which is pinned CAVE separately, so
// the rays must show exactly `clue - 1` cave cells. Overshooting is a dead
// branch, which also bounds `count`.
const makeSightSpec = (clue) => NFA.encodeSpec({
  startState: { count: 0, blocked: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { count: state.count, blocked: false };
    }
    if (state.blocked || value !== CAVE) {
      return { count: state.count, blocked: true };
    }
    const count = state.count + 1;
    if (count >= clue) return undefined;
    return { count: count, blocked: false };
  },
  accept: (state) => state.count === clue - 1,
  // Opposite rays always total SIZE - 1 cells, so all four hold 2*(SIZE-1) = 18
  // cells, plus the 3 breaks between the 4 segments.
  maxDepth: 2 * (SIZE - 1) + 3,
}, shape, { multiSegment: true });

const sightSpecs = new Map(
  [...new Set(clues.map(([, , clue]) => clue))]
    .map(clue => [clue, makeSightSpec(clue)]));

const sightCounts = clues.map(([row, col, clue]) => new NFA(
  sightSpecs.get(clue), 'sight',
  ...RAY_DIRECTIONS
    .map(([dRow, dCol]) => sightRay(row, col, dRow, dCol))
    .filter(ray => ray.length)));

return [
  shape,

  // The ring is the border anchor described above, never a puzzle cell.
  graph.makeReplicate(new Given(ringCells[0], WALL), ringCells),

  new ConnectedValues('', WALL),
  new ConnectedValues('', CAVE),

  ...clues.map(([row, col]) => new Given(cellAt(row, col), CAVE)),
  ...sightCounts,
];
