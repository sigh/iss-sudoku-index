// Title: One is Never Outnumbered
// Author: Haley Prochilo
// Video: https://www.youtube.com/watch?v=WtqxhYvsuSw
// Source: https://app.crackingthecryptic.com/sudoku/QBTLGT3tNF

// Rules: Normal sudoku rules apply. Cages show their sums (killer cages:
// digits inside a cage do not repeat and sum to the printed total). Digits
// increase along thermometers, from the bulb (filled circle) to the tip.
// The digit 1 never touches two of the same digit, including diagonally:
// for any cell holding a 1, the (up to 8) orthogonal/diagonal neighbours of
// that cell hold no repeated digit.

const givens = [
  new Given('R2C1', 1),
  new Given('R2C5', 6),
  new Given('R2C6', 9),
  new Given('R3C7', 1),
  new Given('R5C5', 1),
  new Given('R6C6', 8),
  new Given('R8C4', 8),
];

// Cages, transcribed from the puzzle's own cage list (its three metadata
// stub entries for title/author/rules are not cages and are excluded).
const cages = [
  [7, 'R1C1', 'R1C2'],
  [10, 'R2C2', 'R2C3'],
  [23, 'R1C8', 'R1C9', 'R2C8'],
  [11, 'R4C5', 'R4C6'],
  [11, 'R5C4', 'R6C4'],
  [11, 'R6C5', 'R6C6'],
  [3, 'R6C7', 'R6C8'],
  [19, 'R8C7', 'R8C8', 'R8C9'],
  [17, 'R4C2', 'R4C3', 'R5C2', 'R5C3', 'R6C2'],
  [15, 'R4C1', 'R5C1'],
];
const cageConstraints = cages.map(([total, ...cells]) => new Cage(total, ...cells));

// Thermometers. Each line is drawn tip-first, ending at its bulb (the
// filled circle overlay marks the bulb cell); Thermo needs the bulb first,
// so each path below is the drawn order reversed to start at the bulb.
const thermos = [
  // drawn R5C8-R5C9-R6C9-R7C9-R7C8-R7C7-R7C6, bulb=R7C6
  new Thermo('R7C6', 'R7C7', 'R7C8', 'R7C9', 'R6C9', 'R5C9', 'R5C8'),
  // drawn R7C1-R7C2-R7C3-R8C3, bulb=R8C3
  new Thermo('R8C3', 'R7C3', 'R7C2', 'R7C1'),
  // drawn R5C2-R6C2, bulb=R6C2
  new Thermo('R6C2', 'R5C2'),
];

// "The digit 1 never touches two of the same digit (including diagonally)":
// for every grid cell C, either C does not hold 1, or the set of C's own
// king-move neighbours (up to 8 cells, fewer on an edge/corner) holds no
// repeated digit. Encoded as one Or(Given(C, not 1), AllDifferent(neighbours
// of C)) per cell, which is exactly the conditional the rule states.
const NOT_ONE = [2, 3, 4, 5, 6, 7, 8, 9];
const graph = cellGraph('9x9');
const oneOutnumberedRules = graph.cells().map(cell => new Or([
  new Given(cell, ...NOT_ONE),
  new AllDifferent(...graph.kingNeighbours(cell)),
]));

return [
  new Shape('9x9'),
  ...givens,
  ...cageConstraints,
  ...thermos,
  ...oneOutnumberedRules,
];
