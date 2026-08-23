// Title: In the Spotlight
// Author: Eclectic Hoosier
// Video: https://www.youtube.com/watch?v=9xAfxviIHvo
// Source: https://app.crackingthecryptic.com/sudoku/GT9f3PBhJ3
//
// Normal sudoku (default row/col/box). Cages: digits distinct, sum to the
// given total (Cage). Arrows: digits on the arm sum to the digit in the
// connected circle (Arrow, bulb cell first). Outside diagonal-sum clues: the
// full diagonal the arrow points into sums to the badge value (LittleKiller).
// The central gold circle on R5C5 is explicitly "not relevant to the solve"
// (decoration, omitted).
//
// The two outside diagonal clues' entry cells (R1C4, R6C1) each lie on two
// possible diagonals; the drawn off-grid arrow's direction (down-right, from
// the raw wayPoints) picks the diagonal used below.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const cages = [
  ['R1C1', 'R1C2', 'R2C1', 17],
  ['R4C2', 'R5C2', 'R6C2', 15],
  ['R7C1', 'R8C1', 'R9C1', 20],
  ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5', 'R7C5', 26],
  ['R4C8', 'R5C8', 'R6C8', 22],
  ['R1C9', 'R2C9', 'R3C9', 20],
  ['R8C9', 'R9C9', 'R9C8', 16],
].map(spec => {
  const total = spec[spec.length - 1];
  const cells = spec.slice(0, -1);
  return new Cage(total, ...cells);
});

// Bulb (circle) cell first, then the arm cells.
const arrows = [
  ['R1C7', 'R1C6', 'R1C5', 'R1C4'],
  ['R3C5', 'R3C4', 'R3C3'],
  ['R3C1', 'R4C1', 'R5C1', 'R6C1'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R7C9', 'R6C9', 'R5C9', 'R4C9'],
  ['R4C3', 'R5C4', 'R5C5', 'R6C6', 'R6C7'],
].map(cells => new Arrow(...cells));

const littleKillers = [
  LittleKiller.fromCells(33, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R6C1', 1, 1), geometry),
];

return [
  new Shape('9x9'),
  ...cages,
  ...arrows,
  ...littleKillers,
];
