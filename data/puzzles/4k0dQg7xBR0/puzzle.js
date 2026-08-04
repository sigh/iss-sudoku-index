// Title: Blackout
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=4k0dQg7xBR0
// Source: https://app.crackingthecryptic.com/sudoku/h9q22bptmF

// Normal sudoku rules apply, plus:
// - Mark nine cells, one per row, column and box. The digit in a row's first
//   cell (its column-1 entry) gives the column of that row's marked cell; the
//   digit in a column's first cell (its row-1 entry) gives the row of that
//   column's marked cell; the digit in a box's first cell (reading-order
//   position 1) gives the reading-order position (1-9) of that box's marked
//   cell.
// - The nine marked cells' digits are exactly 1-9, each once.
// - Adjacent digits on each green line differ by at least 5.
// Fog/reveal is solving UI, not a final-grid rule, and is not encoded.

const graph = cellGraph('9x9');
const boxes = graph.boxes(); // boxes[0]..boxes[8], each 9 cells in reading order

// Row and column marking is read directly off column 1 / row 1: each row and
// column already has exactly one marked cell (by rule), and a row/column
// reads left-to-right/top-to-bottom, so the marked column of row r is simply
// the digit at R{r}C1, and the marked row of column c is the digit at
// R1C{c}. Column 1 and row 1 are already all-different by ordinary Sudoku,
// which alone gives one marked cell per column and per row.

// Consistency: the row view and column view must describe the same physical
// marked cell. For every (r, c) other than the shared corner cell, if
// R{r}C1 = c (row r's marked cell sits at column c) then R1C{c} must = r
// (column c's marked cell sits at row r). Column 1 being a permutation makes
// this pin the column view as the exact inverse of the row view.
const inverseLinks = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    if (r === 1 && c === 1) continue; // same cell on both sides; vacuous
    const rowCell = makeCellId(r, 1);
    const colCell = makeCellId(1, c);
    inverseLinks.push(new Pair(
      Pair.fnToKey((a, b) => !(a === c && b !== r), 9),
      '', rowCell, colCell));
  }
}

// One marked cell per box: within each row band (rows 1-3, 4-6, 7-9), the
// three marked columns (read off column 1) must be one from each
// box-column third {1,2,3}/{4,5,6}/{7,8,9} -- otherwise two of that band's
// marked cells would land in the same box. Entropic over exactly 3 cells
// enforces "one from each third" for that single group.
const bandStartRows = [0, 3, 6].map(i => parseCellId(boxes[i][0]).row);
const bandEntropics = bandStartRows.map(r =>
  new Entropic(makeCellId(r, 1), makeCellId(r + 1, 1), makeCellId(r + 2, 1)));

// Box position: box b's first cell (its own reading-order position 1) holds
// the reading-order position (1-9) of box b's marked cell. Enumerate box b's
// own 9 cells as the candidate marked cell: cell (r, c) is the candidate
// exactly when row r's marked column (R{r}C1) equals c; when it is, the
// box's first cell must hold that candidate's reading-order position.
const boxPositionLinks = boxes.map(cells => new Or(
  cells.map((cellId, idx) => {
    const { row, col } = parseCellId(cellId);
    return new And([
      new Given(makeCellId(row, 1), col),
      new Given(cells[0], idx + 1),
    ]);
  })
));

// Each digit appears in exactly one marked cell: an auxiliary Var per row
// holds the digit written at that row's marked cell. Row r's marked column
// is R{r}C1's value, so markedValue(r) is pinned to the grid digit at that
// column, for whichever column it turns out to be.
const markedValue = new Var('M', 'Marked digit', 9);
const markedValueLinks = [];
for (let r = 1; r <= 9; r++) {
  const branches = [];
  for (let c = 1; c <= 9; c++) {
    branches.push(new And([
      new Given(makeCellId(r, 1), c),
      new SameValues(2, markedValue.cell(r), makeCellId(r, c)),
    ]));
  }
  markedValueLinks.push(new Or(branches));
}

// Green lines: adjacent digits differ by at least 5 (Whisper). Cell lists
// are the drawn wayPoint order (all open paths, not closed loops).
const greenLines = [
  new Whisper(5, 'R1C2', 'R2C3', 'R3C2', 'R2C1'),
  new Whisper(5, 'R4C4', 'R3C5', 'R4C6', 'R5C7', 'R6C6'),
  new Whisper(5, 'R6C8', 'R5C9'),
  new Whisper(5, 'R9C9', 'R9C8'),
];

return [
  new Shape('9x9'),
  markedValue,
  new AllDifferent(...markedValue.cells()),
  ...inverseLinks,
  ...bandEntropics,
  ...boxPositionLinks,
  ...markedValueLinks,
  ...greenLines,
];
