// Title: April 1, 2022: Kakuro
// Author: clover!
// Video: https://www.youtube.com/watch?v=Lh_j9DLhIY4
// Source: https://tinyurl.com/ybntat35

// Rules: "Normal sudoku rules apply; however, there are no 3x3 regions, and
// digits may repeat in a row or column as long as they're separated by at
// least one gray square. Do not place digits in gray squares. The value in
// a gray square tells you the sum of all of the digits either to its right
// (if the value appears in the top right) or below it (if the value appears
// in the bottom left), up to the next gray square." This is a Kakuro: each
// maximal run of white cells between gray cells (or the grid edge) is
// all-different, and where a gray cell prints a total for a direction, that
// run also sums to it.
//
// The grid is `Raw` (no implicit row/column/box rules), since digits repeat
// across a row/column once separated by a gray cell -- every rule is stated
// explicitly below, derived from the grid layout rather than hand-listed.
// The value range is widened to 0-9 so gray cells can hold a blank marker 0;
// white cells are restricted back to 1-9.

// Transcribed from the puzzle's gray cells and their printed totals, keyed
// by corner: a top-right total gives the rightward run's sum, a bottom-left
// total the downward run's sum, matching "top right"/"bottom left" in the
// rules text above. Row by row R1C1..R10C10. '#' = gray, no total; '.' =
// white, no total; 'R<n>'/'D<n>' = gray with a rightward/downward total (a
// cell may carry both).
const ROWS = [
  ['#',   'D11', '#',    'D8',   'D10', '#',   'D29', 'D12',    '#',   'D13'],
  ['R10', '.',   '.',    '.',    '.',   'R30', '.',   '.',      '.',   '.'],
  ['#',   '.',   'R9D8', '.',    '.',   'R14', '.',   '.',      'D8',  '.'],
  ['R10', '.',   '.',    'R8D8', '.',   '.',   '.',   'R10D20', '.',   '.'],
  ['R10', '.',   '.',    '.',    '.',   'R13', '.',   '.',      '.',   '.'],
  ['#',   'D26', 'D10',  '.',    'D26', '#',   'D12', '.',      'D12', 'D13'],
  ['R10', '.',   '.',    '.',    '.',   'R30', '.',   '.',      '.',   '.'],
  ['R12', '.',   '.',    'R11D7', '.',  '.',   '.',   'R7D9',   '.',   '.'],
  ['#',   '.',   'R8',   '.',    '.',   'R3',  '.',   '.',      '#',   '.'],
  ['R30', '.',   '.',    '.',    '.',   'R22', '.',   '.',      '.',   '.'],
];

const BLANK = 0;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('10x10', '0-9', 'Raw');
const graph = cellGraph(shape);
const origin = graph.cells()[0]; // R1C1, used only as the Replicate shift anchor

// r, c are 1-indexed (R1C1..R10C10), matching ROWS's printed layout.
const tokenAt = (r, c) => ROWS[r - 1][c - 1];
const cellAt = (r, c) => makeCellId(r, c);
const isGray = (r, c) => tokenAt(r, c) !== '.';
const clueValue = (r, c, letter) => {
  const m = tokenAt(r, c).match(new RegExp(letter + '(\\d+)'));
  return m ? Number(m[1]) : null;
};

const grayCells = [];
const whiteCells = [];
for (let r = 1; r <= 10; r++) {
  for (let c = 1; c <= 10; c++) {
    const cell = cellAt(r, c);
    (isGray(r, c) ? grayCells : whiteCells).push(cell);
  }
}

// Blank marker on gray cells; true digit range on white cells. Both are one
// shifted template Given, replicated onto every cell of that colour.
const domains = [
  graph.makeReplicate(new Given(origin, BLANK), grayCells),
  graph.makeReplicate(new Given(origin, ...DIGITS), whiteCells),
];

// Walk from just after a gray cell in one direction until the next gray
// cell or the grid edge, collecting the run's white cells.
const runCells = (r, c, dr, dc) => {
  const cells = [];
  let rr = r + dr, cc = c + dc;
  while (rr >= 1 && rr <= 10 && cc >= 1 && cc <= 10 && !isGray(rr, cc)) {
    cells.push(cellAt(rr, cc));
    rr += dr; cc += dc;
  }
  return cells;
};

// One run per direction per gray cell: all-different always (the relaxed
// row/column rule), plus a Sum when that gray cell prints a total for the
// direction.
const runConstraints = [];
for (let r = 1; r <= 10; r++) {
  for (let c = 1; c <= 10; c++) {
    if (!isGray(r, c)) continue;
    for (const [dr, dc, letter] of [[0, 1, 'R'], [1, 0, 'D']]) {
      const cells = runCells(r, c, dr, dc);
      if (cells.length > 1) runConstraints.push(new AllDifferent(...cells));
      const total = clueValue(r, c, letter);
      if (total !== null) runConstraints.push(new Sum(total, ...cells));
    }
  }
}

return [
  shape,
  ...domains,
  ...runConstraints,
];
