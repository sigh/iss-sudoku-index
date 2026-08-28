// Title: Yin-Yang Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=qyM_aI4JTZM
// Source: https://app.crackingthecryptic.com/sudoku/GHr3MNpNBd

// Rules:
//   - Normal Sudoku rules apply. The grid has no given digits.
//   - Some cells have to be coloured grey. All grey cells have to be
//     orthogonally connected. All white cells have to be orthogonally
//     connected, as well.
//   - No 2x2 region may be completely covered by grey cells, or completely
//     covered by white cells.
//   - The clues outside of the grid indicate the sum of all grey cells in the
//     respective row or column.
// Every clause is encoded; nothing is omitted.

// The value range is widened by one so that the masked overlay below can hold
// 0 for a white cell. Grid cells are put back to 1-9; the extra value 0 is
// only ever used by Var cells.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// YinYang colours the grid with the two lowest values of the range, so on this
// 0-9 shape grey is 0 and white is 1.
const GREY = 0;
const WHITE = 1;
const shade = graph.makeOverlay('YY');

// Masked digits: a grey cell's own digit, 0 for a white cell. A row or column
// clue is then a plain Sum over this overlay.
const masked = graph.makeOverlay('VG');

// Split across two binary relations rather than one three-way constraint:
// together they say masked = digit when grey and masked = 0 when white.
const maskedIsDigitOrZero = Pair.fnToKey((digit, m) => m === 0 || m === digit, shape);
const maskedIsNonZeroIffGrey = Pair.fnToKey((s, m) => (s === GREY) === (m !== 0), shape);

const maskRules = graph.cells().flatMap(cell => [
  new Pair(maskedIsDigitOrZero, 'masked digit', cell, masked.at(cell)),
  new Pair(maskedIsNonZeroIffGrey, 'masked shade', shade.at(cell), masked.at(cell)),
]);

// Printed in the margin left of each row and above each column; rows 4 and 6
// and columns 1, 5 and 9 carry no clue.
const rowClues = { 1: 7, 2: 12, 3: 17, 5: 17, 7: 27, 8: 8, 9: 27 };
const colClues = { 2: 13, 3: 38, 4: 22, 6: 14, 7: 24, 8: 9 };

const outsideClues = [
  ...Object.entries(rowClues).map(
    ([row, total]) => new Sum(total, ...masked.at(graph.row(+row)))),
  ...Object.entries(colClues).map(
    ([col, total]) => new Sum(total, ...masked.at(graph.column(+col)))),
];

return [
  shape,
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  new YinYang(),
  masked.toVar('masked grey digits'),
  ...maskRules,
  ...outsideClues,
];
