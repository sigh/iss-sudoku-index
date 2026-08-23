// Title: Black Rose
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=RS_qVmj9teA
// Source: https://app.crackingthecryptic.com/sudoku/2gT2TmHmRm

// Normal sudoku rules apply (standard 3x3 boxes, no given digits). Yin-Yang:
// shading is the YinYang constraint's YY cell group. Each outside clue gives
// the sum of the digits in the first continuous block of shaded cells seen
// scanning inward from that side.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// An outside clue's target is the digits of the first unbroken run of shaded
// cells scanning `lineCells` from index 0 (the end nearest the clue). Try
// every candidate run [start, end]: the cells before it unshaded, the run
// itself shaded, the cell after it (if any) unshaded, and its digits sum to
// `total`. Exactly one window matches the true shading, so the clue is
// their Or.
function outsideShadedSum(total, lineCells) {
  const windows = [];
  for (let start = 0; start < lineCells.length; start++) {
    for (let end = start; end < lineCells.length; end++) {
      windows.push(new And([
        ...lineCells.slice(0, start)
          .map(cell => new Given(shade.at(cell), UNSHADED)),
        ...lineCells.slice(start, end + 1)
          .map(cell => new Given(shade.at(cell), SHADED)),
        ...(end + 1 < lineCells.length
          ? [new Given(shade.at(lineCells[end + 1]), UNSHADED)] : []),
        new Sum(total, ...lineCells.slice(start, end + 1)),
      ]));
    }
  }
  return new Or(windows);
}

// Outside-clue totals and lanes, transcribed from the drawn edge overlays.
// Cells are ordered from the edge nearest the clue inward, per direction.
const outsideClues = [
  // top: scan down the column, row 1 first
  { total: 26, cells: graph.column(1) },
  { total: 14, cells: graph.column(5) },
  { total: 15, cells: graph.column(7) },
  // left: scan right along the row, col 1 first
  { total: 38, cells: graph.row(1) },
  { total: 7, cells: graph.row(3) },
  { total: 7, cells: graph.row(4) },
  { total: 13, cells: graph.row(5) },
  // right: scan left along the row, col 9 first
  { total: 10, cells: graph.row(2).slice().reverse() },
  { total: 12, cells: graph.row(3).slice().reverse() },
  { total: 7, cells: graph.row(4).slice().reverse() },
  { total: 13, cells: graph.row(5).slice().reverse() },
  // bottom: scan up the column, row 9 first
  { total: 10, cells: graph.column(3).slice().reverse() },
  { total: 7, cells: graph.column(4).slice().reverse() },
  { total: 15, cells: graph.column(5).slice().reverse() },
  { total: 6, cells: graph.column(6).slice().reverse() },
  { total: 14, cells: graph.column(7).slice().reverse() },
  { total: 6, cells: graph.column(8).slice().reverse() },
];

return [
  new Shape('9x9'),
  new YinYang(),
  ...outsideClues.map(({ total, cells }) => outsideShadedSum(total, cells)),
];
