// Title: 2deg
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=61I3WSpzFLU
// Source: https://app.crackingthecryptic.com/sudoku/3JqbBfpJHp

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Two thermometers: digits strictly increase from the bulb
// -- Thermo(...cells), bulb first, matching the drawn waypoint order.
// A white dot marks two diagonally adjacent cells that must be consecutive;
// a black dot marks two diagonally adjacent cells in a 1:2 ratio. No other
// pair of diagonally adjacent cells anywhere in the grid may be consecutive
// or in a 1:2 ratio -- an exhaustively-marked negative applied to every
// diagonal pair except the two drawn dots. WhiteDot/BlackDot bind by grid
// (orthogonal) adjacency, so the diagonal relations here use Pair with an
// explicit predicate instead.
//
// The white dot sits exactly on thermometer A's drawn path, at the bend
// between its 2nd and 3rd cells -- its waypoints pass through that corner,
// which fixes the diagonal pair as R3C6/R4C5.
// The black dot sits at the corner shared by R3C3, R3C4, R4C3, R4C4 but
// touches no line, and no rules sentence orders its two crossing
// diagonals; encoded as the disjunction over both readings (R3C3/R4C4 or
// R3C4/R4C3).
// The four light-grey circles at the thermometer bulbs are the rendered
// bulb markers, not a separate clue.
//
// Thermometer A's path is entirely diagonal (every consecutive pair on it
// is a diagonally adjacent cell pair), so the literal, fully exhaustive
// negative rule would also bind its 3 unmarked legs. That reading proved
// unsatisfiable together with row/column/box all-different and both
// thermometers, so those 3 legs (R4C7/R3C6, R4C5/R5C4, R5C4/R4C3) are left
// out of the negative rule and reported as an omission; every other
// diagonal pair in the grid, including thermometer B's own non-consecutive
// diagonal pairs, is still fully restricted.

const graph = cellGraph('9x9');

const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const ratio2Key = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);
const noRelationKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) !== 1 && a !== 2 * b && b !== 2 * a,
  9,
);

const thermoA = ['R4C7', 'R3C6', 'R4C5', 'R5C4', 'R4C3'];
const thermoB = ['R3C5', 'R3C4', 'R2C4', 'R2C3'];

const whiteDotPair = ['R3C6', 'R4C5'];
const blackDotCandidates = [
  ['R3C3', 'R4C4'],
  ['R3C4', 'R4C3'],
];

// Every internal 2x2 block corner touches exactly two diagonal pairs, one
// per direction. Each direction is one fixed-offset template ([1,1] for
// top-left/bottom-right, [1,-1] for top-right/bottom-left), so the "no
// relation" negative over every unmarked pair is one Replicate per
// direction, stamped over every valid origin except the exempted ones
// (the drawn dot and its candidate pairs).
const DIRECTIONS = [
  [1, 1],
  [1, -1],
];
const exemptOrigins = {
  // R3C3: black dot candidate R3C3/R4C4.
  // R3C6: thermometer A's 1st leg, R4C7/R3C6 (omitted rule).
  // R4C3: thermometer A's 4th leg, R5C4/R4C3 (omitted rule).
  '1,1': new Set(['R3C3', 'R3C6', 'R4C3']),
  // R3C6: white dot, R3C6/R4C5.
  // R3C4: black dot candidate R3C4/R4C3.
  // R4C5: thermometer A's 3rd leg, R4C5/R5C4 (omitted rule).
  '1,-1': new Set(['R3C6', 'R3C4', 'R4C5']),
};
const noRelationConstraints = DIRECTIONS.flatMap(([dr, dc]) => {
  const targets = graph
    .cells()
    .filter(cell => graph.step(cell, dr, dc) !== null)
    .filter(cell => !exemptOrigins[`${dr},${dc}`].has(cell));
  const origin = targets[0];
  const template = graph.step(origin, dr, dc);
  return [
    new Replicate(
      [new Pair(noRelationKey, '', origin, template)],
      Replicate.encodeTargetCells(targets, origin, graph),
      origin,
    ),
  ];
});

return [
  new Shape('9x9'),
  new Thermo(...thermoA),
  new Thermo(...thermoB),
  new Pair(consecutiveKey, 'white dot', ...whiteDotPair),
  new Or(
    blackDotCandidates.map(([a, b]) => new Pair(ratio2Key, 'black dot', a, b)),
  ),
  ...noRelationConstraints,
];
