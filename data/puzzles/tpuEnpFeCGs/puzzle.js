// Title: Agincourt
// Author: Magnive
// Video: https://www.youtube.com/watch?v=tpuEnpFeCGs
// Source: https://app.crackingthecryptic.com/sudoku/DLFMNqR3H9

// Normal sudoku rules apply (default row/column/box all-different).
//
// "Digits along an arrow must sum to the digit in that arrow's circle" --
// eight Arrow(bulb, ...arm) constraints, bulb cells taken from the 8 white
// circle underlays, arm paths from the drawn arrow geometry.
//
// "Even digits must see at least one identical digit by a knight's move (in
// chess)": for every cell, either its value is odd, or some knight-move-away
// cell holds the same value. Encoded per cell as `Or(Given(odd), ...SameValues(2,
// cell, neighbour) for each knight neighbour)` -- any one matching neighbour,
// or an odd value, satisfies the disjunction.

const graph = cellGraph('9x9');

// Arrows: [bulb, ...arm cells]. Bulb cells match the 8 white circle
// underlays; arm paths from the drawn arrow waypoints.
const arrows = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C3', 'R2C3', 'R3C3', 'R3C2'],
  ['R5C1', 'R6C1', 'R6C2', 'R5C2'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R9C9', 'R8C9', 'R7C8'],
  ['R6C9', 'R5C9', 'R4C8', 'R4C7', 'R5C6'],
  ['R3C6', 'R2C7', 'R1C7', 'R1C6'],
  ['R2C9', 'R3C8', 'R3C7'],
];

const KNIGHT_OFFSETS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const knightRule = graph.cells().map(cell => {
  const neighbours = KNIGHT_OFFSETS
    .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
    .filter(n => n !== null);
  return new Or([
    new Given(cell, 1, 3, 5, 7, 9),
    ...neighbours.map(n => new SameValues(2, cell, n)),
  ]);
});

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  ...arrows.map(cells => new Arrow(...cells)),
  ...knightRule,
];
