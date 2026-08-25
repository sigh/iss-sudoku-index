// Title: Lost Clone
// Author: Ferran Rojas
// Video: https://www.youtube.com/watch?v=46tqeOm5OIs
// Source: https://app.crackingthecryptic.com/webapp/4mbb4Hg948

// Normal sudoku. Cages (killer: sum + all-different within the cage) show the
// sum of their digits. A shaded 5x5 block (rows 3-7, cols 4-8) has a
// translated clone elsewhere on the board: some other 5x5 block, reached
// without rotating, holds the exact same digits in the same relative
// positions. The source names no location for the clone, so every other
// on-grid placement of a 5x5 block is a candidate; the puzzle picks one.

const graph = cellGraph('9x9');

// Every top-left corner that keeps a 5x5 block on the 9x9 board.
const ORIGIN = { row: 3, col: 4 };
const candidateOrigins = [];
for (let r0 = 1; r0 <= 5; r0++) {
  for (let c0 = 1; c0 <= 5; c0++) {
    if (r0 === ORIGIN.row && c0 === ORIGIN.col) continue;
    candidateOrigins.push({ row: r0, col: c0 });
  }
}

const shadedBlock = graph.block(makeCellId(ORIGIN.row, ORIGIN.col), 5, 5);

// Cell-for-cell equality between the shaded block and a same-shape block
// elsewhere: one Pair per corresponding cell pair (a 2-cell Pair applies to
// its one consecutive pair, i.e. a plain equality edge).
const eqKey = Pair.fnToKey((a, b) => a === b, 9);
const cloneConstraint = new Or(candidateOrigins.map(({ row, col }) => {
  const targetBlock = graph.block(makeCellId(row, col), 5, 5);
  return new And(shadedBlock.map((cell, i) =>
    new Pair(eqKey, 'clone', cell, targetBlock[i])));
}));

return [
  new Shape('9x9'),

  new Given('R2C4', 8), new Given('R2C8', 3),
  new Given('R3C1', 7),
  new Given('R4C9', 7),
  new Given('R5C7', 1),
  new Given('R6C6', 1),
  new Given('R8C1', 5), new Given('R8C9', 2),
  new Given('R9C1', 9),

  // Cages (drawn cage boxes and totals).
  new Cage(13, 'R1C6', 'R1C7'),
  new Cage(11, 'R6C8', 'R6C9'),
  new Cage(6, 'R9C4', 'R9C5', 'R9C6'),

  cloneConstraint,
];
