// Title: Space Invaders
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=LNpAsvUuk9I
// Source: https://sudokupad.app/uojuxaw1qw?setting-nogrid=1

// Normal sudoku (the 9 drawn cages are hidden, no-total, and coincide
// exactly with the ordinary boxes -- no extra information).
//
// INVADERS: 13 single cells (identified from the shaded/unshaded
// background split plus each carrying its own small sprite overlay) each
// need at least one orthogonally adjacent cell summing to 10 with it.
//
// DIFFERENCE BOMBS: 7 vertically-adjacent cell pairs, each marked with a
// symbol on their shared edge, all share one common (unstated) absolute
// difference -- modelled with a shared auxiliary Var.
//
// OMITTED: TURRETS. "Strategically place 3 turrets into cells in the
// bottom row... can pivot to fire upwards or diagonally... shooting it N
// times... each invader is only shot by one of the turrets" is an
// existential placement of 3 turret cells plus an assignment of every
// invader to a turret whose line of sight (straight up its column, or
// diagonal) reaches it, with the turret's own digit acting as a missile
// budget spent across the invaders assigned to it. This is a genuine
// deduction the puzzle asks the solver to perform (which cells hold
// turrets, which invader each one is responsible for) -- per policy it is
// not resolved out-of-band; the rule is omitted rather than approximated.

const invaders = [
  'R2C2', 'R2C7', 'R4C4', 'R4C9', 'R5C2', 'R5C6', 'R6C4', 'R6C6',
  'R7C4', 'R7C6', 'R7C7', 'R8C6', 'R8C8',
];

const graph = cellGraph('9x9');

// Each invader sums to 10 with some orthogonal neighbour.
const invaderClues = invaders.map(cell => new Or(
  graph.neighbours(cell).map(n => new X(cell, n))
));

// Difference bombs: all 7 marked pairs share one common absolute
// difference, held in an auxiliary Var (1-8: the pairs are vertically
// adjacent, so same-column all-different already forbids a difference of 0).
const bombPairs = [
  ['R2C3', 'R3C3'],
  ['R5C3', 'R6C3'],
  ['R7C1', 'R8C1'],
  ['R3C5', 'R4C5'],
  ['R3C7', 'R4C7'],
  ['R4C7', 'R5C7'],
  ['R7C3', 'R8C3'],
];

const diffVar = new Var('D', 'DifferenceBomb', 1);

const bombClues = bombPairs.map(([a, b]) => new Or([
  new EqualSum([a], [b, diffVar.cell(1)]),
  new EqualSum([b], [a, diffVar.cell(1)]),
]));

return [
  new Shape('9x9'),

  diffVar,
  new Given(diffVar.cell(1), 1, 2, 3, 4, 5, 6, 7, 8),

  ...invaderClues,
  ...bombClues,
];
