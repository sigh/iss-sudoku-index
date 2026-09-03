// Title: Heyawake Sudoku
// Author: rockratzero
// Video: https://www.youtube.com/watch?v=Vdo0q1Btds4
// Source: https://app.crackingthecryptic.com/sudoku/jgFjmHD7bb

// Normal sudoku rules apply. Some cells are shaded: shaded cells never share an
// edge, and the unshaded cells form a single orthogonally-connected area. The
// digit in each circle says how many cells of that circle's own 3x3 box are
// shaded. A contiguous vertical or horizontal line of unshaded cells cannot span
// two 3x3 region borders. The digits in a cage may not repeat and must sum to
// the cage total, with shaded cells contributing nothing to that total.
// Every rule above is encoded; nothing is omitted.
//
// The shading is a Var cell per grid cell (1 = unshaded, 2 = shaded).

const UNSHADED = 1;
const SHADED = 2;

const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Drawn cages: total printed in the top-left cell, then the cage's cells.
const cages = [
  { total: 11, cells: ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'] },
  { total: 32, cells: ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'] },
  { total: 3, cells: ['R1C4', 'R2C3', 'R2C4', 'R2C5'] },
  { total: 3, cells: ['R3C1', 'R3C2', 'R3C3', 'R3C4'] },
  { total: 17, cells: ['R7C6', 'R7C7', 'R7C8', 'R7C9'] },
  { total: 16, cells: ['R1C5', 'R1C6', 'R2C6'] },
  { total: 9, cells: ['R1C1', 'R1C2'] },
  { total: 24, cells: ['R4C3', 'R5C2', 'R5C3'] },
  { total: 9, cells: ['R5C1', 'R6C1', 'R6C2', 'R6C3'] },
  { total: 7, cells: ['R5C7', 'R5C8', 'R6C7'] },
  { total: 15, cells: ['R4C8', 'R4C9', 'R5C9'] },
  { total: 13, cells: ['R8C4', 'R9C3', 'R9C4', 'R9C5'] },
  { total: 6, cells: ['R8C6', 'R8C7', 'R8C8', 'R9C7'] },
  { total: 9, cells: ['R9C8', 'R9C9'] },
  { total: 20, cells: ['R8C1', 'R8C2', 'R9C2'] },
  { total: 4, cells: ['R7C1', 'R7C2'] },
  { total: 13, cells: ['R7C3', 'R7C4', 'R8C3'] },
];

// The nine drawn circles, one per 3x3 box.
const circles = [
  'R1C1', 'R2C4', 'R3C7',
  'R4C1', 'R5C4', 'R6C7',
  'R7C1', 'R8C4', 'R9C7',
];

// --- Shading layer: every cell is unshaded or shaded. ---
const shadingDomain = shade.makeReplicate(
  new Given(shade.cells()[0], UNSHADED, SHADED));

// --- Shaded cells cannot share an edge. ---
const noAdjacentShaded = Pair.fnToKey(
  (a, b) => !(a === SHADED && b === SHADED), shape);
// Right and down steps only, so each orthogonally adjacent pair is covered once.
// One Replicate per step direction, stamped on every cell that has such a
// neighbour.
const origin = graph.cells()[0];
const noTouch = [[0, 1], [1, 0]].map(([dR, dC]) => shade.makeReplicate(
  new Pair(noAdjacentShaded, 'no-touch',
    shade.at(origin), shade.at(graph.step(origin, dR, dC))),
  shade.at(graph.cells().filter(cell => graph.step(cell, dR, dC)))));

// --- Each circle's digit is the shaded count of its own box. ---
// A shade cell holds 1 when unshaded and 2 when shaded, so a box's nine shade
// cells total 9 + (shaded count), so requiring that total minus the circle
// digit to equal 9 makes the digit the shaded count.
const circleCounts = circles.map(cell => new Sum(
  9,
  ...shade.at(graph.boxes().find(box => box.includes(cell))),
  [cell, -1]));

// --- No unshaded line spans two 3x3 region borders. ---
// The internal borders of a row fall between columns 3 and 4 and between columns
// 6 and 7, so a horizontal run of unshaded cells crossing both covers columns
// 3-7 of its row; the same five-cell window in rows 3-7 covers a column. Hence
// the rule is exactly: at least one shaded cell in each such window.
const borderSpans = [
  ...graph.rows().map(row => row.slice(2, 7)),
  ...graph.columns().map(column => column.slice(2, 7)),
].map(cells => new ContainAtLeast(String(SHADED), ...shade.at(cells)));

// --- Cage digits do not repeat; the unshaded ones sum to the cage total. ---
// The sum machine scans (shade, digit) for each cage cell in turn: a shaded cell
// skips its digit, an unshaded cell adds it, and the running total must land
// exactly on the cage total. The state is the running total plus a flag for
// which half of a pair comes next (null = a shade cell is next), and a total
// that has already overshot is rejected on the spot, which bounds the machine at
// about 3 * (total + 1) states.
const cageSumMachine = total => NFA.encodeSpec({
  startState: { sum: 0, counts: null },
  transition: ({ sum, counts }, value) => {
    if (counts === null) return { sum, counts: value === UNSHADED };
    const next = counts ? sum + value : sum;
    return next > total ? undefined : { sum: next, counts: null };
  },
  accept: ({ sum, counts }) => counts === null && sum === total,
}, shape);
// Two cages cover a whole 3x3 box, whose own all-different is already the
// no-repeat clause for them, so those two need only the sum machine.
const boxCellSets = new Set(graph.boxes().map(box => box.join('_')));
const cageRules = cages.flatMap(({ total, cells }) => [
  ...(boxCellSets.has(cells.join('_')) ? [] : [new AllDifferent(...cells)]),
  new NFA(cageSumMachine(total), `cage${total}`,
    ...cells.flatMap(cell => [shade.at(cell), cell])),
]);

return [
  shape,
  shade.toVar('shading'),
  shadingDomain,
  ...noTouch,
  // The unshaded cells form a single orthogonally-connected area.
  new ConnectedValues('VS', UNSHADED),
  ...circleCounts,
  ...borderSpans,
  ...cageRules,
];
