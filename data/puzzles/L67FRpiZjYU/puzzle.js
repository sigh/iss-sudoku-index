// Title: Pinwheel
// Author: Paradox
// Video: https://www.youtube.com/watch?v=L67FRpiZjYU
// Source: https://app.crackingthecryptic.com/sudoku/fQpGg8mQR4
//
// Normal sudoku, standard 3x3 boxes. Digits cannot repeat along the drawn
// diagonal. Cage digits cannot repeat and (if shown) sum to the cage total.
// Arrow-shaft digits sum to the digit in the attached circle. Digits on the
// between-line are strictly between the two circled digits at its ends.
// White-dot cells are consecutive. Each outside total is either a diagonal
// (little-killer) sum -- where a small drawn arrow marks the diagonal and
// its direction -- or otherwise a sandwich sum between the row/column's 1
// and 9; three of the six outside totals here carry that diagonal arrow.
// "Not all sandwich clues are given, but none would be zero": every row and
// column's 1 and 9 (given a sandwich total or not) are never orthogonally
// adjacent, so encode that for every row and column, not just the three
// with a printed total.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Truth table: a cell pair may not be {1, 9} in either order.
const noZeroSandwichKey = Pair.fnToKey(
  (a, b) => !((a === 1 && b === 9) || (a === 9 && b === 1)), 9);
const noZeroSandwiches = [
  ...graph.rows().map((row) => new Pair(noZeroSandwichKey, '', ...row)),
  ...graph.columns().map((col) => new Pair(noZeroSandwichKey, '', ...col)),
];

return [
  new Shape('9x9'),

  new Given('R2C6', 4),

  // Drawn corner-to-corner (R1C9 to R9C1): direction 1 is the bottom-left to
  // top-right diagonal in ISS's convention, which is this one.
  new Diagonal(1),

  // Killer cages, drawn totals.
  new Cage(11, 'R2C5', 'R2C4', 'R2C3', 'R3C3'),
  new Cage(29, 'R3C7', 'R3C8', 'R4C8', 'R5C8'),
  new Cage(29, 'R5C2', 'R6C2', 'R7C2', 'R7C3'),
  // No total drawn: still an all-different cage.
  new AllDifferent('R7C7', 'R8C7', 'R8C6', 'R8C5'),

  // Arrows: bulb cell first, then the shaft.
  new Arrow('R8C8', 'R8C9', 'R9C9', 'R9C8'),
  new Arrow('R8C2', 'R9C2', 'R9C1', 'R8C1'),

  // Between-line: circles at R1C9 and R3C7, per the drawn gray line's own
  // endpoints; the walk order below is the path's actual walk order (it
  // detours through R1C8-R1C7-R1C6-R2C6-R2C7 rather than running straight).
  new Between('R1C9', 'R1C8', 'R1C7', 'R1C6', 'R2C6', 'R2C7', 'R3C7'),

  new WhiteDot('R2C5', 'R2C6'),
  new WhiteDot('R8C7', 'R8C8'),

  // Little-killer diagonals: each short black arrow near a grid corner marks
  // its adjacent outside total as a diagonal sum rather than a sandwich sum.
  // Corner + direction fixes exactly two cells for each, verified against
  // the drawn arrowhead geometry.
  LittleKiller.fromCells(13, graph.ray('R1C2', 1, -1), geometry),
  LittleKiller.fromCells(10, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(6, graph.ray('R8C9', 1, -1), geometry),

  // Remaining outside totals (no diagonal arrow) are row/column sandwich
  // sums between the 1 and the 9.
  Sandwich.fromCells(7, graph.row(2), geometry),
  Sandwich.fromCells(20, graph.row(8), geometry),
  Sandwich.fromCells(19, graph.column(9), geometry),

  ...noZeroSandwiches,
];
