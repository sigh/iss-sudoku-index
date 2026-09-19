// Title: When Kakuro meets Sudoku
// Author: ibogdank
// Video: https://www.youtube.com/watch?v=f95VPWh3aB0
// Source: https://test.crackingthecryptic.com/sudoku/PJgrQtBGdg

// Normal sudoku rules with digits 0-9: every row, column and 4x3 box holds
// each of 0-9 once, except that no digit goes in a shaded cell. A shaded
// cell (or a value printed just outside the grid, along the top/left edge)
// gives the sum of the unshaded run it introduces -- rightward for a value
// at a cell's top (or left of the grid), downward for a value at a cell's
// bottom (or above the grid) -- with no-repeat already guaranteed by the
// row/column rule, so only the sum is added per clued run. A run marked "?"
// is unclued (no-repeat only, already implied); a 1-cell run carries no
// printed total either way.
//
// The grid here is the drawn 13x13 board's rows 2-13, columns 2-13,
// renumbered to this script's own R1-R12/C1-C12: the board's shaded top
// row and left column are pure clue border and are not modelled as cells
// -- their totals are folded into BORDER_ACROSS/BORDER_DOWN below. A Raw grid is
// used (not the default Sudoku grid type) so the twelve shaded cells can be
// pinned to a fixed non-participating digit without colliding with a
// built-in row/column/box all-different, which would otherwise apply
// across all 12 cells of a unit rather than just its 10 playable ones; the
// row/column/box rules are therefore stated explicitly below, scoped to
// each unit's playable cells only.

const shape = new Shape('12x12', '0-9', 'Raw');
const cell = (r, c) => makeCellId(r, c);

// Shaded ("wall") cells that hold no digit, transcribed from the drawn
// blue 1x1 squares, one entry below per wall cell (every wall cell carries
// at least one printed total). Each value is the total for the run the
// wall introduces: `across` = the run to its right, `down` = the run below
// it, read off each cell's split-diagonal clue box by which triangle the
// total sits in (top-right = across, bottom-left = down; the diagonal
// stroke itself is decorative). '?' marks a printed "?" (unclued).
// Keyed by `${row},${col}` in this script's own 1-12 numbering.
const INTERIOR_TOTALS = {
  '1,7': { across: 24, down: '?' },
  '1,12': { down: 33 },
  '2,5': { across: 2, down: 41 },
  '2,8': { across: 16, down: 36 },
  '3,1': { across: 11, down: 38 },
  '3,4': { across: 34, down: 18 },
  '4,2': { across: 33, down: 9 },
  '4,10': { across: 9, down: 6 },
  '5,6': { across: 9, down: '?' },
  '5,11': { down: 14 },
  '6,3': { across: 13, down: 8 },
  '6,9': { across: 21, down: 11 },
  '7,4': { across: 32, down: 18 },
  '7,10': { across: 7, down: 18 },
  '8,2': { across: 17, down: 22 },
  '8,7': { across: 24, down: '?' },
  '9,3': { across: 32, down: 8 },
  '9,11': { down: 15 },
  '10,9': { across: 12, down: 11 },
  '10,12': { down: 12 },
  '11,5': { across: 16 },
  '11,8': { across: 12 },
  '12,1': { across: '?' },
  '12,6': { across: '?' },
};
const WALLS = new Set(Object.keys(INTERIOR_TOTALS));
const isWall = (r, c) => WALLS.has(`${r},${c}`);

// Totals printed along the board's border row (row 0) and column (column
// 0), each the total for the first run of its row/column (the setter drew
// these as an unsplit number, since only one direction is possible at the
// border). A row/column missing here has a first run 1 cell long or
// shorter, which carries no total.
const BORDER_ACROSS = { 1: 21, 2: 27, 5: 27, 6: 11, 7: 6, 9: 8, 10: 33, 11: 17 };
const BORDER_DOWN = { 1: 7, 2: 14, 3: 29, 4: 9, 6: '?', 9: 23, 10: 21, 11: 16 };

// Derive every across/down run (not hand-enumerated) as a maximal span of
// non-wall cells, matching each to its total: the border table if the run
// starts at column/row 1, otherwise the interior wall cell immediately
// before it. Every run longer than 1 cell resolves to a table entry (a
// number or '?'); the throw below guards that none is left unmatched.
function buildRuns(dim, isRowMajor) {
  const runs = [];
  for (let line = 1; line <= dim; line++) {
    let run = [];
    const flush = () => {
      if (run.length < 2) { run = []; return; }
      const start = run[0];
      const source = start === 1
        ? (isRowMajor ? BORDER_ACROSS[line] : BORDER_DOWN[line])
        : (isRowMajor
          ? INTERIOR_TOTALS[`${line},${start - 1}`]?.across
          : INTERIOR_TOTALS[`${start - 1},${line}`]?.down);
      if (source === undefined) {
        throw new Error(`No clue source for run at line ${line} start ${start}`);
      }
      const cells = run.map(pos => isRowMajor ? cell(line, pos) : cell(pos, line));
      runs.push({ total: source, cells });
      run = [];
    };
    for (let pos = 1; pos <= dim; pos++) {
      const [r, c] = isRowMajor ? [line, pos] : [pos, line];
      if (isWall(r, c)) { flush(); } else { run.push(pos); }
    }
    flush();
  }
  return runs;
}
const runs = [...buildRuns(12, true), ...buildRuns(12, false)];

// Sum constraints: one per run with a printed numeric total. Distinctness
// within a run is already implied by its row/column all-different below,
// so no separate AllDifferent/Cage is needed. Runs marked '?' get no
// constraint -- they are unclued by the drawn art, not a gap: the
// no-repeat they'd otherwise need is already the row/column rule.
const sums = runs
  .filter(run => typeof run.total === 'number')
  .map(run => new Sum(run.total, ...run.cells));

// Row/column/box all-different, scoped to each unit's playable (non-wall)
// cells only -- ten cells per unit for the ten digits 0-9, since every row,
// column and box has exactly two wall cells.
const playableIn = cells => cells.filter(([r, c]) => !isWall(r, c));

const rowGroups = [];
for (let r = 1; r <= 12; r++) {
  const cells = [];
  for (let c = 1; c <= 12; c++) cells.push([r, c]);
  rowGroups.push(playableIn(cells));
}
const colGroups = [];
for (let c = 1; c <= 12; c++) {
  const cells = [];
  for (let r = 1; r <= 12; r++) cells.push([r, c]);
  colGroups.push(playableIn(cells));
}
// Boxes are the twelve 4x3 rectangles: row bands {1-4,5-8,9-12} crossed
// with column bands {1-3,4-6,7-9,10-12}, as drawn on the board.
const boxGroups = [];
for (const [rLo, rHi] of [[1, 4], [5, 8], [9, 12]]) {
  for (const [cLo, cHi] of [[1, 3], [4, 6], [7, 9], [10, 12]]) {
    const cells = [];
    for (let r = rLo; r <= rHi; r++) {
      for (let c = cLo; c <= cHi; c++) cells.push([r, c]);
    }
    boxGroups.push(playableIn(cells));
  }
}
const allDifferents = [...rowGroups, ...colGroups, ...boxGroups]
  .map(cells => new AllDifferent(...cells.map(([r, c]) => cell(r, c))));

// Pin every wall cell to a fixed non-participating digit (0). Wall cells
// are excluded from every all-different and Sum group above, so this
// choice cannot collide with a real digit; it only removes ten free
// choices per wall cell from the measured search space.
const wallGivens = [...WALLS].map(key => {
  const [r, c] = key.split(',').map(Number);
  return new Given(cell(r, c), 0);
});

return [shape, ...allDifferents, ...sums, ...wallGivens];
