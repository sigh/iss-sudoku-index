// Title: The secret is 66....
// Author: Panthera
// Video: https://www.youtube.com/watch?v=zz3Bh-R1xP8
// Source: https://sudokupad.app/okwmaphg80?setting-largepuzzle=1

// The 256-cell board has no ordinary row/column houses: it is 32 drawn
// regions (16 six-cell boxes outlined in red, 16 ten-cell boxes) whose cells
// double up as a scattered 6x6 grid (digits 1-6) and a scattered 10x10 grid
// (digits 0-9). Each physical row/column of the board holds one 6-cell
// segment of the first grid and one 10-cell segment of the second, each
// independently a "digits once each" house -- the two segments may repeat a
// digit against each other, which a real Sudoku-grid row/column house cannot
// allow, so the grid is Raw: no implicit row/column constraints.
// Japanese Sums: outside-grid clues (read outermost-to-innermost, matching a
// scan from the top or left) each give one coloured run's cell-sum, in
// order along that row/column. Runs of the same colour need a gap cell
// between them; different colours may touch. A VH Var records each cell's
// run colour (0 = none) and a scanning NFA checks the sequence per line.

const shape = new Shape('16x16', '0-9', 'Raw');
const canvas = cellGraph(shape);
const colours = canvas.makeOverlay('VH');
const colourVar = colours.toVar('Japanese Sum run colour, row-major; 0 = none');

// Box regions as drawn: [row, col] pairs (0-indexed, from the payload), 16
// red-outlined 6-cell boxes forming the scattered 6x6 grid and 16 plain
// 10-cell boxes forming the scattered 10x10 grid. Columns/rows above 9 need
// makeCellId's base-17 letter encoding ('C10' is not a valid id on a grid
// this wide), so this stays row/col pairs converted through makeCellId
// rather than a hand-written R#C# table.
const REGIONS = [
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0]],
  [[0, 3], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3], [3, 0], [3, 1], [3, 2], [3, 3]],
  [[0, 4], [1, 4], [1, 5], [2, 4], [2, 5], [2, 6], [3, 4], [3, 5], [3, 6], [3, 7]],
  [[0, 5], [0, 6], [0, 7], [1, 6], [1, 7], [2, 7]],
  [[4, 0], [4, 1], [4, 2], [4, 3], [5, 1], [5, 2], [5, 3], [6, 2], [6, 3], [7, 3]],
  [[5, 0], [6, 0], [6, 1], [7, 0], [7, 1], [7, 2]],
  [[4, 4], [4, 5], [4, 6], [4, 7], [5, 4], [5, 5], [5, 6], [6, 4], [6, 5], [7, 4]],
  [[5, 7], [6, 6], [6, 7], [7, 5], [7, 6], [7, 7]],
  [[0, 8], [0, 9], [0, 10], [0, 11], [1, 8], [1, 9], [1, 10], [2, 8], [2, 9], [3, 8]],
  [[1, 11], [2, 10], [2, 11], [3, 9], [3, 10], [3, 11]],
  [[1, 12], [2, 12], [2, 13], [3, 12], [3, 13], [3, 14]],
  [[0, 12], [0, 13], [0, 14], [0, 15], [1, 13], [1, 14], [1, 15], [2, 14], [2, 15], [3, 15]],
  [[4, 9], [4, 10], [4, 11], [5, 10], [5, 11], [6, 11]],
  [[4, 8], [5, 8], [5, 9], [6, 8], [6, 9], [6, 10], [7, 8], [7, 9], [7, 10], [7, 11]],
  [[4, 12], [4, 13], [4, 14], [5, 12], [5, 13], [6, 12]],
  [[4, 15], [5, 14], [5, 15], [6, 13], [6, 14], [6, 15], [7, 12], [7, 13], [7, 14], [7, 15]],
  [[8, 0], [8, 1], [8, 2], [8, 3], [9, 0], [9, 1], [9, 2], [10, 0], [10, 1], [11, 0]],
  [[9, 3], [10, 2], [10, 3], [11, 1], [11, 2], [11, 3]],
  [[9, 4], [10, 4], [10, 5], [11, 4], [11, 5], [11, 6]],
  [[8, 4], [8, 5], [8, 6], [8, 7], [9, 5], [9, 6], [9, 7], [10, 6], [10, 7], [11, 7]],
  [[12, 1], [12, 2], [12, 3], [13, 2], [13, 3], [14, 3]],
  [[12, 0], [13, 0], [13, 1], [14, 0], [14, 1], [14, 2], [15, 0], [15, 1], [15, 2], [15, 3]],
  [[12, 7], [13, 6], [13, 7], [14, 5], [14, 6], [14, 7], [15, 4], [15, 5], [15, 6], [15, 7]],
  [[12, 4], [12, 5], [12, 6], [13, 4], [13, 5], [14, 4]],
  [[8, 8], [8, 9], [8, 10], [9, 8], [9, 9], [10, 8]],
  [[8, 11], [9, 10], [9, 11], [10, 9], [10, 10], [10, 11], [11, 8], [11, 9], [11, 10], [11, 11]],
  [[8, 12], [9, 12], [9, 13], [10, 12], [10, 13], [10, 14], [11, 12], [11, 13], [11, 14], [11, 15]],
  [[8, 13], [8, 14], [8, 15], [9, 14], [9, 15], [10, 15]],
  [[12, 8], [12, 9], [12, 10], [12, 11], [13, 9], [13, 10], [13, 11], [14, 10], [14, 11], [15, 11]],
  [[13, 8], [14, 8], [14, 9], [15, 8], [15, 9], [15, 10]],
  [[12, 12], [12, 13], [12, 14], [12, 15], [13, 12], [13, 13], [13, 14], [14, 12], [14, 13], [15, 12]],
  [[13, 15], [14, 14], [14, 15], [15, 13], [15, 14], [15, 15]],
];
const regionCells = REGIONS.map(cells => cells.map(
  ([row, col]) => makeCellId(row + 1, col + 1))); // lint-ok: zero-indexed-cell-math
const SHADED_DIGITS = [1, 2, 3, 4, 5, 6];
const shadedIds = new Set(regionCells.filter(cells => cells.length === 6).flat());

const rowGroups = canvas.rows().flatMap(row => [
  row.filter(c => shadedIds.has(c)),
  row.filter(c => !shadedIds.has(c)),
]);
const columnGroups = canvas.columns().flatMap(col => [
  col.filter(c => shadedIds.has(c)),
  col.filter(c => !shadedIds.has(c)),
]);
const houses = [...regionCells, ...rowGroups, ...columnGroups]
  .map(cells => new AllDifferent(...cells));

// Domain per cell: grid cells default to the shape's full 0-9 alphabet, which
// already matches the unshaded (10x10) digits, so only the shaded (6x6)
// cells need a narrowing Given -- one Replicate template stamped over just
// those 96 cells.
const shadedDigitCells = canvas.cells().filter(cell => shadedIds.has(cell));
const domains = [
  canvas.makeReplicate(new Given(canvas.cells()[0], ...SHADED_DIGITS), shadedDigitCells),
];
// A run colour is 0 (none) or one of the seven letters below; 8 and 9 are
// unused values of the shared 0-9 alphabet. Same domain everywhere, so one
// Replicate template covers the whole grid.
const colourDomains = [
  colours.makeReplicate(new Given(colours.cells()[0], 0, 1, 2, 3, 4, 5, 6, 7), colours.cells()),
];

// Outside-clue tables, transcribed from the drawn text badges outside the
// grid, outermost-to-innermost (increasing distance from the grid edge is
// decreasing scan order, so the farthest badge is clue 0). Row i's badges are
// the stack drawn to the *left* of the grid at vertical offset i; column i's
// are the stack drawn *above* it at horizontal offset i. Letters match the
// rules' own legend: r,g,b,L,k,y,p.
const ROW_CLUES = [
  [[2, 'p']],
  [[1, 'p'], [6, 'k'], [4, 'L'], [0, 'g']],
  [[5, 'k'], [9, 'L'], [4, 'g'], [7, 'g']],
  [[3, 'p'], [6, 'k'], [24, 'L'], [0, 'g'], [5, 'g'], [9, 'L'], [5, 'g']],
  [[0, 'k'], [11, 'L'], [17, 'g'], [8, 'L'], [7, 'y'], [3, 'L'], [4, 'g']],
  [[4, 'p'], [9, 'k'], [14, 'L'], [1, 'g'], [0, 'L'], [13, 'y'], [3, 'b'], [6, 'y'], [2, 'g']],
  [[5, 'p'], [24, 'k'], [9, 'L'], [11, 'y'], [2, 'r']],
  [[5, 'p'], [12, 'k'], [9, 'y'], [16, 'L'], [9, 'y'], [1, 'r']],
  [[24, 'y'], [1, 'L'], [0, 'g']],
  [[1, 'p'], [9, 'k'], [12, 'L'], [22, 'y'], [8, 'L'], [8, 'g']],
  [[0, 'p'], [8, 'k'], [12, 'L'], [9, 'y'], [3, 'k'], [22, 'L'], [4, 'g']],
  [[7, 'k'], [6, 'L'], [7, 'p'], [9, 'k'], [18, 'L'], [3, 'g']],
  [[6, 'p'], [6, 'k'], [3, 'L'], [6, 'p'], [13, 'k'], [11, 'L'], [0, 'g']],
  [[3, 'p'], [7, 'k'], [0, 'p'], [9, 'k']],
  [[0, 'p'], [4, 'k'], [8, 'p'], [6, 'k'], [5, 'p']],
  [[9, 'p'], [1, 'p']],
];
const COL_CLUES = [
  [[3, 'p'], [3, 'p'], [4, 'p'], [1, 'p'], [2, 'p']],
  [[24, 'k'], [5, 'p'], [18, 'k'], [4, 'p']],
  [[20, 'L'], [11, 'k'], [5, 'L'], [11, 'k'], [3, 'p']],
  [[0, 'g'], [19, 'L'], [8, 'k'], [5, 'p'], [12, 'L'], [3, 'k']],
  [[4, 'g'], [11, 'L'], [6, 'k'], [12, 'L'], [9, 'k'], [9, 'p']],
  [[0, 'g'], [8, 'L'], [13, 'k'], [4, 'y'], [4, 'L']],
  [[9, 'g'], [7, 'L'], [17, 'y']],
  [[9, 'g'], [2, 'L'], [22, 'y']],
  [[5, 'g'], [19, 'L'], [9, 'y'], [7, 'p']],
  [[0, 'g'], [5, 'L'], [9, 'y'], [7, 'L'], [9, 'y'], [8, 'k'], [6, 'p']],
  [[1, 'g'], [4, 'L'], [22, 'y'], [8, 'L'], [5, 'k'], [0, 'p']],
  [[6, 'g'], [2, 'L'], [1, 'y'], [3, 'b'], [6, 'y'], [18, 'L'], [3, 'k']],
  [[5, 'g'], [3, 'L'], [11, 'y'], [0, 'g'], [14, 'L'], [14, 'k'], [8, 'p']],
  [[6, 'g'], [3, 'r'], [12, 'g'], [16, 'L'], [9, 'k'], [1, 'p']],
  [[0, 'r'], [3, 'g'], [4, 'L'], [1, 'k'], [3, 'p']],
  [[0, 'g'], [2, 'p']],
];
const COLOUR_CODE = { r: 1, g: 2, b: 3, L: 4, k: 5, y: 6, p: 7 };
const NO_COLOUR = 0;
const toClueList = raw => raw.map(([sum, letter]) => ({ sum, colour: COLOUR_CODE[letter] }));

// One NFA per row/column. Cells arrive as alternating (colour, digit) pairs
// in scan order. `active` tracks the run in progress (its colour and
// running sum, clamped at the clue's target once it can only fail); a run
// only ends by seeing a different colour, which is checked against the next
// expected clue. Same-colour clues can only advance through the `active ===
// null, value === NO_COLOUR` branch, i.e. through an intervening gap cell;
// different-coloured runs may start in the very same step a prior run ends.
function japaneseSumMachine(clueList) {
  return NFA.encodeSpec({
    startState: { phase: 'colour', tok: 0, active: null },
    transition: ({ phase, tok, active }, value) => {
      if (phase === 'digit') {
        if (active === null) return { phase: 'colour', tok, active: null };
        const target = clueList[tok].sum;
        const sum = Math.min(active.sum + value, target + 1);
        return { phase: 'colour', tok, active: { colour: active.colour, sum } };
      }
      if (active !== null) {
        if (value === active.colour) return { phase: 'digit', tok, active };
        const clue = clueList[tok];
        if (!clue || clue.colour !== active.colour || clue.sum !== active.sum) {
          return undefined;
        }
        const nextTok = tok + 1;
        if (value === NO_COLOUR) return { phase: 'digit', tok: nextTok, active: null };
        const nextClue = clueList[nextTok];
        if (!nextClue || nextClue.colour !== value) return undefined;
        return { phase: 'digit', tok: nextTok, active: { colour: value, sum: 0 } };
      }
      if (value === NO_COLOUR) return { phase: 'digit', tok, active: null };
      const clue = clueList[tok];
      if (!clue || clue.colour !== value) return undefined;
      return { phase: 'digit', tok, active: { colour: value, sum: 0 } };
    },
    accept: ({ phase, tok, active }) => {
      if (phase !== 'colour') return false;
      if (active === null) return tok === clueList.length;
      const clue = clueList[tok];
      if (!clue || clue.colour !== active.colour || clue.sum !== active.sum) return false;
      return tok + 1 === clueList.length;
    },
    // 16 cells, each an alternating (colour, digit) pair.
    maxDepth: 32,
  }, shape);
}

const interleave = cells => cells.flatMap(cell => [colours.at(cell), cell]);
const japaneseSums = [
  ...canvas.rows().map((row, i) => new NFA(
    japaneseSumMachine(toClueList(ROW_CLUES[i])), `row ${i + 1} japanese sum`,
    ...interleave(row))),
  ...canvas.columns().map((column, i) => new NFA(
    japaneseSumMachine(toClueList(COL_CLUES[i])), `column ${i + 1} japanese sum`,
    ...interleave(column))),
];

return [
  shape,
  colourVar,
  ...domains,
  ...colourDomains,
  ...houses,
  ...japaneseSums,
];
