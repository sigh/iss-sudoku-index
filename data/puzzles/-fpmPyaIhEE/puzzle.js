// Title: The Devil is in the Details
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=-fpmPyaIhEE
// Source: https://sudokupad.app/26e1w4r81e

// Normal sudoku on a plain 9x9 (standard 3x3 boxes, no givens).
//
// Four cages and four little-killer-style diagonal arrows are each labelled
// 666. Per the rules, a cage/arrow total is not a digit sum: its cells are
// split into one or more straight (horizontal/vertical/diagonal) contiguous
// runs, each run's digits concatenate (in the stated reading direction) into
// one number -- 1-9 for a single digit, up to 3 digits since any 4+ digit
// number already exceeds 666 -- and the printed total is the sum of those
// numbers. Every digit belongs to exactly one number. Cages additionally
// forbid repeated digits ("digits may not repeat within a cage"); arrow
// diagonals allow repeats ("digits may repeat along a diagonal") -- no extra
// uniqueness beyond ordinary row/column/box sudoku there.
//
// The split points are never shown, so each clue is encoded as an Or over
// every way its cells can be partitioned into straight runs (any orientation,
// runs capped at length 3), each branch a linear Sum(666, ...) over the
// resulting place-value coefficients.

function parseCells(cellIds) {
  return cellIds.map(id => {
    const { row, col } = parseCellId(id);
    return { id, row, col };
  });
}

// Every way to partition a cell set into straight (horizontal / vertical /
// diagonal) contiguous runs of length 1-3, covering every cell exactly once.
// Recurses on the row-major-smallest remaining cell each step (a canonical
// choice: any run containing that cell must start there, so this both avoids
// duplicate partitions and never misses one).
function enumeratePartitions(cellObjs) {
  if (cellObjs.length === 0) return [[]];
  const sorted = [...cellObjs].sort((a, b) => a.row - b.row || a.col - b.col);
  const x = sorted[0];
  const byKey = new Map(cellObjs.map(c => [`${c.row},${c.col}`, c]));
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  const candidateRuns = [[x]];
  for (const [dr, dc] of dirs) {
    for (let len = 2; len <= 3; len++) {
      const run = [];
      let ok = true;
      for (let k = 0; k < len; k++) {
        const c = byKey.get(`${x.row + dr * k},${x.col + dc * k}`);
        if (!c) { ok = false; break; }
        run.push(c);
      }
      if (!ok) break;
      candidateRuns.push(run);
    }
  }
  const results = [];
  for (const run of candidateRuns) {
    const runKeys = new Set(run.map(c => `${c.row},${c.col}`));
    const rest = cellObjs.filter(c => !runKeys.has(`${c.row},${c.col}`));
    for (const sub of enumeratePartitions(rest)) results.push([run, ...sub]);
  }
  return results;
}

// A run's [cellId, placeValueCoefficient] pairs. Vertical numbers read
// top-to-bottom (ascending row); horizontal and diagonal numbers read
// left-to-right (ascending column) -- including a down-left diagonal, whose
// physical draw order is the reverse of its reading order.
function numberCoeffs(run) {
  const oneRow = new Set(run.map(c => c.row)).size === 1;
  const oneCol = new Set(run.map(c => c.col)).size === 1;
  const sorted = oneRow
    ? [...run].sort((a, b) => a.col - b.col)
    : oneCol
      ? [...run].sort((a, b) => a.row - b.row)
      : [...run].sort((a, b) => a.col - b.col);
  const len = sorted.length;
  return sorted.map((c, i) => [c.id, Math.pow(10, len - 1 - i)]);
}

function concatSum666(cellIds) {
  const partitions = enumeratePartitions(parseCells(cellIds));
  return new Or(partitions.map(partition => {
    const coeffs = partition.flatMap(numberCoeffs);
    // A partition of all single-digit numbers has every coefficient 1 --
    // use the plain Sum form rather than a coefficient Sum for that branch.
    const terms = coeffs.every(([, k]) => k === 1)
      ? coeffs.map(([id]) => id)
      : coeffs;
    return new Sum(666, ...terms);
  }));
}

// Cages: cells array, from `cages` (payload row/col, 1-indexed here).
const cageA = ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5'];
const cageB = ['R6C5', 'R6C6', 'R6C7', 'R7C6', 'R7C7', 'R7C8'];
const cageC = ['R7C4', 'R7C5', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R9C8'];
const cageD = ['R2C5', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8'];
const cages = [cageA, cageB, cageC, cageD];

// Arrows: little-killer-style off-grid diagonal rays, walked from the drawn
// entry cell to the far grid edge in the drawn direction. Each arrowhead's
// drawn shaft, extrapolated to the grid edge, lands exactly on a column
// border (C4/C5 for one arrow of each top/bottom pair, C5/C6 for the other)
// rather than inside a cell; taking the left-hand column of that border
// (C4 and C5, not C5 and C6) is the reading used here.
const arrowTopC4 = ['R1C4', 'R2C3', 'R3C2', 'R4C1'];
const arrowTopC5 = ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'];
const arrowBottomC4 = ['R9C4', 'R8C3', 'R7C2', 'R6C1'];
const arrowBottomC5 = ['R9C5', 'R8C4', 'R7C3', 'R6C2', 'R5C1'];
const arrows = [arrowTopC4, arrowTopC5, arrowBottomC4, arrowBottomC5];

return [
  new Shape('9x9'),
  ...cages.map(cells => new AllDifferent(...cells)),
  ...cages.map(cells => concatSum666(cells)),
  ...arrows.map(cells => concatSum666(cells)),
];
