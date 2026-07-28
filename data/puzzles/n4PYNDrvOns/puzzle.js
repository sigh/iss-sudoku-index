// Title: Eureka!
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=n4PYNDrvOns
// Source: https://sudokupad.app/jx80un5ofh

// Normal sudoku; the seven drawn grey cells are walls, the cave is one
// orthogonally-connected group, gold marks exactly the wall cells whose digit is
// larger than their row number, and the two drawn white dots are consecutive.
//
// Not encoded: every wall component touches the grid edge; the one-cell-wide
// orthogonal loop visits exactly the cave cells; and a loop digit in row N differs
// from each loop neighbour by at least N.

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const CAVE = 1, WALL = 2;

const PRE_SHADED_WALLS = [
  'R1C1', 'R1C2', 'R1C7', 'R5C1', 'R5C5', 'R5C9', 'R6C5',
];
const GOLD = new Set(['R1C2', 'R1C7', 'R5C1', 'R5C9', 'R6C5']);

const goldRules = graph.cells().flatMap(cell => {
  const { row } = parseCellId(cell);
  if (GOLD.has(cell)) {
    return [
      new Given(shade.at(cell), WALL),
      new Given(cell, ...Array.from({ length: 9 - row }, (_, i) => row + i + 1)),
    ];
  }
  // "All possible gold has been given": an unmarked wall's digit is at most
  // its row number; cave cells are unrestricted by the gold rule.
  return [new Or([
    new Given(shade.at(cell), CAVE),
    new Given(cell, ...Array.from({ length: row }, (_, i) => i + 1)),
  ])];
});

return [
  new Shape('9x9'),
  shade.toVar('cave or wall'),
  shade.makeReplicate(new Given(shade.cells()[0], CAVE, WALL)),
  ...PRE_SHADED_WALLS.map(cell => new Given(shade.at(cell), WALL)),
  new ConnectedValues('VS', CAVE),
  ...goldRules,
  new WhiteDot('R9C1', 'R9C2'),
  new WhiteDot('R9C2', 'R9C3'),
];
