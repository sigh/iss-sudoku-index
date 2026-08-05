// Title: Non-Venomous
// Author: Scruffamudda
// Video: https://www.youtube.com/watch?v=B8mjmYstpMg
// Source: https://app.crackingthecryptic.com/sudoku/3D6bf29hHt

// Normal Sudoku rules apply. A single orthogonally connected snake has two 9-valued
// ends and does not self-touch, including diagonally. Circle and square digits count
// snake cells in their own king neighbourhoods; circles are odd and squares are even.
const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const snake = graph.makeOverlay('VS');
const ends = graph.makeOverlay('VE');
const gridCells = graph.cells();

// Drawn circles and squares, transcribed from the grey underlays.
const circles = [
  'R1C1', 'R1C2', 'R1C9', 'R2C6', 'R3C1', 'R3C4', 'R3C7', 'R3C9', 'R5C5',
  'R6C3', 'R7C4', 'R7C7', 'R8C5',
];
const squares = [
  'R1C8', 'R2C2', 'R2C5', 'R4C5', 'R5C4', 'R5C7', 'R6C2', 'R7C6', 'R8C1',
  'R8C4',
];

// A snake cell has one or two orthogonal snake neighbours. Since OFF is 2 and
// ON is 1, a cell with d neighbours and k ON neighbours has Sum 2*d-k.
// The endpoint overlay records exactly the degree-one cells, which are both 9s.
const pathRules = gridCells.map(cell => {
  const neighbours = snake.at(graph.neighbours(cell));
  const base = neighbours.length;
  return new Or([
    new And([new Given(snake.at(cell), OFF), new Given(ends.at(cell), OFF)]),
    new And([
      new Given(snake.at(cell), ON),
      new Sum(2 * base - 1, ...neighbours),
      new Given(ends.at(cell), ON),
      new Given(cell, 9),
    ]),
    new And([
      new Given(snake.at(cell), ON),
      new Sum(2 * base - 2, ...neighbours),
      new Given(ends.at(cell), OFF),
    ]),
  ]);
});

// A diagonal-only pair in any 2x2 block is a diagonal self-touch.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { cells: [] },
  transition: ({ cells }, value) => {
    if (cells === null) return { cells: null };
    const next = [...cells, value === ON];
    if (next.length < 4) return { cells: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { cells: null };
  },
  accept: ({ cells }) => cells === null,
}, geometry.numValues);
const blockStarts = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = snake.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no diagonal self-touch',
    ...snake.at(graph.block('R1C1', 2, 2))),
  snake.at(blockStarts),
);

// Each marked cell's digit is the count of ON values in its up-to-9-cell neighbourhood.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const counts = [...circles, ...squares].map(cell => new NFA(countMachine, 'snake count',
  cell, ...snake.at([cell, ...graph.kingNeighbours(cell)])));

return [
  new Shape('9x9'),
  snake.toVar('snake membership'),
  ends.toVar('snake endpoints'),
  snake.makeReplicate(new Given(snake.cells()[0], ON, OFF)),
  ends.makeReplicate(new Given(ends.cells()[0], ON, OFF)),
  new ConnectedValues('VS', ON),
  new ContainExact('1_1', ...ends.cells()),
  ...pathRules,
  noDiagonalTouches,
  ...counts,
  ...circles.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...squares.map(cell => new Given(cell, 2, 4, 6, 8)),
];
