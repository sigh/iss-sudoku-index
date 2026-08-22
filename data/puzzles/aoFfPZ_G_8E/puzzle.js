// Title: A Part Ridge and a Pair of 3s
// Author: Dittman Rat
// Video: https://www.youtube.com/watch?v=aoFfPZ_G_8E
// Source: https://app.crackingthecryptic.com/sudoku/gjQ8Fhjnbg

// Normal sudoku rules apply. Both drawn diagonals (R1C1-R9C9 and R1C9-R9C1)
// are all-different. The 7 grey cells in column 5 (R2C5-R8C5) form a "ridge":
// each must be greater than every orthogonally-adjacent white cell (its
// left/right neighbours in the same row, plus R1C5 above R2C5 and R9C5 below
// R8C5 at the two ends of the column). Grey-grey adjacency within the column
// needs no extra constraint: the column all-different already covers it.
// Eight cells are highlighted in four colour pairs (drawn underlays); exactly
// one pair holds two 3s (one per cell) and the other three pairs' six cells
// hold no 3, encoded as a disjunction over which pair is the "two 3s" pair.

const ridge = ['R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5'];

// Each grey cell listed first, followed by its white orthogonal neighbours
// (GreaterThan binds by grid adjacency and requires earlier-listed cells to
// exceed later-listed adjacent ones).
const ridgeConstraints = [
  new GreaterThan('R2C5', 'R1C5', 'R2C4', 'R2C6'),
  new GreaterThan('R3C5', 'R3C4', 'R3C6'),
  new GreaterThan('R4C5', 'R4C4', 'R4C6'),
  new GreaterThan('R5C5', 'R5C4', 'R5C6'),
  new GreaterThan('R6C5', 'R6C4', 'R6C6'),
  new GreaterThan('R7C5', 'R7C4', 'R7C6'),
  new GreaterThan('R8C5', 'R9C5', 'R8C4', 'R8C6'),
];

// Colour pairs, from the drawn 1x1 underlays (fill colour groups them):
// red R3C1/R4C2, cyan R3C9/R4C8, yellow-green R6C8/R7C9, gold R6C2/R7C1.
const colourPairs = {
  red: ['R3C1', 'R4C2'],
  cyan: ['R3C9', 'R4C8'],
  yellowGreen: ['R6C8', 'R7C9'],
  gold: ['R6C2', 'R7C1'],
};

const NOT_THREE = [1, 2, 4, 5, 6, 7, 8, 9];

const twoThreesCases = Object.values(colourPairs).map((chosenPair) => {
  const clauses = [];
  for (const cell of chosenPair) clauses.push(new Given(cell, 3));
  for (const [name, pair] of Object.entries(colourPairs)) {
    if (pair === chosenPair) continue;
    for (const cell of pair) clauses.push(new Given(cell, ...NOT_THREE));
  }
  return new And(clauses);
});

return [
  new Shape('9x9'),
  new Given('R1C2', 4),
  new Given('R2C3', 9),
  new Given('R5C7', 7),
  new Given('R5C8', 9),
  new Given('R5C9', 8),
  new Given('R7C3', 7),
  new Given('R8C7', 2),
  new Given('R9C2', 6),
  new Given('R9C8', 4),
  new Diagonal(-1),
  new Diagonal(1),
  ...ridgeConstraints,
  new Or(twoThreesCases),
];
