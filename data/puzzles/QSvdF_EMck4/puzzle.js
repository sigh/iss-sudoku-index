// Title: SUGOKU
// Author: Hancker
// Video: https://www.youtube.com/watch?v=QSvdF_EMck4
// Source: https://sudokupad.app/uoyv9ny78e

// Normal sudoku rules apply. A Go position is drawn on the grid with two kinds
// of pieces: plus (black) pieces and white circle pieces, at the cells listed
// below. In each row and column, the digits on the same kind of piece contain
// no two consecutive digits. In each 3x3 box, the digits on the same kind of
// piece all share the same parity. One given digit: R5C5 = 1 (a plus piece).

const plus = [
  'R1C2', 'R1C5', 'R1C7',
  'R2C7',
  'R3C4', 'R3C5', 'R3C7', 'R3C9',
  'R4C1', 'R4C3', 'R4C4', 'R4C6', 'R4C8',
  'R5C2', 'R5C5', 'R5C8',
  'R6C3', 'R6C8',
  'R7C2', 'R7C3', 'R7C7', 'R7C8',
  'R8C2', 'R8C8', 'R8C9',
];

const white = [
  'R2C2', 'R2C4', 'R2C5', 'R2C6',
  'R3C2', 'R3C3', 'R3C6', 'R3C8',
  'R4C2', 'R4C7',
  'R5C7',
  'R6C2', 'R6C4', 'R6C6', 'R6C7',
  'R7C4', 'R7C5', 'R7C6',
  'R8C3', 'R8C5', 'R8C7',
  'R9C3', 'R9C4', 'R9C8',
];

const noConsecutive = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);
const sameParity = PairX.fnToKey((a, b) => a % 2 == b % 2, 9);

function row(cell) {
  return parseCellId(cell).row;
}

function col(cell) {
  return parseCellId(cell).col;
}

// Box index (0-8, row-major) of a cell; the API has no box-index helper.
function box(cell) {
  const {row, col} = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
}

function groupsBy(cells, keyFn) {
  const groups = new Map();
  for (const cell of cells) {
    const key = keyFn(cell);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(cell);
  }
  return [...groups.values()].filter(group => group.length > 1);
}

function pieceConstraints(name, cells) {
  const constraints = [];
  for (const [axis, keyFn] of [['row', row], ['column', col]]) {
    for (const group of groupsBy(cells, keyFn)) {
      constraints.push(new PairX(noConsecutive, `${name} ${axis}`, ...group));
    }
  }
  for (const group of groupsBy(cells, box)) {
    constraints.push(new PairX(sameParity, `${name} box parity`, ...group));
  }
  return constraints;
}

return [
  new Shape('9x9'),
  new Given('R5C5', 1),
  ...pieceConstraints('plus', plus),
  ...pieceConstraints('white', white),
];
