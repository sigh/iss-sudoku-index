// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=7Ts2ysxPT14
// Source: https://cracking-the-cryptic.web.app/sudoku/hJd3DhdF7j

// Rules encoded here:
//   Rows, columns and the nine marked shapes each contain 1-9 (no 3x3 boxes).
//   Any run of digits between bars in a row or column must ascend or descend,
//   not necessarily consecutively.
// The shape outlines are the only boundaries drawn on the board, so they are
// the bars: a run is a maximal stretch of consecutive cells in a row or column
// that no shape outline crosses. Nothing else is drawn -- the five givens and
// the nine shapes are the whole board.
// Nothing is omitted.

// The nine marked shapes, transcribed from the drawn region outlines: one
// letter per cell, row-major from R1C1.
const layout = [
  'AAAADDGGG',
  'AAADDEEGG',
  'AABBDDEGG',
  'BBBDDEEGG',
  'BBBFDEEHH',
  'FFBFFEEHH',
  'CFFFIIIHH',
  'CFCCIIIIH',
  'CCCCCIIHH',
];

// Transcribed from the drawn givens.
const givens = [
  ['R1C5', 7],
  ['R2C2', 3],
  ['R3C4', 1],
  ['R4C9', 2],
  ['R6C1', 4],
];

const shapeAt = (row, col) => layout[row - 1][col - 1];

const shapeNames = [...new Set(layout.join(''))];
const jigsaw = shapeNames.map(name => {
  const cells = [];
  for (let row = 1; row <= 9; row++) {
    for (let col = 1; col <= 9; col++) {
      if (shapeAt(row, col) === name) cells.push(makeCellId(row, col));
    }
  }
  return new Jigsaw('9x9', ...cells);
});

// Split one line into runs: a bar sits between two neighbouring cells exactly
// when they lie in different shapes, so a run is a maximal stretch of the line
// whose cells all carry the same shape letter.
function runsInLine(line) {
  const runs = [];
  for (const cell of line) {
    const prev = runs.length ? runs[runs.length - 1] : null;
    if (prev && shapeAt(...prev.coords[prev.coords.length - 1]) === shapeAt(...cell)) {
      prev.coords.push(cell);
    } else {
      runs.push({ coords: [cell] });
    }
  }
  return runs.map(run => run.coords.map(([row, col]) => makeCellId(row, col)));
}

const lines = [];
for (let i = 1; i <= 9; i++) {
  lines.push([...Array(9).keys()].map(j => [i, j + 1]));  // row i, left to right
  lines.push([...Array(9).keys()].map(j => [j + 1, i]));  // column i, top to bottom
}

// Ascending or descending along the run, in line order. A one-cell run carries
// no relation between cells, so it needs no constraint.
const slopes = lines.flatMap(runsInLine).filter(run => run.length > 1).map(
  run => new Or([
    new Thermo(...run),
    new Thermo(...[...run].reverse()),
  ]));

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...jigsaw,
  ...slopes,
];
