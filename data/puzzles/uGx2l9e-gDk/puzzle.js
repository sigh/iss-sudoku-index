// Title: Meta Unique-ish
// Author: Fenners
// Video: https://www.youtube.com/watch?v=uGx2l9e-gDk
// Source: https://sudokupad.app/8b7y7246mu

// Separate clues of one type have disjoint digit sets. These two-cell
// AllDifferent constraints cover each cross-clue pair while preserving the
// rule's permission for repeats within a clue.
const disjointClueSets = occurrences => occurrences.flatMap(
  (left, index) => occurrences.slice(index + 1).flatMap(right =>
    left.flatMap(a => right.map(b => new AllDifferent(a, b))),
  ),
);

const quadruples = [
  ['R1C6', 'R1C7', 'R2C6', 'R2C7'],
  ['R3C1', 'R3C2', 'R4C1', 'R4C2'],
  ['R8C3', 'R8C4', 'R9C3', 'R9C4'],
];

const renbans = [
  ['R2C5', 'R3C5', 'R3C6'],
  ['R7C7', 'R7C8'],
  ['R2C1', 'R2C2', 'R1C2', 'R1C1'],
];

const arrows = [
  ['R7C5', 'R6C5', 'R5C5', 'R5C4'],
  ['R4C5', 'R4C6', 'R5C7', 'R4C8'],
  ['R4C3', 'R3C4'],
];

const whiteDots = [
  ['R6C8', 'R6C9'],
  ['R7C8', 'R7C9'],
  ['R1C8', 'R1C9'],
];

const blackDots = [
  ['R2C1', 'R3C1'],
  ['R7C2', 'R8C2'],
  ['R8C6', 'R8C7'],
];

return [
  new Shape('9x9'),

  ...renbans.map(cells => new Renban(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),

  // The question-mark quadruples carry no fixed values; their surrounding
  // cell sets matter only as occurrences of the meta rule.
  ...disjointClueSets(quadruples),
  ...disjointClueSets(renbans),
  ...disjointClueSets(arrows),
  ...disjointClueSets(whiteDots),
  ...disjointClueSets(blackDots),
];
