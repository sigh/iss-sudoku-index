// Title: Monkey Step Friends Sudoku
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=9NogpcJ8UZk
// Source: https://cracking-the-cryptic.web.app/sudoku/mdpgJLgt8L
//
// Normal sudoku rules apply: standard row/column/box all-different (the
// default for a 9x9 Shape).
//
// Monkey-step rule: a monkey step is 3 cells in one direction and 1 cell to
// the side (an extended knight leap). Every cell must have at least one
// identical digit reachable from it by a monkey step. This is an existential
// per-cell rule (not "every monkey-step pair is equal"), so each cell gets
// its own Or() over an equality Pair to each of its in-grid monkey-step
// targets.

const shape = new Shape('9x9');
const at = (r, c) => makeCellId(r, c);

// Givens, transcribed from the puzzle's drawn grid.
const givens = [
  [1, 9, 9], [2, 6, 8], [2, 7, 5], [3, 1, 7], [3, 5, 2], [3, 7, 1],
  [4, 1, 3], [4, 2, 5], [5, 9, 6], [6, 2, 9], [6, 3, 6], [6, 9, 7],
  [8, 3, 1], [8, 5, 7], [8, 7, 9], [9, 5, 4], [9, 6, 5], [9, 7, 2],
].map(([r, c, v]) => new Given(at(r, c), v));

// The 8 offsets of a "3 cells in one direction, 1 cell to the side" leap.
const MONKEY_OFFSETS = [
  [3, 1], [3, -1], [-3, 1], [-3, -1],
  [1, 3], [1, -3], [-1, 3], [-1, -3],
];

const equalKey = Pair.fnToKey((a, b) => a === b, shape);

const monkeyStepRules = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const targets = MONKEY_OFFSETS
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => nr >= 1 && nr <= 9 && nc >= 1 && nc <= 9);
    monkeyStepRules.push(new Or(
      targets.map(([nr, nc]) => new Pair(equalKey, 'monkey step', at(r, c), at(nr, nc)))
    ));
  }
}

return [shape, ...givens, ...monkeyStepRules];
