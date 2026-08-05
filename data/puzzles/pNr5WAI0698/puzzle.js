// Title: Farsight
// Author: Sunnyjum
// Video: https://www.youtube.com/watch?v=pNr5WAI0698
// Source: https://app.crackingthecryptic.com/sudoku/G9BrTHrpP4

// Rules encoded: normal Sudoku; grey-circled digits are odd; a caged digit N
// has a consecutive digit exactly N cells away in its row or column.
const oddCircles = ['R3C8', 'R4C9', 'R7C6', 'R7C7', 'R8C8'];
const cagedCells = [
  'R1C4', 'R1C6', 'R1C9', 'R2C1', 'R2C4', 'R2C6', 'R2C8', 'R3C4', 'R3C6',
  'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C6', 'R4C8', 'R4C9', 'R5C1', 'R5C3',
  'R5C4', 'R5C6', 'R5C8', 'R6C6', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C8',
  'R7C9', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5',
];

// The circle positions and outlined one-cell cages are transcribed from the drawing.
const farsightKeys = Object.fromEntries([...Array(9)].map((_, i) => {
  const distance = i + 1;
  return [distance, Pair.fnToKey(
    (source, target) => source === distance && Math.abs(source - target) === 1,
    9,
  )];
}));

// For each caged cell, these alternatives are the in-grid row/column cells at
// each possible digit-distance; an Or requires one matching consecutive digit.
const farsight = cagedCells.map(source => {
  const {row, col} = parseCellId(source);
  const targets = [];
  for (let distance = 1; distance <= 9; distance++) {
    for (const [dr, dc] of [[-distance, 0], [distance, 0], [0, -distance], [0, distance]]) {
      const targetRow = row + dr;
      const targetCol = col + dc;
      if (targetRow >= 1 && targetRow <= 9 && targetCol >= 1 && targetCol <= 9) {
        targets.push(new Pair(
          farsightKeys[distance], '', source, makeCellId(targetRow, targetCol),
        ));
      }
    }
  }
  return new Or(targets);
});

return [
  new Shape('9x9'),
  ...oddCircles.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...farsight,
];
