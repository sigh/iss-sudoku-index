// Title: Highs and Lows
// Author: RK2793
// Video: https://www.youtube.com/watch?v=ZOBRY-lbo_E
// Source: https://app.crackingthecryptic.com/sudoku/tBpm7R4Mth

// Rules encoded: standard 9x9 sudoku (rows, columns, boxes all-different,
// digits 1-9); one given; one drawn cage with a printed sum; a "+"/"-" sign
// on every internal cell boundary, comparing each cell to its left neighbour
// (horizontal signs) or to the cell above (vertical signs); an outside sum
// to the left of each row totalling the cells in that row whose only
// applicable sign(s) are "-"; an outside sum above each column totalling the
// cells in that column whose only applicable sign(s) are "+".
//
// The corner cell R1C1 has no left neighbour and no top neighbour, so it
// carries no sign at all. It is therefore excluded from both the row-1 and
// column-1 special sums (a cell with zero signs is not "only -" or "only +"
// in any positive sense). This is also forced by arithmetic from the givens:
// row 1's clue is 11 and R1C1=6; if R1C1 counted, the other 3 selected R1
// cells (distinct digits, excluding 6) would need to sum to 5, but any 3
// distinct digits from {1..5,7,8,9} sum to at least 1+2+3=6 > 5. So R1C1
// cannot be part of the row-1 selection, and symmetrically not of the
// column-1 selection.

// H[r-1] is an 8-character string giving the horizontal ("left of cell")
// sign for cells (r,2)..(r,9), one char per column, transcribed from the
// drawn "+"/"-" marks printed just inside the left edge of each cell.
const H = [
  '--+-++-+', // row 1
  '+--+--++', // row 2
  '--+++-+-', // row 3
  '++--+++-', // row 4
  '+++-+++-', // row 5
  '-++-++-+', // row 6
  '++--+--+', // row 7
  '+--+-++-', // row 8
  '-+-+-+-+', // row 9
];

// VSIGN[c-1] is an 8-character string giving the vertical ("top of cell")
// sign for cells (2,c)..(9,c), one char per row, transcribed from the drawn
// "+"/"-" marks printed just inside the top edge of each cell.
const VSIGN = [
  '+---+--+', // col 1
  '+-+--++-', // col 2
  '+-+-++-+', // col 3
  '-+++---+', // col 4
  '++-++++-', // col 5
  '-+-+-+--', // col 6
  '--++--++', // col 7
  '+++---+-', // col 8
  '--+-+-++', // col 9
];

const hSign = (r, c) => H[r - 1][c - 2]; // c in 2..9
const vSign = (r, c) => VSIGN[c - 1][r - 2]; // r in 2..9

const greaterThans = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 2; c <= 9; c++) {
    const cellHi = hSign(r, c) === '-' ? makeCellId(r, c - 1) : makeCellId(r, c);
    const cellLo = hSign(r, c) === '-' ? makeCellId(r, c) : makeCellId(r, c - 1);
    greaterThans.push(new GreaterThan(cellHi, cellLo));
  }
}
for (let c = 1; c <= 9; c++) {
  for (let r = 2; r <= 9; r++) {
    const cellHi = vSign(r, c) === '-' ? makeCellId(r - 1, c) : makeCellId(r, c);
    const cellLo = vSign(r, c) === '-' ? makeCellId(r, c) : makeCellId(r - 1, c);
    greaterThans.push(new GreaterThan(cellHi, cellLo));
  }
}

// Row clue (left of grid): sum of cells in the row whose only sign(s),
// among {left sign if c>1, top sign if r>1}, are '-'.
const rowClueValue = [11, 6, 17, 4, 3, 3, 14, 10, 7]; // R1..R9, transcribed from the printed outside-left clues
const rowSums = [];
for (let r = 1; r <= 9; r++) {
  const cells = [];
  for (let c = 1; c <= 9; c++) {
    const signs = [];
    if (c > 1) signs.push(hSign(r, c));
    if (r > 1) signs.push(vSign(r, c));
    if (signs.length > 0 && signs.every(s => s === '-')) {
      cells.push(makeCellId(r, c));
    }
  }
  rowSums.push(new Sum(rowClueValue[r - 1], ...cells));
}

// Column clue (above grid): sum of cells in the column whose only sign(s),
// among {left sign if c>1, top sign if r>1}, are '+'.
const colClueValue = [22, 30, 30, 18, 23, 30, 33, 27, 20]; // C1..C9, transcribed from the printed outside-top clues
const colSums = [];
for (let c = 1; c <= 9; c++) {
  const cells = [];
  for (let r = 1; r <= 9; r++) {
    const signs = [];
    if (c > 1) signs.push(hSign(r, c));
    if (r > 1) signs.push(vSign(r, c));
    if (signs.length > 0 && signs.every(s => s === '+')) {
      cells.push(makeCellId(r, c));
    }
  }
  colSums.push(new Sum(colClueValue[c - 1], ...cells));
}

return [
  new Shape('9x9'),
  new Given('R1C1', 6),
  new Cage(14, 'R8C9', 'R9C9'), // drawn cage box; R8C9/R9C9 already in the same column so sudoku forbids a repeat
  ...greaterThans,
  ...rowSums,
  ...colSums,
];
