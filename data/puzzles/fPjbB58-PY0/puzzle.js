// Title: The Galactic Sudoku
// Author: Mitchell Lee
// Video: https://www.youtube.com/watch?v=fPjbB58-PY0
// Source: https://cracking-the-cryptic.web.app/sudoku/R9jrHBRtJr

// Normal sudoku rules apply. Ten outside diagonal clues give the sum of the
// digits along the diagonal the arrow points into, starting at the corner
// cell the arrow enters (Little Killer semantics; digits may repeat on the
// diagonal). One clue, on the R8C1 diagonal, is printed "not equal to 56"
// rather than a plain total: that diagonal's digits must sum to anything
// except 56.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Nine plain-total Little Killer clues. Direction of each diagonal is read
// from the drawn arrow's off-grid ray (down-right / down-left / up-left /
// up-right), not assumed from the outside position alone.
const littleKillers = [
  LittleKiller.fromCells(37, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(16, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(6, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(44, graph.ray('R4C9', 1, -1), geometry),
  LittleKiller.fromCells(22, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(39, graph.ray('R9C6', -1, -1), geometry),
  LittleKiller.fromCells(12, graph.ray('R9C3', -1, -1), geometry),
  LittleKiller.fromCells(12, graph.ray('R6C1', -1, 1), geometry),
  LittleKiller.fromCells(23, graph.ray('R3C1', -1, 1), geometry),
];

// The not-equal-56 clue: an NFA carrying the running diagonal total, clamped
// once it can only fail (sum > 56, since all digits are positive), accepting
// every final total except exactly 56.
const notFiftySixSpec = NFA.encodeSpec({
  startState: { sum: 0 },
  transition: ({ sum }, value) => ({ sum: Math.min(sum + value, 57) }),
  accept: ({ sum }) => sum !== 56,
}, 9);
const notFiftySix = new NFA(
  notFiftySixSpec, 'diag-ne-56', ...graph.ray('R8C1', -1, 1));

return [
  new Shape('9x9'),
  ...littleKillers,
  notFiftySix,
];
