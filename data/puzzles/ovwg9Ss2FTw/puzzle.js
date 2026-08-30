// Title: Little Killer Oddball Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ovwg9Ss2FTw
// Source: https://cracking-the-cryptic.web.app/sudoku/6JnqJQqnBt

// Normal sudoku (default row/col/box), plus:
//  - both long diagonals contain 1-9 (AllDifferent over 9 cells with domain
//    1-9 is equivalent to "contains every digit")
//  - 8 little killer diagonal sums, digits may repeat
//  - of the 4 grey diamond shapes, exactly 3 are all-odd and 1 is all-even;
//    which one is even is not stated by the rules, so it is encoded as an
//    Or over the 4 possible choices (there is no Odd/Even class, so parity
//    is a multi-value Given per cell)

const grid = new Shape('9x9');
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const given = new Given('R4C6', 8);

// direction: -1 is '\' (R1C1..R9C9), 1 is '/' (R1C9..R9C1)
const diagonals = [
  new Diagonal(-1),
  new Diagonal(1),
];

// Little killer clues: (start cell, row step, col step, sum), where the
// start cell and direction come from each drawn arrow's off-grid ray.
const littleKillerRays = [
  ['R2C1', -1, 1, 16],
  ['R3C1', -1, 1, 10],
  ['R7C1', 1, 1, 17],
  ['R2C9', -1, -1, 16],
  ['R3C9', -1, -1, 12],
  ['R6C9', 1, -1, 10],
  ['R7C9', 1, -1, 18],
  ['R8C9', 1, -1, 8],
];
const littleKillers = littleKillerRays.map(([cell, dr, dc, sum]) =>
  LittleKiller.fromCells(sum, graph.ray(cell, dr, dc), geometry));

// Grey shapes: 8-cell diamonds, one per grid corner (8-connected clusters
// of the drawn grey cell shading).
const greyShapes = [
  ['R1C2', 'R1C3', 'R2C1', 'R2C4', 'R3C1', 'R3C4', 'R4C2', 'R4C3'],
  ['R6C2', 'R6C3', 'R7C1', 'R7C4', 'R8C1', 'R8C4', 'R9C2', 'R9C3'],
  ['R1C7', 'R1C8', 'R2C6', 'R2C9', 'R3C6', 'R3C9', 'R4C7', 'R4C8'],
  ['R6C7', 'R6C8', 'R7C6', 'R7C9', 'R8C6', 'R8C9', 'R9C7', 'R9C8'],
];

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

// One case per shape being the all-even one; the other three are all-odd.
const parityCases = greyShapes.map((_, evenIndex) => new And(
  greyShapes.flatMap((cells, i) => {
    const values = i === evenIndex ? EVEN : ODD;
    return cells.map(cell => new Given(cell, ...values));
  })
));

return [
  grid,
  given,
  ...diagonals,
  ...littleKillers,
  new Or(parityCases),
];
