// Title: An Approachable Miracle
// Author: Sumanta (ANU)
// Video: https://www.youtube.com/watch?v=g7VWVqF8SBs
// Source: https://app.crackingthecryptic.com/sudoku/QDrdF8HBqg

// Normal Sudoku. Nine straight vertical thermometers have their bulbs in R9,
// one per column, and have the nine different possible lengths. No two 9s
// share a diagonal. The bottom C3 and C6 clues are upward skyscrapers, 1 and 2.

const graph = cellGraph('9x9');
const height = new Var('T', 'thermometer lengths by column', 9);
const heights = height.cells();
const geometry = graph.gridGeometry();

// Each height Var selects one of the nine upward thermo suffixes in its column.
// AllDifferent makes the selected lengths exactly 1 through 9.
function verticalThermo(column) {
  const upward = graph.column(column).reverse();
  return new Or(Array.from({ length: 9 }, (_, index) => {
    const length = index + 1;
    return new And([
      new Given(height.cell(column), length),
      new Thermo(...upward.slice(0, length)),
    ]);
  }));
}

// PairX checks every pair in a cell group, so each complete diagonal forbids
// any two of its cells from both being 9.
const antiNine = PairX.fnToKey((a, b) => a !== 9 || b !== 9, 9);
const diagonalPairs = [[1, 1], [1, -1]].flatMap(([dr, dc]) => {
  const starts = dr === 1 && dc === 1
    ? [
      ...Array.from({ length: 9 }, (_, c) => [1, c + 1]),
      ...Array.from({ length: 8 }, (_, r) => [r + 2, 1]),
    ]
    : [
      ...Array.from({ length: 9 }, (_, c) => [1, c + 1]),
      ...Array.from({ length: 8 }, (_, r) => [r + 2, 9]),
    ];
  return starts.map(([row, col]) => {
    const cells = [];
    while (row >= 1 && row <= 9 && col >= 1 && col <= 9) {
      cells.push(makeCellId(row, col));
      row += dr;
      col += dc;
    }
    return new PairX(antiNine, 'no diagonal pair of 9s', ...cells);
  }).filter(constraint => constraint.cells.length >= 2);
});

return [
  new Shape('9x9'),
  height,
  new AllDifferent(...heights),
  ...Array.from({ length: 9 }, (_, index) => verticalThermo(index + 1)),
  ...diagonalPairs,
  Skyscraper.fromCells(1, graph.column(3).reverse(), geometry),
  Skyscraper.fromCells(2, graph.column(6).reverse(), geometry),
];
