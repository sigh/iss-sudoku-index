// Title: Clueless Minimax
// Author: Alf Smith
// Video: https://www.youtube.com/watch?v=z6bQ_YAL3xQ
// Source: https://sudokupad.app/l7tcebgv6n

// Normal sudoku rules apply -- rows, columns and boxes all-different, the
// default for a 9x9 Shape. There are no given digits.
//
// Box-centre min/max rule: the centre cell of each 3x3 box is compared
// against its (up to four) orthogonally adjacent neighbours. The centre
// box's centre (R5C5) is less than all four neighbours; every other box's
// centre is greater than all four of its neighbours. GreaterThan(a, b, c...)
// makes each cell greater than any *later*-listed cell it is orthogonally
// adjacent to, so listing a box's centre first gives "centre > neighbours",
// and listing it last reverses that to "neighbours > centre".
//
// Gold-cell rule: a gold cell's digit equals its own position, counted left
// to right and top to bottom, within its row (= its column number), its
// column (= its row number), or its box (reading-order index 1-9 within the
// box). "All possible gold cells are given" makes the drawn set exhaustive:
// every cell not drawn gold must avoid *all three* of its own position
// values, not merely fail to be forced into one of them.
//
// Gold cells (yellow-filled underlay cells in the payload).
const goldCells = [
  'R1C5', 'R1C8', 'R2C3', 'R2C7', 'R2C9', 'R3C3', 'R4C4', 'R4C7', 'R4C8',
  'R5C3', 'R6C1', 'R6C4', 'R6C6', 'R7C5', 'R7C7', 'R7C9', 'R8C1', 'R8C2',
  'R9C2', 'R9C3', 'R9C6',
];
const goldSet = new Set(goldCells);

const graph = cellGraph('9x9');
const allCells = graph.cells();

// A cell's own three position values: column (position in its row), row
// (position in its column), and reading-order index within its 3x3 box.
function positionValues(cell) {
  const { row, col } = parseCellId(cell);
  const withinBoxRow = (row - 1) % 3;
  const withinBoxCol = (col - 1) % 3;
  const boxPos = withinBoxRow * 3 + withinBoxCol + 1;
  return [...new Set([col, row, boxPos])];
}

const goldConstraints = goldCells.map(
  cell => new Given(cell, ...positionValues(cell)));

const nonGoldConstraints = allCells
  .filter(cell => !goldSet.has(cell))
  .map(cell => {
    const excluded = new Set(positionValues(cell));
    const allowed = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => !excluded.has(v));
    return new Given(cell, ...allowed);
  });

// The centre box's centre is the local minimum; every other box's centre is
// a local maximum over its own orthogonal neighbours.
const boxCentres = [
  'R2C2', 'R2C5', 'R2C8', 'R5C2', 'R5C5', 'R5C8', 'R8C2', 'R8C5', 'R8C8',
];

const minMaxConstraints = boxCentres.map(centre => {
  const neighbours = graph.neighbours(centre);
  return centre === 'R5C5'
    ? new GreaterThan(...neighbours, centre)
    : new GreaterThan(centre, ...neighbours);
});

return [
  new Shape('9x9'),
  ...minMaxConstraints,
  ...goldConstraints,
  ...nonGoldConstraints,
];
