// Title: Nothing's Perfect
// Author: NotThatItMatters
// Video: https://www.youtube.com/watch?v=YfvasDcx94M
// Source: https://app.crackingthecryptic.com/sudoku/D439327Fp9

// Normal sudoku rules (default Shape rows/cols/boxes).
//
// There is a single set of 9 "marker" cells: one per row, one per column,
// one per box. Three clues each name part of this same set and must cohere:
//   - row 1: R1Cc's digit V means (V, c) is the marker in column c.
//   - column 1: RrC1's digit W means (r, W) is the marker in row r.
//   - each box's own bottom-right cell (its "position 9") holds a digit P
//     that names the box-relative position (1-9, reading order) of that
//     box's marker.
// Column 1 is already all-different (ordinary sudoku), so reading RrC1 as
// "row r's marker column" already gives one marker per row and per column
// for free; the row-1 clue and the box clue must describe that same
// permutation, which is encoded below as "whatever value the indicator
// holds, the described cell/position is exactly the column-1-derived
// marker" -- one Or-of-Given-pairs per indicator cell.
//
// "Marker cells contain all digits EXCEPT 6" is read as a completeness
// claim -- every digit in {1,2,3,4,5,7,8,9} appears at least once among the
// 9 marker cells, and 6 never does (ordinary reading of "contains all X
// except Y"). Since there are 9 marker cells and 8 permitted digits, one
// digit necessarily repeats.
//
// Kropki: two black dots (2:1 ratio), both given explicitly below. "ALL
// black dots are shown" makes every other orthogonally adjacent pair NOT a
// black dot -- encoded as a negative Pair Replicated over every undrawn
// horizontal/vertical edge (the rules say nothing about white/consecutive
// dots, so those are left free).

const graph = cellGraph('9x9');
const col1 = graph.column(1);   // R1C1..R9C1, top to bottom
const row1 = graph.row(1);      // R1C1..R1C9, left to right
const boxes = graph.boxes();    // 9 boxes, row-major reading order per box

const nums = Array.from({ length: 9 }, (_, i) => i + 1);

// One auxiliary Var per row: the digit sitting at that row's marker cell.
// Located via the row's own column-1 cell (the natural "row r" locator).
const markerDigits = graph.makeOverlay('VMD', col1);

// value(r,1) = w  =>  row1's cell in column w must read back r (row1's
// clue for column w names the row of column w's marker, which is the same
// cell as row r's marker whenever w = value(r,1)).
function rowColumnConsistency(r) {
  const rCell = col1[r - 1];
  return new Or(nums.map(w => new And([
    new Given(rCell, w),
    new Given(row1[w - 1], r),
  ])));
}

// value(r,1) = w  =>  the marker digit for row r is whatever sits at (r, w).
function markerDigitLink(r) {
  const rCell = col1[r - 1];
  const mdCell = markerDigits.at(rCell);
  return new Or(nums.map(w => new And([
    new Given(rCell, w),
    new SameValues(2, makeCellId(r, w), mdCell),
  ])));
}

// The box's own position-9 (bottom-right) cell holds P => the cell at
// box-relative position P (reading order) is row (rowStart+rowOffset)'s
// marker, i.e. that row's column-1 cell must read back the matching column.
function boxConsistency(boxCells) {
  const corner = boxCells[8];
  const { row: rowStart, col: colStart } = parseCellId(boxCells[0]);
  return new Or(nums.map(p => {
    const rowOffset = Math.floor((p - 1) / 3);
    const colOffset = (p - 1) % 3;
    const targetRow = rowStart + rowOffset;
    const targetCol = colStart + colOffset;
    return new And([
      new Given(corner, p),
      new Given(makeCellId(targetRow, 1), targetCol),
    ]);
  }));
}

// Black Kropki dots: exactly these two, drawn as edge overlays between R8
// and R9 (source-assets: puzzle overlay geometry).
const blackDots = [
  ['R8C3', 'R9C3'],
  ['R8C5', 'R9C5'],
];

const notRatio2 = Pair.fnToKey((a, b) => a !== b * 2 && b !== a * 2, 9);

// Every horizontal edge is a shifted copy of the same template (no black
// dot is horizontal); every vertical edge is too, except the two marked
// ones. Replicate keeps the encoding to two templates instead of 142 Pairs.
const horizontalOrigins = nums.flatMap(
  r => nums.slice(0, 8).map(c => makeCellId(r, c)));
const verticalOrigins = nums.slice(0, 8).flatMap(
  r => nums.map(c => makeCellId(r, c)))
  .filter(cell => cell !== 'R8C3' && cell !== 'R8C5');

const horizontalNegative = graph.makeReplicate(
  new Pair(notRatio2, 'no unmarked black dot (horiz)', 'R1C1', 'R1C2'),
  horizontalOrigins);
const verticalNegative = graph.makeReplicate(
  new Pair(notRatio2, 'no unmarked black dot (vert)', 'R1C1', 'R2C1'),
  verticalOrigins);

return [
  new Shape('9x9'),

  markerDigits.toVar('marker digit (per row)'),
  ...col1.map(c => new Given(markerDigits.at(c), 1, 2, 3, 4, 5, 7, 8, 9)),

  ...nums.map(rowColumnConsistency),
  ...nums.map(markerDigitLink),
  ...boxes.map(boxConsistency),

  new ContainAtLeast('1_2_3_4_5_7_8_9', ...markerDigits.at(col1)),

  new BlackDot(...blackDots[0]),
  new BlackDot(...blackDots[1]),
  horizontalNegative,
  verticalNegative,
];
