// Title: Superposition
// Author: Mitchell Lee
// Video: https://www.youtube.com/watch?v=QEnVuvbmkqE
// Source: https://yusitnikov.github.io/puzzletv/#4-superposition

// FRACTIONAL SUDOKU. This is a 6x6 grid of cells arranged in six rows and
// six columns of six cells each. Cells are divided into "cell pieces" by
// grey lines; write a digit 1-6 in each piece; digits may not repeat in a
// cell. In each row, column and box, the total area of the pieces holding
// digit 1 must equal the area of a single cell, and the same for 2-6.
// "You may enter equal-size same-cell pieces' digits in either order" is a
// solving note, not a rule: it only says the two orderings are equivalent,
// which the encoding below already treats as one state.
//
// Modelled on a 12x12 Raw grid of unit-cells, two per puzzle-cell side (a
// unit-cell's area is 1, a puzzle-cell's is 4). Every piece's unit-cells
// are forced to one shared digit (a piece writes one digit across its
// area), distinct pieces sharing a puzzle-cell get distinct digits, and
// each row/column/box's 24 unit-cells must hold each digit exactly 4 times
// -- exactly the stated area rule, since a piece assigned digit d
// contributes its own unit-cell area to d's count. A Raw grid has no
// implicit rules, so row/column/box all-different is not in force here and
// does not need omitting.

const shape = new Shape('12x12', 6, 'Raw');

// Puzzle-cell (pi, pj), 0-indexed, covers the 2x2 block of unit-cells at
// 1-indexed rows 2*pi+1..2*pi+2 and columns 2*pj+1..2*pj+2.
const unitCell = (pi, pj, dr, dc) => makeCellId(2 * pi + 1 + dr, 2 * pj + 1 + dc);

// Cell-piece layout, transcribed from the drawn grey piece boundaries
// (each puzzle-cell's four unit-cells grouped by shared piece):
// 'W' = one whole-cell piece (area 4); 'V' = two vertical-half pieces,
// left column and right column (area 2 each) -- no cell is split any other
// way. The six 'W' cells on the main diagonal carry the puzzle's six given
// digits, transcribed below in reading order 1-6.
const LAYOUT = [
  ['W', 'V', 'V', 'W', 'V', 'V'],
  ['V', 'W', 'V', 'V', 'W', 'V'],
  ['V', 'W', 'W', 'V', 'V', 'W'],
  ['V', 'V', 'W', 'W', 'V', 'V'],
  ['V', 'V', 'V', 'V', 'W', 'W'],
  ['V', 'V', 'W', 'V', 'W', 'W'],
];
const DIAGONAL_GIVENS = [1, 2, 3, 4, 5, 6];

const sameValueGroups = [];
const cellPieceReps = []; // one representative unit-cell per piece, per puzzle-cell
const givens = [];

for (let pi = 0; pi < 6; pi++) {
  for (let pj = 0; pj < 6; pj++) {
    if (LAYOUT[pi][pj] === 'W') {
      const cells = [
        unitCell(pi, pj, 0, 0), unitCell(pi, pj, 0, 1),
        unitCell(pi, pj, 1, 0), unitCell(pi, pj, 1, 1),
      ];
      sameValueGroups.push(cells);
      cellPieceReps.push([cells[0]]);
      if (pi === pj) givens.push(new Given(cells[0], DIAGONAL_GIVENS[pi]));
    } else {
      const left = [unitCell(pi, pj, 0, 0), unitCell(pi, pj, 1, 0)];
      const right = [unitCell(pi, pj, 0, 1), unitCell(pi, pj, 1, 1)];
      sameValueGroups.push(left, right);
      cellPieceReps.push([left[0], right[0]]);
    }
  }
}

// Every piece writes one digit across all its unit-cells.
const pieceEqualities = sameValueGroups.map(
  cells => new SameValues(cells.length, ...cells));

// Digits may not repeat in a cell: distinct pieces sharing a puzzle-cell
// (only the 'V' cells have more than one) get distinct digits.
const noRepeatInCell = cellPieceReps
  .filter(reps => reps.length > 1)
  .map(reps => new AllDifferent(...reps));

// "When cell pieces in the same cell have equal size, you may enter their
// digits in either order" -- every 'V' cell's two pieces are area 2, so
// swapping which one gets which digit is a stated non-difference, not a
// second solution. Pin left > right (the two reps are horizontally
// adjacent unit-cells, and AllDifferent above already forbids equality) so
// the search counts each such pair once; this pin is an artifact of the
// unit-cell model, not puzzle content.
const equalPieceOrder = cellPieceReps
  .filter(reps => reps.length > 1)
  .map(([left, right]) => new GreaterThan(left, right));

// Each row/column/box's 24 unit-cells hold each digit exactly 4 times
// (the area of one puzzle-cell), per the stated area rule.
const AREA_MULTISET = '1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4_5_5_5_5_6_6_6_6';

const rowCells = (pi) => {
  const cells = [];
  for (let pj = 0; pj < 6; pj++) {
    for (let dc = 0; dc < 2; dc++) {
      cells.push(unitCell(pi, pj, 0, dc), unitCell(pi, pj, 1, dc));
    }
  }
  return cells;
};
const colCells = (pj) => {
  const cells = [];
  for (let pi = 0; pi < 6; pi++) {
    for (let dr = 0; dr < 2; dr++) {
      cells.push(unitCell(pi, pj, dr, 0), unitCell(pi, pj, dr, 1));
    }
  }
  return cells;
};
const boxCells = (boxRow, boxCol) => {
  const cells = [];
  for (let dpi = 0; dpi < 2; dpi++) {
    for (let dpj = 0; dpj < 3; dpj++) {
      const pi = 2 * boxRow + dpi, pj = 3 * boxCol + dpj;
      cells.push(
        unitCell(pi, pj, 0, 0), unitCell(pi, pj, 0, 1),
        unitCell(pi, pj, 1, 0), unitCell(pi, pj, 1, 1));
    }
  }
  return cells;
};

const rows = Array.from({ length: 6 }, (_, pi) => new ContainExact(AREA_MULTISET, ...rowCells(pi)));
const cols = Array.from({ length: 6 }, (_, pj) => new ContainExact(AREA_MULTISET, ...colCells(pj)));
const boxes = [];
for (let boxRow = 0; boxRow < 3; boxRow++) {
  for (let boxCol = 0; boxCol < 2; boxCol++) {
    boxes.push(new ContainExact(AREA_MULTISET, ...boxCells(boxRow, boxCol)));
  }
}

return [
  shape,
  ...givens,
  ...pieceEqualities,
  ...noRepeatInCell,
  ...equalPieceOrder,
  ...rows,
  ...cols,
  ...boxes,
];
