// Title: June 10, 2023: Strange and Wiggly
// Author: clover!
// Video: https://www.youtube.com/watch?v=PZ1W_HIMqdI
// Source: https://tinyurl.com/3karj4sc

// Place digits 1-9 once each in every drawn region. Digits that see each other
// along a row or column must differ; a gray cell blocks that line of sight, so
// digits split across one may repeat.
//
// The canvas is 11x11, but only 81 of its cells are playable: nine 9-cell
// regions, drawn as wiggly (non-square) shapes by two overlapping line
// layers -- white lines along the outer edge of the play area and black lines
// dividing it into regions. Combining both as walls and flood-filling
// isolates exactly nine 9-cell components -- the regions below -- plus 40
// singleton cells walled off on every side. Those 40 cells (including the 4
// gray-shaded ones) carry no digit: no given ever falls on one, and every
// row/column's span between its first and last playable cell contains only
// playable or gray cells, never a plain background gap -- so a plain
// background cell is genuinely outside the grid, not a cell that merely lacks
// a digit. Because the puzzle draws its regions as wiggly shapes rather than
// literal 3x3 squares (title: "Strange and Wiggly"), the rules' "3x3 region"
// phrase is read against this drawn geometry rather than literally.
//
// The playable area is not a rectangle, and rows/columns must allow repeats
// across a gray block -- the solver's main-grid row/column all-different is
// unconditional and cannot express that. So the whole puzzle is modelled off
// the main grid: a Var overlay shadows the full 11x11 canvas one-for-one
// (VD1..VD121, row-major), and region/row/column groups are stated
// explicitly over it instead of relying on the main grid's built-in ones. The
// 40 non-playable overlay cells are pinned to an arbitrary fixed digit (they
// carry no puzzle meaning, but need a value to keep the solution count from
// inflating with their free choice). The Shape's one real cell is an unused,
// pinned placeholder.

// Region layout, transcribed from the drawn wall lines (see above). A letter
// is a region id; '.' is outside every region (includes the 4 gray cells).
const LAYOUT = [
  '..AAA......',
  '..AAABBB...',
  '..AAABBBCCC',
  '.DDD.BBBCCC',
  '.DDDEEE.CCC',
  '.DDDEEEFFF.',
  'GGG.EEEFFF.',
  'GGGHHH.FFF.',
  'GGGHHHIII..',
  '...HHHIII..',
  '......III..',
];
const N = 11;

// A Var cell per grid cell, so the group's declared shape matches the source
// canvas (checked by review) and `at()`/`cells()` come for free.
const grid = cellGraph('11x11').makeOverlay('VD').toVar('digits'); // Var('D', 'digits', '11x11')
const cellId = (r, c) => grid.cell(r + 1, c + 1); // r, c 0-indexed

const playable = []; // {r, c, region}, 0-indexed
const background = []; // {r, c}
for (let r = 0; r < N; r++)
  for (let c = 0; c < N; c++)
    if (LAYOUT[r][c] !== '.') playable.push({ r, c, region: LAYOUT[r][c] });
    else background.push({ r, c });

// Regions: one AllDifferent per drawn wiggly region.
const regionCells = new Map();
for (const cell of playable) {
  if (!regionCells.has(cell.region)) regionCells.set(cell.region, []);
  regionCells.get(cell.region).push(cellId(cell.r, cell.c));
}
const regions = [...regionCells.values()].map(g => new AllDifferent(...g));

// Row/column sight groups: maximal runs of line-consecutive playable cells --
// a run breaks wherever LAYOUT has no cell, which per the note above is always
// either the grid edge or a gray cell for an interior break.
function sightRuns(rcAt) {
  const groups = [];
  for (let line = 0; line < N; line++) {
    let run = [];
    for (let i = 0; i < N; i++) {
      const [r, c] = rcAt(line, i);
      if (LAYOUT[r][c] !== '.') run.push(cellId(r, c));
      else { if (run.length > 1) groups.push(run); run = []; }
    }
    if (run.length > 1) groups.push(run);
  }
  return groups;
}
const rowGroups = sightRuns((r, c) => [r, c]).map(g => new AllDifferent(...g));
const colGroups = sightRuns((c, r) => [r, c]).map(g => new AllDifferent(...g));

// Pin the non-playable cells so their free choice doesn't multiply the
// solution count; they carry no rule of their own.
const backgroundPins = background.map(({ r, c }) => new Given(cellId(r, c), 1));

// Givens (row, col, value), 1-indexed to match R#C# in the description --
// transcribed from the source's given cells.
const GIVENS = [
  [1, 3, 1], [1, 4, 2], [2, 3, 3], [2, 4, 4], [2, 6, 5],
  [3, 7, 3], [3, 10, 5], [3, 11, 6],
  [4, 4, 9], [4, 7, 1], [4, 10, 7], [4, 11, 8],
  [5, 3, 7], [5, 5, 5],
  [6, 2, 3], [6, 7, 6], [6, 10, 4],
  [7, 5, 1], [7, 9, 5],
  [8, 1, 5], [8, 2, 7], [8, 8, 3],
  [9, 1, 6], [9, 2, 8], [9, 5, 2],
  [10, 6, 6], [10, 8, 1], [10, 9, 3],
  [11, 8, 2], [11, 9, 4],
];
const givens = GIVENS.map(([row, col, v]) => new Given(cellId(row - 1, col - 1), v));

return [
  new Shape('1x1', 9), // dummy main cell; the real puzzle lives on the VD overlay
  new Given('R1C1', 1), // pin it so it doesn't inflate the solution count
  grid,
  ...regions,
  ...rowGroups,
  ...colGroups,
  ...backgroundPins,
  ...givens,
];
