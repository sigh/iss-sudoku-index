// Title: Rubik's Cube
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=JiJMk99A944
// Source: https://sudokupad.app/P4h9q6HtRH

// Normal Sudoku rules apply. The white dot is consecutive. Corresponding
// positions in the nine 3x3 boxes differ. For every true XYZ, YZX is true.
const INDEX = new Var('I', 'row index', 9);
const indexGivens = Array.from(
  {length: 9},
  (_, i) => new Given(INDEX.cell(i + 1), i + 1),
);

// The nine groups are the like-position cells in the drawn 3x3 boxes.
const boxPositions = Array.from({length: 9}, (_, positionIndex) => {
  const position = positionIndex + 1;
  const localRow = Math.floor((position - 1) / 3) + 1;
  const localCol = (position - 1) % 3 + 1;
  return new AllDifferent(...Array.from({length: 9}, (_, boxIndex) => {
    const box = boxIndex + 1;
    const boxRow = Math.floor((box - 1) / 3) + 1;
    const boxCol = (box - 1) % 3 + 1;
    return makeCellId(3 * (boxRow - 1) + localRow, 3 * (boxCol - 1) + localCol);
  }));
});

// `ValueIndexing(VIr, RrCc, row c)` makes row c at index RrCc equal r,
// which is the stated XYZ -> YZX transformation. VIr is the fixed digit r.
const rotations = Array.from({length: 9}, (_, rowIndex) => {
  const row = rowIndex + 1;
  return Array.from({length: 9}, (_, colIndex) => {
    const col = colIndex + 1;
    return new ValueIndexing(
      INDEX.cell(row),
      makeCellId(row, col),
      ...Array.from({length: 9}, (_, valueIndex) => makeCellId(col, valueIndex + 1)),
    );
  });
}).flat();

return [
  new Shape('9x9'),
  INDEX,
  ...indexGivens,
  new WhiteDot('R1C1', 'R1C2'), // The drawn white dot.
  ...boxPositions,
  ...rotations,
];
