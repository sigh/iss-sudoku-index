// Title: Crossed Paths
// Author: Blobz
// Video: https://www.youtube.com/watch?v=OR8UpZmZo0E
// Source: https://app.crackingthecryptic.com/sudoku/372RPNJGJ6

// Normal sudoku (standard 3x3 boxes) plus 10 killer cages (distinct + sum).
//
// The two "paths" are not extra unknowns: normal sudoku already guarantees a
// unique cell in column C holding digit C, and a unique cell in row R holding
// digit R -- those cells *are* the path, by definition of the rule text.
// Moving one column (row) at a time, "orthogonally or diagonally connected"
// (a king move) reduces to the row (column) index changing by at most 1
// between consecutive columns (rows), since the column (row) index always
// changes by exactly 1. That is the columnStepNfa / rowStepNfa below.
//
// "The paths do not share cells": a shared cell would need digit(x,y) = y
// (on the column path) and digit(x,y) = x (on the row path) at once, forcing
// x = y and digit(x,x) = x. So the rule is exactly: no diagonal cell holds
// its own row/column index -- encoded as a restricted Given per diagonal
// cell.
//
// "Nor appear in any cage": a cage cell (x,y) with digit(x,y) = y would be
// forced to be that column's path cell (by the uniqueness argument above),
// which the rule forbids; likewise digit(x,y) = x would force it onto the
// row path. So every cage cell excludes its own row index and its own
// column index from its candidates -- encoded as a restricted Given per
// cage cell.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

const cages = [
  [11, ['R1C2', 'R1C3', 'R2C3']],
  [11, ['R2C1', 'R3C1', 'R3C2']],
  [8, ['R4C3', 'R5C3']],
  [12, ['R5C1', 'R6C1']],
  [19, ['R7C3', 'R7C4', 'R7C5']],
  [10, ['R9C3', 'R9C4', 'R9C5']],
  [19, ['R8C7', 'R9C7', 'R9C8']],
  [19, ['R7C8', 'R7C9', 'R8C9']],
  [14, ['R2C9', 'R3C9']],
  [13, ['R3C5', 'R4C5', 'R5C5', 'R4C6']],
];

// Scans the 9 cells of index i, then the 9 cells of index i+1 (a column
// pair for the left-to-right path, a row pair for the top-to-bottom path).
// Tracks the local position (1-9) where value `i` is found in the first
// half; once in the second half, rejects outright if value `i+1` turns up
// more than one position away from that -- including "never found", since
// `row` stays null. All soundness is enforced by the rejection, so `accept`
// is unconditional.
function stepNfa(i) {
  return NFA.encodeSpec({
    startState: { step: 0, row: null },
    transition: ({ step, row }, value) => {
      const newStep = step + 1;
      if (newStep <= 9) {
        return { step: newStep, row: row === null && value === i ? newStep : row };
      }
      const localPos = newStep - 9;
      if (value === i + 1 && (row === null || Math.abs(localPos - row) > 1)) {
        return undefined;
      }
      return { step: newStep, row };
    },
    accept: () => true,
    maxDepth: 18,
  }, 9);
}

const columnStepNfas = Array.from({ length: 8 }, (_, k) => {
  const i = k + 1;
  return new NFA(
    stepNfa(i), `column path step ${i}-${i + 1}`,
    ...graph.column(i), ...graph.column(i + 1),
  );
});

const rowStepNfas = Array.from({ length: 8 }, (_, k) => {
  const i = k + 1;
  return new NFA(
    stepNfa(i), `row path step ${i}-${i + 1}`,
    ...graph.row(i), ...graph.row(i + 1),
  );
});

const allValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
function excluding(...exclude) {
  return allValues.filter(v => !exclude.includes(v));
}

// No shared cell between the two paths: diagonal cell (i,i) never holds i.
const diagonalGivens = allValues.map(
  i => new Given(makeCellId(i, i), ...excluding(i)));

// No path cell inside any cage: each cage cell excludes its own row index
// and its own column index.
const cageCells = new Set(cages.flatMap(([, cells]) => cells));
const cageGivens = [...cageCells].map(cellId => {
  const { row, col } = parseCellId(cellId);
  return new Given(cellId, ...excluding(row, col));
});

return [
  shape,
  ...cages.map(([sum, cells]) => new Cage(sum, ...cells)),
  ...columnStepNfas,
  ...rowStepNfas,
  ...diagonalGivens,
  ...cageGivens,
];
