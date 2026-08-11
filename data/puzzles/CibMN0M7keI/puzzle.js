// Title: Eighteen Radars
// Author: Yatopia
// Video: https://www.youtube.com/watch?v=CibMN0M7keI
// Source: https://app.crackingthecryptic.com/sudoku/2PNQJ3823q

// Rules encoded:
// - Normal sudoku rules (default Shape('9x9'): row/column/box all-different).
// - No two orthogonally adjacent cells hold consecutive values (AntiConsecutive).
// - No two cells a knight's move apart hold the same value (AntiKnight).
// - A radar cell's value is the distance to the closest 9 on its row or column.
//   All radars are marked grey; every marked cell is a radar. Read together
//   this marking is exhaustive: grey cells must satisfy the radar equation
//   and every other cell must fail it, or an unmarked cell would itself be
//   an unmarked radar. Grey cells are the puzzle's 18 grey 1x1 underlays.

const graph = cellGraph('9x9');

// Every row/column of a 9x9 sudoku holds exactly one 9 (row/col all-different),
// so "distance to the closest 9 on this row/column" is just the distance to
// that one 9. posInRow[r] = the column holding row r's 9; posInCol[c] = the
// row holding column c's 9. ValueIndexing(valueCell, controlCell, ...cells)
// is a 1-indexed dereference: it forces controlCell to the index i with
// cells[i-1] == valueCell. Using a cell pinned to 9 as valueCell turns that
// into "find the position of the 9".
const nine = new Var('N', 'nine', 1);
const posInRow = new Var('R', 'pos-in-row', 9); // VR1..VR9
const posInCol = new Var('C', 'pos-in-col', 9); // VC1..VC9

const rowIndexers = [];
for (let r = 1; r <= 9; r++) {
  rowIndexers.push(
    new ValueIndexing(nine.cell(1), posInRow.cell(r), ...graph.row(r)));
}
const colIndexers = [];
for (let c = 1; c <= 9; c++) {
  colIndexers.push(
    new ValueIndexing(nine.cell(1), posInCol.cell(c), ...graph.column(c)));
}

// Grey (radar) cells: the 18 grey 1x1 underlays from the puzzle's source
// payload, converted from their [row,col] 0-indexed centers.
const greyCells = new Set([
  'R1C2', 'R1C5', 'R1C7', 'R2C6', 'R3C7', 'R4C6', 'R5C8', 'R3C4', 'R4C3',
  'R5C2', 'R5C4', 'R6C5', 'R7C1', 'R8C3', 'R8C5', 'R9C6', 'R8C7', 'R9C8',
]);

// One NFA per grid cell (r, c), reading [posInRow(r), posInCol(c), cell]:
// posInRow(r)/posInCol(c) give the row's/column's 9-position, and the third
// symbol is the cell's own digit. The radar value is
// min(|c - posInRow(r)|, |r - posInCol(c)|). Grey cells must equal it; every
// other cell must not, per the exhaustive-marking reading above.
const radarNFAs = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cellId = makeCellId(r, c);
    const isRadar = greyCells.has(cellId);
    const spec = NFA.encodeSpec({
      startState: { step: 0 },
      transition: ({ step, posRow, posCol }, value) => {
        if (step === 0) return { step: 1, posRow: value };
        if (step === 1) return { step: 2, posRow, posCol: value };
        // step === 2: value is this cell's own digit.
        const expected = Math.min(Math.abs(c - posRow), Math.abs(r - posCol));
        const matches = value === expected;
        return (isRadar ? matches : !matches) ? { step: 3 } : undefined;
      },
      accept: ({ step }) => step === 3,
    }, 9);
    radarNFAs.push(
      new NFA(spec, 'radar', posInRow.cell(r), posInCol.cell(c), cellId));
  }
}

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  new AntiKnight(),
  nine,
  posInRow,
  posInCol,
  new Given(nine.cell(1), 9),
  ...rowIndexers,
  ...colIndexers,
  ...radarNFAs,
];
