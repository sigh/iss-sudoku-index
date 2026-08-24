// Title: Highs and Lows
// Author: RobK
// Video: https://www.youtube.com/watch?v=_0YUlMPmD0w
// Source: https://app.crackingthecryptic.com/sudoku/QNqH98Dg2L
//
// Rules encoded:
// - Normal sudoku: 9x9 grid, default row/column/box all-different (no jigsaw
//   regions -- the payload's regions are the standard nine 3x3 boxes).
// - "All pairs of cells which share an edge and whose values add to 5 are
//   marked with a V; all which add to 10 are marked with an X." No V or X
//   mark is drawn anywhere in the payload, so this is the exhaustively-marked
//   negative case: no orthogonally-adjacent pair may sum to 5 or 10 anywhere.
//   StrictXV with zero X/V constraints present states exactly that.
// - "Within any given cage, either all of the cells have values less than 5,
//   or they all have values greater than 5." No cage in the payload carries a
//   total, so this threshold rule is the only constraint on each cage's
//   cells -- no distinctness is stated or encoded for cage members.

// Cage cell lists, transcribed from the puzzle's drawn cage outlines. A
// zero-cell metadata stub carried alongside the real cages is not a cage
// and is omitted.
const cages = [
  ['R2C1', 'R3C1'],
  ['R2C2', 'R3C2', 'R3C3'],
  ['R2C3', 'R1C3'],
  ['R1C4', 'R1C5', 'R2C5', 'R3C5'],
  ['R1C8', 'R1C9'],
  ['R3C7', 'R4C7'],
  ['R3C9', 'R4C9'],
  ['R5C7', 'R6C7'],
  ['R5C8', 'R6C8'],
  ['R7C7', 'R7C8', 'R7C9'],
  ['R8C9', 'R8C8', 'R9C8'],
  ['R7C4', 'R8C4', 'R9C4', 'R8C5'],
  ['R7C2', 'R8C2'],
  ['R4C1', 'R4C2', 'R5C2'],
  ['R4C4', 'R4C3'],
  ['R5C5', 'R5C6'],
];

// Same-side-of-5 predicate: both values < 5, or both values > 5. A cell
// holding 5 satisfies neither branch, so this also forbids 5 in any cage
// cell (every cage above has >= 2 cells, so every cage cell appears in some
// pair). PairX applies the relation over every pair in the set, which is
// right for a whole-cage rule (as opposed to Pair's consecutive-pairs-only).
const highLowKey = Pair.fnToKey((a, b) => (a < 5 && b < 5) || (a > 5 && b > 5), 9);

const cageConstraints = cages.map(
  (cells, i) => new PairX(highLowKey, `cage-${i}`, ...cells));

return [
  new Shape('9x9'),
  new Given('R3C8', 8),
  new Given('R9C9', 1),
  new StrictXV(),
  ...cageConstraints,
];
