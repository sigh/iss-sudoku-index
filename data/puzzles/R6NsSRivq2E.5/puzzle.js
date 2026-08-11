// Title: July 27, 2022: Liar Killer
// Author: clover!
// Video: https://www.youtube.com/watch?v=R6NsSRivq2E
// Source: https://tinyurl.com/ycxytp8a

// Rules: normal sudoku, and 24 killer cages (below, transcribed from the
// payload's `cage` array). Digits within a cage never repeat. In each of the
// nine 3x3 boxes exactly one of its cages is "lying": its printed total is
// NOT the cage's actual digit sum. Every other cage's total is correct.
//
// The raw cage geometry puts every cage entirely inside one box, three cages
// per box, except the centre box (R4-R6,C4-C6), which has none. With no cage
// there, "exactly one lying cage" has nothing to select among, so that box
// carries no lying-cage constraint -- this is read directly off the drawn
// cage placements, not deduced by solving.
//
// Every cage here also happens to have each pair of its cells sharing a row,
// column, or (for the four 3-cell cages) the box itself, so the cage
// no-repeat rule is already implied by the base row/column/box constraints;
// no separate AllDifferent is added.

const cages = [
  // #0-#23 index order and cell lists match the payload's `cage` array.
  { cells: ['R2C1', 'R3C1'], total: 3 },
  { cells: ['R1C2', 'R1C3'], total: 3 },
  { cells: ['R1C7', 'R1C8'], total: 4 },
  { cells: ['R2C9', 'R3C9'], total: 4 },
  { cells: ['R2C2', 'R2C3', 'R3C2'], total: 12 },
  { cells: ['R2C7', 'R2C8', 'R3C8'], total: 11 },
  { cells: ['R7C9', 'R8C9'], total: 5 },
  { cells: ['R9C7', 'R9C8'], total: 5 },
  { cells: ['R7C8', 'R8C7', 'R8C8'], total: 24 },
  { cells: ['R9C2', 'R9C3'], total: 3 },
  { cells: ['R7C1', 'R8C1'], total: 3 },
  { cells: ['R7C2', 'R8C2', 'R8C3'], total: 23 },
  { cells: ['R2C6', 'R3C6'], total: 7 },
  { cells: ['R2C4', 'R3C4'], total: 7 },
  { cells: ['R7C6', 'R8C6'], total: 7 },
  { cells: ['R7C4', 'R8C4'], total: 7 },
  { cells: ['R6C7', 'R6C8'], total: 7 },
  { cells: ['R4C7', 'R4C8'], total: 7 },
  { cells: ['R4C2', 'R4C3'], total: 7 },
  { cells: ['R6C2', 'R6C3'], total: 7 },
  { cells: ['R5C8', 'R5C9'], total: 7 },
  { cells: ['R5C1', 'R5C2'], total: 7 },
  { cells: ['R1C5', 'R2C5'], total: 10 },
  { cells: ['R8C5', 'R9C5'], total: 10 },
];

// Givens, transcribed from the payload grid.
const givens = [
  ['R2C2', 3], ['R2C8', 2], ['R3C3', 8], ['R3C6', 2], ['R3C7', 7],
  ['R4C3', 5], ['R5C5', 1], ['R6C7', 3], ['R7C3', 3], ['R7C4', 4],
  ['R7C7', 1], ['R8C2', 9], ['R8C8', 7],
];

function boxOf(cellId) {
  const { row, col } = parseCellId(cellId);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
}

// Every cage's cells share one box (asserted so a transcription slip is
// caught at load time rather than silently mis-grouped).
for (const cage of cages) {
  const boxes = new Set(cage.cells.map(boxOf));
  if (boxes.size !== 1) {
    throw new Error(`Cage ${cage.cells.join(',')} spans multiple boxes`);
  }
}

// Group cage indices by box (0-8, row-major). Boxes with no cages (the
// centre box here) simply get no group and no lying-cage constraint below.
const cagesByBox = new Map();
cages.forEach((cage, i) => {
  const box = boxOf(cage.cells[0]);
  if (!cagesByBox.has(box)) cagesByBox.set(box, []);
  cagesByBox.get(box).push(i);
});

// One flag Var per cage: 1 = printed total is correct, 2 = it is a lie.
const flags = new Var('L', 'cage total is a lie (2) or true (1)', cages.length);
const flagCell = i => flags.cell(i + 1);

// Accepts [flag, ...cageCells] iff the flag correctly reports whether the
// cage's digits sum to `total`. The running sum clamps at total+1 once it
// can only ever fail the equality check.
function cageFlagNFA(total, cellCount) {
  return NFA.encodeSpec({
    startState: { flag: null, sum: 0 },
    transition: ({ flag, sum }, value) => {
      if (flag === null) return { flag: value, sum: 0 };
      return { flag, sum: Math.min(sum + value, total + 1) };
    },
    accept: ({ flag, sum }) => flag === 1 ? sum === total : sum !== total,
    maxDepth: cellCount + 1,
  }, 9);
}

const cageFlagChecks = cages.map((cage, i) => new NFA(
  cageFlagNFA(cage.total, cage.cells.length),
  `cage ${i} total ${cage.cells.length === 1 ? 'true' : 'true/lie'} check`,
  flagCell(i), ...cage.cells,
));

// Per box with cages: exactly one of its (always 3) cages lies.
const oneLiarPerBox = [...cagesByBox.values()].map(indices => {
  const valueStr = indices.map((_, k) => k === 0 ? '2' : '1').join('_');
  return new ContainExact(valueStr, ...indices.map(flagCell));
});

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  flags,
  ...flags.cells().map(c => new Given(c, 1, 2)),
  ...cageFlagChecks,
  ...oneLiarPerBox,
];
