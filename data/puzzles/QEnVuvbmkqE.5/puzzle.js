// Title: Fractionally Harder
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=QEnVuvbmkqE
// Source: https://yusitnikov.github.io/puzzletv/#5-fractionally-harder

// FRACTIONAL SUDOKU. This is a 6x6 grid of cells arranged in six rows and
// six columns of six cells each, with the standard six 2-row x 3-column
// boxes. Cells are divided into "cell pieces" by grey lines; write a digit
// 1-6 in each piece; digits may not repeat in a cell. In each row, column
// and box, the total area of the pieces holding digit 1 must equal the
// area of a single cell, and the same for 2-6. "You may enter equal-size
// same-cell pieces' digits in either order" is a solving note, not a rule:
// it only says the two orderings are equivalent, which the symmetry pin
// below already treats as one state.
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

// Cell-piece layout, transcribed from the drawn grey piece boundaries (the
// payload's per-unit-cell `colors` grouping id, read per puzzle-cell): 'W'
// = one whole-cell piece (area 4); 'V' = two pieces split left|right (area
// 2 each); 'H' = two pieces split top/bottom (area 2 each). No cell splits
// any other way.
const LAYOUT = [
  ['V', 'W', 'V', 'W', 'V', 'W'],
  ['W', 'V', 'W', 'V', 'W', 'V'],
  ['V', 'W', 'V', 'H', 'W', 'H'],
  ['W', 'V', 'W', 'W', 'H', 'W'],
  ['V', 'W', 'V', 'H', 'W', 'H'],
  ['W', 'V', 'W', 'W', 'H', 'W'],
];

// The puzzle's 8 givens, transcribed from the payload's `given`/`value`
// fields: each names a puzzle-cell, which piece carries it ('whole' for a
// 'W' cell; 'left'/'right' for a 'V' cell; 'top'/'bottom' for an 'H' cell,
// by the drawn position of the coloured group holding the given), and the
// digit.
const GIVENS = [
  { pi: 0, pj: 0, piece: 'left', value: 5 },
  { pi: 1, pj: 1, piece: 'left', value: 1 },
  { pi: 1, pj: 5, piece: 'left', value: 5 },
  { pi: 2, pj: 2, piece: 'left', value: 2 },
  { pi: 3, pj: 4, piece: 'top', value: 5 },
  { pi: 4, pj: 3, piece: 'top', value: 4 },
  { pi: 4, pj: 4, piece: 'whole', value: 6 },
  { pi: 5, pj: 1, piece: 'left', value: 3 },
];
const hasGiven = {};
for (const g of GIVENS) hasGiven[`${g.pi},${g.pj}`] = true;

const sameValueGroups = []; // one array of unit-cells per piece
const cellPieceReps = []; // [pi][pj] -> [repCellForPiece, ...], in piece order

for (let pi = 0; pi < 6; pi++) {
  const rowReps = [];
  for (let pj = 0; pj < 6; pj++) {
    const type = LAYOUT[pi][pj];
    if (type === 'W') {
      const cells = [
        unitCell(pi, pj, 0, 0), unitCell(pi, pj, 0, 1),
        unitCell(pi, pj, 1, 0), unitCell(pi, pj, 1, 1),
      ];
      sameValueGroups.push(cells);
      rowReps.push([cells[0]]);
    } else if (type === 'V') {
      const left = [unitCell(pi, pj, 0, 0), unitCell(pi, pj, 1, 0)];
      const right = [unitCell(pi, pj, 0, 1), unitCell(pi, pj, 1, 1)];
      sameValueGroups.push(left, right);
      rowReps.push([left[0], right[0]]);
    } else { // 'H'
      const top = [unitCell(pi, pj, 0, 0), unitCell(pi, pj, 0, 1)];
      const bottom = [unitCell(pi, pj, 1, 0), unitCell(pi, pj, 1, 1)];
      sameValueGroups.push(top, bottom);
      rowReps.push([top[0], bottom[0]]);
    }
  }
  cellPieceReps.push(rowReps);
}

const givens = GIVENS.map((g) => {
  const type = LAYOUT[g.pi][g.pj];
  let cell;
  if (type === 'W') {
    cell = unitCell(g.pi, g.pj, 0, 0);
  } else if (type === 'V') {
    cell = unitCell(g.pi, g.pj, 0, g.piece === 'left' ? 0 : 1);
  } else {
    cell = unitCell(g.pi, g.pj, g.piece === 'top' ? 0 : 1, 0);
  }
  return new Given(cell, g.value);
});

// Every piece writes one digit across all its unit-cells.
const pieceEqualities = sameValueGroups.map(
  cells => new SameValues(cells.length, ...cells));

// Digits may not repeat in a cell: distinct pieces sharing a puzzle-cell
// (only split cells have more than one) get distinct digits.
const noRepeatInCell = [];
for (let pi = 0; pi < 6; pi++) {
  for (let pj = 0; pj < 6; pj++) {
    const reps = cellPieceReps[pi][pj];
    if (reps.length > 1) noRepeatInCell.push(new AllDifferent(...reps));
  }
}

// "When cell pieces in the same cell have equal size, you may enter their
// digits in either order" -- every split cell's two pieces are area 2, so
// swapping which one gets which digit is a stated non-difference, not a
// second solution. For a split cell with no given, pin the first piece's
// representative above the second's (they are grid-adjacent unit-cells --
// horizontally for 'V', vertically for 'H') so the search counts each
// equal-order pair once; this pin is an artifact of the unit-cell model,
// not puzzle content. A split cell that carries a given already has one
// specific piece fixed by the drawn puzzle, so there is no order ambiguity
// left there -- it is excluded from the pin, since pinning it too would
// impose an arbitrary extra constraint on which value that given's
// opposite piece may take.
const equalPieceOrder = [];
for (let pi = 0; pi < 6; pi++) {
  for (let pj = 0; pj < 6; pj++) {
    const reps = cellPieceReps[pi][pj];
    if (reps.length > 1 && !hasGiven[`${pi},${pj}`]) {
      equalPieceOrder.push(new GreaterThan(reps[0], reps[1]));
    }
  }
}

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
