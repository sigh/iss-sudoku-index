// Title: The Raven
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=kglHhQzsCzo
// Source: https://app.crackingthecryptic.com/sudoku/QTDfNnbPhh

// Rules encoded here:
//  - Normal sudoku.
//  - The two lines are equal sum lines: the digits of a line that lie inside one
//    3x3 box sum to the same total in every box the line passes through.
//    Different lines may have different totals.
//  - Each letter stands for one digit and different letters stand for different
//    digits; a letter drawn inside a cell is that cell's digit.
//  - The clues outside the grid are x-sums: with x the digit in the first cell
//    in the clue's direction, the first x cells sum to the clue's value.  Every
//    clue value is spelled with letters (NE VE RM O RE = NEVERMORE).
//
// Nothing is omitted.

// Ten letters are used, so the letter alphabet needs ten digits: the grid's
// value range is widened to 0-9 and the playable cells are put back to the
// sudoku digits 1-9, leaving 0 available only to the letter variable below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const sudokuDigits = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

const boxOf = (cell) => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

// Split a line's cells into one segment per 3x3 box it occupies.  A box the line
// enters twice yields a single segment: the rule totals the digits "within a
// particular 3x3 region", not the runs the drawn walk happens to make.
const boxSegments = (cells) => {
  const byBox = new Map();
  for (const cell of cells) {
    const box = boxOf(cell);
    if (!byBox.has(box)) byBox.set(box, []);
    byBox.get(box).push(cell);
  }
  return [...byBox.values()];
};

// --- letters -------------------------------------------------------------
// The letter drawn in each cell, from the text placed inside the grid:
// row 2 spells THE, row 5 spells RAVEN, and E. A. POE runs up the lower right.
const letterCells = {
  T: ['R2C2'],
  H: ['R2C3'],
  E: ['R2C4', 'R5C6', 'R9C5', 'R7C8'],
  R: ['R5C3'],
  A: ['R5C4', 'R8C6'],
  V: ['R5C5'],
  N: ['R5C7'],
  P: ['R8C7'],
  O: ['R7C7'],
};

// M is the tenth letter of the puzzle and the only one drawn in no cell: it
// occurs just as the units digit of the clue under column 5.  It gets a
// variable, whose domain is the widened 0-9 range.
const mVar = new Var('M', 'M');
const mCell = 'VM';

const sameLetter = Object.values(letterCells)
  .filter((cells) => cells.length > 1)
  .map((cells) => new SameValues(cells.length, ...cells));

// One cell per letter, all ten different.  T, H and P are drawn once each and
// are named by no clue, so this is the only rule those three letters carry.
const differentLetters = new AllDifferent(
  ...Object.values(letterCells).map((cells) => cells[0]), mCell);

// --- equal sum lines -----------------------------------------------------
// Two colours are drawn, so two lines.  The grey line is exported as two strokes
// because it branches at R6C5, which a single stroke cannot do; its cells are
// the union of both strokes.  The chocolate line is the single stroke below the
// bird.  Cells are listed once each: the loop's repeated start cell and the
// stroke that retraces R7C5 add no new cell.
const greyLine = [
  // the closed loop, walked as drawn from R7C1
  'R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R2C7', 'R3C8', 'R3C7',
  'R4C6', 'R5C6', 'R6C5', 'R6C4', 'R6C3', 'R7C2',
  // the branch hanging from R6C5
  'R7C5', 'R7C4', 'R7C6',
];
const brownLine = ['R7C6', 'R7C7', 'R7C8'];

// --- x-sum clues ---------------------------------------------------------
// The five clues sit under columns 3 to 7, so each reads upwards and its first
// cell is in row 9.  Their values are the letter strings printed there.
const xSumClues = [
  { col: 3, letters: ['N', 'E'] },
  { col: 4, letters: ['V', 'E'] },
  { col: 5, letters: ['R', 'M'] },
  { col: 6, letters: ['O'] },
  { col: 7, letters: ['R', 'E'] },
];
const clueColumns = xSumClues.map((clue) => clue.col);

// A clue letter's digit is read from a cell that letter is drawn in.  Prefer a
// cell outside every clued column, so that no clue equation names the same cell
// twice: E is drawn in R2C4, which is inside clued column 4.
const letterValueCell = (letter) => (
  letter === 'M' ? mCell
    : letterCells[letter].find(
      (cell) => !clueColumns.includes(parseCellId(cell).col))
    ?? letterCells[letter][0]);

const xSum = ({ col, letters }) => {
  const cells = [9, 8, 7, 6, 5, 4, 3, 2, 1].map((row) => makeCellId(row, col));
  // "NE" is 10*N + E, so the k-th letter from the left carries 10^(len-1-k).
  // Moved to the left-hand side of "sum of first x cells - value = 0", each
  // letter cell enters the Sum with the negative of its place value.
  const terms = letters.map(
    (letter, i) => [letterValueCell(letter), -(10 ** (letters.length - 1 - i))]);

  return new Or(cells.map((_, i) => {
    const x = i + 1;
    const summed = cells.slice(0, x);
    // A one-letter clue is just "these cells total that cell's digit".
    const equation = terms.length === 1
      ? new EqualSum(summed, [terms[0][0]])
      : new Sum(0, ...summed, ...terms);
    return new And([new Given(cells[0], x), equation]);
  }));
};

return [
  shape,
  mVar,
  sudokuDigits,
  ...sameLetter,
  differentLetters,
  new EqualSum(...boxSegments(greyLine)),
  new EqualSum(...boxSegments(brownLine)),
  ...xSumClues.map(xSum),
];
