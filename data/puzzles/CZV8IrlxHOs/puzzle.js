// Title: A Sudoku Of Sublime Genius
// Author: Matyas Martinka
// Video: https://www.youtube.com/watch?v=CZV8IrlxHOs
// Source: https://cracking-the-cryptic.web.app/sudoku/hg764Pd67f

// Normal sudoku rules apply (default row/column/box AllDifferent from
// Shape('9x9')). Every cell also carries a colour, water or land, on a
// dedicated VWL overlay (WATER=1, LAND=2): water forms one single
// orthogonally-connected region (ConnectedValues), and no 2x2 block of
// cells is entirely water. Some cells carry an arrow that is confined to
// their own cell and only points a direction (no printed number): for
// such a cell, its own sudoku digit equals the count of cells sharing its
// colour along the ray it points, from the arrow cell to the grid edge,
// not including the arrow cell itself, and those cells need not be
// connected to the arrow cell.
//
// Omitted: islands (orthogonally-connected land groups) must be size >= 3
// and every land cell must belong to one, and cells in the same island
// must hold different digits. The land partition here is unanchored (no
// per-island drawn clue) and unbounded in both island count and island
// size, which has no known ISS encoding. "Islands may touch diagonally" is
// a clarification of that same omitted rule and needs no separate
// encoding.

const WATER = 1;
const LAND = 2;

const graph = cellGraph('9x9');
const wl = graph.makeOverlay('VWL');
const wlVar = wl.toVar('water/land');

// Restrict every colour cell's domain to {WATER, LAND}; a bare Var overlay
// otherwise inherits the grid's full 1-9 range. One shifted-copy template
// via Replicate, rather than 81 individual Givens.
const colorDomain = wl.makeReplicate(new Given(wl.cells()[0], WATER, LAND));

// Rule 4: water is a single orthogonally-connected region.
const waterConnected = new ConnectedValues('VWL', WATER);

// Rule 5: no 2x2 block is entirely water, i.e. at least one of every 2x2
// window's four cells is land.
const windows = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    windows.push([
      makeCellId(r, c), makeCellId(r, c + 1),
      makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
    ]);
  }
}
const no2x2Water = windows.map(cells => new Or(
  cells.map(cell => new Given(wl.at(cell), LAND))));

// Rule 3: arrow cell -> pointed direction (dRow, dCol). Each arrow is drawn
// as a short stub confined to its own cell, from the cell's centre to one
// edge of that cell, so the offset between the two drawn points gives the
// direction and nothing else -- there is no printed number.
const arrows = [
  ['R1C8', [0, -1]], ['R3C9', [-1, 0]], ['R3C7', [-1, 0]], ['R3C5', [0, 1]],
  ['R3C4', [0, -1]], ['R2C4', [0, -1]], ['R1C4', [0, -1]], ['R1C3', [0, -1]],
  ['R1C2', [1, 0]], ['R3C2', [0, 1]], ['R4C8', [0, -1]], ['R6C9', [0, -1]],
  ['R4C6', [1, 0]], ['R5C4', [1, 0]], ['R4C2', [0, -1]], ['R5C1', [1, 0]],
  ['R5C2', [1, 0]], ['R6C1', [0, 1]], ['R6C3', [-1, 0]], ['R7C1', [1, 0]],
  ['R9C1', [0, 1]], ['R9C2', [-1, 0]], ['R8C3', [0, -1]], ['R9C4', [0, 1]],
  ['R7C6', [-1, 0]], ['R7C8', [-1, 0]], ['R8C7', [-1, 0]], ['R9C7', [0, -1]],
  ['R9C8', [0, -1]],
];

// Two-segment NFA per arrow: the origin segment reads [own digit, own
// colour] to set the target count and the relation's reference colour; the
// single ray segment (the colour overlay cells in the pointed direction,
// excluding the arrow cell) counts cells whose colour matches the origin's.
// Accept iff that count equals the origin digit. maxDepth = 2 origin cells
// + 1 segment break + up to 8 ray cells.
const countSpec = NFA.encodeSpec({
  startState: { targetDigit: null, originColor: null, count: 0 },
  transition: ({ targetDigit, originColor, count }, value) => {
    // A SEGMENT_BREAK precedes the ray; nothing to reset since there is
    // only one ray per arrow, but the check must come first regardless.
    if (value === SEGMENT_BREAK) return { targetDigit, originColor, count };
    if (targetDigit === null) return { targetDigit: value, originColor, count };
    if (originColor === null) return { targetDigit, originColor: value, count };
    const hit = value === originColor ? 1 : 0;
    return {
      targetDigit, originColor,
      count: Math.min(count + hit, targetDigit + 1),
    };
  },
  accept: ({ targetDigit, originColor, count }) =>
    targetDigit !== null && originColor !== null && count === targetDigit,
  maxDepth: 11,
}, 9, { multiSegment: true });

const arrowConstraints = arrows.map(([cell, [dRow, dCol]]) => {
  const ray = graph.ray(cell, dRow, dCol).slice(1);
  return new NFA(countSpec, 'ArrowCount', [cell, wl.at(cell)], wl.at(ray));
});

return [
  new Shape('9x9'),
  wlVar,
  colorDomain,
  waterConnected,
  ...no2x2Water,
  ...arrowConstraints,
];
